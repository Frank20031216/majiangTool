import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class UrlSchemeService {
  private readonly appId: string;
  private readonly appSecret: string;
  private accessToken: string | null = null;
  private accessTokenExpire: number = 0;

  constructor() {
    this.appId = process.env.WX_APP_ID || '';
    this.appSecret = process.env.WX_APP_SECRET || '';
  }

  /**
   * 获取 Access Token
   */
  private async getAccessToken(): Promise<string> {
    // 如果已有有效的 token，直接返回
    if (this.accessToken && Date.now() < this.accessTokenExpire) {
      return this.accessToken;
    }

    if (!this.appId || !this.appSecret) {
      throw new Error('缺少微信 AppId 或 AppSecret 配置');
    }

    const url = `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${this.appId}&secret=${this.appSecret}`;
    
    const response = await axios.get(url);
    const data = response.data;

    if (data.errcode) {
      throw new Error(`获取 Access Token 失败: ${data.errmsg}`);
    }

    this.accessToken = data.access_token || '';
    // 提前 5 分钟过期
    this.accessTokenExpire = Date.now() + ((data.expires_in || 7200) - 300) * 1000;

    return this.accessToken;
  }

  /**
   * 生成 URL Scheme
   * @param path 小程序页面路径，如 /pages/room/index?id=123456
   */
  async generateUrlScheme(path: string): Promise<string> {
    const accessToken = await this.getAccessToken();
    const url = `https://api.weixin.qq.com/wxa/generatescheme?access_token=${accessToken}`;

    const requestBody = {
      jump_wxa: {
        path: path,
        query: '',
        env_version: 'release', // release: 正式版 trial: 体验版 develop: 开发版
      },
      expire_type: 0, // 0: 不过期
      expire_time: 0,
    };

    const response = await axios.post(url, requestBody);
    const data = response.data;

    if (data.errcode) {
      throw new Error(`生成 URL Scheme 失败: ${data.errmsg}`);
    }

    return data.openlink || '';
  }

  /**
   * 生成 URL Link（小程序链接，可在不同场景打开）
   * @param path 小程序页面路径
   * @param expireDays 链接有效期（天数），默认30天
   */
  async generateUrlLink(path: string, expireDays: number = 30): Promise<string> {
    const accessToken = await this.getAccessToken();
    const url = `https://api.weixin.qq.com/wxa/generate_urllink?access_token=${accessToken}`;

    const requestBody = {
      path: path,
      query: '',
      expire_type: 1, // 1: 指定过期时间
      expire_interval: expireDays * 24 * 60 * 60, // 转换为秒
      env_version: 'release',
    };

    const response = await axios.post(url, requestBody);
    const data = response.data;

    if (data.errcode) {
      throw new Error(`生成 URL Link 失败: ${data.errmsg}`);
    }

    return data.url_link;
  }
}
