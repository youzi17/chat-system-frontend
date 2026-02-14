// AI配置相关类型定义

/**
 * AI配置（根据API规范更新）
 */
// types/aiConfig.ts
export interface AIConfig {
  id: string
  name: string
  studentName: string // ← 新增：来自接口
  model: string
  temperature: number
  createdAt: string
  // 注意：接口未返回 description, maxTokens, systemPrompt, updatedAt
}

/**
 * 创建AI配置的请求体
 */
export interface CreateAIConfigRequest {
  name: string
  description?: string
  model: string
  temperature: number
}

/**
 * AI模型配置（用于AI响应）
 */
export interface AIModelConfig {
  model: string
  temperature: number
}

/**
 * AI对话请求
 */
export interface AIChatRequest {
  configId: string
  message: string
}

/**
 * AI对话响应
 */
export interface AIChatResponse {
  response: string
  config: AIModelConfig
}
