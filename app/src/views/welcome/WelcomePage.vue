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
          <span class="button-text">{{ t('welcome.startExplore') }}</span>
          <svg class="button-icon" viewBox="0 0 24 24" fill="none">
            <path
              d="M5 12H19M19 12L12 5M19 12L12 19"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </button>
        <button class="secondary-button" @click="handleOpenClaw">
          <span>{{ t('welcome.experienceOpenClaw') }}</span>
        </button>
      </div>
    </div>

    <!-- 底部信息 -->
    <div class="welcome-footer">
      <p class="footer-text">{{ t('welcome.poweredBy') }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted } from 'vue'
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
        ctx!.fillStyle = 'rgba(24, 144, 255, 0.4)'
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
    gap: 16px;
    margin-bottom: 32px;

    .logo-icon {
      width: 120px;
      height: 120px;
      color: #1890ff;
      animation: glow 2s ease-in-out infinite alternate;

      svg {
        width: 100%;
        height: 100%;
      }
    }

    .logo-text {
      font-size: 56px;
      font-weight: 700;
      background: linear-gradient(135deg, #1890ff 0%, #40a9ff 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      letter-spacing: 2px;
    }
  }

  .welcome-slogan {
    font-size: 24px;
    color: #303133;
    margin-bottom: 8px;
    font-weight: 600;
  }

  .welcome-description {
    font-size: 18px;
    color: #606266;
    margin-bottom: 48px;
  }

  .button-group {
    display: flex;
    align-items: center;
    gap: 24px;
    margin-bottom: 48px;
  }

  .start-button {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 16px 48px;
    background: linear-gradient(135deg, #1890ff 0%, #096dd9 100%);
    border-radius: 999px;
    color: #ffffff;
    font-size: 18px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;

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
      box-shadow: 0 10px 30px rgba(24, 144, 255, 0.4);

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
      transition: transform 0.3s ease;
    }
  }

  .secondary-button {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 12px 32px;
    background: transparent;
    border: 1px solid rgba(24, 144, 255, 0.5);
    border-radius: 999px;
    color: #1890ff;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover {
      background: rgba(24, 144, 255, 0.08);
      border-color: #1890ff;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(24, 144, 255, 0.15);
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

    .footer-text {
      font-size: 14px;
      color: #909399;
    }
  }

  @keyframes glow {
    from {
      filter: drop-shadow(0 0 20px rgba(24, 144, 255, 0.3));
    }
    to {
      filter: drop-shadow(0 0 40px rgba(24, 144, 255, 0.6));
    }
  }
</style>
