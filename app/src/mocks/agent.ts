import type { Agent, AgentRuntimeStatus } from '@/types'
import { AgentStatus, AgentType, AgentDomain } from '@/types'

/**
 * Mock Agents Data
 * 用于开发和测试智能体列表和管理功能
 */

export const mockAgents: Agent[] = [
  {
    id: 'agent-000',
    type: AgentType.SYSTEM,
    status: AgentStatus.ACTIVE,
    domain: AgentDomain.RESOURCE,
    version: '1.0.0',
    tags: ['资源', '容量', '操盘'],
    createdAt: Date.now() - 86400000 * 10,
    updatedAt: Date.now() - 600000,
    creator: '资源团队',
    category: 'resource-ops',
    identity: {
      name: '资源操盘Agent',
      code: 'resource_operator',
      avatar: '🎯',
      description: '智能资源操盘、容量分析以及操盘推荐',
      persona:
        '你是一位专业的资源操盘专家，擅长资源调度、容量规划和优化决策，能够基于数据做出精准的操盘建议。',
      welcomeMessage:
        '您好！我是资源操盘Agent，可以帮您进行智能资源操盘、容量分析以及提供操盘推荐。请问有什么可以帮助您的？',
      responsibilities: [
        {
          id: 'r1',
          name: '资源操盘',
          description: '智能调度和优化资源配置',
          priority: 1,
          keywords: ['操盘', '调度', '优化', '配置'],
          examples: ['帮我优化资源配置', '当前资源调度建议']
        },
        {
          id: 'r2',
          name: '容量分析',
          description: '分析系统容量和资源使用情况',
          priority: 2,
          keywords: ['容量', '分析', '预测', '规划'],
          examples: ['分析当前容量', '预测下季度资源需求']
        },
        {
          id: 'r3',
          name: '操盘推荐',
          description: '基于数据提供操盘决策建议',
          priority: 3,
          keywords: ['推荐', '建议', '决策', '策略'],
          examples: ['给我操盘建议', '分析最优策略']
        }
      ]
    },
    capabilities: {
      mcpServers: [
        { serverId: 'mcp-resource-manager', required: true, fallbackAction: 'error' },
        { serverId: 'mcp-capacity-monitor', required: false, fallbackAction: 'skip' }
      ],
      skills: [
        { skillId: 'capacity-forecast', version: '1.0.0', enabled: true, parameters: {} },
        { skillId: 'resource-optimizer', version: '2.0.0', enabled: true, parameters: {} }
      ],
      tools: [
        { toolId: 'analyze-capacity', enabled: true },
        { toolId: 'optimize-resource', enabled: true },
        { toolId: 'generate-report', enabled: true }
      ],
      llm: {
        provider: 'openai',
        model: 'gpt-4o',
        temperature: 0.4,
        maxTokens: 4096,
        topP: 0.9,
        systemPrompt: '你是一个专业的资源操盘专家...'
      }
    },
    knowledge: {
      documents: [
        {
          id: 'doc1',
          name: '资源操盘手册',
          type: 'file',
          source: '/docs/resource-ops-manual.pdf',
          enabled: true
        },
        {
          id: 'doc2',
          name: '容量规划指南',
          type: 'file',
          source: '/docs/capacity-planning.md',
          enabled: true
        }
      ],
      databases: [
        {
          id: 'db1',
          name: '资源配置库',
          type: 'postgresql',
          connectionString: '***',
          enabled: true
        }
      ],
      apis: [
        {
          id: 'api1',
          name: '资源监控API',
          endpoint: '/api/resource/monitor',
          method: 'GET',
          enabled: true
        }
      ],
      searchConfig: {
        enabled: true,
        topK: 10,
        similarityThreshold: 0.75,
        rerankEnabled: true
      }
    }
  },
  {
    id: 'agent-001',
    type: AgentType.SYSTEM,
    status: AgentStatus.ACTIVE,
    domain: AgentDomain.INFRASTRUCTURE,
    version: '1.0.0',
    tags: ['客服', 'NLP', '多轮对话'],
    createdAt: Date.now() - 86400000 * 30,
    updatedAt: Date.now() - 3600000,
    creator: '系统管理员',
    category: 'customer-service',
    identity: {
      name: '智能客服助手',
      code: 'customer_service_bot',
      avatar: '🤖',
      description: '7x24小时智能客服，支持多轮对话、工单创建、FAQ查询等功能',
      persona:
        '你是一个专业、友好的客服助手，致力于帮助用户解决问题。请用简洁明了的语言回答用户问题。',
      welcomeMessage: '您好！我是智能客服助手，很高兴为您服务。请问有什么可以帮助您的吗？',
      responsibilities: [
        {
          id: 'r1',
          name: '问题解答',
          description: '回答用户关于产品、服务的常见问题',
          priority: 1,
          keywords: ['怎么', '如何', '什么是', '为什么'],
          examples: ['如何修改密码？', '什么是会员权益？']
        },
        {
          id: 'r2',
          name: '工单处理',
          description: '创建和管理用户工单',
          priority: 2,
          keywords: ['工单', '投诉', '反馈', '问题'],
          examples: ['我要提交投诉', '帮我创建工单']
        }
      ]
    },
    capabilities: {
      mcpServers: [
        { serverId: 'mcp-knowledge-base', required: true, fallbackAction: 'error' },
        { serverId: 'mcp-ticket-system', required: false, fallbackAction: 'skip' }
      ],
      skills: [
        { skillId: 'sentiment-analysis', version: '1.2.0', enabled: true, parameters: {} },
        { skillId: 'intent-recognition', version: '2.0.0', enabled: true, parameters: {} }
      ],
      tools: [
        { toolId: 'search-faq', enabled: true },
        { toolId: 'create-ticket', enabled: true },
        { toolId: 'query-order', enabled: true }
      ],
      llm: {
        provider: 'openai',
        model: 'gpt-4o',
        temperature: 0.7,
        maxTokens: 4096,
        topP: 1,
        systemPrompt: '你是一个专业的客服助手...'
      }
    },
    knowledge: {
      documents: [
        {
          id: 'doc1',
          name: '产品手册.pdf',
          type: 'file',
          source: '/docs/product-manual.pdf',
          enabled: true
        },
        { id: 'doc2', name: 'FAQ知识库', type: 'text', source: 'faq-database', enabled: true }
      ],
      databases: [],
      apis: [
        { id: 'api1', name: '订单查询API', endpoint: '/api/orders', method: 'GET', enabled: true }
      ],
      searchConfig: {
        enabled: true,
        topK: 10,
        similarityThreshold: 0.7,
        rerankEnabled: true
      }
    }
  },
  {
    id: 'agent-002',
    type: AgentType.CUSTOM,
    status: AgentStatus.ACTIVE,
    domain: AgentDomain.RESOURCE,
    version: '2.1.0',
    tags: ['数据分析', '报表', 'BI'],
    createdAt: Date.now() - 86400000 * 20,
    updatedAt: Date.now() - 7200000,
    creator: '数据团队',
    category: 'analytics',
    identity: {
      name: '数据分析专家',
      code: 'data_analyst',
      avatar: '📊',
      description: '智能数据分析助手，支持SQL查询、报表生成、数据可视化等',
      persona: '你是一个数据分析专家，擅长从数据中发现洞察，并用清晰的方式呈现分析结果。',
      welcomeMessage:
        '您好！我是数据分析专家，可以帮您查询数据、生成报表和进行数据分析。请问您需要分析什么数据？',
      responsibilities: [
        {
          id: 'r1',
          name: '数据查询',
          description: '执行SQL查询并返回结果',
          priority: 1,
          keywords: ['查询', '统计', '多少'],
          examples: ['查询上个月销售额', '统计用户数量']
        },
        {
          id: 'r2',
          name: '报表生成',
          description: '生成各类数据报表',
          priority: 2,
          keywords: ['报表', '报告', '导出'],
          examples: ['生成月度销售报表', '导出用户分析报告']
        }
      ]
    },
    capabilities: {
      mcpServers: [{ serverId: 'mcp-database', required: true, fallbackAction: 'error' }],
      skills: [
        { skillId: 'sql-generator', version: '1.5.0', enabled: true, parameters: {} },
        { skillId: 'chart-builder', version: '2.1.0', enabled: true, parameters: {} }
      ],
      tools: [
        { toolId: 'execute-sql', enabled: true },
        { toolId: 'generate-chart', enabled: true },
        { toolId: 'export-excel', enabled: true }
      ],
      llm: {
        provider: 'anthropic',
        model: 'claude-sonnet-4.5',
        temperature: 0.3,
        maxTokens: 8192,
        topP: 0.9
      }
    },
    knowledge: {
      documents: [],
      databases: [
        {
          id: 'db1',
          name: '业务数据库',
          type: 'postgresql',
          connectionString: '***',
          enabled: true
        },
        { id: 'db2', name: '数据仓库', type: 'mysql', connectionString: '***', enabled: true }
      ],
      apis: [],
      searchConfig: {
        enabled: false,
        topK: 5,
        similarityThreshold: 0.8,
        rerankEnabled: false
      }
    }
  },
  {
    id: 'agent-003',
    type: AgentType.CUSTOM,
    status: AgentStatus.ACTIVE,
    domain: AgentDomain.INFRASTRUCTURE,
    version: '1.5.0',
    tags: ['代码', '开发', 'Code Review'],
    createdAt: Date.now() - 86400000 * 15,
    updatedAt: Date.now() - 1800000,
    creator: '研发团队',
    category: 'development',
    identity: {
      name: '代码审查助手',
      code: 'code_reviewer',
      avatar: '👨‍💻',
      description: 'AI代码审查助手，支持代码审查、Bug检测、最佳实践建议',
      persona: '你是一位资深的代码审查专家，能够识别代码中的潜在问题并提供改进建议。',
      welcomeMessage:
        '您好！我是代码审查助手，可以帮您审查代码、发现潜在问题并提供改进建议。请提交您的代码。',
      responsibilities: [
        {
          id: 'r1',
          name: '代码审查',
          description: '审查代码质量和规范性',
          priority: 1,
          keywords: ['审查', 'review', '检查'],
          examples: ['帮我审查这段代码', '检查代码质量']
        },
        {
          id: 'r2',
          name: 'Bug检测',
          description: '识别代码中的潜在Bug',
          priority: 2,
          keywords: ['bug', '问题', '错误'],
          examples: ['这里有bug吗', '找出潜在问题']
        }
      ]
    },
    capabilities: {
      mcpServers: [{ serverId: 'mcp-github', required: true, fallbackAction: 'skip' }],
      skills: [
        { skillId: 'code-analysis', version: '3.0.0', enabled: true, parameters: {} },
        { skillId: 'security-scan', version: '1.0.0', enabled: true, parameters: {} }
      ],
      tools: [
        { toolId: 'analyze-code', enabled: true },
        { toolId: 'check-style', enabled: true },
        { toolId: 'detect-smell', enabled: true }
      ],
      llm: {
        provider: 'openai',
        model: 'gpt-4o',
        temperature: 0.2,
        maxTokens: 8192,
        topP: 0.95
      }
    },
    knowledge: {
      documents: [
        {
          id: 'doc1',
          name: '编码规范',
          type: 'file',
          source: '/docs/coding-standards.md',
          enabled: true
        }
      ],
      databases: [],
      apis: [],
      searchConfig: {
        enabled: true,
        topK: 5,
        similarityThreshold: 0.85,
        rerankEnabled: false
      }
    }
  },
  {
    id: 'agent-004',
    type: AgentType.SYSTEM,
    status: AgentStatus.ACTIVE,
    domain: AgentDomain.INFRASTRUCTURE,
    version: '1.2.0',
    tags: ['文档', '写作', '翻译'],
    createdAt: Date.now() - 86400000 * 25,
    updatedAt: Date.now() - 5400000,
    creator: '内容团队',
    category: 'content',
    identity: {
      name: '文档写作助手',
      code: 'doc_writer',
      avatar: '📝',
      description: '智能文档写作助手，支持文档撰写、翻译、润色、格式转换',
      persona: '你是一位专业的文档写作专家，擅长撰写清晰、专业的技术文档和商业文档。',
      welcomeMessage: '您好！我是文档写作助手，可以帮您撰写、翻译或润色文档。请问您需要什么帮助？',
      responsibilities: [
        {
          id: 'r1',
          name: '文档撰写',
          description: '撰写各类文档',
          priority: 1,
          keywords: ['写', '撰写', '生成'],
          examples: ['帮我写一份产品说明书', '生成API文档']
        },
        {
          id: 'r2',
          name: '翻译润色',
          description: '翻译和润色文档',
          priority: 2,
          keywords: ['翻译', '润色', '优化'],
          examples: ['翻译这段文字', '润色这篇文章']
        }
      ]
    },
    capabilities: {
      mcpServers: [],
      skills: [
        {
          skillId: 'translation',
          version: '2.0.0',
          enabled: true,
          parameters: { sourceLang: 'auto', targetLang: 'zh-CN' }
        },
        { skillId: 'grammar-check', version: '1.0.0', enabled: true, parameters: {} }
      ],
      tools: [
        { toolId: 'translate-text', enabled: true },
        { toolId: 'polish-text', enabled: true },
        { toolId: 'format-convert', enabled: true }
      ],
      llm: {
        provider: 'anthropic',
        model: 'claude-sonnet-4.5',
        temperature: 0.5,
        maxTokens: 4096,
        topP: 1
      }
    },
    knowledge: {
      documents: [
        {
          id: 'doc1',
          name: '写作风格指南',
          type: 'file',
          source: '/docs/style-guide.md',
          enabled: true
        }
      ],
      databases: [],
      apis: [],
      searchConfig: {
        enabled: false,
        topK: 5,
        similarityThreshold: 0.7,
        rerankEnabled: false
      }
    }
  },
  {
    id: 'agent-005',
    type: AgentType.TEMPLATE,
    status: AgentStatus.DRAFT,
    domain: AgentDomain.INFRASTRUCTURE,
    version: '0.5.0',
    tags: ['模板', '示例'],
    createdAt: Date.now() - 86400000 * 5,
    updatedAt: Date.now() - 86400000,
    creator: '系统管理员',
    category: 'template',
    identity: {
      name: '通用问答模板',
      code: 'qa_template',
      avatar: '💡',
      description: '基础问答模板，可复制后自定义，适合快速创建新的智能体',
      persona: '你是一个友好的AI助手，乐于帮助用户解答问题。',
      welcomeMessage: '您好！我是一个AI助手，请问有什么可以帮助您的？',
      responsibilities: []
    },
    capabilities: {
      mcpServers: [],
      skills: [],
      tools: [],
      llm: {
        provider: 'openai',
        model: 'gpt-4o-mini',
        temperature: 0.7,
        maxTokens: 2048,
        topP: 1
      }
    },
    knowledge: {
      documents: [],
      databases: [],
      apis: [],
      searchConfig: {
        enabled: false,
        topK: 5,
        similarityThreshold: 0.7,
        rerankEnabled: false
      }
    }
  },
  {
    id: 'agent-006',
    type: AgentType.CUSTOM,
    status: AgentStatus.PAUSED,
    domain: AgentDomain.OPERATION,
    version: '1.0.0',
    tags: ['测试', '已暂停'],
    createdAt: Date.now() - 86400000 * 10,
    updatedAt: Date.now() - 172800000,
    creator: '测试用户',
    category: 'testing',
    identity: {
      name: '测试智能体',
      code: 'test_agent',
      avatar: '🧪',
      description: '用于测试和验证的智能体，当前已暂停服务',
      persona: '你是一个测试智能体。',
      welcomeMessage: '这是测试智能体，当前已暂停服务。',
      responsibilities: []
    },
    capabilities: {
      mcpServers: [],
      skills: [],
      tools: [],
      llm: {
        provider: 'ollama',
        model: 'qwen2.5:7b',
        temperature: 0.7,
        maxTokens: 2048,
        topP: 1
      }
    },
    knowledge: {
      documents: [],
      databases: [],
      apis: [],
      searchConfig: {
        enabled: false,
        topK: 5,
        similarityThreshold: 0.7,
        rerankEnabled: false
      }
    }
  },
  {
    id: 'agent-007',
    type: AgentType.CUSTOM,
    status: AgentStatus.ACTIVE,
    domain: AgentDomain.INFRASTRUCTURE,
    version: '3.0.0',
    tags: ['HR', '招聘', '面试'],
    createdAt: Date.now() - 86400000 * 40,
    updatedAt: Date.now() - 900000,
    creator: 'HR团队',
    category: 'hr',
    identity: {
      name: '招聘助手',
      code: 'recruitment_assistant',
      avatar: '👤',
      description: '智能招聘助手，支持简历筛选、面试安排、候选人评估',
      persona: '你是一位专业的HR招聘助手，熟悉各类岗位要求和面试技巧。',
      welcomeMessage:
        '您好！我是招聘助手，可以帮您筛选简历、安排面试、评估候选人。请问有什么需要帮助的？',
      responsibilities: [
        {
          id: 'r1',
          name: '简历筛选',
          description: '根据岗位要求筛选简历',
          priority: 1,
          keywords: ['简历', '筛选', '匹配'],
          examples: ['帮我筛选这份简历', '候选人匹配度如何']
        },
        {
          id: 'r2',
          name: '面试安排',
          description: '协调面试时间和资源',
          priority: 2,
          keywords: ['面试', '安排', '预约'],
          examples: ['安排明天下午的面试', '查看面试官空闲时间']
        }
      ]
    },
    capabilities: {
      mcpServers: [{ serverId: 'mcp-calendar', required: false, fallbackAction: 'skip' }],
      skills: [
        { skillId: 'resume-parser', version: '2.0.0', enabled: true, parameters: {} },
        { skillId: 'candidate-matcher', version: '1.5.0', enabled: true, parameters: {} }
      ],
      tools: [
        { toolId: 'parse-resume', enabled: true },
        { toolId: 'schedule-interview', enabled: true },
        { toolId: 'send-notification', enabled: true }
      ],
      llm: {
        provider: 'openai',
        model: 'gpt-4o',
        temperature: 0.6,
        maxTokens: 4096,
        topP: 0.9
      }
    },
    knowledge: {
      documents: [
        {
          id: 'doc1',
          name: '岗位需求库',
          type: 'file',
          source: '/docs/job-requirements.pdf',
          enabled: true
        },
        { id: 'doc2', name: '面试题库', type: 'text', source: 'interview-questions', enabled: true }
      ],
      databases: [
        { id: 'db1', name: '候选人数据库', type: 'mongodb', connectionString: '***', enabled: true }
      ],
      apis: [],
      searchConfig: {
        enabled: true,
        topK: 10,
        similarityThreshold: 0.75,
        rerankEnabled: true
      }
    }
  },
  {
    id: 'agent-008',
    type: AgentType.SYSTEM,
    status: AgentStatus.ACTIVE,
    domain: AgentDomain.OPERATION,
    version: '2.0.0',
    tags: ['运维', '监控', '告警'],
    createdAt: Date.now() - 86400000 * 60,
    updatedAt: Date.now() - 600000,
    creator: '运维团队',
    category: 'operations',
    identity: {
      name: '运维监控助手',
      code: 'ops_monitor',
      avatar: '🖥️',
      description: '智能运维助手，支持服务器监控、告警处理、故障诊断',
      persona: '你是一位专业的运维工程师，熟悉各类服务器和监控系统。',
      welcomeMessage:
        '您好！我是运维监控助手，可以帮您监控系统状态、处理告警、诊断故障。请问有什么需要帮助的？',
      responsibilities: [
        {
          id: 'r1',
          name: '监控告警',
          description: '处理系统告警和异常',
          priority: 1,
          keywords: ['告警', '异常', '报警'],
          examples: ['CPU告警怎么处理', '磁盘空间不足']
        },
        {
          id: 'r2',
          name: '故障诊断',
          description: '诊断系统故障原因',
          priority: 2,
          keywords: ['故障', '错误', '问题'],
          examples: ['服务无法访问', '数据库连接失败']
        }
      ]
    },
    capabilities: {
      mcpServers: [
        { serverId: 'mcp-prometheus', required: true, fallbackAction: 'error' },
        { serverId: 'mcp-kubernetes', required: false, fallbackAction: 'skip' }
      ],
      skills: [
        { skillId: 'log-analyzer', version: '1.0.0', enabled: true, parameters: {} },
        { skillId: 'anomaly-detector', version: '2.0.0', enabled: true, parameters: {} }
      ],
      tools: [
        { toolId: 'check-metrics', enabled: true },
        { toolId: 'query-logs', enabled: true },
        { toolId: 'restart-service', enabled: true }
      ],
      llm: {
        provider: 'openai',
        model: 'gpt-4o',
        temperature: 0.3,
        maxTokens: 4096,
        topP: 0.9
      }
    },
    knowledge: {
      documents: [
        {
          id: 'doc1',
          name: '运维手册',
          type: 'file',
          source: '/docs/ops-manual.pdf',
          enabled: true
        }
      ],
      databases: [],
      apis: [
        { id: 'api1', name: '监控API', endpoint: '/api/monitoring', method: 'GET', enabled: true }
      ],
      searchConfig: {
        enabled: true,
        topK: 5,
        similarityThreshold: 0.8,
        rerankEnabled: false
      }
    }
  },
  {
    id: 'agent-009',
    type: AgentType.CUSTOM,
    status: AgentStatus.DEPRECATED,
    domain: AgentDomain.INFRASTRUCTURE,
    version: '0.9.0',
    tags: ['已废弃', '旧版本'],
    createdAt: Date.now() - 86400000 * 90,
    updatedAt: Date.now() - 86400000 * 10,
    creator: '系统管理员',
    category: 'legacy',
    identity: {
      name: '旧版问答助手',
      code: 'legacy_qa',
      avatar: '📦',
      description: '已废弃的旧版问答助手，请使用新版本',
      persona: '这是一个已废弃的智能体。',
      welcomeMessage: '此智能体已废弃，请使用新版本。',
      responsibilities: []
    },
    capabilities: {
      mcpServers: [],
      skills: [],
      tools: [],
      llm: {
        provider: 'openai',
        model: 'gpt-3.5-turbo',
        temperature: 0.7,
        maxTokens: 2048,
        topP: 1
      }
    },
    knowledge: {
      documents: [],
      databases: [],
      apis: [],
      searchConfig: {
        enabled: false,
        topK: 5,
        similarityThreshold: 0.7,
        rerankEnabled: false
      }
    }
  },
  {
    id: 'agent-010',
    type: AgentType.CUSTOM,
    status: AgentStatus.DRAFT,
    domain: AgentDomain.ASSET,
    version: '0.1.0',
    tags: ['开发中', '新功能'],
    createdAt: Date.now() - 86400000 * 2,
    updatedAt: Date.now() - 43200000,
    creator: '产品团队',
    category: 'finance',
    identity: {
      name: '财务分析助手',
      code: 'finance_assistant',
      avatar: '💰',
      description: '智能财务分析助手，支持财务报表分析、预算管理、成本控制（开发中）',
      persona: '你是一位专业的财务分析师。',
      welcomeMessage: '财务分析助手正在开发中，敬请期待...',
      responsibilities: [
        {
          id: 'r1',
          name: '财务分析',
          description: '分析财务报表和指标',
          priority: 1,
          keywords: ['分析', '报表', '财务'],
          examples: ['分析资产负债表', '计算ROI']
        }
      ]
    },
    capabilities: {
      mcpServers: [],
      skills: [],
      tools: [],
      llm: {
        provider: 'anthropic',
        model: 'claude-sonnet-4.5',
        temperature: 0.4,
        maxTokens: 4096,
        topP: 0.9
      }
    },
    knowledge: {
      documents: [],
      databases: [],
      apis: [],
      searchConfig: {
        enabled: false,
        topK: 5,
        similarityThreshold: 0.7,
        rerankEnabled: false
      }
    }
  }
]

/**
 * Mock Agent Runtime Status
 * 智能体运行时状态数据
 */
export const mockRuntimeStatus: AgentRuntimeStatus[] = [
  {
    agentId: 'agent-000',
    status: 'idle',
    sessionCount: 856,
    lastActiveAt: Date.now() - 120000,
    tokensConsumed: 1200000,
    avgLatency: 1.5
  },
  {
    agentId: 'agent-001',
    status: 'idle',
    sessionCount: 1523,
    lastActiveAt: Date.now() - 300000,
    tokensConsumed: 2450000,
    avgLatency: 1.2
  },
  {
    agentId: 'agent-002',
    status: 'busy',
    sessionCount: 892,
    lastActiveAt: Date.now() - 60000,
    tokensConsumed: 890000,
    avgLatency: 2.1
  },
  {
    agentId: 'agent-003',
    status: 'idle',
    sessionCount: 456,
    lastActiveAt: Date.now() - 600000,
    tokensConsumed: 320000,
    avgLatency: 0.8
  },
  {
    agentId: 'agent-004',
    status: 'idle',
    sessionCount: 2341,
    lastActiveAt: Date.now() - 180000,
    tokensConsumed: 1560000,
    avgLatency: 1.5
  },
  {
    agentId: 'agent-007',
    status: 'idle',
    sessionCount: 234,
    lastActiveAt: Date.now() - 900000,
    tokensConsumed: 180000,
    avgLatency: 1.8
  },
  {
    agentId: 'agent-008',
    status: 'busy',
    sessionCount: 567,
    lastActiveAt: Date.now() - 30000,
    tokensConsumed: 450000,
    avgLatency: 0.6
  }
]

/**
 * Mock Agent Categories
 * 智能体分类
 */
export const mockAgentCategories = [
  { id: 'resource-ops', name: '资源操盘', icon: '🎯', count: 1 },
  { id: 'customer-service', name: '客服支持', icon: '🤖', count: 3 },
  { id: 'analytics', name: '数据分析', icon: '📊', count: 2 },
  { id: 'development', name: '研发工具', icon: '👨‍💻', count: 2 },
  { id: 'content', name: '内容创作', icon: '📝', count: 1 },
  { id: 'hr', name: '人力资源', icon: '👤', count: 1 },
  { id: 'operations', name: '运维监控', icon: '🖥️', count: 1 },
  { id: 'finance', name: '财务分析', icon: '💰', count: 1 },
  { id: 'template', name: '模板', icon: '📋', count: 1 },
  { id: 'testing', name: '测试', icon: '🧪', count: 1 },
  { id: 'legacy', name: '已废弃', icon: '📦', count: 1 }
]
