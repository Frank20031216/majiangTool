// 微信登录授权模块
import Taro from '@tarojs/taro'
import { Network } from '@/network'

// 存储键名
const STORAGE_KEYS = {
  USER_ID: 'mahjong_user_id',
  USER_INFO: 'mahjong_user_info'
}

// 用户信息接口
export interface UserInfo {
  id: string
  nickname: string
  avatar: string
}

// 生成唯一ID
function generateId(length = 8): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

// 获取本地用户ID
export function getUserId(): string {
  let userId = Taro.getStorageSync(STORAGE_KEYS.USER_ID)
  if (!userId) {
    userId = generateId(8)
    Taro.setStorageSync(STORAGE_KEYS.USER_ID, userId)
  }
  return userId
}

// 获取本地用户信息
export function getLocalUserInfo(): UserInfo | null {
  const data = Taro.getStorageSync(STORAGE_KEYS.USER_INFO)
  return data ? JSON.parse(data) : null
}

// 保存本地用户信息
export function saveLocalUserInfo(info: UserInfo): void {
  Taro.setStorageSync(STORAGE_KEYS.USER_INFO, JSON.stringify(info))
}

// 清除本地用户信息（登出）
export function clearLocalUserInfo(): void {
  Taro.removeStorageSync(STORAGE_KEYS.USER_INFO)
}

// 微信授权登录
export async function wxLogin(): Promise<UserInfo | null> {
  try {
    // Step 1: 调用 wx.login 获取临时登录凭证 code
    const loginRes = await Taro.login()
    if (!loginRes.code) {
      console.error('wx.login 失败:', loginRes)
      throw new Error('获取登录凭证失败')
    }
    console.log('获取 code 成功:', loginRes.code)

    // Step 2: 后端通过 code 获取用户标识
    const res = await Network.request({
      url: '/api/auth/login',
      method: 'POST',
      data: { code: loginRes.code }
    })

    console.log('后端登录响应:', res.data)

    if (res.data.code !== 200 || !res.data.data) {
      console.error('后端登录失败:', res.data)
      throw new Error('后端登录失败')
    }

    const { openid, unionid } = res.data.data

    // 生成唯一用户ID（优先使用 unionid，其次 openid）
    const userId = unionid || openid || generateId(8)
    console.log('用户ID:', userId)

    // Step 3: 使用 wx.getUserProfile 获取用户信息（昵称、头像）
    const profileRes = await Taro.getUserProfile({
      desc: '用于完善会员资料'
    })

    console.log('获取用户信息成功:', profileRes.userInfo)

    const userInfo: UserInfo = {
      id: userId,
      nickname: profileRes.userInfo.nickName,
      avatar: profileRes.userInfo.avatarUrl
    }

    // 保存到本地
    saveLocalUserInfo(userInfo)

    return userInfo
  } catch (err) {
    console.error('微信登录失败:', err)
    throw err
  }
}

// 获取用户信息（从本地）
export function getUserInfo(): UserInfo | null {
  return getLocalUserInfo()
}

// 保存用户信息（到本地）
export function saveUserInfo(info: UserInfo): void {
  saveLocalUserInfo(info)
}

// 登出
export function logout(): void {
  clearLocalUserInfo()
}

// 格式化时间（兼容后端返回的 snake_case 字段）
export function formatTime(date: string | Date): string {
  if (!date) return ''
  const d = typeof date === 'string' ? new Date(date) : date
  const month = d.getMonth() + 1
  const day = d.getDate()
  const hours = d.getHours().toString().padStart(2, '0')
  const minutes = d.getMinutes().toString().padStart(2, '0')
  return `${month}/${day} ${hours}:${minutes}`
}
