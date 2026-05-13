import { Module } from '@nestjs/common';
import { AppController } from '@/app.controller';
import { AppService } from '@/app.service';
import { UrlSchemeController } from '@/url-scheme.controller';
import { UrlSchemeService } from '@/url-scheme.service';
import { RoomController } from '@/room.controller';
import { RoomService } from '@/room.service';

import { UserController } from '@/user.controller';
import { UserService } from '@/user.service';
import { SubscribeMessageController } from '@/subscribe-message.controller';
import { SubscribeMessageService } from '@/subscribe-message.service';

@Module({
  imports: [],
  controllers: [AppController, UrlSchemeController, RoomController, UserController, SubscribeMessageController],
  providers: [AppService, UrlSchemeService, RoomService, UserService, SubscribeMessageService],
})
export class AppModule {}
