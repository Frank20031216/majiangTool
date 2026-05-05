import Taro from '@tarojs/taro'
import { saveUserInfo, UserInfo } from '@/lib/storage'

/**
 * 微信授权登录 - 使用微信设计好的授权流程
 * 直接通过 wx.getUserProfile 获取用户昵称和头像
 */
export async function wxLogin(): Promise<void> {
  try {
    // 调用微信授权获取用户信息
    const res = await Taro.getUserProfile({
      desc: '用于完善会员资料'
    })

    console.log('微信授权成功:', res.userInfo)

    // 提取用户信息
    const { nickName, avatarUrl } = res.userInfo

    // 生成唯一ID
    const userId = 'user_' + Date.now()

    // 构建用户信息
    const userInfo: UserInfo = {
      id: userId,
      nickname: nickName || '游客',
      avatar: avatarUrl || ''
    }

    // 保存到本地
    saveUserInfo(userInfo)

    // 显示成功提示
    Taro.showToast({ title: '登录成功', icon: 'success' })

  } catch (err) {
    console.error('微信授权失败:', err)
    Taro.showToast({ title: '授权失败，请重试', icon: 'none' })
  }
}
