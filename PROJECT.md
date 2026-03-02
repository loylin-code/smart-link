# SmartLink - Agent编排管理平台

## 项目简介

SmartLink是一个现代化的Agent编排管理平台，提供对话、应用管理、应用编排、资源管理等核心功能。采用科技感、现代感、简约的设计风格，具有清晰的层级结构和流畅的动画效果。

## 技术栈

- **前端框架**: Vue 3.4+ (Composition API)
- **构建工具**: Vite 5.0+
- **UI组件库**: OpenTiny Vue 3.x
- **开发语言**: TypeScript 5.0+
- **状态管理**: Pinia
- **路由管理**: Vue Router 4.x
- **动画库**: @vueuse/motion + CSS3
- **样式预处理**: Sass

## 项目结构

```
smart-link/
├── public/                    # 静态资源
├── src/
│   ├── assets/               # 资源文件
│   │   ├── styles/          # 全局样式
│   │   │   ├── variables.scss    # 变量定义
│   │   │   ├── animations.scss   # 动画效果
│   │   │   └── global.scss       # 全局样式
│   │   └── images/          # 图片资源
│   ├── components/          # 公共组件
│   │   ├── layout/         # 布局组件
│   │   │   ├── AppLayout.vue     # 主布局
│   │   │   ├── AppHeader.vue     # 顶部栏
│   │   │   ├── AppSidebar.vue    # 侧边栏
│   │   │   └── AppConsole.vue    # 控制台
│   │   ├── common/         # 通用组件
│   │   └── business/       # 业务组件
│   ├── views/              # 页面视图
│   │   ├── welcome/       # 欢迎页
│   │   ├── conversation/   # 对话模块
│   │   ├── application/    # 应用管理
│   │   ├── resource/       # 资源管理
│   │   └── error/         # 错误页面
│   ├── router/            # 路由配置
│   ├── store/             # 状态管理
│   │   ├── modules/
│   │   │   ├── app.ts            # 应用状态
│   │   │   └── conversation.ts   # 对话状态
│   │   └── index.ts
│   ├── api/               # API接口
│   ├── utils/             # 工具函数
│   ├── types/             # 类型定义
│   ├── App.vue
│   └── main.ts
├── .env.development        # 开发环境配置
├── .env.production         # 生产环境配置
├── vite.config.ts         # Vite配置
├── tsconfig.json          # TypeScript配置
└── package.json
```

## 核心功能

### 1. 欢迎页
- 科技感粒子背景动画
- 发光Logo效果
- 流畅的页面过渡动画
- 功能预览卡片

### 2. 对话管理
- 对话列表管理
- 实时消息展示
- 消息输入和发送
- 对话历史记录

### 3. 应用管理
- 应用列表展示
- 应用创建和编辑
- 应用编排功能
- 应用状态管理

### 4. 资源管理
- Skills管理
- MCP管理
- 前端组件管理

### 5. 控制台
- 实时日志展示
- 多标签页支持
- 可调整高度
- 命令行终端

## 设计特色

### 色彩系统
- **主色调**: 科技蓝 (#00D4FF)
- **辅助色**: 紫色系 (#7C3AED)
- **背景色**: 深色主题 (#0A0E27)
- **功能色**: 成功、警告、错误、信息

### 动画效果
- 页面过渡动画
- 组件交互动画
- 加载动画
- 发光效果
- 粒子背景

### 响应式设计
- 侧边栏可折叠
- 控制台可调整
- 自适应布局

## 开发指南

### 安装依赖
```bash
npm install
```

### 启动开发服务器
```bash
npm run dev
```

### 构建生产版本
```bash
npm run build
```

### 预览生产版本
```bash
npm run preview
```

### 代码格式化
```bash
npm run format
```

### 代码检查
```bash
npm run lint
```

## 环境配置

### 开发环境 (.env.development)
```
VITE_APP_TITLE=SmartLink
VITE_API_BASE_URL=http://localhost:8080/api
VITE_APP_ENV=development
```

### 生产环境 (.env.production)
```
VITE_APP_TITLE=SmartLink
VITE_API_BASE_URL=https://api.smartlink.com
VITE_APP_ENV=production
```

## 浏览器支持

- Chrome >= 87
- Firefox >= 78
- Safari >= 14
- Edge >= 88

## 开发规范

### 命名规范
- **文件命名**: kebab-case (如: app-layout.vue)
- **组件命名**: PascalCase (如: AppLayout)
- **变量命名**: camelCase (如: isActive)
- **常量命名**: UPPER_SNAKE_CASE (如: API_BASE_URL)
- **CSS类名**: BEM规范 (如: .block__element--modifier)

### 代码规范
- 使用TypeScript严格模式
- 使用Composition API
- 使用`<script setup>`语法
- Props必须定义类型
- 统一使用ESLint + Prettier格式化

### Git提交规范
```
feat: 新功能
fix: 修复bug
docs: 文档更新
style: 代码格式调整
refactor: 重构
test: 测试相关
chore: 构建/工具相关
```

## 性能优化

- 路由懒加载
- 组件按需加载
- 第三方库按需引入
- 图片懒加载
- 代码分割
- Gzip压缩

## 后续计划

- [ ] 完善应用编排功能
- [ ] 集成后端API
- [ ] 添加用户认证
- [ ] 实现数据持久化
- [ ] 添加单元测试
- [ ] 优化移动端适配
- [ ] 添加国际化支持

## 许可证

MIT License

## 联系方式

如有问题或建议，请提交Issue或Pull Request。
