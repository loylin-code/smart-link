<template>
  <div class="welcome-page">
    <!-- 背景装饰 -->
    <div class="welcome-bg">
      <div class="bg-gradient"></div>
      <div class="bg-pattern"></div>
    </div>

    <!-- 主要内容 -->
    <div class="welcome-content">
      <!-- Logo -->
      <div class="welcome-logo">
        <div class="logo-mark">
          <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect
              x="4"
              y="4"
              width="40"
              height="40"
              rx="12"
              stroke="currentColor"
              stroke-width="1.5"
              opacity="0.3"
            />
            <rect
              x="10"
              y="10"
              width="28"
              height="28"
              rx="8"
              stroke="currentColor"
              stroke-width="1.5"
              opacity="0.5"
            />
            <path
              d="M16 24L22 30L32 18"
              stroke="currentColor"
              stroke-width="2"
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
      <div class="welcome-actions">
        <button class="primary-action" @click="handleStart">
          <span>{{ t('welcome.startExplore') }}</span>
          <svg viewBox="0 0 24 24" fill="none">
            <path
              d="M5 12H19M19 12L12 5M19 12L12 19"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </button>
        <button class="secondary-action" @click="handleOpenClaw">
          {{ t('welcome.experienceOpenClaw') }}
        </button>
      </div>
    </div>

    <!-- 底部信息 -->
    <footer class="welcome-footer">
      <p>{{ t('welcome.poweredBy') }}</p>
    </footer>
  </div>
</template>

<script setup lang="ts">
  import { useRouter } from 'vue-router'
  import { useI18n } from 'vue-i18n'

  const router = useRouter()
  const { t } = useI18n()

  const handleStart = () => {
    router.push('/app/explore')
  }

  const handleOpenClaw = () => {
    window.open(
      'https://loylin.com/openclaw/?token=0f463b60f68e62babad7c24898013b0dab742c1e1fd7bc6f',
      '_blank'
    )
  }
</script>

<style scoped lang="scss">
  .welcome-page {
    width: 100%;
    height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    position: relative;
    overflow: hidden;
    background: $bg-primary;
  }

  // 背景装饰
  .welcome-bg {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 0;
    pointer-events: none;

    .bg-gradient {
      position: absolute;
      top: -50%;
      right: -20%;
      width: 80%;
      height: 150%;
      background: radial-gradient(ellipse at center, rgba(30, 64, 175, 0.06) 0%, transparent 60%);
      animation: float 20s ease-in-out infinite;
    }

    .bg-pattern {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-image:
        radial-gradient(circle at 20% 80%, rgba(5, 150, 105, 0.03) 0%, transparent 50%),
        radial-gradient(circle at 80% 20%, rgba(30, 64, 175, 0.03) 0%, transparent 50%);
    }
  }

  @keyframes float {
    0%,
    100% {
      transform: translateY(0) rotate(0deg);
    }
    50% {
      transform: translateY(-20px) rotate(2deg);
    }
  }

  // 主内容
  .welcome-content {
    position: relative;
    z-index: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    max-width: 600px;
    padding: 0 $spacing-xl;
    animation: fadeUp 0.6s $ease-out both;
  }

  @keyframes fadeUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  // Logo
  .welcome-logo {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: $spacing-md;
    margin-bottom: $spacing-xl;
    animation: fadeUp 0.6s $ease-out 0.1s both;
  }

  .logo-mark {
    width: 80px;
    height: 80px;
    color: $primary-color;
    transition: transform 0.3s $ease-out;

    svg {
      width: 100%;
      height: 100%;
    }

    &:hover {
      transform: scale(1.05);
    }
  }

  .logo-text {
    font-family: $font-family-display;
    font-size: $font-size-5xl;
    font-weight: $font-weight-bold;
    color: $text-primary;
    letter-spacing: -0.02em;
    margin: 0;

    @include respond-below(md) {
      font-size: $font-size-4xl;
    }
  }

  // 标语
  .welcome-slogan {
    font-family: $font-family;
    font-size: $font-size-xl;
    font-weight: $font-weight-semibold;
    color: $text-primary;
    margin-bottom: $spacing-sm;
    animation: fadeUp 0.6s $ease-out 0.15s both;

    @include respond-below(md) {
      font-size: $font-size-lg;
    }
  }

  .welcome-description {
    font-size: $font-size-base;
    color: $text-tertiary;
    margin-bottom: $spacing-2xl;
    line-height: $line-height-relaxed;
    animation: fadeUp 0.6s $ease-out 0.2s both;

    @include respond-below(md) {
      font-size: $font-size-sm;
      padding: 0 $spacing-md;
    }
  }

  // 操作按钮
  .welcome-actions {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: $spacing-md;
    animation: fadeUp 0.6s $ease-out 0.25s both;
  }

  .primary-action {
    display: inline-flex;
    align-items: center;
    gap: $spacing-sm;
    padding: $spacing-md $spacing-2xl;
    font-family: $font-family;
    font-size: $font-size-base;
    font-weight: $font-weight-semibold;
    color: $text-inverse;
    background: $primary-color;
    border: none;
    border-radius: $border-radius-md;
    cursor: pointer;
    transition: all $transition-fast $ease-out;

    svg {
      width: 18px;
      height: 18px;
      transition: transform $transition-fast $ease-out;
    }

    &:hover {
      background: $primary-dark;
      box-shadow: $shadow-primary;

      svg {
        transform: translateX(4px);
      }
    }

    &:active {
      transform: translateY(1px);
    }

    @include respond-below(md) {
      padding: $spacing-sm $spacing-xl;
      font-size: $font-size-sm;
    }
  }

  .secondary-action {
    padding: $spacing-sm $spacing-lg;
    font-family: $font-family;
    font-size: $font-size-sm;
    font-weight: $font-weight-medium;
    color: $text-secondary;
    background: transparent;
    border: 1px solid $border-color-base;
    border-radius: $border-radius-md;
    cursor: pointer;
    transition: all $transition-fast $ease-out;

    &:hover {
      border-color: $primary-color;
      color: $primary-color;
      background: $primary-surface;
    }
  }

  // 底部
  .welcome-footer {
    position: absolute;
    bottom: $spacing-2xl;
    left: 50%;
    transform: translateX(-50%);
    text-align: center;
    animation: fadeUp 0.6s $ease-out 0.4s both;

    p {
      font-size: $font-size-xs;
      color: $text-disabled;
      margin: 0;
    }

    @include respond-below(md) {
      bottom: $spacing-lg;
    }
  }

  // 动画减少模式
  @include reduced-motion {
    .welcome-content,
    .welcome-logo,
    .welcome-slogan,
    .welcome-description,
    .welcome-actions,
    .welcome-footer {
      animation: none;
      opacity: 1;
      transform: none;
    }

    .bg-gradient {
      animation: none;
    }
  }
</style>
