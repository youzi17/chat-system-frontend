import type { JwtPayload } from '../types'

/**
 * 解析JWT令牌
 * @param token JWT令牌字符串
 * @returns 解析后的令牌负载对象
 */
export function parseJwt(token: string): JwtPayload | null {
  try {
    const payload = token.split('.')[1]
    if (!payload) {
      throw new Error('Invalid token format: missing payload')
    }
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(
      window
        .atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    )

    return JSON.parse(jsonPayload)
  } catch (error) {
    console.error('Failed to parse JWT:', error)
    return null
  }
}

/**
 * 检查JWT令牌是否过期
 * @param token JWT令牌字符串
 * @returns 是否已过期
 */
export function isTokenExpired(token: string): boolean {
  const payload = parseJwt(token)
  
  if (!payload || !payload.exp) return true
  
  const now = Date.now() / 1000
  return payload.exp < now
}

/**
 * 获取JWT令牌过期时间
 * @param token JWT令牌字符串
 * @returns 过期时间戳（毫秒），如果解析失败则返回null
 */
export function getTokenExpiration(token: string): number | null {
  const payload = parseJwt(token)
  
  if (!payload || !payload.exp) return null
  
  return payload.exp * 1000
}

/**
 * 格式化JWT过期时间显示
 * @param token JWT令牌字符串
 * @returns 格式化的过期时间字符串
 */
export function formatTokenExpiration(token: string): string {
  const expiration = getTokenExpiration(token)
  
  if (!expiration) return '未知过期时间'
  
  return new Date(expiration).toLocaleString()
}