import { Controller, Post, Body, Get, Query } from '@nestjs/common';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('login')
  async login(@Body() body: { code: string }) {
    const { code } = body;

    if (!code) {
      return { code: 400, msg: '缺少code参数', data: null };
    }

    try {

      const session = await this.userService.getWxSession(code);

      const { openid } = session;

      // 查询数据库中是否有该用户
      let user = await this.userService.getUserByOpenid(openid);


      if (user) {
      // 老用户：返回 user 对象，没有 openid 字段
      return { code: 200, msg: '登录成功', data: { openid, isNewUser: false } };
    } else {
      // 新用户：返回 openid 字段
      return { code: 200, msg: '新用户', data: { openid, isNewUser: true } };
    }
      
    } catch (err) {
      return { code: 500, msg: err.message, data: null };
    }
  }

  @Post('register')
  async register(@Body() body: { openid: string; nick_name: string; phone?: string; avatar_url?: string }) {
    const { openid, nick_name, phone, avatar_url } = body;

    if (!openid || !nick_name) {
      return { code: 400, msg: '缺少必填参数', data: null };
    }

    try {
      // 检查用户是否已存在
      const existingUser = await this.userService.getUserByOpenid(openid);
      
      if (existingUser) {
        // 已存在则更新信息
        const user = await this.userService.updateUser(openid, { nick_name, phone, avatar_url });
        return { code: 200, msg: '登录成功', data: { user, isNewUser: false } };
      }

      // 创建新用户
      const user = await this.userService.createUser({ openid, nick_name, phone, avatar_url });
      return { code: 200, msg: '注册成功', data: { user, isNewUser: true } };
    } catch (err) {
      return { code: 500, msg: err.message, data: null };
    }
  }

  @Get('info')
  async getUserInfo(@Query('openid') openid: string) {
    if (!openid) {
      return { code: 400, msg: '缺少openid参数', data: null };
    }

    try {
      const user = await this.userService.getUserByOpenid(openid);
      if (!user) {
        return { code: 404, msg: '用户不存在', data: null };
      }
      return { code: 200, msg: '获取成功', data: user };
    } catch (err) {
      return { code: 500, msg: err.message, data: null };
    }
  }
}
