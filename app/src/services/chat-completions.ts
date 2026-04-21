/**
 * Chat Completions SSE Service
 * OpenAI-compatible streaming chat completions via SSE
 * 对接后端 /v1/chat/completions 流式接口
 */

import type { ChatMessage } from '@/types'

// ============================================================
// Types
// ============================================================

export interface ChatCompletionRequest {
  model: string // 格式: "agent:<agent_id>" 或直接 agent_id
  messages: ChatCompletionMessage[]
  conversation_id?: string
  stream?: boolean // 默认 true
  stream_options?: {
    include_usage?: boolean
  }
  tools?: ToolDefinition[]
  tool_choice?: 'auto' | 'none' | { type: string; function: { name: string } }
  temperature?: number
  max_tokens?: number
  enable_routing?: boolean
  metadata?: Record<string, unknown>
}

export interface ChatCompletionMessage {
  role: 'system' | 'user' | 'assistant' | 'tool'
  content?: string
  name?: string
  tool_calls?: ToolCall[]
  tool_call_id?: string
}

export interface ToolDefinition {
  type: 'function'
  function: {
    name: string
    description?: string
    parameters?: Record<string, unknown>
  }
}

export interface ToolCall {
  id: string
  type: 'function'
  function: {
    name: string
    arguments: string
  }
}

// SSE Chunk 格式 (OpenAI兼容)
export interface ChatCompletionChunk {
  id: string
  object: 'chat.completion.chunk'
  created: number
  model: string
  choices: ChunkChoice[]
  usage?: UsageInfo
}

export interface ChunkChoice {
  index: number
  delta: {
    role?: 'assistant'
    content?: string
    tool_calls?: ToolCallDelta[]
  }
  finish_reason?: 'stop' | 'tool_calls' | 'length' | 'content_filter' | null
}

export interface ToolCallDelta {
  index: number
  id?: string
  type?: 'function'
  function?: {
    name?: string
    arguments?: string
  }
}

export interface UsageInfo {
  prompt_tokens: number
  completion_tokens: number
  total_tokens: number
}

// SSE Error 格式
export interface StreamError {
  message: string
  type: string
  code: string
}

// ============================================================
// SSE Client Class
// ============================================================

export class ChatCompletionsSSE {
  private baseUrl: string
  private apiKey: string | null
  private abortController: AbortController | null = null

  constructor(baseUrl?: string, apiKey?: string) {
    this.baseUrl = baseUrl || import.meta.env.VITE_API_BASE_URL || '/api/v1'
    this.apiKey = apiKey || localStorage.getItem('api_key') || import.meta.env.VITE_API_KEY
  }

  /**
   * 设置 API Key
   */
  setApiKey(apiKey: string) {
    this.apiKey = apiKey
  }

  /**
   * 流式聊天补全
   *
   * @param request 请求参数
   * @param onChunk chunk回调 (增量内容)
   * @param onUsage usage回调 (token统计)
   * @param onError 错误回调
   * @param onComplete 完成回调
   */
  async streamChatCompletion(
    request: ChatCompletionRequest,
    onChunk: (content: string, toolCalls?: ToolCallDelta[]) => void,
    onUsage?: (usage: UsageInfo) => void,
    onError?: (error: StreamError) => void,
    onComplete?: (finishReason: string) => void
  ): Promise<void> {
    // 取消之前的请求
    this.cancel()

    this.abortController = new AbortController()

    // 构建 URL
    const url = `${this.baseUrl}/chat/completions`

    // 处理 model 格式: 如果不是 "agent:xxx" 格式，自动添加
    const model = request.model.startsWith('agent:') ? request.model : `agent:${request.model}`

    // 构建请求体
    const body: ChatCompletionRequest = {
      ...request,
      model,
      stream: true, // 强制流式
      stream_options: {
        include_usage: true // 包含usage统计
      }
    }

    // 构建请求头
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'text/event-stream'
    }

    // 添加认证
    if (this.apiKey) {
      headers['X-API-Key'] = this.apiKey
    }

    // Bearer Token (如果有)
    const token = localStorage.getItem('token')
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    // 防止 onComplete 多次调用
    let completed = false

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
        signal: this.abortController.signal
      })

      if (!response.ok) {
        const errorData = await response.json()
        onError?.({
          message: errorData.error?.message || errorData.message || 'Request failed',
          type: errorData.error?.type || 'http_error',
          code: String(response.status)
        })
        return
      }

      // 读取 SSE 流
      const reader = response.body?.getReader()
      if (!reader) {
        onError?.({
          message: 'No response body',
          type: 'stream_error',
          code: 'NO_BODY'
        })
        return
      }

      const decoder = new TextDecoder()
      let buffer = ''

      // eslint-disable-next-line no-constant-condition
      while (true) {
        const { done, value } = await reader.read()

        if (done) {
          break
        }

        // 解码并追加到 buffer
        buffer += decoder.decode(value, { stream: true })

        // 解析 SSE 格式: "data: {...}\n\n"
        const lines = buffer.split('\n')
        buffer = ''

        for (const line of lines) {
          // 跳过空行
          if (!line.trim()) {
            continue
          }

          // 处理 SSE 数据行
          if (line.startsWith('data: ')) {
            const data = line.slice(6).trim()

            // [DONE] 标记
            if (data === '[DONE]') {
              if (!completed) {
                completed = true
                onComplete?.('stop')
              }
              return
            }

            // 解析 JSON
            try {
              const chunk: ChatCompletionChunk = JSON.parse(data)

              // 处理 choices
              for (const choice of chunk.choices) {
                const delta = choice.delta

                // 内容增量
                if (delta.content) {
                  onChunk(delta.content, delta.tool_calls)
                }

                // Tool calls 增量
                if (delta.tool_calls) {
                  onChunk('', delta.tool_calls)
                }

                // 完成原因（只调用一次）
                if (choice.finish_reason && !completed) {
                  completed = true
                  onComplete?.(choice.finish_reason)
                }
              }

              // Usage 信息
              if (chunk.usage) {
                onUsage?.(chunk.usage)
              }
            } catch (parseError) {
              // 可能是错误事件
              try {
                const errorData: { error: StreamError } = JSON.parse(data)
                if (errorData.error) {
                  onError?.(errorData.error)
                }
              } catch {
                console.warn('Failed to parse SSE data:', data)
              }
            }
          }
        }
      }
    } catch (error: unknown) {
      if (error instanceof Error && error.name === 'AbortError') {
        // 用户取消，不报错
        if (!completed) {
          completed = true
          onComplete?.('cancelled')
        }
      } else {
        const err = error as Error
        onError?.({
          message: err.message || 'Unknown error',
          type: 'network_error',
          code: 'NETWORK'
        })
      }
    }
  }

  /**
   * 取消流式请求
   */
  cancel() {
    if (this.abortController) {
      this.abortController.abort()
      this.abortController = null
    }
  }

  /**
   * 是否正在请求
   */
  isStreaming(): boolean {
    return this.abortController !== null
  }
}

// ============================================================
// Factory & Singleton
// ============================================================

let sseInstance: ChatCompletionsSSE | null = null

/**
 * 获取 SSE 客户端实例
 */
export function getChatCompletionsSSE(): ChatCompletionsSSE {
  if (!sseInstance) {
    sseInstance = new ChatCompletionsSSE()
  }
  return sseInstance
}

/**
 * 创建新的 SSE 客户端
 */
export function createChatCompletionsSSE(baseUrl?: string, apiKey?: string): ChatCompletionsSSE {
  return new ChatCompletionsSSE(baseUrl, apiKey)
}

// ============================================================
// Helper Functions
// ============================================================

/**
 * 构建标准消息格式
 */
export function buildMessages(
  userContent: string,
  conversationHistory?: ChatMessage[],
  systemPrompt?: string
): ChatCompletionMessage[] {
  const messages: ChatCompletionMessage[] = []

  // 系统提示词
  if (systemPrompt) {
    messages.push({
      role: 'system',
      content: systemPrompt
    })
  }

  // 对话历史
  if (conversationHistory && conversationHistory.length > 0) {
    for (const msg of conversationHistory) {
      messages.push({
        role: msg.role,
        content: msg.content
      })
    }
  }

  // 用户消息
  messages.push({
    role: 'user',
    content: userContent
  })

  return messages
}

/**
 * 从 tool_calls delta 构建完整 tool call
 */
export function accumulateToolCalls(accumulated: ToolCall[], delta: ToolCallDelta[]): ToolCall[] {
  for (const d of delta) {
    const index = d.index

    // 创建或更新
    if (!accumulated[index]) {
      accumulated[index] = {
        id: d.id || `tool_${index}`,
        type: 'function',
        function: {
          name: d.function?.name || '',
          arguments: d.function?.arguments || ''
        }
      }
    } else {
      // 追加 arguments
      if (d.function?.arguments) {
        accumulated[index].function.arguments += d.function.arguments
      }
    }
  }

  return accumulated
}

export default ChatCompletionsSSE
