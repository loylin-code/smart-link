<template>
  <div class="play-container">
    <header class="play-header">
      <h1>SmartLink Component Playground</h1>
    </header>
    <main class="play-main">
      <section class="demo-section">
        <h2>Button Component</h2>
        <div class="demo-row">
          <SlButton type="primary">Primary Button</SlButton>
          <SlButton type="default">Default Button</SlButton>
          <SlButton type="danger">Danger Button</SlButton>
          <SlButton type="success">Success Button</SlButton>
        </div>
        <div class="demo-row">
          <SlButton size="small">Small</SlButton>
          <SlButton size="medium">Medium</SlButton>
          <SlButton size="large">Large</SlButton>
        </div>
        <div class="demo-row">
          <SlButton loading>Loading</SlButton>
          <SlButton disabled>Disabled</SlButton>
        </div>
      </section>

      <section class="demo-section">
        <h2>Input Component</h2>
        <div class="demo-row">
          <SlInput v-model="inputValue" placeholder="Type something..." />
          <SlInput v-model="passwordValue" type="password" placeholder="Password" />
        </div>
        <div class="demo-row">
          <SlInput v-model="textareaValue" type="textarea" placeholder="Textarea" :rows="4" />
        </div>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
  import { ref } from 'vue'
  import { SlButton, SlInput } from '@smart-link/ui'

  const inputValue = ref('')
  const passwordValue = ref('')
  const textareaValue = ref('')
</script>

<style scoped lang="scss">
  .play-container {
    min-height: 100vh;
    background: #0a0e27;
    color: #fff;
    padding: 24px;
  }

  .play-header {
    margin-bottom: 32px;
    padding-bottom: 16px;
    border-bottom: 1px solid #252b4e;

    h1 {
      font-size: 24px;
      font-weight: 600;
      background: linear-gradient(135deg, #00d4ff, #7c3aed);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
  }

  .demo-section {
    margin-bottom: 32px;

    h2 {
      font-size: 18px;
      margin-bottom: 16px;
      color: #b4b9d4;
    }
  }

  .demo-row {
    display: flex;
    gap: 16px;
    margin-bottom: 16px;
    flex-wrap: wrap;
  }
</style>
