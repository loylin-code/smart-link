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
    slots: [{ name: 'default', description: '按钮内容' }]
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
    slots: []
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
    slots: [{ name: 'default', description: '标签内容' }]
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
    slots: [{ name: 'default', description: '包裹元素' }]
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
    slots: []
  },
  {
    type: 'SlDivider',
    name: '分割线',
    category: 'basic',
    description: '用于分隔内容的分割线',
    icon: 'divider',
    props: [{ name: 'vertical', type: 'boolean', default: false, description: '是否垂直' }],
    events: [],
    slots: [{ name: 'default', description: '分割线文字' }]
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
    slots: [{ name: 'default', description: '链接内容' }]
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
    slots: []
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
    slots: []
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
    slots: []
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
    slots: [{ name: 'default', description: '标签内容' }]
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
    slots: [{ name: 'default', description: '标签内容' }]
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
    slots: []
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
    slots: [{ name: 'default', description: '表单内容' }]
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
    slots: [{ name: 'default', description: '表单项内容' }]
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
    slots: [{ name: 'default', description: '容器内容' }]
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
    slots: [{ name: 'default', description: '行内容' }]
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
    slots: [{ name: 'default', description: '列内容' }]
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
    slots: [{ name: 'default', description: '内容' }]
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
    slots: []
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
    slots: [{ name: 'default', description: '触发元素' }]
  }
]

export const COMPONENT_CATEGORIES = [
  { value: 'all', label: '全部' },
  { value: 'basic', label: '基础组件' },
  { value: 'form', label: '表单组件' },
  { value: 'layout', label: '布局组件' },
  { value: 'data', label: '数据组件' },
  { value: 'business', label: '业务组件' }
] as const
