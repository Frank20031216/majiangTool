import Taro from '@tarojs/taro'
import { Network } from '@/network'
import { saveUserInfo, UserInfo } from '@/lib/storage'

/**
 * 微信授权登录（完整流程）
 * Step 1: wx.login 获取 code
 * Step 2: 后端通过 code 换取 openid
 * Step 3: wx.getUserProfile 获取昵称头像
 */
export async function wxLogin(): Promise<void> {
  try {
    // Step 1: 调用 wx.login 获取临时登录凭证
    const loginRes = await Taro.login()
    console.log('wx.login result:', loginRes)
    
    if (!loginRes.code) {
      console.error('wx.login 失败:', loginRes)
      Taro.showToast({ title: '登录失败，请重试', icon: 'none' })
      return
    }

    // Step 2: 调用后端接口，用 code 换取 openid
    let openid = 'guest_' + Date.now()
    try {
      const res = await Network.request({
        url: '/api/auth/login',
        method: 'POST',
        data: { code: loginRes.code }
      })
      console.log('后端登录响应:', res)
      
      if (res.data?.data?.openid) {
        openid = res.data.data.openid
      }
    } catch (err) {
      console.error('后端登录接口错误:', err)
      // 继续使用临时 openid
    }

    // Step 3: 调用 wx.getUserProfile 获取用户信息
    const userProfileRes = await Taro.getUserProfile({
      desc: '用于完善会员资料'
    })
    console.log('wx.getUserProfile result:', userProfileRes)

    if (!userProfileRes.userInfo) {
      Taro.showToast({ title: '获取用户信息失败', icon: 'none' })
      return
    }

    const { nickName, avatarUrl } = userProfileRes.userInfo

    // 保存用户信息
    const userInfo: UserInfo = {
      id: openid,
      nickname: nickName || '微信用户',
      avatar: avatarUrl || ''
    }
    
    saveUserInfo(userInfo)
    Taro.showToast({ title: '登录成功', icon: 'success' })

    // 刷新页面
    setTimeout(() => {
      const pages = Taro.getCurrentPages()
      if (pages.length > 1) {
        Taro.redirectTo({ url: '/pages/index/index' })
      } else {
        Taro.reLaunch({ url: '/pages/index/index' })
      }
    }, 1500)

  } catch (err) {
    console.error('微信授权登录失败:', err)
    
    // 用户拒绝授权时，允许使用昵称输入方式
    if ((err as any).errMsg?.includes('auth deny') || (err as any).errMsg?.includes('cancel')) {
      Taro.showToast({ title: '您已取消授权，可手动输入昵称', icon: 'none' })
    } else {
      Taro.showToast({ title: '登录失败，请重试', icon: 'none' })
    }
  }
}

/**
 * 快速登录（用于开发测试，无需微信授权）
 */
export async function quickLogin(nickName: string): Promise<void> {
  const userId = 'guest_' + Date.now()
  const userInfo: UserInfo = {
    id: userId,
    nickname: nickName || '游客',
    avatar: ''
  }
  saveUserInfo(userInfo)
  Taro.showToast({ title: '登录成功', icon: 'success' })
  
  setTimeout(() => {
    Taro.reLaunch({ url: '/pages/index/index' })
  }, 1500)
}
