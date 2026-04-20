<template>
  <div class="markdown-renderer">
    <div ref="contentRef" class="markdown-content" v-html="renderedHtml"></div>
    <div v-if="showCopyFeedback" class="copy-feedback">已复制</div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted, nextTick } from 'vue'
  import MarkdownIt from 'markdown-it'
  import hljs from 'highlight.js'
  import 'highlight.js/styles/github.css'

  interface Props {
    content: string
  }

  const props = defineProps<Props>()
  const contentRef = ref<HTMLElement>()
  const showCopyFeedback = ref(false)

  const md = new MarkdownIt({
    html: true,
    linkify: true,
    highlight: (str: string, lang: string) => {
      if (lang && hljs.getLanguage(lang)) {
        try {
          return hljs.highlight(str, { language: lang }).value
        } catch {
          // intentionally empty
        }
      }
      return hljs.highlightAuto(str).value
    }
  })

  const renderedHtml = computed(() => md.render(props.content))

  onMounted(() => {
    nextTick(() => {
      contentRef.value?.querySelectorAll('pre code').forEach((block) => {
        const pre = block.parentElement
        if (pre) {
          const copyBtn = document.createElement('button')
          copyBtn.className = 'copy-btn'
          copyBtn.textContent = '复制'
          copyBtn.onclick = () => {
            navigator.clipboard.writeText(block.textContent || '')
            showCopyFeedback.value = true
            setTimeout(() => (showCopyFeedback.value = false), 2000)
          }
          pre.style.position = 'relative'
          pre.appendChild(copyBtn)
        }
      })
    })
  })
</script>

<style scoped lang="scss">
  .markdown-renderer {
    padding: 20px;
  }
  .markdown-content {
    h1 {
      font-size: 24px;
      margin-top: 24px;
      color: #0f172a;
    }
    h2 {
      font-size: 20px;
      margin-top: 20px;
      color: #0f172a;
    }
    h3 {
      font-size: 16px;
      margin-top: 16px;
      color: #0f172a;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 16px 0;
    }
    th,
    td {
      border: 1px solid #e2e8f0;
      padding: 8px 12px;
    }
    th {
      background: #f1f5f9;
      font-weight: 600;
    }
    pre {
      margin: 16px 0;
      border-radius: 8px;
      overflow: hidden;
      position: relative;
      background: #f6f8fa;
    }
    code {
      font-family: 'Consolas', monospace;
    }
  }
  .copy-btn {
    position: absolute;
    top: 8px;
    right: 8px;
    padding: 4px 12px;
    font-size: 12px;
    background: #3b82f6;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    &:hover {
      background: #2563eb;
    }
  }
  .copy-feedback {
    position: fixed;
    bottom: 24px;
    right: 24px;
    padding: 8px 16px;
    background: #059669;
    color: white;
    border-radius: 8px;
    font-size: 14px;
    animation: fadeIn 0.2s ease;
  }
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
</style>
