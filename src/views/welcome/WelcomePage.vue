<template>
  <div class="welcome-page">
    <!-- 粒子背景 -->
    <canvas ref="particleCanvas" class="particle-canvas"></canvas>

    <!-- 主要内容 -->
    <div class="welcome-content">
      <!-- Logo -->
      <div class="welcome-logo">
        <div class="logo-icon">
          <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="40" cy="40" r="36" stroke="currentColor" stroke-width="2" opacity="0.3"/>
            <circle cx="40" cy="40" r="28" stroke="currentColor" stroke-width="2" opacity="0.5"/>
            <circle cx="40" cy="40" r="20" stroke="currentColor" stroke-width="2"/>
            <path d="M32 40L38 46L48 34" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <h1 class="logo-text">SmartLink</h1>
      </div>

      <!-- 标语 -->
      <p class="welcome-slogan">智能Agent编排管理平台</p>
      <p class="welcome-description">
        构建智能工作流，连接无限可能
      </p>

      <!-- 开始按钮 -->
      <button class="start-button" @click="handleStart">
        <span class="button-text">开始探索</span>
        <svg class="button-icon" viewBox="0 0 24 24" fill="none">
          <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>

      <!-- 功能预览 -->
      <div class="feature-preview">
        <div
          v-for="(feature, index) in features"
          :key="index"
          class="feature-item"
          :style="{ animationDelay: `${index * 0.1}s` }"
        >
          <div class="feature-icon">
            <component :is="feature.icon" />
          </div>
          <span class="feature-label">{{ feature.label }}</span>
        </div>
      </div>

      <!-- 底部信息 -->
      <div class="welcome-footer">
        <p class="footer-text">Powered by Vue 3 + OpenTiny</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, h } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const particleCanvas = ref<HTMLCanvasElement>()

// 图标组件
const ChatIcon = () => h('svg', { viewBox: '0 0 24 24', fill: 'none' }, [
  h('path', { d: 'M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z', stroke: 'currentColor', 'stroke-width': 2, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' })
])

const AppIcon = () => h('svg', { viewBox: '0 0 24 24', fill: 'none' }, [
  h('rect', { x: 3, y: 3, width: 7, height: 7, rx: 1, stroke: 'currentColor', 'stroke-width': 2 }),
  h('rect', { x: 14, y: 3, width: 7, height: 7, rx: 1, stroke: 'currentColor', 'stroke-width': 2 }),
  h('rect', { x: 3, y: 14, width: 7, height: 7, rx: 1, stroke: 'currentColor', 'stroke-width': 2 }),
  h('rect', { x: 14, y: 14, width: 7, height: 7, rx: 1, stroke: 'currentColor', 'stroke-width': 2 })
])

const ResourceIcon = () => h('svg', { viewBox: '0 0 24 24', fill: 'none' }, [
  h('path', { d: 'M22 19V17C22 15.1362 20.7252 13.5701 19 13.126V12C19 10.3431 17.6569 9 16 9H8C6.34315 9 5 10.3431 5 12V13.126C3.27477 13.5701 2 15.1362 2 17V19C2 20.1046 2.89543 21 4 21H20C21.1046 21 22 20.1046 22 19Z', stroke: 'currentColor', 'stroke-width': 2 }),
  h('path', { d: 'M8 9V6C8 4.34315 9.34315 3 11 3H13C14.6569 3 16 4.34315 16 6V9', stroke: 'currentColor', 'stroke-width': 2 })
])

const ConsoleIcon = () => h('svg', { viewBox: '0 0 24 24', fill: 'none' }, [
  h('rect', { x: 3, y: 3, width: 18, height: 18, rx: 2, stroke: 'currentColor', 'stroke-width': 2 }),
  h('path', { d: 'M8 12L11 15L16 9', stroke: 'currentColor', 'stroke-width': 2, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' })
])

const features = [
  { icon: ChatIcon, label: '对话' },
  { icon: AppIcon, label: '应用' },
  { icon: ResourceIcon, label: '资源' },
  { icon: ConsoleIcon, label: '控制台' }
]

const handleStart = () => {
  router.push('/app/conversation')
}

// 粒子动画
onMounted(() => {
  if (!particleCanvas.value) return

  const canvas = particleCanvas.value
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  // 设置canvas尺寸
  const resizeCanvas = () => {
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
  }
  resizeCanvas()
  window.addEventListener('resize', resizeCanvas)

  // 粒子类
  class Particle {
    x: number
    y: number
    vx: number
    vy: number
    radius: number

    constructor() {
      this.x = Math.random() * canvas.width
      this.y = Math.random() * canvas.height
      this.vx = (Math.random() - 0.5) * 0.5
      this.vy = (Math.random() - 0.5) * 0.5
      this.radius = Math.random() * 2 + 1
    }

    update() {
      this.x += this.vx
      this.y += this.vy

      if (this.x < 0 || this.x > canvas.width) this.vx *= -1
      if (this.y < 0 || this.y > canvas.height) this.vy *= -1
    }

    draw() {
      ctx!.beginPath()
      ctx!.arc(this.x, this.y, this.radius, 0, Math.PI * 2)
      ctx!.fillStyle = 'rgba(0, 212, 255, 0.5)'
      ctx!.fill()
    }
  }

  // 创建粒子
  const particles: Particle[] = []
  for (let i = 0; i < 80; i++) {
    particles.push(new Particle())
  }

  // 动画循环
  const animate = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // 更新和绘制粒子
    particles.forEach(p => {
      p.update()
      p.draw()
    })

    // 绘制连线
    particles.forEach((p1, i) => {
      particles.slice(i + 1).forEach(p2 => {
        const dx = p1.x - p2.x
        const dy = p1.y - p2.y
        const dist = Math.sqrt(dx * dx + dy * dy)

        if (dist < 120) {
          ctx!.beginPath()
          ctx!.moveTo(p1.x, p1.y)
          ctx!.lineTo(p2.x, p2.y)
          ctx!.strokeStyle = `rgba(0, 212, 255, ${0.2 * (1 - dist / 120)})`
          ctx!.stroke()
        }
      })
    })

    requestAnimationFrame(animate)
  }

  animate()

  // 清理
  return () => {
    window.removeEventListener('resize', resizeCanvas)
  }
})
</script>

<style scoped lang="scss">
.welcome-page {
  width: 100%;
  height: 100vh;
  background: $bg-primary;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.particle-canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
}

.welcome-content {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  animation: fadeInUp 1s ease;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.welcome-logo {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: $spacing-md;
  margin-bottom: $spacing-xl;

  .logo-icon {
    width: 120px;
    height: 120px;
    color: $primary-color;
    animation: glow 2s ease-in-out infinite alternate;

    svg {
      width: 100%;
      height: 100%;
    }
  }

  .logo-text {
    font-size: 56px;
    font-weight: $font-weight-bold;
    background: linear-gradient(135deg, $primary-color, $secondary-color);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    letter-spacing: 2px;
  }
}

.welcome-slogan {
  font-size: $font-size-2xl;
  color: $text-primary;
  margin-bottom: $spacing-sm;
  font-weight: $font-weight-semibold;
}

.welcome-description {
  font-size: $font-size-lg;
  color: $text-secondary;
  margin-bottom: $spacing-3xl;
}

.start-button {
  display: flex;
  align-items: center;
  gap: $spacing-sm;
  padding: $spacing-md $spacing-2xl;
  background: linear-gradient(135deg, $primary-color, $primary-dark);
  border-radius: $border-radius-full;
  color: $text-primary;
  font-size: $font-size-lg;
  font-weight: $font-weight-semibold;
  cursor: pointer;
  transition: all $transition-base ease;
  position: relative;
  overflow: hidden;
  margin-bottom: $spacing-3xl;

  &::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 0;
    height: 0;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.2);
    transform: translate(-50%, -50%);
    transition: width 0.6s, height 0.6s;
  }

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 10px 30px rgba(0, 212, 255, 0.4);

    &::before {
      width: 400px;
      height: 400px;
    }

    .button-icon {
      transform: translateX(5px);
    }
  }

  &:active {
    transform: translateY(-1px);
  }

  .button-text {
    position: relative;
    z-index: 1;
  }

  .button-icon {
    width: 24px;
    height: 24px;
    position: relative;
    z-index: 1;
    transition: transform $transition-base ease;
  }
}

.feature-preview {
  display: flex;
  gap: $spacing-2xl;
  margin-bottom: $spacing-3xl;
}

.feature-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: $spacing-sm;
  animation: fadeInUp 1s ease backwards;

  .feature-icon {
    width: 60px;
    height: 60px;
    background: $bg-tertiary;
    border: 1px solid $bg-elevated;
    border-radius: $border-radius-lg;
    display: flex;
    align-items: center;
    justify-content: center;
    color: $primary-color;
    transition: all $transition-base ease;

    svg {
      width: 28px;
      height: 28px;
    }

    &:hover {
      background: rgba(0, 212, 255, 0.1);
      border-color: $primary-color;
      transform: translateY(-5px);
      box-shadow: 0 8px 20px rgba(0, 212, 255, 0.3);
    }
  }

  .feature-label {
    font-size: $font-size-sm;
    color: $text-secondary;
    font-weight: $font-weight-medium;
  }
}

.welcome-footer {
  position: absolute;
  bottom: $spacing-2xl;

  .footer-text {
    font-size: $font-size-sm;
    color: $text-tertiary;
  }
}

@keyframes glow {
  from {
    filter: drop-shadow(0 0 20px rgba(0, 212, 255, 0.3));
  }
  to {
    filter: drop-shadow(0 0 40px rgba(0, 212, 255, 0.6));
  }
}
</style>
