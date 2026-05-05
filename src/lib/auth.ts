import Taro from '@tarojs/taro'
import { Network } from '@/network'
import { getUserId, saveUserInfo } from '@/lib/storage'

// 微信登录凭证校验接口返回的数据
interface WxLoginResponse {
  openid?: string
  unionid?: string
  sessionKey?: string
}

interface UserInfo {
  id: string
  nickname: string
  avatar?: string
}

/**
 * 微信授权登录流程
 * 1. 调用 wx.login 获取 code
 * 2. 调用后端接口通过 code 获取 openid
 * 3. 调用 wx.getUserProfile 获取昵称和头像
 * 4. 保存用户信息
 */
export async function wxLogin(): Promise<UserInfo | null> {
  try {
    // Step 1: 获取微信登录凭证
    const loginResult = await Taro.login()
    if (!loginResult.code) {
      console.error('wx.login 失败:', loginResult)
      Taro.showToast({ title: '登录失败，请重试', icon: 'none' })
      return null
    }

    // Step 2: 调用后端接口，通过 code 获取 openid
    const loginRes = await Network.request({
      url: '/api/auth/login',
      method: 'POST',
      data: { code: loginResult.code }
    })
    console.log('登录凭证校验结果:', loginRes.data)

    if (loginRes.data.code !== 200) {
      console.error('后端登录接口失败:', loginRes.data.msg)
      Taro.showToast({ title: '登录失败，请重试', icon: 'none' })
      return null
    }

    const wxData = loginRes.data.data as WxLoginResponse

    // Step 3: 获取用户信息（昵称、头像）
    const userProfileResult = await Taro.getUserProfile({
      desc: '用于完善会员资料'
    })

    if (!userProfileResult.userInfo) {
      console.error('getUserProfile 失败:', userProfileResult)
      Taro.showToast({ title: '获取用户信息失败', icon: 'none' })
      return null
    }

    const { nickName, avatarUrl } = userProfileResult.userInfo

    // Step 4: 生成用户 ID 并保存用户信息
    let userId = getUserId()
    if (!userId) {
      userId = `user_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`
      Taro.setStorageSync('userId', userId)
    }

    const userInfo: UserInfo = {
      id: userId,
      nickname: nickName,
      avatar: avatarUrl
    }

    saveUserInfo(userInfo)
    console.log('用户登录成功:', userInfo)

    return userInfo
  } catch (err) {
    console.error('微信登录失败:', err)
    Taro.showToast({ title: '登录失败，请重试', icon: 'none' })
    return null
  }
}

/**
 * 快速登录（仅使用昵称，不调用微信授权）
 */
export function quickLogin(nickname: string): UserInfo {
  let userId = getUserId()
  if (!userId) {
    userId = `user_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`
    Taro.setStorageSync('userId', userId)
  }

  const userInfo: UserInfo = {
    id: userId,
    nickname: nickname.trim() || `牌友${Math.floor(Math.random() * 100)}`
  }

  saveUserInfo(userInfo)
  console.log('快速登录成功:', userInfo)

  return userInfo
}
