export default {
  common: {
    language: 'Language',
    chinese: '中文',
    english: 'English',
    back: 'Back to List',
    save: 'Save',
    loading: 'Loading...',
    yes: 'Yes',
    no: 'No'
  },
  welcome: {
    slogan: 'Intelligent Enterprise Agent Platform',
    description: 'Natural Language Driven · Intelligent Orchestration · Dynamic Rendering',
    startExplore: 'Start Exploring',
    experienceOpenClaw: 'Experience OpenClaw',
    poweredBy: 'Powered by SmartLink'
  },
  header: {
    explore: 'Explore',
    application: 'Application',
    resource: 'Resource'
  },
  explore: {
    newChat: 'New Chat',
    chat: 'Chat',
    inputPlaceholder: 'Type a message...',
    selectOrCreate: 'Select or create a conversation to start chatting',
    justNow: 'Just now',
    minutesAgo: 'minutes ago',
    hoursAgo: 'hours ago',
    me: 'Me',
    assistant: 'SmartLink'
  },
  sidebar: {
    appOrchestration: 'App Orchestration',
    appManagement: 'App Management',
    explore: 'Explore',
    componentManagement: 'Component Management',
    skillsManagement: 'Skills Management',
    mcpManagement: 'MCP Management',
    modelManagement: 'Model Management',
    dataModel: 'Data Models',
    resource: 'Resource',
    toolManagement: 'Tool Management',
    settings: 'Settings',
    appearance: 'Appearance',
    providers: 'Model Providers',
    appList: 'App List',
    appDesign: 'App Design',
    collapseSidebar: 'Collapse Sidebar'
  },
  resource: {
    noMCP: 'No MCP configuration',
    createMCP: 'Create MCP'
  },
  error: {
    notFound: 'Page Not Found',
    backHome: 'Back to Home'
  },
  skills: {
    title: 'Skills Management',
    create: 'Create Skill',
    searchPlaceholder: 'Search Skills...',
    author: 'Author',
    category: {
      all: 'All Categories',
      analytics: 'Analytics',
      processing: 'Processing',
      invoker: 'Invoker',
      transform: 'Transform'
    },
    risk: {
      all: 'All Risk Levels',
      low: 'Low Risk',
      medium: 'Medium Risk',
      high: 'High Risk'
    },
    requiresApproval: 'Requires Approval',
    stats: {
      total: 'Total',
      enabled: 'Enabled',
      totalCalls: 'Total Calls',
      avgSuccessRate: 'Avg Success Rate',
      calls: 'Calls',
      successRate: 'Success Rate',
      avgDuration: 'Avg Duration'
    },
    actions: {
      test: 'Test',
      edit: 'Edit',
      delete: 'Delete'
    },
    status: {
      enabled: 'Enabled',
      partial: 'Partial',
      disabled: 'Disabled'
    },
    test: {
      success: 'Test Successful',
      failed: 'Test Failed: {error}'
    },
    delete: {
      confirm: 'Are you sure you want to delete Skill "{name}"?'
    },
    empty: {
      title: 'No Skills Found',
      subtitle: 'Click "Create Skill" to add your first Skill'
    },
    pagination: {
      showing: 'Showing {start}-{end} of {total}'
    }
  },
  skillDetail: {
    basicInfo: {
      title: 'Basic Information',
      name: 'Skill Name',
      uniqueId: 'Unique ID',
      version: 'Version',
      displayName: 'Display Name',
      category: 'Category',
      description: 'Description',
      tags: 'Tags',
      author: 'Author',
      maintainer: 'Maintainer',
      lastUpdated: 'Last Updated',
      riskLevel: 'Risk Level',
      requiresApproval: 'Requires Approval',
      edit: 'Edit Info',
      changelog: 'View Changelog'
    },
    schema: {
      title: 'Input/Output Schema',
      input: 'Input Parameters',
      output: 'Output Results',
      required: 'Required',
      minLength: 'Min Length',
      maxLength: 'Max Length',
      enum: 'Enum',
      noDescription: 'No description',
      copySchema: 'Copy Schema',
      importExample: 'Import Example',
      copied: 'Copied to clipboard'
    },
    config: {
      title: 'Configuration',
      llmParams: 'LLM Parameters',
      model: 'Model',
      temperature: 'Temperature',
      maxTokens: 'Max Tokens',
      topP: 'Top P',
      toolBindings: 'Tool Bindings',
      required: 'Required',
      optional: 'Optional',
      guardrails: 'Guardrails',
      validateInput: 'Validate Input',
      privacyCheck: 'Privacy Check',
      maxRetries: 'Max Retries',
      resources: 'Resource Limits',
      timeout: 'Timeout',
      maxMemory: 'Max Memory',
      maxConcurrency: 'Max Concurrency',
      save: 'Save Config',
      reset: 'Reset'
    },
    dependencies: {
      title: 'Dependencies',
      skills: 'Dependent Skills',
      tools: 'Dependent Tools',
      mcpServers: 'Dependent MCP Servers',
      add: 'Add Dependency',
      noSkills: 'No Skill dependencies',
      noTools: 'No Tool dependencies',
      noMcp: 'No MCP server dependencies'
    },
    usage: {
      title: 'Usage Stats (Last 30 Days)',
      totalCalls: 'Total Calls',
      successRate: 'Success Rate',
      avgDuration: 'Avg Duration',
      p95Duration: 'P95 Duration',
      tokens: 'Token Usage',
      input: 'Input',
      output: 'Output',
      cost: 'Estimated Cost',
      viewDetails: 'View Details',
      exportReport: 'Export Report'
    },
    composition: {
      title: 'Composition (Used by Workflows)',
      description: 'This Skill is referenced by:',
      viewGraph: 'View Full Dependency Graph'
    },
    monitoring: {
      title: 'Execution Monitoring',
      status: 'Status',
      todayCalls: "Today's Calls",
      successRate: 'Success Rate',
      avgLatency: 'Avg Latency',
      todayCost: "Today's Cost"
    },
    quickActions: {
      title: 'Quick Actions',
      test: 'Test Now',
      viewLogs: 'View Logs',
      copyConfig: 'Copy Config',
      pause: 'Pause',
      enable: 'Enable',
      copied: 'Config copied to clipboard'
    }
  },
  datamodel: {
    title: 'Data Model Management',
    categoryTitle: 'Categories',
    allModels: 'All Models',
    newCategory: 'New Category',
    newCategoryTitle: 'New Category',
    categoryName: 'Category Name',
    categoryNamePlaceholder: 'Enter category name',
    categoryIcon: 'Category Icon',
    categoryDescription: 'Description',
    categoryDescriptionPlaceholder: 'Enter category description (optional)',
    currentCategory: 'Current Category',
    createModel: 'Create Model',
    createModelTitle: 'Create Data Model',
    createAndEdit: 'Create & Edit',
    searchPlaceholder: 'Search models...',
    filterByType: 'Filter by Type',
    modelName: 'Model Name',
    modelNamePlaceholder: 'e.g., server_info',
    displayName: 'Display Name',
    displayNamePlaceholder: 'e.g., Server Information',
    modelType: 'Model Type',
    category: 'Category',
    description: 'Description',
    descriptionPlaceholder: 'Enter model description',
    showing: 'Showing',
    total: 'Total',
    items: 'items',
    noModels: 'No data models found',
    fieldCount: 'Fields',
    relationCount: 'Relations',
    fields: '',
    models: 'models',
    updated: 'Updated',
    // Model types
    type: {
      entity: 'Entity Model',
      entityDesc: 'Business entities like user, order, etc.',
      input: 'Input Model',
      inputDesc: 'API input parameters',
      output: 'Output Model',
      outputDesc: 'API output data structure',
      intermediate: 'Intermediate Model',
      intermediateDesc: 'Temporary models for internal processing'
    },
    // Detail page
    basicInfo: 'Basic Information',
    fieldDefinitions: 'Field Definitions',
    addField: 'Add Field',
    addFieldTitle: 'Add Field',
    editField: 'Edit Field',
    fieldName: 'Field Name',
    fieldNamePlaceholder: 'e.g., userId',
    fieldType: 'Field Type',
    fieldTypes: {
      string: 'String',
      number: 'Number',
      boolean: 'Boolean',
      date: 'Date',
      enum: 'Enum',
      object: 'Object',
      array: 'Array'
    },
    required: 'Required',
    requiredField: 'Required Field',
    defaultValue: 'Default Value',
    noFields: 'No fields defined',
    addFirstField: 'Add First Field',
    // Relations
    relations: 'Relations',
    addRelation: 'Add Relation',
    addRelationTitle: 'Add Relation',
    editRelation: 'Edit Relation',
    targetModel: 'Target Model',
    selectModel: 'Select Model',
    relationType: 'Relation Type',
    relationTypes: {
      '1N': 'One-to-Many (1:N)',
      '1NDesc': 'One user has many orders',
      N1: 'Many-to-One (N:1)',
      N1Desc: 'Many orders belong to one user',
      '11': 'One-to-One (1:1)',
      '11Desc': 'One-to-one correspondence',
      NN: 'Many-to-Many (N:N)',
      NNDesc: 'Many-to-many relation'
    },
    foreignKey: 'Foreign Key',
    targetKey: 'Target Key',
    selectField: 'Select Field',
    cascade: 'Cascade',
    cascadeDelete: 'Cascade Delete',
    cascadeDeleteDesc: 'Delete related records when deleting current record',
    cascadeUpdate: 'Cascade Update',
    cascadeUpdateDesc: 'Update related records when updating current record',
    noRelations: 'No relations defined',
    addFirstRelation: 'Add First Relation',
    // Advanced options
    advancedOptions: 'Advanced Options',
    minLength: 'Min Length',
    maxLength: 'Max Length',
    min: 'Min Value',
    max: 'Max Value',
    pattern: 'Pattern (Regex)',
    enumValues: 'Enum Values',
    enumValuesPlaceholder: 'Comma separated, e.g., active,inactive,suspended',
    // Confirmations
    confirmDeleteField: 'Are you sure you want to delete this field?',
    confirmDeleteRelation: 'Are you sure you want to delete this relation?',
    modelNotFound: 'Model not found',
    backToList: 'Back to List'
  },
  settings: {
    appearance: 'Appearance',
    providers: 'Model Providers',
    systemSettings: 'System Settings',
    themeMode: 'Theme Mode',
    lightMode: 'Light Mode',
    darkMode: 'Dark Mode',
    followSystem: 'Follow System',
    primaryColor: 'Primary Color',
    colors: {
      defaultBlue: 'Default Blue',
      techGreen: 'Tech Green',
      elegantPurple: 'Elegant Purple',
      activeOrange: 'Active Orange'
    },
    fontSize: 'Font Size',
    small: 'Small',
    medium: 'Medium',
    large: 'Large',
    saveChanges: 'Save Changes',
    appearanceSettings: {
      title: 'Appearance Settings'
    },
    modelProviders: {
      title: 'Model Providers',
      sectionTitle: 'Model Provider Configuration',
      configured: 'Configured',
      unconfigured: 'Not Configured',
      apiKey: 'API Key',
      baseUrl: 'Base URL',
      availableModels: 'Available Models',
      testConnection: 'Test Connection',
      testing: 'Testing...',
      addConfig: 'Add Configuration',
      addNewProvider: 'Add New Provider',
      confirmDelete: 'Are you sure you want to delete provider "{name}"?',
      descriptions: {
        ollama: 'Local model service, supports Llama, Qwen and other open source models',
        alibaba: 'Supports Qwen series models',
        google: 'Supports Gemini series models',
        custom: 'Custom model provider'
      }
    }
  }
}
