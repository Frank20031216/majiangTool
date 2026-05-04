import { Controller, Get, Query } from '@nestjs/common';
import { UrlSchemeService } from './url-scheme.service';

@Controller('url-scheme')
export class UrlSchemeController {
  constructor(private readonly urlSchemeService: UrlSchemeService) {}

  @Get('generate')
  async generateUrlScheme(@Query('path') path: string): Promise<{
    status: string;
    data?: string;
    error?: string;
  }> {
    try {
      if (!path) {
        return { status: 'error', error: '缺少 path 参数' };
      }
      const urlScheme = await this.urlSchemeService.generateUrlScheme(path);
      return { status: 'success', data: urlScheme };
    } catch (error) {
      return { status: 'error', error: (error as Error).message };
    }
  }
}
