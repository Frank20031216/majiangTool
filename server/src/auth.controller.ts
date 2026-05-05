import { Controller, Post, Body } from '@nestjs/common'

interface LoginDto {
  code: string
}

@Controller('auth')
export class AuthController {
  // 小程序登录凭证校验
  @Post('login')
  async login(@Body() body: LoginDto) {
    const { code } = body

    if (!code) {
      return { code: 400, msg: '缺少 code 参数', data: null }
    }

    try {
      const appId = process.env.WX_APP_ID
      const appSecret = process.env.WX_APP_SECRET

      if (!appId || !appSecret) {
        console.error('微信配置缺失:', { appId: !!appId, appSecret: !!appSecret })
        // 未配置时返回模拟数据用于测试
        return {
          code: 200,
          msg: 'success',
          data: {
            openid: 'mock_openid_' + code.substring(0, 8),
            unionid: null,
            sessionKey: 'mock_session_key'
          }
        }
      }

      // 调用微信接口获取 openid 和 unionid
      const url = `https://api.weixin.qq.com/sns/jscode2session?appid=${appId}&secret=${appSecret}&js_code=${code}&grant_type=authorization_code`
      
      const response = await fetch(url)
      const data = await response.json() as {
        openid?: string
        unionid?: string
        session_key?: string
        errcode?: number
        errmsg?: string
      }

      if (data.errcode) {
        console.error('微信API错误:', data)
        return { code: 400, msg: data.errmsg || '微信登录失败', data: null }
      }

      return {
        code: 200,
        msg: 'success',
        data: {
          openid: data.openid,
          unionid: data.unionid,
          sessionKey: data.session_key
        }
      }
    } catch (err) {
      console.error('登录失败:', err)
      return { code: 500, msg: '服务器错误', data: null }
    }
  }
}
