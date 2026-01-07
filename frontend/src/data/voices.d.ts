// 音色数据类型声明

export interface Voice {
  id: string
  name: string
  type: string
  quality: string
  emotions?: string[]
}

export interface VoiceCategory {
  category: string
  voices: Voice[]
}

export const voiceCategories: VoiceCategory[]

export function getAllVoices(): Voice[]

export function getVoiceById(id: string): Voice | undefined

export function getRecommendedVoices(): Voice[]
