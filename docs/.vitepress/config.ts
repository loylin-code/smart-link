import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'SmartLink',
  description: 'AI-powered page orchestration platform',
  lang: 'zh-CN',
  base: '/',
  head: [['link', { rel: 'icon', href: '/favicon.ico' }]],
  themeConfig: {
    logo: '/logo.svg',
    nav: [
      { text: '指南', link: '/guide/' },
      { text: '组件', link: '/components/' },
      {
        text: '相关链接',
        items: [{ text: 'GitHub', link: 'https://github.com/loylin-code/smart-link' }]
      }
    ],
    sidebar: {
      '/guide/': [
        {
          text: '开始',
          items: [
            { text: '介绍', link: '/guide/' },
            { text: '快速上手', link: '/guide/quick-start' },
            { text: '安装', link: '/guide/installation' }
          ]
        }
      ],
      '/components/': [
        {
          text: '基础组件',
          items: [
            { text: 'Button 按钮', link: '/components/button' },
            { text: 'Input 输入框', link: '/components/input' }
          ]
        }
      ]
    },
    socialLinks: [{ icon: 'github', link: 'https://github.com/loylin-code/smart-link' }],
    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2024-present SmartLink'
    }
  },
  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          silenceDeprecations: ['legacy-js-api']
        }
      }
    }
  }
})
