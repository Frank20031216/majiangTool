import { Module } from '@nestjs/common';
import { AppController } from '@/app.controller';
import { AppService } from '@/app.service';
import { UrlSchemeController } from '@/url-scheme.controller';
import { UrlSchemeService } from '@/url-scheme.service';

@Module({
  imports: [],
  controllers: [AppController, UrlSchemeController],
  providers: [AppService, UrlSchemeService],
})
export class AppModule {}
