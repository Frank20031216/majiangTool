// 麻将约局应用类型定义
import Taro from '@tarojs/taro'

export interface Room {
  id: string
  location: string
  start_time: string
  end_time?: string
  creator_id: string
  creator_name: string
  members: Member[]
  created_at: string
}

export interface Member {
  id: string
  name: string
  joined_at: number
}

export interface UserRecord {
  roomId: string
  memberId: string
  joinedAt: number
}

export interface UserInfo {
  id: string
  nickname: string
  avatar?: string
}

// 存储键名
const STORAGE_KEYS = {
  USER_ID: 'mahjong_user_id',
  USER_INFO: 'mahjong_user_info'
}

// 获取用户ID
export function getUserId(): string {
  let userId = Taro.getStorageSync(STORAGE_KEYS.USER_ID)
  if (!userId) {
    // 生成唯一ID
    userId = generateId()
    Taro.setStorageSync(STORAGE_KEYS.USER_ID, userId)
  }
  return userId
}

// 获取用户信息
export function getUserInfo(): UserInfo | null {
  const data = Taro.getStorageSync(STORAGE_KEYS.USER_INFO)
  return data ? JSON.parse(data) : null
}

// 保存用户信息
export function saveUserInfo(info: UserInfo): void {
  Taro.setStorageSync(STORAGE_KEYS.USER_INFO, JSON.stringify(info))
}

// 微信登录获取用户信息
export async function wxLogin(): Promise<UserInfo | null> {
  try {
    // 获取用户信息（需要用户授权）
    const profileResult = await Taro.getUserProfile({
      desc: '用于显示您的昵称和头像'
    })

    if (profileResult.errMsg === 'getUserProfile:ok') {
      const { userInfo } = profileResult
      const userId = getUserId()
      
      const userInfoData: UserInfo = {
        id: userId,
        nickname: userInfo.nickName,
        avatar: userInfo.avatarUrl
      }
      
      saveUserInfo(userInfoData)
      return userInfoData
    }
    
    return null
  } catch (error) {
    console.error('微信登录失败:', error)
    return null
  }
}

// 登出
export function logout(): void {
  Taro.removeStorageSync(STORAGE_KEYS.USER_INFO)
}

// 生成唯一ID
export function generateId(): string {
  const now = new Date()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  const hour = String(now.getHours()).padStart(2, '0')
  const minute = String(now.getMinutes()).padStart(2, '0')
  const second = String(now.getSeconds()).padStart(2, '0')
  
  // 格式: MMDDHHmmss + 随机字符
  const timePart = `${month}${day}${hour}${minute}${second}`
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ'
  let randomPart = ''
  for (let i = 0; i < 2; i++) {
    randomPart += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  
  return timePart + randomPart
}

// 格式化时间
export function formatTime(dateStr: string | undefined | null): string {
  if (!dateStr) return ''
  try {
    const date = new Date(dateStr)
    const valid = Number.isNaN(date.getTime())
    if (valid) return ''
    return date.toLocaleString('zh-CN', {
      month: 'numeric',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch {
    return ''
  }
}

// 生成邀请链接
export function generateInviteLink(roomId: string): string {
  return `/pages/room/index?id=${roomId}`
}
