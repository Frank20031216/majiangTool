import Taro from '@tarojs/taro'
import { Network } from '@/network'
import { saveUserInfo, getUserId } from './storage'

export interface UserInfo {
  id: string
  nickname: string
  avatarUrl?: string
  phone?: string
}

/**
 * 微信授权登录
 * 流程：wx.login -> 后端换取openid -> wx.getUserProfile获取昵称头像 -> 保存用户信息
 */
export async function wxLogin(): Promise<UserInfo | null> {
  try {
    // Step 1: wx.login 获取临时登录凭证 code
    const loginResult = await Taro.login()
    if (!loginResult.code) {
      console.error('wx.login 失败:', loginResult)
      Taro.showToast({ title: '登录失败，请重试', icon: 'none' })
      return null
    }

    // Step 2: wx.getUserProfile 获取用户信息（昵称、头像）
    let nickname = '微信用户'
    let avatarUrl = ''

    try {
      const profileResult = await Taro.getUserProfile({
        desc: '用于完善会员资料'
      })
      nickname = profileResult.userInfo?.nickName || nickname
      avatarUrl = profileResult.userInfo?.avatarUrl || ''
    } catch (profileErr) {
      console.warn('用户拒绝授权或授权失败:', profileErr)
      Taro.showToast({ title: '请允许授权以完善资料', icon: 'none' })
    }

    // Step 3: 调用后端接口，通过 code 换取 openid
    let openid = ''

    try {
      const res = await Network.request({
        url: '/api/auth/login',
        method: 'POST',
        data: {
          code: loginResult.code,
          nickname,
          avatarUrl
        }
      })

      if (res.data?.data?.openid) {
        openid = res.data.data.openid
      }
    } catch (err) {
      console.warn('后端登录接口失败，使用本地生成ID:', err)
      // 如果后端不可用，使用本地生成的唯一ID
      openid = getUserId() || `local_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
    }

    // Step 4: 构建并保存用户信息
    const userInfo: UserInfo = {
      id: openid,
      nickname,
      avatarUrl
    }

    saveUserInfo(userInfo)
    console.log('登录成功:', userInfo)

    return userInfo
  } catch (err) {
    console.error('wxLogin 异常:', err)
    return null
  }
}

/**
 * 获取用户手机号
 * 需要使用 button 组件的 open-type="getPhoneNumber"
 * @param e - button 组件的 bindgetphonenumber 事件对象
 */
export async function getPhoneNumber(e: any): Promise<string | null> {
  try {
    // 获取加密数据
    if (e.detail?.code) {
      // 小程序端的手机号获取
      // code 需要发送到后端解密获取手机号
      const res = await Network.request({
        url: '/api/auth/decrypt-phone',
        method: 'POST',
        data: {
          code: e.detail.code
        }
      })

      if (res.data?.data?.phoneNumber) {
        console.log('获取手机号成功:', res.data.data.phoneNumber)
        return res.data.data.phoneNumber
      }
    }

    console.warn('获取手机号失败:', e.detail)
    return null
  } catch (err) {
    console.error('getPhoneNumber 异常:', err)
    return null
  }
}

/**
 * 获取用户手机号（简化版，不依赖后端解密）
 * 直接通过 button open-type="getPhoneNumber" 获取
 * 注意：此方式需要在 button 上绑定 bindgetphonenumber
 */
export function handleGetPhone(e: any): string | null {
  if (e.detail?.phoneNumber) {
    console.log('获取手机号成功:', e.detail.phoneNumber)
    return e.detail.phoneNumber
  }
  console.warn('用户拒绝获取手机号或获取失败:', e.detail)
  return null
}
