// 常量定义
export const STORAGE_KEYS = {
  CHAT_SESSIONS: 'chat-sessions',
  CURRENT_SESSION: 'current-session',
  SELECTED_ROLE: 'selected-role',
  USER_PREFERENCES: 'user-preferences',
  AUTH_TOKEN: 'auth-token',
  USER_INFO: 'user-info',
  SELECTED_AI_CONFIG: 'selected-ai-config',
  AI_CONFIGS: 'ai-configs',
  SELECTED_CONFIG_ID: 'selected-config-id',
} as const

export const API_ENDPOINTS = {
  CHAT: '/api/chat',
  UPLOAD: '/api/upload',
  AUTH: {
    REGISTER: '/auth/register',
    LOGIN: '/auth/login',
    PROFILE: '/auth/profile',
  },
  AI_CONFIGS: '/ai-configs',
  AI_CHAT: '/api/ai',
  ROLES: '/roles',
} as const

export const CHAT_LIMITS = {
  MAX_MESSAGE_LENGTH: 2000,
  MAX_SESSIONS: 50,
  MAX_MESSAGES_PER_SESSION: 100,
} as const

export const UI_CONSTANTS = {
  ANIMATION_DURATION: 300,
  DEBOUNCE_DELAY: 500,
  THROTTLE_DELAY: 100,
} as const

export const ROLE_CATEGORIES = {
  ANIME: 'anime',
  GAME: 'game',
  CUSTOM: 'custom',
} as const

export const MESSAGE_TYPES = {
  TEXT: 'text',
  IMAGE: 'image',
  FILE: 'file',
} as const
