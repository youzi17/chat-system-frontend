import { aiChatService as apiService } from './api/aiChat'
import { useAuthStore } from '@/stores/auth'
import type { AIConfig } from '@/types/aiConfig'

/**
 * AI聊天服务
 */
export const useAIChatService = () => {
  const authStore = useAuthStore()

  /**
   * 发送AI聊天请求
   * @param message 用户消息
   * @param configId AI配置ID
   * @returns AI响应内容
   */
  const sendChatRequest = async (message: string, configId: string): Promise<string> => {
    try {
      if (!authStore.token) {
        throw new Error('用户未登录')
      }

      // 发送请求到AI聊天接口
      const response = await apiService.sendMessage({ configId, message }, authStore.token)

      // 处理响应
      if (response.data && response.data.response) {
        return response.data.response
      } else {
        throw new Error('AI响应格式不正确')
      }
    } catch (error) {
      console.error('发送AI聊天请求失败:', error)
      // 为了确保即使API调用失败，我们也能提供一些有用的错误消息
      throw new Error(`AI对话请求失败: ${error instanceof Error ? error.message : '未知错误'}`)
    }
  }

  /**
   * 生成提示词模板
   * @param template 提示词模板
   * @param variables 模板变量
   * @returns 处理后的提示词
   */
  const generatePrompt = (template: string, variables: Record<string, string>): string => {
    let prompt = template

    // 替换模板中的变量
    Object.keys(variables).forEach((key) => {
      const regex = new RegExp(`\{${key}\}`, 'g')
      const replacement = variables[key] || ''
      prompt = prompt.replace(regex, replacement)
    })

    return prompt
  }

  /**
   * 生成系统提示词
   * @param config AI配置
   * @param userRole 用户角色
   * @returns 系统提示词内容
   */
  const generateSystemPrompt = (config?: AIConfig, userRole?: string): string => {
    const defaultPrompt = '你是一个有帮助的AI助手，会用自然友好的语言回答用户的问题。'

    if (!config) return defaultPrompt

    // 根据配置创建适合的系统提示词
    const promptParts = [
      '你是一个有帮助的AI助手，会用自然友好的语言回答用户的问题。',
      `你正在使用${config.model || 'AI模型'}模型进行回答。`,
    ]

    // 根据温度添加不同的提示
    if (config.temperature && config.temperature > 0.7) {
      promptParts.push('请提供创意性强、多样化的回答。')
    } else if (config.temperature && config.temperature < 0.3) {
      promptParts.push('请提供准确、专业、具体的回答。')
    }

    return promptParts.join(' ')
  }

  /**
   * 格式化AI回复
   * @param content AI回复内容
   * @returns 格式化后的内容
   */
  const formatAIResponse = (content: string): string => {
    // 去除开头和结尾的空行
    let formatted = content.trim()

    // 处理连续空格
    formatted = formatted.replace(/\s+/g, ' ')

    // 确保标点符号后面有空格
    formatted = formatted.replace(/([.!?,;:])([^\s"])/g, '$1 $2')

    return formatted
  }

  return {
    sendChatRequest,
    generatePrompt,
    generateSystemPrompt,
    formatAIResponse,
  }
}