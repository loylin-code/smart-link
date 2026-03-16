import type { ComponentMeta } from '../types/component-meta'

export const COMPONENT_META_LIST: ComponentMeta[] = [
  // Basic Components
  {
    type: 'SlButton',
    name: '按钮',
    category: 'basic',
    description: '常用的操作按钮，支持多种类型和尺寸',
    icon: 'button',
    props: [
      {
        name: 'type',
        type: 'string',
        default: 'default',
        description: '按钮类型',
        options: ['primary', 'default', 'danger', 'warning', 'success']
      },
      {
        name: 'size',
        type: 'string',
        default: 'medium',
        description: '按钮尺寸',
        options: ['small', 'medium', 'large']
      },
      { name: 'disabled', type: 'boolean', default: false, description: '是否禁用' },
      { name: 'loading', type: 'boolean', default: false, description: '是否加载中' }
    ],
    events: [{ name: 'click', params: 'event: MouseEvent', description: '点击按钮时触发' }],
    slots: [{ name: 'default', description: '按钮内容' }],
    examples: [
      {
        title: '按钮类型',
        description: '提供多种类型的按钮',
        code: `<SlButton type="primary">主要按钮</SlButton>
<SlButton type="default">默认按钮</SlButton>
<SlButton type="danger">危险按钮</SlButton>
<SlButton type="warning">警告按钮</SlButton>
<SlButton type="success">成功按钮</SlButton>`
      },
      {
        title: '按钮尺寸',
        description: '三种不同尺寸的按钮',
        code: `<SlButton size="small" type="primary">小按钮</SlButton>
<SlButton size="medium" type="primary">中按钮</SlButton>
<SlButton size="large" type="primary">大按钮</SlButton>`
      },
      {
        title: '禁用与加载',
        description: '按钮的禁用和加载状态',
        code: `<SlButton disabled>禁用按钮</SlButton>
<SlButton loading>加载中</SlButton>`
      }
    ]
  },
  {
    type: 'SlIcon',
    name: '图标',
    category: 'basic',
    description: '常用图标集合',
    icon: 'icon',
    props: [
      { name: 'name', type: 'string', description: '图标名称' },
      { name: 'size', type: 'string | number', default: 16, description: '图标大小' },
      { name: 'color', type: 'string', description: '图标颜色' },
      { name: 'spin', type: 'boolean', default: false, description: '是否旋转' }
    ],
    events: [{ name: 'click', params: 'event: MouseEvent', description: '点击时触发' }],
    slots: [],
    examples: [
      {
        title: '基础用法',
        description: '使用图标名称显示图标',
        code: `<SlIcon name="edit" :size="20" />
<SlIcon name="delete" :size="20" color="#f56c6c" />
<SlIcon name="setting" :size="20" color="#409eff" />`
      },
      {
        title: '旋转动画',
        description: '图标旋转动画效果',
        code: `<SlIcon name="loading" :size="24" spin />
<SlIcon name="sync" :size="24" spin color="#1890ff" />`
      }
    ]
  },
  {
    type: 'SlTag',
    name: '标签',
    category: 'basic',
    description: '用于标记和分类',
    icon: 'tag',
    props: [
      {
        name: 'type',
        type: 'string',
        default: 'default',
        description: '标签类型',
        options: ['default', 'primary', 'success', 'warning', 'danger', 'info']
      },
      {
        name: 'size',
        type: 'string',
        default: 'medium',
        description: '标签尺寸',
        options: ['small', 'medium', 'large']
      },
      { name: 'closable', type: 'boolean', default: false, description: '是否可关闭' },
      { name: 'round', type: 'boolean', default: false, description: '是否圆角' }
    ],
    events: [
      { name: 'click', params: 'event: MouseEvent', description: '点击时触发' },
      { name: 'close', params: 'event: MouseEvent', description: '关闭时触发' }
    ],
    slots: [{ name: 'default', description: '标签内容' }],
    examples: [
      {
        title: '标签类型',
        description: '不同类型的标签',
        code: `<SlTag type="default">默认</SlTag>
<SlTag type="primary">主要</SlTag>
<SlTag type="success">成功</SlTag>
<SlTag type="warning">警告</SlTag>
<SlTag type="danger">危险</SlTag>
<SlTag type="info">信息</SlTag>`
      },
      {
        title: '可关闭标签',
        description: '带关闭按钮的标签',
        code: `<SlTag type="primary" closable @close="handleClose">
  可关闭标签
</SlTag>`
      },
      {
        title: '圆角标签',
        code: `<SlTag type="success" round>圆角标签</SlTag>`
      }
    ]
  },
  {
    type: 'SlBadge',
    name: '徽标',
    category: 'basic',
    description: '用于显示数字或状态标记',
    icon: 'badge',
    props: [
      { name: 'value', type: 'string | number', description: '显示值' },
      { name: 'max', type: 'number', default: 99, description: '最大值' },
      { name: 'dot', type: 'boolean', default: false, description: '是否显示小圆点' },
      { name: 'hidden', type: 'boolean', default: false, description: '是否隐藏' }
    ],
    events: [],
    slots: [{ name: 'default', description: '包裹元素' }],
    examples: [
      {
        title: '数字徽标',
        description: '显示数字标记',
        code: `<SlBadge :value="12">
  <SlButton>消息</SlButton>
</SlBadge>
<SlBadge :value="100" :max="99">
  <SlButton>评论</SlButton>
</SlBadge>`
      },
      {
        title: '小红点',
        description: '显示小红点标记',
        code: `<SlBadge dot>
  <SlButton>通知</SlButton>
</SlBadge>`
      }
    ]
  },
  {
    type: 'SlAvatar',
    name: '头像',
    category: 'basic',
    description: '用于展示用户头像',
    icon: 'avatar',
    props: [
      { name: 'src', type: 'string', description: '图片地址' },
      { name: 'size', type: 'string | number', default: 'medium', description: '头像尺寸' },
      { name: 'circle', type: 'boolean', default: false, description: '是否圆形' },
      { name: 'text', type: 'string', description: '文字头像' }
    ],
    events: [],
    slots: [],
    examples: [
      {
        title: '图片头像',
        description: '使用图片作为头像',
        code: `<SlAvatar src="https://example.com/avatar.jpg" />
<SlAvatar src="https://example.com/avatar.jpg" :size="64" circle />`
      },
      {
        title: '文字头像',
        description: '使用文字作为头像',
        code: `<SlAvatar text="张三" />
<SlAvatar text="李四" :size="48" />`
      }
    ]
  },
  {
    type: 'SlDivider',
    name: '分割线',
    category: 'basic',
    description: '用于分隔内容的分割线',
    icon: 'divider',
    props: [{ name: 'vertical', type: 'boolean', default: false, description: '是否垂直' }],
    events: [],
    slots: [{ name: 'default', description: '分割线文字' }],
    examples: [
      {
        title: '水平分割',
        code: `<p>上方内容</p>
<SlDivider />
<p>下方内容</p>`
      },
      {
        title: '带文字分割',
        code: `<SlDivider>默认</SlDivider>
<SlDivider>分割线</SlDivider>`
      },
      {
        title: '垂直分割',
        code: `<span>文字</span>
<SlDivider vertical />
<span>文字</span>
<SlDivider vertical />
<span>文字</span>`
      }
    ]
  },
  {
    type: 'SlLink',
    name: '链接',
    category: 'basic',
    description: '文字超链接',
    icon: 'link',
    props: [
      {
        name: 'type',
        type: 'string',
        default: 'default',
        description: '链接类型',
        options: ['default', 'primary', 'success', 'warning', 'danger', 'info']
      },
      { name: 'href', type: 'string', description: '链接地址' },
      { name: 'disabled', type: 'boolean', default: false, description: '是否禁用' },
      { name: 'underline', type: 'boolean', default: true, description: '是否下划线' }
    ],
    events: [{ name: 'click', params: 'event: MouseEvent', description: '点击时触发' }],
    slots: [{ name: 'default', description: '链接内容' }],
    examples: [
      {
        title: '基础用法',
        code: `<SlLink href="https://example.com">默认链接</SlLink>
<SlLink type="primary">主要链接</SlLink>
<SlLink type="success">成功链接</SlLink>
<SlLink type="warning">警告链接</SlLink>
<SlLink type="danger">危险链接</SlLink>`
      },
      {
        title: '禁用状态',
        code: `<SlLink disabled>禁用链接</SlLink>`
      },
      {
        title: '下划线',
        code: `<SlLink :underline="false">无下划线</SlLink>
<SlLink :underline="true">有下划线</SlLink>`
      }
    ]
  },
  {
    type: 'SlImage',
    name: '图片',
    category: 'basic',
    description: '图片展示组件',
    icon: 'image',
    props: [
      { name: 'src', type: 'string', description: '图片地址' },
      { name: 'alt', type: 'string', description: '替代文本' },
      {
        name: 'fit',
        type: 'string',
        default: 'cover',
        description: '填充方式',
        options: ['fill', 'contain', 'cover', 'none', 'scale-down']
      },
      { name: 'width', type: 'string | number', description: '宽度' },
      { name: 'height', type: 'string | number', description: '高度' }
    ],
    events: [],
    slots: [],
    examples: [
      {
        title: '基础用法',
        description: '展示一张图片',
        code: `<SlImage 
  src="https://picsum.photos/200/200" 
  alt="示例图片"
  :width="200"
  :height="200"
/>`
      },
      {
        title: '填充方式',
        description: '不同的图片填充方式',
        code: `<SlImage src="image.jpg" fit="cover" :width="200" :height="150" />
<SlImage src="image.jpg" fit="contain" :width="200" :height="150" />
<SlImage src="image.jpg" fit="fill" :width="200" :height="150" />`
      }
    ]
  },
  // Form Components
  {
    type: 'SlInput',
    name: '输入框',
    category: 'form',
    description: '通过鼠标或键盘输入内容',
    icon: 'input',
    props: [
      { name: 'modelValue', type: 'string | number', description: '绑定值' },
      {
        name: 'type',
        type: 'string',
        default: 'text',
        description: '输入框类型',
        options: ['text', 'password', 'textarea', 'number']
      },
      { name: 'placeholder', type: 'string', default: '', description: '占位文本' },
      { name: 'disabled', type: 'boolean', default: false, description: '是否禁用' },
      { name: 'readonly', type: 'boolean', default: false, description: '是否只读' }
    ],
    events: [{ name: 'update:modelValue', params: 'value: string', description: '值变化时触发' }],
    slots: [],
    examples: [
      {
        title: '基础用法',
        code: `<SlInput v-model="text" placeholder="请输入内容" />`
      },
      {
        title: '禁用状态',
        code: `<SlInput disabled placeholder="禁用状态" />`
      },
      {
        title: '密码输入框',
        code: `<SlInput v-model="password" type="password" placeholder="请输入密码" />`
      },
      {
        title: '文本域',
        code: `<SlInput 
  v-model="textarea" 
  type="textarea" 
  placeholder="请输入多行文本"
/>`
      }
    ]
  },
  {
    type: 'SlSelect',
    name: '选择器',
    category: 'form',
    description: '下拉选择器',
    icon: 'select',
    props: [
      { name: 'modelValue', type: 'string | number', description: '绑定值' },
      { name: 'options', type: 'Array<{label, value}>', default: [], description: '选项列表' },
      { name: 'placeholder', type: 'string', default: '请选择', description: '占位文本' },
      { name: 'disabled', type: 'boolean', default: false, description: '是否禁用' }
    ],
    events: [
      { name: 'update:modelValue', params: 'value: string | number', description: '值变化时触发' },
      { name: 'change', params: 'value: string | number', description: '选择变化时触发' }
    ],
    slots: [],
    examples: [
      {
        title: '基础用法',
        code: `<SlSelect 
  v-model="value" 
  :options="[
    { label: '选项一', value: '1' },
    { label: '选项二', value: '2' },
    { label: '选项三', value: '3' }
  ]"
  placeholder="请选择"
/>`
      },
      {
        title: '禁用状态',
        code: `<SlSelect 
  disabled
  placeholder="禁用状态"
/>`
      }
    ]
  },
  {
    type: 'SlCheckbox',
    name: '复选框',
    category: 'form',
    description: '多选框',
    icon: 'checkbox',
    props: [
      { name: 'modelValue', type: 'boolean', default: false, description: '绑定值' },
      { name: 'disabled', type: 'boolean', default: false, description: '是否禁用' }
    ],
    events: [
      { name: 'update:modelValue', params: 'value: boolean', description: '值变化时触发' },
      { name: 'change', params: 'value: boolean', description: '状态变化时触发' }
    ],
    slots: [{ name: 'default', description: '标签内容' }],
    examples: [
      {
        title: '基础用法',
        code: `<SlCheckbox v-model="checked">同意协议</SlCheckbox>`
      },
      {
        title: '禁用状态',
        code: `<SlCheckbox disabled>禁用复选框</SlCheckbox>`
      }
    ]
  },
  {
    type: 'SlRadio',
    name: '单选框',
    category: 'form',
    description: '单选框',
    icon: 'radio',
    props: [
      { name: 'modelValue', type: 'string | number', description: '绑定值' },
      { name: 'value', type: 'string | number', description: '选项值' },
      { name: 'name', type: 'string', description: '原生name属性' },
      { name: 'disabled', type: 'boolean', default: false, description: '是否禁用' }
    ],
    events: [
      { name: 'update:modelValue', params: 'value: string | number', description: '值变化时触发' },
      { name: 'change', params: 'value: string | number', description: '选择变化时触发' }
    ],
    slots: [{ name: 'default', description: '标签内容' }],
    examples: [
      {
        title: '基础用法',
        code: `<SlRadio v-model="gender" value="male" name="gender">男</SlRadio>
<SlRadio v-model="gender" value="female" name="gender">女</SlRadio>`
      },
      {
        title: '禁用状态',
        code: `<SlRadio disabled>禁用单选框</SlRadio>`
      }
    ]
  },
  {
    type: 'SlSwitch',
    name: '开关',
    category: 'form',
    description: '开关选择器',
    icon: 'switch',
    props: [
      { name: 'modelValue', type: 'boolean', default: false, description: '绑定值' },
      { name: 'disabled', type: 'boolean', default: false, description: '是否禁用' }
    ],
    events: [
      { name: 'update:modelValue', params: 'value: boolean', description: '值变化时触发' },
      { name: 'change', params: 'value: boolean', description: '状态变化时触发' }
    ],
    slots: [],
    examples: [
      {
        title: '基础用法',
        code: `<SlSwitch v-model="enabled" />`
      },
      {
        title: '禁用状态',
        code: `<SlSwitch disabled />`
      }
    ]
  },
  {
    type: 'SlForm',
    name: '表单',
    category: 'form',
    description: '表单容器',
    icon: 'form',
    props: [
      { name: 'model', type: 'object', default: {}, description: '表单数据对象' },
      { name: 'labelWidth', type: 'string', default: '100px', description: '标签宽度' },
      {
        name: 'labelPosition',
        type: 'string',
        default: 'right',
        description: '标签位置',
        options: ['left', 'right', 'top']
      }
    ],
    events: [{ name: 'submit', params: 'event: Event', description: '提交表单时触发' }],
    slots: [{ name: 'default', description: '表单内容' }],
    examples: [
      {
        title: '基础表单',
        code: `<SlForm :model="formData" label-width="80px">
  <SlFormItem label="用户名" prop="username">
    <SlInput v-model="formData.username" />
  </SlFormItem>
  <SlFormItem label="密码" prop="password">
    <SlInput v-model="formData.password" type="password" />
  </SlFormItem>
</SlForm>`
      }
    ]
  },
  {
    type: 'SlFormItem',
    name: '表单项',
    category: 'form',
    description: '表单项组件',
    icon: 'form-item',
    props: [
      { name: 'label', type: 'string', description: '标签文本' },
      { name: 'prop', type: 'string', description: '字段名' },
      { name: 'required', type: 'boolean', default: false, description: '是否必填' }
    ],
    events: [],
    slots: [{ name: 'default', description: '表单项内容' }],
    examples: [
      {
        title: '基础用法',
        code: `<SlFormItem label="用户名" prop="username" required>
  <SlInput v-model="username" />
</SlFormItem>`
      }
    ]
  },
  // Layout Components
  {
    type: 'SlContainer',
    name: '容器',
    category: 'layout',
    description: '布局容器',
    icon: 'container',
    props: [
      {
        name: 'direction',
        type: 'string',
        default: 'vertical',
        description: '布局方向',
        options: ['horizontal', 'vertical']
      }
    ],
    events: [],
    slots: [{ name: 'default', description: '容器内容' }],
    examples: [
      {
        title: '垂直布局',
        code: `<SlContainer direction="vertical">
  <header>头部</header>
  <main>内容</main>
  <footer>底部</footer>
</SlContainer>`
      },
      {
        title: '水平布局',
        code: `<SlContainer direction="horizontal">
  <aside>侧边栏</aside>
  <main>内容</main>
</SlContainer>`
      }
    ]
  },
  {
    type: 'SlRow',
    name: '行',
    category: 'layout',
    description: '栅格行组件',
    icon: 'row',
    props: [
      { name: 'gutter', type: 'number', default: 0, description: '栅格间隔' },
      {
        name: 'justify',
        type: 'string',
        default: 'start',
        description: '水平对齐方式',
        options: ['start', 'end', 'center', 'space-around', 'space-between']
      },
      {
        name: 'align',
        type: 'string',
        default: 'top',
        description: '垂直对齐方式',
        options: ['top', 'middle', 'bottom']
      }
    ],
    events: [],
    slots: [{ name: 'default', description: '行内容' }],
    examples: [
      {
        title: '基础栅格',
        code: `<SlRow :gutter="20">
  <SlCol :span="12">左侧</SlCol>
  <SlCol :span="12">右侧</SlCol>
</SlRow>`
      },
      {
        title: '对齐方式',
        code: `<SlRow justify="center" align="middle">
  <SlCol :span="8">居中</SlCol>
</SlRow>`
      }
    ]
  },
  {
    type: 'SlCol',
    name: '列',
    category: 'layout',
    description: '栅格列组件',
    icon: 'col',
    props: [
      { name: 'span', type: 'number', default: 24, description: '栅格占据的列数' },
      { name: 'offset', type: 'number', default: 0, description: '栅格左侧的间隔格数' },
      { name: 'push', type: 'number', default: 0, description: '栅格向右移动格数' },
      { name: 'pull', type: 'number', default: 0, description: '栅格向左移动格数' }
    ],
    events: [],
    slots: [{ name: 'default', description: '列内容' }],
    examples: [
      {
        title: '基础用法',
        code: `<SlRow>
  <SlCol :span="24">col-24</SlCol>
</SlRow>
<SlRow>
  <SlCol :span="12">col-12</SlCol>
  <SlCol :span="12">col-12</SlCol>
</SlRow>
<SlRow>
  <SlCol :span="8">col-8</SlCol>
  <SlCol :span="8">col-8</SlCol>
  <SlCol :span="8">col-8</SlCol>
</SlRow>`
      },
      {
        title: '偏移',
        code: `<SlRow>
  <SlCol :span="6" :offset="6">col-6 offset-6</SlCol>
  <SlCol :span="6" :offset="6">col-6 offset-6</SlCol>
</SlRow>`
      }
    ]
  },
  {
    type: 'SlCard',
    name: '卡片',
    category: 'layout',
    description: '信息展示卡片',
    icon: 'card',
    props: [{ name: 'shadow', type: 'boolean', default: true, description: '是否显示阴影' }],
    events: [],
    slots: [
      { name: 'default', description: '卡片主体' },
      { name: 'header', description: '卡片头部' },
      { name: 'footer', description: '卡片底部' }
    ],
    examples: [
      {
        title: '基础卡片',
        code: `<SlCard>
  <template #header>
    <span>卡片标题</span>
  </template>
  <p>卡片内容</p>
  <template #footer>
    <SlButton type="primary">操作</SlButton>
  </template>
</SlCard>`
      },
      {
        title: '简单卡片',
        code: `<SlCard>
  <p>简单的卡片内容</p>
</SlCard>`
      }
    ]
  },
  {
    type: 'SlSpace',
    name: '间距',
    category: 'layout',
    description: '设置组件之间的间距',
    icon: 'space',
    props: [
      {
        name: 'direction',
        type: 'string',
        default: 'horizontal',
        description: '排列方向',
        options: ['horizontal', 'vertical']
      },
      { name: 'size', type: 'string | number', default: 'small', description: '间距大小' }
    ],
    events: [],
    slots: [{ name: 'default', description: '内容' }],
    examples: [
      {
        title: '基础用法',
        code: `<SlSpace>
  <SlButton>按钮1</SlButton>
  <SlButton>按钮2</SlButton>
  <SlButton>按钮3</SlButton>
</SlSpace>`
      },
      {
        title: '垂直方向',
        code: `<SlSpace direction="vertical">
  <SlButton>按钮1</SlButton>
  <SlButton>按钮2</SlButton>
</SlSpace>`
      },
      {
        title: '自定义间距',
        code: `<SlSpace :size="20">
  <SlButton>按钮1</SlButton>
  <SlButton>按钮2</SlButton>
</SlSpace>`
      }
    ]
  },
  // Feedback Components
  {
    type: 'SlDrawer',
    name: '抽屉',
    category: 'layout',
    description: '屏幕边缘滑出的浮层面板',
    icon: 'drawer',
    props: [
      { name: 'modelValue', type: 'boolean', default: false, description: '是否显示' },
      { name: 'title', type: 'string', description: '标题' },
      { name: 'size', type: 'string', default: '400px', description: '抽屉尺寸' },
      {
        name: 'placement',
        type: 'string',
        default: 'right',
        description: '抽屉方向',
        options: ['left', 'right']
      }
    ],
    events: [
      { name: 'update:modelValue', params: 'value: boolean', description: '显示状态变化' },
      { name: 'close', params: '', description: '关闭时触发' }
    ],
    slots: [
      { name: 'default', description: '抽屉内容' },
      { name: 'footer', description: '底部内容' }
    ],
    examples: [
      {
        title: '基础用法',
        code: `<SlButton @click="drawerVisible = true">打开抽屉</SlButton>
<SlDrawer v-model="drawerVisible" title="抽屉标题">
  <p>抽屉内容</p>
  <template #footer>
    <SlButton @click="drawerVisible = false">关闭</SlButton>
  </template>
</SlDrawer>`
      },
      {
        title: '左侧抽屉',
        code: `<SlDrawer 
  v-model="visible" 
  title="左侧抽屉"
  placement="left"
  size="300px"
>
  <p>抽屉内容</p>
</SlDrawer>`
      }
    ]
  },
  {
    type: 'SlModal',
    name: '对话框',
    category: 'layout',
    description: '模态对话框',
    icon: 'modal',
    props: [
      { name: 'modelValue', type: 'boolean', default: false, description: '是否显示' },
      { name: 'title', type: 'string', description: '标题' },
      { name: 'width', type: 'string', default: '500px', description: '对话框宽度' },
      { name: 'closable', type: 'boolean', default: true, description: '是否显示关闭按钮' }
    ],
    events: [
      { name: 'update:modelValue', params: 'value: boolean', description: '显示状态变化' },
      { name: 'close', params: '', description: '关闭时触发' }
    ],
    slots: [
      { name: 'default', description: '对话框内容' },
      { name: 'footer', description: '底部内容' }
    ],
    examples: [
      {
        title: '基础用法',
        code: `<SlButton @click="modalVisible = true">打开对话框</SlButton>
<SlModal v-model="modalVisible" title="对话框标题">
  <p>对话框内容</p>
  <template #footer>
    <SlButton @click="modalVisible = false">取消</SlButton>
    <SlButton type="primary">确定</SlButton>
  </template>
</SlModal>`
      },
      {
        title: '自定义宽度',
        code: `<SlModal 
  v-model="visible" 
  title="自定义宽度"
  width="800px"
>
  <p>更宽的对话框</p>
</SlModal>`
      }
    ]
  },
  {
    type: 'SlMessage',
    name: '消息提示',
    category: 'layout',
    description: '轻量级的全局反馈',
    icon: 'message',
    props: [
      { name: 'message', type: 'string', description: '消息文字' },
      {
        name: 'type',
        type: 'string',
        default: 'info',
        description: '消息类型',
        options: ['success', 'error', 'warning', 'info']
      },
      { name: 'duration', type: 'number', default: 3000, description: '显示时间(ms)' }
    ],
    events: [],
    slots: [],
    examples: [
      {
        title: '基础用法',
        description: '不同类型的消息提示',
        code: `import { SlMessage } from '@smart-link/ui'

SlMessage.success('操作成功！')
SlMessage.error('操作失败！')
SlMessage.warning('警告信息')
SlMessage.info('提示信息')`
      },
      {
        title: '自定义时长',
        code: `SlMessage.success({
  message: '这是一条消息',
  duration: 5000
})`
      }
    ]
  },
  {
    type: 'SlTooltip',
    name: '文字提示',
    category: 'layout',
    description: '文字提示气泡框',
    icon: 'tooltip',
    props: [
      { name: 'content', type: 'string', description: '提示内容' },
      {
        name: 'placement',
        type: 'string',
        default: 'top',
        description: '显示位置',
        options: ['top', 'bottom', 'left', 'right']
      }
    ],
    events: [],
    slots: [{ name: 'default', description: '触发元素' }],
    examples: [
      {
        title: '基础用法',
        code: `<SlTooltip content="这是提示内容">
  <SlButton>悬停显示提示</SlButton>
</SlTooltip>`
      },
      {
        title: '不同位置',
        code: `<SlTooltip content="上方提示" placement="top">
  <SlButton>上</SlButton>
</SlTooltip>
<SlTooltip content="下方提示" placement="bottom">
  <SlButton>下</SlButton>
</SlTooltip>
<SlTooltip content="左侧提示" placement="left">
  <SlButton>左</SlButton>
</SlTooltip>
<SlTooltip content="右侧提示" placement="right">
  <SlButton>右</SlButton>
</SlTooltip>`
      }
    ]
  }
]

export const COMPONENT_CATEGORIES = [
  { value: 'all', label: '全部组件' },
  { value: 'basic', label: '基础组件' },
  { value: 'form', label: '表单组件' },
  { value: 'layout', label: '布局组件' },
  { value: 'data', label: '数据组件' },
  { value: 'business', label: '业务组件' }
] as const
