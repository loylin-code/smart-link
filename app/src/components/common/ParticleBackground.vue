<template>
  <canvas ref="canvasRef" class="particle-background"></canvas>
</template>

<script setup lang="ts">
  import { ref, onMounted, onUnmounted } from 'vue'

  interface Props {
    particleCount?: number
    particleColor?: string
    connectionDistance?: number
    minSpeed?: number
    maxSpeed?: number
  }

  const props = withDefaults(defineProps<Props>(), {
    particleCount: 80,
    particleColor: 'rgba(24, 144, 255,', // 使用主题色 #1890ff
    connectionDistance: 120,
    minSpeed: 0.3,
    maxSpeed: 0.5
  })

  const canvasRef = ref<HTMLCanvasElement>()

  // 动画相关变量
  let animationId: number
  let resizeListener: () => void
  let particles: Particle[] = []

  // 粒子类
  class Particle {
    x: number
    y: number
    vx: number
    vy: number
    radius: number
    opacity: number
    private canvas: HTMLCanvasElement
    private minSpeed: number
    private maxSpeed: number

    constructor(canvas: HTMLCanvasElement, minSpeed: number, maxSpeed: number) {
      this.canvas = canvas
      this.minSpeed = minSpeed
      this.maxSpeed = maxSpeed
      this.x = Math.random() * canvas.width
      this.y = Math.random() * canvas.height
      this.vx =
        (Math.random() - 0.5) * (maxSpeed - minSpeed) + (Math.random() > 0.5 ? minSpeed : -minSpeed)
      this.vy =
        (Math.random() - 0.5) * (maxSpeed - minSpeed) + (Math.random() > 0.5 ? minSpeed : -minSpeed)
      this.radius = Math.random() * 2 + 1
      this.opacity = Math.random() * 0.5 + 0.3
    }

    update() {
      this.x += this.vx
      this.y += this.vy

      // 边界反弹
      if (this.x < 0 || this.x > this.canvas.width) this.vx *= -1
      if (this.y < 0 || this.y > this.canvas.height) this.vy *= -1
    }

    draw(ctx: CanvasRenderingContext2D, color: string) {
      ctx.beginPath()
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2)
      ctx.fillStyle = `${color} ${this.opacity})`
      ctx.fill()
    }
  }

  onMounted(() => {
    if (!canvasRef.value) return

    const canvas = canvasRef.value
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // 设置 canvas 尺寸
    const resizeCanvas = () => {
      canvas.width = canvas.parentElement?.offsetWidth || window.innerWidth
      canvas.height = canvas.parentElement?.offsetHeight || window.innerHeight
    }
    resizeCanvas()
    resizeListener = resizeCanvas
    window.addEventListener('resize', resizeListener)

    // 根据设备类型调整粒子数量
    const isMobile = window.innerWidth < 768
    const count = isMobile ? Math.floor(props.particleCount / 2) : props.particleCount

    // 创建粒子
    particles = []
    for (let i = 0; i < count; i++) {
      particles.push(new Particle(canvas, props.minSpeed, props.maxSpeed))
    }

    // 动画循环
    const animate = () => {
      if (!ctx || !canvas) return

      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // 更新和绘制粒子
      particles.forEach((p) => {
        p.update()
        p.draw(ctx, props.particleColor)
      })

      // 绘制连线
      particles.forEach((p1, i) => {
        particles.slice(i + 1).forEach((p2) => {
          const dx = p1.x - p2.x
          const dy = p1.y - p2.y
          const dist = Math.sqrt(dx * dx + dy * dy)

          if (dist < props.connectionDistance) {
            ctx.beginPath()
            ctx.moveTo(p1.x, p1.y)
            ctx.lineTo(p2.x, p2.y)
            ctx.strokeStyle = `${props.particleColor} ${0.15 * (1 - dist / props.connectionDistance)})`
            ctx.stroke()
          }
        })
      })

      animationId = requestAnimationFrame(animate)
    }

    animate()
  })

  // 清理资源
  onUnmounted(() => {
    if (animationId) {
      cancelAnimationFrame(animationId)
    }
    if (resizeListener) {
      window.removeEventListener('resize', resizeListener)
    }
    particles = []
  })
</script>

<style scoped lang="scss">
  .particle-background {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 0;
    pointer-events: none;
    overflow: hidden;
  }
</style>
