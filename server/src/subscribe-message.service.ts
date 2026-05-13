import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class SubscribeMessageService {
  private readonly appId = process.env.WX_APP_ID || 'wx3cbf65d65860566f';
  private readonly appSecret = process.env.WX_APP_SECRET || 'd6704db3d13bc479bdf798d3ee25de61';

  async getAccessToken(): Promise<string> {
    const url = `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${this.appId}&secret=${this.appSecret}`;
    
    const response = await axios.get(url);
    const data = response.data;

    if (data.errcode) {
      throw new Error(`获取access_token失败: ${data.errmsg}`);
    }

    return data.access_token;
  }

  async sendSubscribeMessage(params: {
    touser: string;
    template_id: string;
    page: string;
    data: Record<string, { value: string }>;
  }): Promise<boolean> {
    const accessToken = await this.getAccessToken();
    const url = `https://api.weixin.qq.com/cgi-bin/message/subscribe/send?access_token=${accessToken}`;

    const payload = {
      touser: params.touser,
      template_id: params.template_id,
      page: params.page,
      data: params.data,
      miniprogram_state: 'developer',
      lang: 'zh_CN',
    };

    const response = await axios.post(url, payload);
    const result = response.data;

    if (result.errcode && result.errcode !== 0) {
      throw new Error(`发送订阅消息失败: ${result.errmsg}`);
    }

    return true;
  }
}
