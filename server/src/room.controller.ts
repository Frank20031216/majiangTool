import { Controller, Get, Post, Delete, Body, Param, ParseIntPipe } from '@nestjs/common';
import { RoomService, Member, Room } from '@/room.service';

@Controller('rooms')
export class RoomController {
  constructor(private readonly roomService: RoomService) {}

  // 转换数据库字段名为前端友好的 camelCase
  private transformRoom(room: Room) {
    return {
      id: room.room_code, // 使用 room_code 作为前端 id
      room_code: room.room_code,
      location: room.location,
      startTime: room.start_time,
      endTime: room.end_time,
      creatorName: room.creator_name,
      creatorId: room.creator_id,
      members: room.members,
      isPermanent: room.is_permanent,
      createdAt: room.created_at,
    };
  }

  @Get()
  async getAllRooms() {
    const rooms = await this.roomService.getAllRooms();
    return { code: 200, msg: 'success', data: rooms.map(r => this.transformRoom(r)) };
  }

  @Get(':id')
  async getRoom(@Param('id', ParseIntPipe) id: number) {
    const room = await this.roomService.getRoomById(id);
    if (!room) {
      return { code: 404, msg: '房间不存在', data: null };
    }
    return { code: 200, msg: 'success', data: this.transformRoom(room) };
  }

  @Get('code/:code')
  async getRoomByCode(@Param('code') code: string) {
    const room = await this.roomService.getRoomByCode(code);
    if (!room) {
      return { code: 404, msg: '房间不存在', data: null };
    }
    return { code: 200, msg: 'success', data: this.transformRoom(room) };
  }

  @Post()
  async createRoom(@Body() body: { location: string; start_time: string; end_time?: string; creator_name: string; creator_id: string }) {
    const roomCode = Math.random().toString().slice(2, 8).padStart(6, '0');
    const room = await this.roomService.createRoom({
      room_code: roomCode,
      location: body.location,
      start_time: body.start_time,
      end_time: body.end_time || null,
      creator_name: body.creator_name,
      creator_id: body.creator_id,
      members: [{ id: body.creator_id, name: body.creator_name, joinedAt: new Date().toISOString() }],
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
  async deleteRoom(@Param('id', ParseIntPipe) id: number, @Body() body: { creator_id: string }) {
    try {
      await this.roomService.deleteRoom(id, body.creator_id);
      return { code: 200, msg: 'success', data: null };
    } catch (error) {
      return { code: 400, msg: (error as Error).message, data: null };
    }
  }

  @Post('remove-member')
  async removeMember(@Body() body: { room_id: number; member_id: string; creator_id: string }) {
    try {
      const room = await this.roomService.removeMember(body.room_id, body.member_id, body.creator_id);
      return { code: 200, msg: 'success', data: room };
    } catch (error) {
      return { code: 400, msg: (error as Error).message, data: null };
    }
  }

  @Post('init')
  async initPermanentRooms() {
    await this.roomService.initPermanentRooms();
    return { code: 200, msg: 'success', data: null };
  }
}
