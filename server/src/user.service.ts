import { Injectable } from '@nestjs/common';
import { getSupabaseClient } from '@/storage/database/supabase-client';
import axios from 'axios';

@Injectable()
export class UserService {

  
  private supabase = getSupabaseClient();

  async getWxSession(code: string): Promise<{ openid: string; session_key: string }> {
    const appId = 'wx3cbf65d65860566f';
    const appSecret = 'd6704db3d13bc479bdf798d3ee25de61';

    // if (!appId || !appSecret || appId === 'wx3cbf65d65860566f') {
    //   // Mock mode for development
    //   return {
    //     openid: 'mock_openid_' + code.slice(0, 16),
    //     session_key: 'mock_session_key'
    //   };
    // }

    const url = `https://api.weixin.qq.com/sns/jscode2session?appid=${appId}&secret=${appSecret}&js_code=${code}&grant_type=authorization_code`;
    
    try {
      const response = await axios.get(url);
      const data = response.data;

      if (data.errcode) {
        throw new Error(`微信登录失败: ${data.errmsg}`);
      }

      return {
        openid: data.openid,
        session_key: data.session_key
      };
    } catch (error) {
      console.error('获取微信session失败:', error);
      throw new Error('获取微信session失败');
    }
  }

  async getUserByOpenid(openid: string) {
    const client = this.supabase;
    if (!client) {
      return null;
    }
    
    const { data, error } = await client
      .from('users')
      .select('*')
      .eq('openid', openid)
      .single();
    
      if (error) {
      return null;
    }
    
    return {
  ...data,
  openid: data.openid,
  nickName: data.nick_name,    // 转换
  phone: data.phone,
  avatarUrl: data.avatar_url   // 转换
}
  }

  async createUser(userData: { openid: string; nick_name: string; phone?: string; avatar_url?: string }) {
    const client = this.supabase;
    if (!client) {
      return {
        id: Date.now(),
        ...userData,
        created_at: new Date().toISOString(),
      };
    }

    const { data, error } = await client
      .from('users')
      .insert([{
        openid: userData.openid,
        nick_name: userData.nick_name,
        phone: userData.phone || '',
        avatar_url: userData.avatar_url || ''
      }])
      .select()
      .single();

    if (error) {
      console.error('创建用户失败:', error);
      throw new Error(`创建用户失败: ${error.message}`);
    }

    return {
  ...data,
  openid: data.openid,
  nickName: data.nick_name,    // 转换
  phone: data.phone,
  avatarUrl: data.avatar_url   // 转换
}
  }

  async updateUser(openid: string, userData: { nick_name?: string; phone?: string; avatar_url?: string }) {
    const client = this.supabase;
    if (!client) {
      return { openid, ...userData };
    }

    const { data, error } = await client
      .from('users')
      .update({
        nick_name: userData.nick_name,
        phone: userData.phone,
        avatar_url: userData.avatar_url
      })
      .eq('openid', openid)
      .select()
      .single();

    if (error) {
      console.error('更新用户失败:', error);
      throw new Error(`更新用户失败: ${error.message}`);
    }

    return {
  ...data,
  openid: data.openid,
  nickName: data.nick_name,    // 转换
  phone: data.phone,
  avatarUrl: data.avatar_url   // 转换
}
  }
}
