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
            <circle cx="40" cy="40" r="36" stroke="currentColor" stroke-width="2" opacity="0.3" />
            <circle cx="40" cy="40" r="28" stroke="currentColor" stroke-width="2" opacity="0.5" />
            <circle cx="40" cy="40" r="20" stroke="currentColor" stroke-width="2" />
            <path
              d="M32 40L38 46L48 34"
              stroke="currentColor"
              stroke-width="3"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </div>
        <h1 class="logo-text">SmartLink</h1>
      </div>

      <!-- 标语 -->
      <p class="welcome-slogan">{{ t('welcome.slogan') }}</p>
      <p class="welcome-description">{{ t('welcome.description') }}</p>

      <!-- 按钮区域 -->
      <div class="button-group">
        <button class="start-button" @click="handleStart">
          <span class="button-icon-left">🚀</span>
          <span class="button-text">{{ t('welcome.startExplore') }}</span>
          <svg class="button-icon-right" viewBox="0 0 24 24" fill="none">
            <path
              d="M5 12H19M19 12L12 5M19 12L12 19"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </button>
      </div>

      <!-- 次级按钮 -->
      <button class="secondary-button" @click="handleOpenClaw">
        <span>{{ t('welcome.experienceOpenClaw') }}</span>
      </button>
    </div>

    <!-- 底部信息 -->
    <div class="welcome-footer">
      <p class="footer-text">{{ t('welcome.poweredBy') }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted, onUnmounted } from 'vue'
  import { useRouter } from 'vue-router'
  import { useI18n } from 'vue-i18n'

  const router = useRouter()
  const { t } = useI18n()
  const particleCanvas = ref<HTMLCanvasElement>()

  const handleStart = () => {
    router.push('/app/explore')
  }

  const handleOpenClaw = () => {
    window.open(
      'https://loylin.com/openclaw/?token=0f463b60f68e62babad7c24898013b0dab742c1e1fd7bc6f',
      '_blank'
    )
  }

  // 粒子动画
  let animationId: number
  let resizeListener: () => void

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
    resizeListener = resizeCanvas
    window.addEventListener('resize', resizeListener)

    // 粒子类
    class Particle {
      x: number
      y: number
      vx: number
      vy: number
      radius: number
      opacity: number

      constructor() {
        this.x = Math.random() * canvas.width
        this.y = Math.random() * canvas.height
        this.vx = (Math.random() - 0.5) * 0.5
        this.vy = (Math.random() - 0.5) * 0.5
        this.radius = Math.random() * 2 + 1
        this.opacity = Math.random() * 0.5 + 0.3
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
        ctx!.fillStyle = `rgba(24, 144, 255, ${this.opacity})`
        ctx!.fill()
      }
    }

    // 创建粒子
    const particles: Particle[] = []
    const particleCount = window.innerWidth < 768 ? 40 : 80
    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle())
    }

    // 动画循环
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // 更新和绘制粒子
      particles.forEach((p) => {
        p.update()
        p.draw()
      })

      // 绘制连线
      particles.forEach((p1, i) => {
        particles.slice(i + 1).forEach((p2) => {
          const dx = p1.x - p2.x
          const dy = p1.y - p2.y
          const dist = Math.sqrt(dx * dx + dy * dy)

          if (dist < 120) {
            ctx!.beginPath()
            ctx!.moveTo(p1.x, p1.y)
            ctx!.lineTo(p2.x, p2.y)
            ctx!.strokeStyle = `rgba(24, 144, 255, ${0.15 * (1 - dist / 120)})`
            ctx!.stroke()
          }
        })
      })

      animationId = requestAnimationFrame(animate)
    }

    animate()
  })

  // 清理
  onUnmounted(() => {
    if (animationId) {
      cancelAnimationFrame(animationId)
    }
    if (resizeListener) {
      window.removeEventListener('resize', resizeListener)
    }
  })
</script>

<style scoped lang="scss">
  @use '@/assets/styles/variables.scss' as *;

  .welcome-page {
    width: 100%;
    height: 100vh;
    background: linear-gradient(135deg, #f0f5ff 0%, #e6f7ff 50%, #ffffff 100%);
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
    animation: fadeInUp 0.8s ease-out;
    padding: 0 24px;
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
    gap: 16px;
    margin-bottom: 32px;
    animation: logoFadeIn 1s ease-out 0.2s both;

    .logo-icon {
      width: 120px;
      height: 120px;
      color: $primary-color;
      animation:
        glow 2s ease-in-out infinite alternate,
        float 3s ease-in-out infinite;

      svg {
        width: 100%;
        height: 100%;
      }
    }

    .logo-text {
      font-size: 56px;
      font-weight: $font-weight-bold;
      background: linear-gradient(135deg, $primary-color 0%, $primary-light 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      letter-spacing: 2px;
      margin: 0;

      @media (max-width: 768px) {
        font-size: 40px;
      }
    }
  }

  @keyframes glow {
    from {
      filter: drop-shadow(0 0 20px rgba($primary-color, 0.3));
    }
    to {
      filter: drop-shadow(0 0 40px rgba($primary-color, 0.6));
    }
  }

  @keyframes float {
    0%,
    100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-8px);
    }
  }

  @keyframes logoFadeIn {
    from {
      opacity: 0;
      transform: scale(0.9);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }

  .welcome-slogan {
    font-size: 24px;
    color: $text-primary;
    margin-bottom: 8px;
    font-weight: $font-weight-semibold;
    animation: fadeInUp 0.8s ease-out 0.4s both;

    @media (max-width: 768px) {
      font-size: 20px;
    }
  }

  .welcome-description {
    font-size: 18px;
    color: $text-secondary;
    margin-bottom: 48px;
    animation: fadeInUp 0.8s ease-out 0.5s both;

    @media (max-width: 768px) {
      font-size: 14px;
      padding: 0 16px;
    }
  }

  .button-group {
    display: flex;
    align-items: center;
    gap: 24px;
    margin-bottom: 24px;
    animation: fadeInUp 0.8s ease-out 0.6s both;
  }

  .start-button {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 16px 48px;
    background: linear-gradient(135deg, $primary-color 0%, $primary-dark 100%);
    border: none;
    border-radius: $border-radius-full;
    color: #ffffff;
    font-size: 18px;
    font-weight: $font-weight-semibold;
    cursor: pointer;
    transition: all $transition-base ease;
    position: relative;
    overflow: hidden;
    box-shadow: 0 4px 14px rgba($primary-color, 0.25);

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
      transition:
        width 0.6s,
        height 0.6s;
    }

    &:hover {
      transform: translateY(-3px);
      box-shadow: 0 8px 25px rgba($primary-color, 0.4);

      &::before {
        width: 400px;
        height: 400px;
      }

      .button-icon-right {
        transform: translateX(5px);
      }
    }

    &:active {
      transform: translateY(-1px);
    }

    .button-icon-left {
      font-size: 20px;
    }

    .button-text {
      position: relative;
      z-index: 1;
    }

    .button-icon-right {
      width: 20px;
      height: 20px;
      position: relative;
      z-index: 1;
      transition: transform $transition-base ease;
    }

    @media (max-width: 768px) {
      padding: 14px 36px;
      font-size: 16px;
    }
  }

  .secondary-button {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 12px 32px;
    background: transparent;
    border: 1px solid rgba($primary-color, 0.5);
    border-radius: $border-radius-full;
    color: $primary-color;
    font-size: 14px;
    font-weight: $font-weight-medium;
    cursor: pointer;
    transition: all $transition-base ease;
    animation: fadeInUp 0.8s ease-out 0.7s both;

    &:hover {
      background: rgba($primary-color, 0.08);
      border-color: $primary-color;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba($primary-color, 0.15);
    }

    &:active {
      transform: translateY(0);
    }
  }

  .welcome-footer {
    position: absolute;
    bottom: 48px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 2;
    animation: fadeIn 1s ease-out 1s both;

    .footer-text {
      font-size: 14px;
      color: $text-tertiary;
      margin: 0;
    }

    @media (max-width: 768px) {
      bottom: 24px;
    }
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  // 响应式调整
  @media (max-width: 768px) {
    .welcome-logo {
      .logo-icon {
        width: 80px;
        height: 80px;
      }
    }
  }
</style>
