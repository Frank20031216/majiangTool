import { RoomService, Member } from '@/room.service';
import { Controller, Get, Post, Delete, Body, Param, ParseIntPipe } from '@nestjs/common';

@Controller('rooms')
export class RoomController {
  constructor(private readonly roomService: RoomService) {}

  // 转换数据库字段名为前端友好的格式
  private transformRoom(room: any) {
    return {
      id: room.id,
      room_code: room.room_code,
      location: room.location,
      start_time: room.start_time,
      end_time: room.end_time,
      creator_name: room.creator_name,
      creator_id: room.creator_id,
      members: room.members,
      is_permanent: room.is_permanent,
      created_at: room.created_at,
    };
  }

  @Get()
  async getAllRooms() {
    const rooms = await this.roomService.findAll();
    return { code: 200, msg: 'success', data: rooms.map(r => this.transformRoom(r)) };
  }

  @Get(':id')
  async getRoom(@Param('id', ParseIntPipe) id: number) {
    const room = await this.roomService.findById(id);
    if (!room) {
      return { code: 404, msg: '房间不存在', data: null };
    }
    return { code: 200, msg: 'success', data: this.transformRoom(room) };
  }

  @Post()
  async createRoom(@Body() body: { 
    location: string; 
    start_time: string; 
    end_time?: string; 
    creator_name: string; 
    creator_id: string 
  }) {
    // 生成8位房间号
    const now = new Date();
    const roomCode = `${(now.getMonth() + 1).toString().padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}${now.getHours().toString().padStart(2, '0')}${now.getMinutes().toString().padStart(2, '0')}${now.getSeconds().toString().padStart(2, '0')}`.slice(0, 8) + Math.random().toString().slice(2, 4);
    
    const room = await this.roomService.create({
      room_code: roomCode,
      location: body.location,
      start_time: body.start_time,
      end_time: body.end_time || null,
      creator_name: body.creator_name,
      creator_id: body.creator_id,
      members: [],
      is_permanent: false,
    });
    return { code: 200, msg: 'success', data: this.transformRoom(room) };
  }

  @Post('join')
  async joinRoom(@Body() body: { room_id: number; member: Member }) {
    try {
      const room = await this.roomService.joinRoom(body.room_id, body.member);
      return { code: 200, msg: 'success', data: this.transformRoom(room) };
    } catch (error) {
      return { code: 400, msg: (error as Error).message, data: null };
    }
  }

  @Post('leave')
  async leaveRoom(@Body() body: { room_id: number; member_id: string }) {
    try {
      const room = await this.roomService.leaveRoom(body.room_id, body.member_id);
      return { code: 200, msg: 'success', data: this.transformRoom(room) };
    } catch (error) {
      return { code: 400, msg: (error as Error).message, data: null };
    }
  }

  @Delete(':id')
  async deleteRoom(@Param('id', ParseIntPipe) id: number) {
    try {
      await this.roomService.delete(id);
      return { code: 200, msg: 'success', data: null };
    } catch (error) {
      return { code: 400, msg: (error as Error).message, data: null };
    }
  }

  @Post('remove-member')
  async removeMember(@Body() body: { room_id: number; user_id: string }) {
    try {
      const room = await this.roomService.removeMember(body.room_id, body.user_id);
      return { code: 200, msg: 'success', data: this.transformRoom(room) };
    } catch (error) {
      return { code: 400, msg: (error as Error).message, data: null };
    }
  }
}
