import { Module } from '@nestjs/common';
import { AppController } from '@/app.controller';
import { AppService } from '@/app.service';
import { UrlSchemeController } from '@/url-scheme.controller';
import { UrlSchemeService } from '@/url-scheme.service';
import { RoomController } from '@/room.controller';
import { RoomService } from '@/room.service';

import { UserController } from '@/user.controller';
import { UserService } from '@/user.service';

@Module({
  imports: [],
  controllers: [AppController, UrlSchemeController, RoomController, UserController],
  providers: [AppService, UrlSchemeService, RoomService, UserService],
})
export class AppModule {}
