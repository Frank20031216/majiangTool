import Taro from '@tarojs/taro'
import { Network } from '@/network'

interface UserInfo {
  openid: string
  nickName: string
  phone?: string
  avatarUrl?: string
}

// 获取本地存储的用户信息
export function getLocalUser(): UserInfo | null {
  try {
    const data = Taro.getStorageSync('userInfo')
    if (data) {
      return JSON.parse(data)
    }
  } catch (e) {
    console.error('获取本地用户信息失败:', e)
  }
  return null
}

// 保存用户信息到本地
export function saveLocalUser(user: UserInfo): void {
  try {
    Taro.setStorageSync('userInfo', JSON.stringify(user))
  } catch (e) {
    console.error('保存用户信息失败:', e)
  }
}

// 微信登录（获取 code）
export function wxLogin(): Promise<string> {
  return new Promise((resolve, reject) => {
    Taro.login({
      success: (res) => {
        if (res.code) {
          resolve(res.code)
        } else {
          reject(new Error('获取 code 失败'))
        }
      },
      fail: reject
    })
  })
}

// 通过 code 获取 openid
export async function getOpenidByCode(code: string): Promise<{ openid: string; isNewUser: boolean }> {
  const res = await Network.request({
    url: '/api/user/login',
    method: 'POST',
    data: { code }
  })
  
  const result = res.data
  if (result.code !== 200) {
    throw new Error(result.msg || '登录失败')
  }
  
  return {
    openid: result.data.openid,
    isNewUser: result.data.isNewUser
  }
}

// 注册新用户
export async function registerUser(userData: {
  openid: string
  nick_name: string
  phone?: string
  avatar_url?: string
}): Promise<UserInfo> {
  const res = await Network.request({
    url: '/api/user/register',
    method: 'POST',
    data: userData
  })
  
  const result = res.data

  if (result.code !== 200) {
    throw new Error(result.msg || '注册失败')
  }
  
  return result.data.user
}


export async function getUserInfo(openid: string): Promise<UserInfo> {
  const res = await Network.request({
    url: `/api/user/info?openid=${openid}`,
    method: 'GET',
  })
  
  const result = res.data
  return result.data
}

// 获取用户信息
export async function getUserProfile(): Promise<{ nickName: string; avatarUrl: string }> {
  return new Promise((resolve, reject) => {
    Taro.getUserProfile({
      desc: '用于完善用户资料',
      success: (res) => {
        resolve({
          nickName: res.userInfo?.nickName || '',
          avatarUrl: res.userInfo?.avatarUrl || ''
        })
      },
      fail: reject
    })
  })
}
