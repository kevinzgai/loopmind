import apiClient from './client.js'

// ─── Types ───────────────────────────────────────────────────────────────────

export interface AgentFeatures {
  conversationOperator: boolean
  nextQuestionSuggestion: boolean
  textToSpeech: boolean
  speechToText: boolean
  contentModeration: boolean
}

export interface AgentTtsConfig {
  voice: string
  speechRate: number
  autoPlay: boolean
}

export interface AgentGreeting {
  enabled: boolean
  text: string
  quickQuestions: string[]
}

export interface AgentKnowledgeBase {
  id: string
  name: string
}

export interface Agent {
  id: string
  name: string
  description?: string
  avatar?: string
  category?: string
  model: string
  personality?: string
  initialMemory?: string
  voice?: string
  speechRate?: number
  knowledgeBaseId?: AgentKnowledgeBase | string | null
  knowledgeBaseIds?: string[]
  enableKnowledgeBase?: boolean
  features: AgentFeatures
  ttsConfig: AgentTtsConfig
  greeting?: AgentGreeting
  sensitiveWords?: string[]
  isPublished?: boolean
  usageCount?: number
  createdAt?: string
  updatedAt?: string
}

export interface Conversation {
  id: string
  title: string
  messageCount?: number
  updatedAt?: string
}

export interface ChatMessage {
  id?: string
  role: 'user' | 'assistant' | 'system'
  content: string
}

export interface AgentMemory {
  agentId: string
  userId: string
  content: string
  contentLength: number
  conversationCount: number
  keywords: string[]
}

export interface ApiResponse<T = unknown> {
  code: number
  data: T
  message: string
}

export interface PaginatedData<T> {
  list: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

// ─── Agent CRUD ───────────────────────────────────────────────────────────────

/** GET /agent/categories - 获取已发布智能体的实际分类列表 */
export function getAgentCategories() {
  return apiClient.get<ApiResponse<{ categories: string[] }>>('/agent/categories')
}

/** GET /agent/published */
export function getPublishedAgents(params?: {
  page?: number
  limit?: number
  category?: string
  search?: string
}) {
  return apiClient.get<ApiResponse<PaginatedData<Agent>>>('/agent/published', { params })
}

/** GET /agent/my-agents */
export function getMyAgents(params?: { page?: number; limit?: number }) {
  return apiClient.get<ApiResponse<PaginatedData<Agent>>>('/agent/my-agents', { params })
}

/** GET /agent/:agentId */
export function getAgent(agentId: string) {
  return apiClient.get<ApiResponse<{ agent: Agent }>>(`/agent/${agentId}`)
}

/** POST /agent/create */
export function createAgent(data: Partial<Agent>) {
  return apiClient.post<ApiResponse<{ agent: Agent }>>('/agent/create', data)
}

/** PUT /agent/:agentId */
export function updateAgent(agentId: string, data: Partial<Agent>) {
  return apiClient.put<ApiResponse<{ agent: Agent }>>(`/agent/${agentId}`, data)
}

/** DELETE /agent/:agentId */
export function deleteAgent(agentId: string) {
  return apiClient.delete<ApiResponse<null>>(`/agent/${agentId}`)
}

/** POST /agent/:agentId/publish */
export function publishAgent(agentId: string) {
  return apiClient.post<ApiResponse<{ agent: Agent }>>(`/agent/${agentId}/publish`)
}

/** POST /agent/:agentId/unpublish */
export function unpublishAgent(agentId: string) {
  return apiClient.post<ApiResponse<{ agent: Agent }>>(`/agent/${agentId}/unpublish`)
}

/** GET /agent/:agentId/memory */
export function getAgentMemory(agentId: string) {
  return apiClient.get<ApiResponse<{ memory: AgentMemory }>>(`/agent/${agentId}/memory`)
}

/** POST /agent/generate-config */
export function generateAgentConfig(prompt: string, type: 'personality' | 'full' = 'personality') {
  return apiClient.post<ApiResponse<{ personality?: string; config?: Partial<Agent> }>>(
    '/agent/generate-config',
    { prompt, type },
    { timeout: 60000 }
  )
}

// ─── Conversations ────────────────────────────────────────────────────────────

/** GET /agent/:agentId/conversations */
export function listAgentConversations(agentId: string) {
  return apiClient.get<ApiResponse<{ conversations: Conversation[] }>>(
    `/agent/${agentId}/conversations`
  )
}

/** POST /agent/:agentId/conversations */
export function createAgentConversation(agentId: string, title = '新对话') {
  return apiClient.post<ApiResponse<{ conversation: Conversation }>>(
    `/agent/${agentId}/conversations`,
    { title }
  )
}

/** GET /agent/:agentId/conversations/:conversationId */
export function getAgentConversationMessages(agentId: string, conversationId: string) {
  return apiClient.get<ApiResponse<{ messages: ChatMessage[] }>>(
    `/agent/${agentId}/conversations/${conversationId}`
  )
}

/** DELETE /agent/:agentId/conversations/:conversationId */
export function deleteAgentConversation(agentId: string, conversationId: string) {
  return apiClient.delete<ApiResponse<null>>(
    `/agent/${agentId}/conversations/${conversationId}`
  )
}

/** GET /agent/:agentId/history (匿名用户) */
export function getAgentChatHistory(agentId: string, userId?: string) {
  return apiClient.get<ApiResponse<{ history: ChatMessage[] }>>(
    `/agent/${agentId}/history`,
    { params: userId ? { userId } : {} }
  )
}

export default {
  getPublishedAgents,
  getMyAgents,
  getAgent,
  createAgent,
  updateAgent,
  deleteAgent,
  publishAgent,
  unpublishAgent,
  getAgentMemory,
  generateAgentConfig,
  listAgentConversations,
  createAgentConversation,
  getAgentConversationMessages,
  deleteAgentConversation,
  getAgentChatHistory,
}
