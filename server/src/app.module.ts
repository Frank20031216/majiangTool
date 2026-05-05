import { Module } from '@nestjs/common';
import { AppController } from '@/app.controller';
import { AppService } from '@/app.service';
import { UrlSchemeController } from '@/url-scheme.controller';
import { UrlSchemeService } from '@/url-scheme.service';
import { RoomController } from '@/room.controller';
import { RoomService } from '@/room.service';

@Module({
  imports: [],
  controllers: [AppController, UrlSchemeController, RoomController],
  providers: [AppService, UrlSchemeService, RoomService],
})
export class AppModule {}
