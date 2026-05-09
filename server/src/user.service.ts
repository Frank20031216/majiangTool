import { Injectable } from '@nestjs/common';
import { createClient } from '@supabase/supabase-js';
import { WX_APP_ID, WX_APP_SECRET } from '../app.module';

@Injectable()
export class UserService {
  private supabase = createClient(
    process.env.SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  );

  async getUserByOpenid(openid: string) {
    const { data, error } = await this.supabase
      .from('users')
      .select('*')
      .eq('openid', openid)
      .single();
    
    if (error && error.code !== 'PGRST116') {
      throw new Error(`获取用户失败: ${error.message}`);
    }
    
    return data;
  }

  async createUser(userData: { openid: string; nick_name?: string; phone?: string; avatar_url?: string }) {
    const { data, error } = await this.supabase
      .from('users')
      .insert([userData])
      .select()
      .single();
    
    if (error) {
      throw new Error(`创建用户失败: ${error.message}`);
    }
    
    return data;
  }

  async updateUser(openid: string, userData: { nick_name?: string; phone?: string; avatar_url?: string }) {
    const { data, error } = await this.supabase
      .from('users')
      .update({ ...userData, updated_at: new Date().toISOString() })
      .eq('openid', openid)
      .select()
      .single();
    
    if (error) {
      throw new Error(`更新用户失败: ${error.message}`);
    }
    
    return data;
  }

  async getWxSession(code: string) {
    if (!WX_APP_ID || !WX_APP_SECRET) {
      // 测试模式，返回模拟 openid
      return { openid: `test_openid_${Date.now()}`, session_key: 'test_session_key' };
    }

    const url = `https://api.weixin.qq.com/sns/jscode2session?appid=${WX_APP_ID}&secret=${WX_APP_SECRET}&js_code=${code}&grant_type=authorization_code`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.errcode) {
      throw new Error(`微信登录失败: ${data.errmsg}`);
    }
    
    return {
      openid: data.openid,
      session_key: data.session_key,
      unionid: data.unionid,
    };
  }
}
