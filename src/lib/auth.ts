import Taro from '@tarojs/taro'
import { Network } from '@/network'
import { saveUserInfo } from '@/lib/storage'

// 微信登录流程
export async function wxLogin(): Promise<WxLoginResult | null> {
  // Step 1: wx.login 获取 code
  const loginResult = await Taro.login()
  if (!loginResult.code) {
    console.error('wx.login 失败:', loginResult)
    Taro.showToast({ title: '登录失败，请重试', icon: 'none' })
    return null
  }

  // Step 2: wx.getUserProfile 获取用户信息
  const userProfileResult = await Taro.getUserProfile({
    desc: '用于完善用户资料'
  })

  if (!userProfileResult.userInfo) {
    console.error('获取用户信息失败:', userProfileResult)
    Taro.showToast({ title: '授权失败，请重试', icon: 'none' })
    return null
  }

  const { nickName: nickname, avatarUrl } = userProfileResult.userInfo

  // Step 3: 后端通过 code 获取 openid
  try {
    const res = await Network.request({
      url: '/api/auth/login',
      method: 'POST',
      data: {
        code: loginResult.code,
        nickname,
        avatar: avatarUrl
      }
    })

    const data = res.data
    if (data.code === 200 && data.data?.userId) {
      // 保存用户信息，使用 openid 作为唯一标识
      saveUserInfo({
        id: data.data.userId,
        nickname,
        avatar: avatarUrl
      })
      return {
        userId: data.data.userId,
        nickname,
        avatarUrl
      }
    } else {
      console.error('后端登录失败:', data)
      Taro.showToast({ title: '登录失败', icon: 'none' })
      return null
    }
  } catch (err) {
    console.error('登录请求失败:', err)
    Taro.showToast({ title: '网络错误', icon: 'none' })
    return null
  }
}

// 返回值类型
export interface WxLoginResult {
  userId: string
  nickname: string
  avatarUrl: string
}
