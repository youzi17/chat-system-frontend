/**
 * JWT令牌负载接口
 */
export interface JwtPayload {
  /**
   * 令牌过期时间戳（秒）
   */
  exp?: number

  /**
   * 令牌签发时间戳（秒）
   */
  iat?: number

  /**
   * 令牌签发者
   */
  iss?: string

  /**
   * 令牌主题（通常是用户ID）
   */
  sub?: string

  /**
   * 用户名
   */
  username?: string

  /**
   * 显示名称
   */
  displayName?: string

  /**
   * 用户角色
   */
  role?: string

  /**
   * 其他自定义字段
   */
  [key: string]: unknown
}
export interface TokenResponse {
  token: string
}
