import { log } from '../utils/logger'

interface AIConfig {
  apiKey: string
  baseUrl: string
  model: string
  maxTokens: number
  temperature: number
}

function getAIConfig(): AIConfig {
  const apiKey = process.env.AI_API_KEY || ''
  const model = process.env.AI_MODEL || 'gpt-3.5-turbo'
  const maxTokens = parseInt(process.env.AI_MAX_TOKENS || '2000', 10)
  const temperature = parseFloat(process.env.AI_TEMPERATURE || '0.7')

  const customUrl = process.env.AI_API_URL || process.env.AI_API_BASE_URL
  let baseUrl = 'https://api.openai.com/v1'
  
  if (customUrl) {
    if (customUrl.includes('/chat/completions')) {
      baseUrl = customUrl.replace(/\/chat\/completions$/, '')
    } else {
      baseUrl = customUrl.replace(/\/$/, '')
    }
  }

  if (!apiKey) {
    log.warn('AIConfig', 'AI_API_KEY未配置，AI功能将不可用')
  }

  return {
    apiKey,
    baseUrl,
    model,
    maxTokens,
    temperature
  }
}

export const aiConfig = getAIConfig()

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

export interface ChatCompletionRequest {
  model: string
  messages: ChatMessage[]
  max_tokens: number
  temperature: number
  stream?: boolean
}

export interface ChatCompletionResponse {
  id: string
  object: string
  created: number
  model: string
  choices: Array<{
    index: number
    message: {
      role: string
      content: string
    }
    finish_reason: string
  }>
  usage: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
}

export interface StreamChunk {
  id: string
  object: string
  created: number
  model: string
  choices: Array<{
    index: number
    delta: {
      role?: string
      content?: string
    }
    finish_reason: string | null
  }>
}

export default aiConfig
