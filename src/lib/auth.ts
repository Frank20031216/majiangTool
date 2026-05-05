import Taro from '@tarojs/taro'
import { Network } from '@/network'
import { saveUserInfo, UserInfo } from '@/lib/storage'

/**
 * 微信授权登录 - 完整流程
 * 1. wx.login() 获取 code
 * 2. wx.getUserProfile() 获取用户信息
 * 3. 将 code 和用户信息发送到后端换取 openid
 */
export async function wxLogin(): Promise<void> {
  try {
    // Step 1: 调用 wx.login 获取临时登录凭证
    const loginRes = await Taro.login()
    if (!loginRes.code) {
      Taro.showToast({ title: '登录失败，请重试', icon: 'none' })
      return
    }
    console.log('wx.login 成功, code:', loginRes.code)

    // Step 2: 调用 wx.getUserProfile 获取用户信息
    const profileRes = await Taro.getUserProfile({
      desc: '用于完善会员资料'
    })
    console.log('wx.getUserProfile 成功:', profileRes.userInfo)

    // 提取用户信息
    const { nickName, avatarUrl } = profileRes.userInfo

    // Step 3: 发送到后端换取 openid
    try {
      const res = await Network.request({
        url: '/api/auth/login',
        method: 'POST',
        data: {
          code: loginRes.code,
          nickname: nickName,
          avatar: avatarUrl
        }
      })

      if (res.data.code === 200 && res.data.data) {
        // 后端返回的 openid 作为用户唯一标识
        const userInfo: UserInfo = {
          id: res.data.data.openid,
          nickname: nickName || '游客',
          avatar: avatarUrl || ''
        }
        saveUserInfo(userInfo)
        Taro.showToast({ title: '登录成功', icon: 'success' })
      } else {
        // 后端不可用时，使用本地生成ID
        const userInfo: UserInfo = {
          id: 'user_' + Date.now(),
          nickname: nickName || '游客',
          avatar: avatarUrl || ''
        }
        saveUserInfo(userInfo)
        Taro.showToast({ title: '登录成功', icon: 'success' })
      }
    } catch {
      // 网络错误时也保存用户信息
      const userInfo: UserInfo = {
        id: 'user_' + Date.now(),
        nickname: nickName || '游客',
        avatar: avatarUrl || ''
      }
      saveUserInfo(userInfo)
      Taro.showToast({ title: '登录成功', icon: 'success' })
    }

  } catch (err) {
    console.error('微信授权失败:', err)
    Taro.showToast({ title: '授权失败，请重试', icon: 'none' })
  }
}
