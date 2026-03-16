import type { Skill, SkillCategory, SkillStatus, SkillRiskLevel } from '@/types'

/**
 * Mock Skills Data
 * 用于开发和测试Skills管理功能
 */

// 风险等级类型
type RiskLevel = 'low' | 'medium' | 'high'

// 生成随机统计数据
function generateStats(callsRange: [number, number], successRange: [number, number]) {
  const calls = Math.floor(Math.random() * (callsRange[1] - callsRange[0]) + callsRange[0])
  const successRate = Math.floor(
    Math.random() * (successRange[1] - successRange[0]) + successRange[0]
  )
  return {
    totalCalls: calls,
    successRate: successRate,
    avgDuration: Math.floor(Math.random() * 5 + 0.5),
    last30Days: {
      calls: Math.floor(calls * 0.3),
      tokens: {
        input: Math.floor(Math.random() * 500000 + 100000),
        output: Math.floor(Math.random() * 200000 + 50000)
      },
      cost: Math.floor(Math.random() * 500 + 50) / 100
    }
  }
}

// Skills mock 数据
export const mockSkills: Skill[] = [
  {
    id: 'skill-001',
    name: 'sentiment-analysis',
    displayName: '情感分析',
    version: '1.2.0',
    category: 'analytics' as SkillCategory,
    status: 'enabled' as SkillStatus,
    author: 'AI Team',
    maintainer: '张三',
    description:
      '分析文本情感倾向，支持正面、负面、中性三种情感分类，适用于客户反馈、社交媒体监控等场景',
    tags: ['NLP', '情感', '文本分析'],
    riskLevel: 'low' as SkillRiskLevel,
    requiresApproval: false,
    inputSchema: {
      type: 'object',
      properties: {
        text: { type: 'string', description: '待分析的文本内容' },
        language: { type: 'string', description: '文本语言', default: 'zh-CN' }
      },
      required: ['text']
    },
    outputSchema: {
      type: 'object',
      properties: {
        sentiment: { type: 'string', enum: ['positive', 'negative', 'neutral'] },
        confidence: { type: 'number' },
        details: { type: 'object' }
      }
    },
    config: {
      model: 'gpt-4o-mini',
      temperature: 0.3,
      maxTokens: 1000,
      topP: 0.9,
      toolBindings: [],
      guardrails: {
        validateInput: true,
        privacyCheck: false,
        maxRetries: 3
      },
      resources: {
        timeout: 30,
        maxMemory: 256,
        maxConcurrency: 10
      }
    },
    dependencies: {
      skills: [],
      tools: ['text-preprocessor'],
      mcpServers: []
    },
    stats: generateStats([5000, 15000], [95, 99]),
    lastUpdated: Date.now() - 3600000,
    createdAt: Date.now() - 86400000 * 60,
    updatedAt: Date.now() - 3600000
  },
  {
    id: 'skill-002',
    name: 'intent-recognition',
    displayName: '意图识别',
    version: '2.0.0',
    category: 'analytics' as SkillCategory,
    status: 'enabled' as SkillStatus,
    author: 'AI Team',
    maintainer: '李四',
    description: '识别用户输入的意图类型，支持多领域意图分类，可自定义意图类别',
    tags: ['NLP', '意图', '分类'],
    riskLevel: 'low' as SkillRiskLevel,
    requiresApproval: false,
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: '用户输入' },
        context: { type: 'object', description: '对话上下文' }
      },
      required: ['query']
    },
    outputSchema: {
      type: 'object',
      properties: {
        intent: { type: 'string' },
        confidence: { type: 'number' },
        entities: { type: 'array' }
      }
    },
    config: {
      model: 'gpt-4o',
      temperature: 0.2,
      maxTokens: 500,
      topP: 0.95,
      toolBindings: [],
      guardrails: {
        validateInput: true,
        privacyCheck: true,
        maxRetries: 3
      },
      resources: {
        timeout: 20,
        maxMemory: 256,
        maxConcurrency: 20
      }
    },
    dependencies: {
      skills: [],
      tools: [],
      mcpServers: []
    },
    stats: generateStats([8000, 20000], [92, 98]),
    lastUpdated: Date.now() - 7200000,
    createdAt: Date.now() - 86400000 * 45,
    updatedAt: Date.now() - 7200000
  },
  {
    id: 'skill-003',
    name: 'sql-generator',
    displayName: 'SQL生成器',
    version: '1.5.0',
    category: 'processing' as SkillCategory,
    status: 'enabled' as SkillStatus,
    author: 'Data Team',
    maintainer: '王五',
    description: '根据自然语言描述生成SQL查询语句，支持多种数据库方言',
    tags: ['SQL', '数据库', '查询'],
    riskLevel: 'medium' as SkillRiskLevel,
    requiresApproval: false,
    inputSchema: {
      type: 'object',
      properties: {
        description: { type: 'string', description: '查询需求描述' },
        schema: { type: 'object', description: '数据库Schema' },
        dialect: { type: 'string', enum: ['mysql', 'postgresql', 'sqlite'] }
      },
      required: ['description']
    },
    outputSchema: {
      type: 'object',
      properties: {
        sql: { type: 'string' },
        explanation: { type: 'string' }
      }
    },
    config: {
      model: 'gpt-4o',
      temperature: 0.1,
      maxTokens: 2000,
      topP: 0.9,
      toolBindings: ['database-connector'],
      guardrails: {
        validateInput: true,
        privacyCheck: true,
        maxRetries: 2
      },
      resources: {
        timeout: 60,
        maxMemory: 512,
        maxConcurrency: 5
      }
    },
    dependencies: {
      skills: [],
      tools: ['schema-extractor'],
      mcpServers: ['mcp-database']
    },
    stats: generateStats([2000, 8000], [88, 95]),
    lastUpdated: Date.now() - 1800000,
    createdAt: Date.now() - 86400000 * 30,
    updatedAt: Date.now() - 1800000
  },
  {
    id: 'skill-004',
    name: 'chart-builder',
    displayName: '图表生成器',
    version: '2.1.0',
    category: 'processing' as SkillCategory,
    status: 'enabled' as SkillStatus,
    author: 'Data Team',
    description: '根据数据自动生成可视化图表配置，支持多种图表类型',
    tags: ['图表', '可视化', 'ECharts'],
    riskLevel: 'low' as SkillRiskLevel,
    requiresApproval: false,
    inputSchema: {
      type: 'object',
      properties: {
        data: { type: 'array', description: '数据集' },
        chartType: { type: 'string', enum: ['line', 'bar', 'pie', 'scatter'] },
        options: { type: 'object' }
      },
      required: ['data']
    },
    outputSchema: {
      type: 'object',
      properties: {
        chartConfig: { type: 'object', description: 'ECharts配置' }
      }
    },
    config: {
      model: 'gpt-4o-mini',
      temperature: 0.3,
      maxTokens: 4000,
      topP: 0.9,
      toolBindings: [],
      guardrails: {
        validateInput: true,
        privacyCheck: false,
        maxRetries: 3
      },
      resources: {
        timeout: 30,
        maxMemory: 256,
        maxConcurrency: 10
      }
    },
    dependencies: {
      skills: [],
      tools: [],
      mcpServers: []
    },
    stats: generateStats([3000, 10000], [94, 99]),
    lastUpdated: Date.now() - 5400000,
    createdAt: Date.now() - 86400000 * 20,
    updatedAt: Date.now() - 5400000
  },
  {
    id: 'skill-005',
    name: 'api-invoker',
    displayName: 'API调用器',
    version: '1.0.0',
    category: 'invoker' as SkillCategory,
    status: 'enabled' as SkillStatus,
    author: 'Integration Team',
    maintainer: '赵六',
    description: '智能调用外部API，支持参数映射、错误处理和重试机制',
    tags: ['API', '集成', 'HTTP'],
    riskLevel: 'high' as SkillRiskLevel,
    requiresApproval: true,
    inputSchema: {
      type: 'object',
      properties: {
        endpoint: { type: 'string', description: 'API端点' },
        method: { type: 'string', enum: ['GET', 'POST', 'PUT', 'DELETE'] },
        params: { type: 'object' },
        headers: { type: 'object' }
      },
      required: ['endpoint', 'method']
    },
    outputSchema: {
      type: 'object',
      properties: {
        status: { type: 'number' },
        data: { type: 'object' },
        headers: { type: 'object' }
      }
    },
    config: {
      model: 'gpt-4o-mini',
      temperature: 0.1,
      maxTokens: 8000,
      topP: 0.95,
      toolBindings: [],
      guardrails: {
        validateInput: true,
        privacyCheck: true,
        maxRetries: 3
      },
      resources: {
        timeout: 120,
        maxMemory: 512,
        maxConcurrency: 5
      }
    },
    dependencies: {
      skills: [],
      tools: ['http-client'],
      mcpServers: []
    },
    stats: generateStats([1000, 5000], [85, 95]),
    lastUpdated: Date.now() - 86400000,
    createdAt: Date.now() - 86400000 * 15,
    updatedAt: Date.now() - 86400000
  },
  {
    id: 'skill-006',
    name: 'data-transformer',
    displayName: '数据转换器',
    version: '1.3.0',
    category: 'transform' as SkillCategory,
    status: 'enabled' as SkillStatus,
    author: 'Data Team',
    description: '执行数据格式转换、字段映射、数据清洗等操作',
    tags: ['数据', '转换', 'ETL'],
    riskLevel: 'low' as SkillRiskLevel,
    requiresApproval: false,
    inputSchema: {
      type: 'object',
      properties: {
        sourceData: { type: 'object', description: '源数据' },
        transformRules: { type: 'array', description: '转换规则' },
        targetFormat: { type: 'string' }
      },
      required: ['sourceData', 'transformRules']
    },
    outputSchema: {
      type: 'object',
      properties: {
        result: { type: 'object' },
        errors: { type: 'array' }
      }
    },
    config: {
      temperature: 0,
      maxTokens: 16000,
      topP: 1,
      toolBindings: [],
      guardrails: {
        validateInput: true,
        privacyCheck: false,
        maxRetries: 3
      },
      resources: {
        timeout: 300,
        maxMemory: 1024,
        maxConcurrency: 3
      }
    },
    dependencies: {
      skills: [],
      tools: ['json-path', 'jq-engine'],
      mcpServers: []
    },
    stats: generateStats([500, 3000], [96, 100]),
    lastUpdated: Date.now() - 43200000,
    createdAt: Date.now() - 86400000 * 25,
    updatedAt: Date.now() - 43200000
  },
  {
    id: 'skill-007',
    name: 'document-summarizer',
    displayName: '文档摘要',
    version: '2.0.0',
    category: 'processing' as SkillCategory,
    status: 'enabled' as SkillStatus,
    author: 'AI Team',
    maintainer: '钱七',
    description: '对长文档进行智能摘要，支持多种摘要长度和风格',
    tags: ['文档', '摘要', 'NLP'],
    riskLevel: 'low' as SkillRiskLevel,
    requiresApproval: false,
    inputSchema: {
      type: 'object',
      properties: {
        content: { type: 'string', description: '文档内容' },
        maxLength: { type: 'number', description: '摘要最大长度' },
        style: { type: 'string', enum: ['brief', 'detailed', 'bullet'] }
      },
      required: ['content']
    },
    outputSchema: {
      type: 'object',
      properties: {
        summary: { type: 'string' },
        keyPoints: { type: 'array' }
      }
    },
    config: {
      model: 'claude-sonnet-4.5',
      temperature: 0.5,
      maxTokens: 2000,
      topP: 0.9,
      toolBindings: [],
      guardrails: {
        validateInput: true,
        privacyCheck: false,
        maxRetries: 2
      },
      resources: {
        timeout: 60,
        maxMemory: 512,
        maxConcurrency: 10
      }
    },
    dependencies: {
      skills: [],
      tools: [],
      mcpServers: []
    },
    stats: generateStats([10000, 25000], [93, 98]),
    lastUpdated: Date.now() - 900000,
    createdAt: Date.now() - 86400000 * 90,
    updatedAt: Date.now() - 900000
  },
  {
    id: 'skill-008',
    name: 'web-scraper',
    displayName: '网页抓取',
    version: '1.1.0',
    category: 'invoker' as SkillCategory,
    status: 'partial' as SkillStatus,
    author: 'Integration Team',
    description: '抓取网页内容并提取结构化数据，支持动态页面渲染',
    tags: ['爬虫', '网页', '数据提取'],
    riskLevel: 'medium' as SkillRiskLevel,
    requiresApproval: false,
    inputSchema: {
      type: 'object',
      properties: {
        url: { type: 'string', description: '网页URL' },
        selectors: { type: 'object', description: 'CSS选择器' },
        waitFor: { type: 'string', description: '等待元素' }
      },
      required: ['url']
    },
    outputSchema: {
      type: 'object',
      properties: {
        data: { type: 'object' },
        rawHtml: { type: 'string' }
      }
    },
    config: {
      model: 'gpt-4o-mini',
      temperature: 0,
      maxTokens: 8000,
      topP: 1,
      toolBindings: [],
      guardrails: {
        validateInput: true,
        privacyCheck: true,
        maxRetries: 3
      },
      resources: {
        timeout: 180,
        maxMemory: 1024,
        maxConcurrency: 3
      }
    },
    dependencies: {
      skills: [],
      tools: ['puppeteer', 'cheerio'],
      mcpServers: ['mcp-browser']
    },
    stats: generateStats([500, 2000], [80, 92]),
    lastUpdated: Date.now() - 172800000,
    createdAt: Date.now() - 86400000 * 40,
    updatedAt: Date.now() - 172800000
  },
  {
    id: 'skill-009',
    name: 'code-analyzer',
    displayName: '代码分析',
    version: '3.0.0',
    category: 'analytics' as SkillCategory,
    status: 'enabled' as SkillStatus,
    author: 'Dev Team',
    maintainer: '孙八',
    description: '分析代码质量、检测潜在问题、提供优化建议',
    tags: ['代码', '分析', '质量'],
    riskLevel: 'low' as SkillRiskLevel,
    requiresApproval: false,
    inputSchema: {
      type: 'object',
      properties: {
        code: { type: 'string', description: '代码内容' },
        language: { type: 'string', description: '编程语言' },
        analysisType: { type: 'string', enum: ['quality', 'security', 'performance'] }
      },
      required: ['code', 'language']
    },
    outputSchema: {
      type: 'object',
      properties: {
        issues: { type: 'array' },
        suggestions: { type: 'array' },
        score: { type: 'number' }
      }
    },
    config: {
      model: 'gpt-4o',
      temperature: 0.2,
      maxTokens: 4000,
      topP: 0.95,
      toolBindings: [],
      guardrails: {
        validateInput: true,
        privacyCheck: false,
        maxRetries: 2
      },
      resources: {
        timeout: 120,
        maxMemory: 512,
        maxConcurrency: 5
      }
    },
    dependencies: {
      skills: [],
      tools: ['ast-parser', 'linter'],
      mcpServers: []
    },
    stats: generateStats([2000, 6000], [91, 97]),
    lastUpdated: Date.now() - 3600000,
    createdAt: Date.now() - 86400000 * 35,
    updatedAt: Date.now() - 3600000
  },
  {
    id: 'skill-010',
    name: 'email-sender',
    displayName: '邮件发送',
    version: '1.0.0',
    category: 'invoker' as SkillCategory,
    status: 'disabled' as SkillStatus,
    author: 'Integration Team',
    description: '发送邮件通知，支持HTML模板和附件',
    tags: ['邮件', '通知', 'SMTP'],
    riskLevel: 'high' as SkillRiskLevel,
    requiresApproval: true,
    inputSchema: {
      type: 'object',
      properties: {
        to: { type: 'string', description: '收件人' },
        subject: { type: 'string', description: '邮件主题' },
        body: { type: 'string', description: '邮件内容' },
        attachments: { type: 'array' }
      },
      required: ['to', 'subject', 'body']
    },
    outputSchema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        messageId: { type: 'string' }
      }
    },
    config: {
      temperature: 0,
      maxTokens: 500,
      topP: 1,
      toolBindings: [],
      guardrails: {
        validateInput: true,
        privacyCheck: true,
        maxRetries: 2
      },
      resources: {
        timeout: 60,
        maxMemory: 128,
        maxConcurrency: 10
      }
    },
    dependencies: {
      skills: [],
      tools: ['smtp-client'],
      mcpServers: []
    },
    stats: generateStats([100, 500], [95, 99]),
    lastUpdated: Date.now() - 604800000,
    createdAt: Date.now() - 86400000 * 50,
    updatedAt: Date.now() - 604800000
  },
  {
    id: 'skill-011',
    name: 'translation',
    displayName: '多语言翻译',
    version: '2.0.0',
    category: 'processing' as SkillCategory,
    status: 'enabled' as SkillStatus,
    author: 'AI Team',
    description: '高质量多语言翻译，支持上下文理解和专业术语',
    tags: ['翻译', '多语言', 'NLP'],
    riskLevel: 'low' as SkillRiskLevel,
    requiresApproval: false,
    inputSchema: {
      type: 'object',
      properties: {
        text: { type: 'string', description: '待翻译文本' },
        sourceLang: { type: 'string', description: '源语言' },
        targetLang: { type: 'string', description: '目标语言' },
        context: { type: 'string' }
      },
      required: ['text', 'targetLang']
    },
    outputSchema: {
      type: 'object',
      properties: {
        translation: { type: 'string' },
        alternatives: { type: 'array' }
      }
    },
    config: {
      model: 'gpt-4o',
      temperature: 0.3,
      maxTokens: 4000,
      topP: 0.9,
      toolBindings: [],
      guardrails: {
        validateInput: true,
        privacyCheck: false,
        maxRetries: 3
      },
      resources: {
        timeout: 60,
        maxMemory: 256,
        maxConcurrency: 15
      }
    },
    dependencies: {
      skills: [],
      tools: [],
      mcpServers: []
    },
    stats: generateStats([15000, 35000], [94, 99]),
    lastUpdated: Date.now() - 7200000,
    createdAt: Date.now() - 86400000 * 100,
    updatedAt: Date.now() - 7200000
  },
  {
    id: 'skill-012',
    name: 'log-analyzer',
    displayName: '日志分析',
    version: '1.0.0',
    category: 'analytics' as SkillCategory,
    status: 'enabled' as SkillStatus,
    author: 'Ops Team',
    maintainer: '周九',
    description: '分析系统日志，识别异常模式和潜在问题',
    tags: ['日志', '运维', '监控'],
    riskLevel: 'medium' as SkillRiskLevel,
    requiresApproval: false,
    inputSchema: {
      type: 'object',
      properties: {
        logs: { type: 'string', description: '日志内容' },
        pattern: { type: 'string', description: '搜索模式' },
        timeRange: { type: 'object' }
      },
      required: ['logs']
    },
    outputSchema: {
      type: 'object',
      properties: {
        anomalies: { type: 'array' },
        summary: { type: 'object' },
        recommendations: { type: 'array' }
      }
    },
    config: {
      model: 'gpt-4o-mini',
      temperature: 0.1,
      maxTokens: 3000,
      topP: 0.95,
      toolBindings: [],
      guardrails: {
        validateInput: true,
        privacyCheck: true,
        maxRetries: 3
      },
      resources: {
        timeout: 90,
        maxMemory: 512,
        maxConcurrency: 5
      }
    },
    dependencies: {
      skills: [],
      tools: ['regex-engine'],
      mcpServers: ['mcp-elasticsearch']
    },
    stats: generateStats([800, 3000], [88, 96]),
    lastUpdated: Date.now() - 14400000,
    createdAt: Date.now() - 86400000 * 55,
    updatedAt: Date.now() - 14400000
  }
]

/**
 * 获取Skills统计数据
 */
export function getSkillsStats() {
  const total = mockSkills.length
  const enabled = mockSkills.filter((s) => s.status === 'enabled').length
  const totalCalls = mockSkills.reduce((sum, s) => sum + s.stats.totalCalls, 0)
  const avgSuccessRate = (
    mockSkills.reduce((sum, s) => sum + s.stats.successRate, 0) / total
  ).toFixed(1)

  return {
    total,
    enabled,
    totalCalls,
    avgSuccessRate
  }
}

/**
 * 按分类获取Skills
 */
export function getSkillsByCategory() {
  const categories: Record<SkillCategory, Skill[]> = {
    analytics: [],
    processing: [],
    invoker: [],
    transform: []
  }

  mockSkills.forEach((skill) => {
    categories[skill.category].push(skill)
  })

  return categories
}

/**
 * 按风险等级获取Skills
 */
export function getSkillsByRiskLevel() {
  const levels: Record<RiskLevel, Skill[]> = {
    low: [],
    medium: [],
    high: []
  }

  mockSkills.forEach((skill) => {
    levels[skill.riskLevel].push(skill)
  })

  return levels
}
