import { Controller, Post, Body } from '@nestjs/common';
import { SubscribeMessageService } from './subscribe-message.service';

@Controller('subscribe-message')
export class SubscribeMessageController {
  constructor(private readonly subscribeMessageService: SubscribeMessageService) {}

  @Post('send')
  async sendMessage(@Body() body: {
    touser: string;
    template_id: string;
    page: string;
    data: Record<string, { value: string }>;
  }) {
    try {
      await this.subscribeMessageService.sendSubscribeMessage({
        touser: body.touser,
        template_id: body.template_id,
        page: body.page,
        data: body.data,
      });
      return { code: 200, msg: '发送成功', data: true };
    } catch (err) {
      return { code: 500, msg: err.message, data: null };
    }
  }
}
