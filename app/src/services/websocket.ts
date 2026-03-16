/**
 * WebSocket Service
 * WebSocket 连接管理和消息处理
 */

// WebSocket 配置
interface WebSocketConfig {
  url: string
  reconnectAttempts?: number
  reconnectInterval?: number
  heartbeatInterval?: number
  onOpen?: () => void
  onClose?: (event: CloseEvent) => void
  onError?: (error: Event) => void
  onMessage?: (data: any) => void
}

// WebSocket 消息类型
export type WSMessageType = 'chat' | 'stream' | 'ping' | 'pong' | 'tool_call' | 'status' | 'error'

// WebSocket 消息接口
export interface WSMessage<T = unknown> {
  type: WSMessageType
  data: T
  timestamp?: number
}

// 聊天消息数据
export interface ChatMessageData {
  message: string
  conversation_id?: string
  app_id?: string
  attachments?: File[]
}

// 流式响应数据
export interface StreamResponseData {
  delta: string
  done: boolean
  conversation_id?: string
  message_id?: string
  component?: unknown
}

// WebSocket 连接状态
export type WSConnectionState =
  | 'connecting'
  | 'connected'
  | 'disconnecting'
  | 'disconnected'
  | 'error'

// 事件处理器类型
type EventHandler<T = unknown> = (data: T) => void

/**
 * WebSocket 服务类
 */
export class WebSocketService {
  private ws: WebSocket | null = null
  private config: Required<WebSocketConfig>
  private reconnectCount = 0
  private heartbeatTimer: number | null = null
  private connectionState: WSConnectionState = 'disconnected'
  private eventHandlers: Map<string, Set<EventHandler>> = new Map()

  constructor(config: WebSocketConfig) {
    this.config = {
      reconnectAttempts: config.reconnectAttempts ?? 5,
      reconnectInterval: config.reconnectInterval ?? 3000,
      heartbeatInterval: config.heartbeatInterval ?? 30000,
      url: config.url,
      onOpen: config.onOpen ?? (() => {}),
      onClose: config.onClose ?? (() => {}),
      onError: config.onError ?? (() => {}),
      onMessage: config.onMessage ?? (() => {})
    }
  }

  /**
   * 获取连接状态
   */
  get state(): WSConnectionState {
    return this.connectionState
  }

  /**
   * 是否已连接
   */
  get isConnected(): boolean {
    return this.connectionState === 'connected' && this.ws?.readyState === WebSocket.OPEN
  }

  /**
   * 连接 WebSocket
   */
  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.isConnected) {
        resolve()
        return
      }

      this.connectionState = 'connecting'

      try {
        this.ws = new WebSocket(this.config.url)

        this.ws.onopen = () => {
          this.connectionState = 'connected'
          this.reconnectCount = 0
          this.startHeartbeat()
          this.config.onOpen()
          this.emit('connected', {})
          resolve()
        }

        this.ws.onclose = (event) => {
          this.connectionState = 'disconnected'
          this.stopHeartbeat()
          this.config.onClose(event)
          this.emit('disconnected', { code: event.code, reason: event.reason })

          // 自动重连
          if (this.reconnectCount < this.config.reconnectAttempts) {
            this.scheduleReconnect()
          }
        }

        this.ws.onerror = (error) => {
          this.connectionState = 'error'
          this.config.onError(error)
          this.emit('error', error)
          reject(error)
        }

        this.ws.onmessage = (event) => {
          this.handleMessage(event.data)
        }
      } catch (error) {
        this.connectionState = 'error'
        reject(error)
      }
    })
  }

  /**
   * 断开连接
   */
  disconnect(): void {
    if (!this.ws) return

    this.connectionState = 'disconnecting'
    this.stopHeartbeat()
    this.ws.close(1000, 'Client disconnect')
    this.ws = null
    this.connectionState = 'disconnected'
  }

  /**
   * 发送消息
   */
  send<T = unknown>(type: WSMessageType, data: T): boolean {
    if (!this.isConnected) {
      console.warn('WebSocket is not connected')
      return false
    }

    const message: WSMessage<T> = {
      type,
      data,
      timestamp: Date.now()
    }

    try {
      this.ws!.send(JSON.stringify(message))
      return true
    } catch (error) {
      console.error('Failed to send message:', error)
      return false
    }
  }

  /**
   * 发送聊天消息
   */
  sendChat(data: ChatMessageData): boolean {
    return this.send('chat', data)
  }

  /**
   * 发送心跳
   */
  sendPing(): boolean {
    return this.send('ping', {})
  }

  /**
   * 注册事件处理器
   */
  on<T = unknown>(event: string, handler: EventHandler<T>): void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, new Set())
    }
    this.eventHandlers.get(event)!.add(handler as EventHandler)
  }

  /**
   * 移除事件处理器
   */
  off<T = unknown>(event: string, handler: EventHandler<T>): void {
    const handlers = this.eventHandlers.get(event)
    if (handlers) {
      handlers.delete(handler as EventHandler)
    }
  }

  /**
   * 处理接收到的消息
   */
  private handleMessage(rawData: string): void {
    try {
      const message: WSMessage = JSON.parse(rawData)

      // 调用通用消息处理器
      this.config.onMessage(message)

      // 根据消息类型分发事件
      switch (message.type) {
        case 'stream':
          this.emit('stream', message.data)
          break
        case 'chat':
          this.emit('chat', message.data)
          break
        case 'pong':
          this.emit('pong', message.data)
          break
        case 'status':
          this.emit('status', message.data)
          break
        case 'error':
          this.emit('error', message.data)
          break
        default:
          this.emit('message', message)
      }
    } catch (error) {
      console.error('Failed to parse message:', error)
    }
  }

  /**
   * 触发事件
   */
  private emit<T = unknown>(event: string, data: T): void {
    const handlers = this.eventHandlers.get(event)
    if (handlers) {
      handlers.forEach((handler) => handler(data))
    }
  }

  /**
   * 启动心跳
   */
  private startHeartbeat(): void {
    this.stopHeartbeat()
    this.heartbeatTimer = window.setInterval(() => {
      this.sendPing()
    }, this.config.heartbeatInterval)
  }

  /**
   * 停止心跳
   */
  private stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer)
      this.heartbeatTimer = null
    }
  }

  /**
   * 安排重连
   */
  private scheduleReconnect(): void {
    this.reconnectCount++
    console.log(`Reconnecting... (${this.reconnectCount}/${this.config.reconnectAttempts})`)

    setTimeout(() => {
      this.connect().catch((error) => {
        console.error('Reconnect failed:', error)
      })
    }, this.config.reconnectInterval)
  }
}

// ============================================================
// 工厂函数
// ============================================================

let wsInstance: WebSocketService | null = null

/**
 * 获取 WebSocket 实例
 */
export function getWebSocket(): WebSocketService {
  if (!wsInstance) {
    const wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:8000'
    const clientId = `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    wsInstance = new WebSocketService({
      url: `${wsUrl}/ws/chat/${clientId}`
    })
  }

  return wsInstance
}

/**
 * 创建新的 WebSocket 实例
 */
export function createWebSocket(clientId?: string): WebSocketService {
  const wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:8000'
  const id = clientId || `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

  return new WebSocketService({
    url: `${wsUrl}/ws/chat/${id}`
  })
}

export default WebSocketService
