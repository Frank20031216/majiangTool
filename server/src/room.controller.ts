import { Controller, Get, Post, Delete, Body, Param } from '@nestjs/common'
import { RoomService } from './room.service'
import {
  CreateRoomRequest,
  JoinRoomRequest,
  LeaveRoomRequest,
  DeleteRoomRequest,
  Room,
} from './room.entity'

@Controller('rooms')
export class RoomController {
  constructor(private readonly roomService: RoomService) {}

  /**
   * 获取所有房间列表
   */
  @Get()
  getAllRooms(): Room[] {
    console.log('[Room] GET /api/rooms - 获取所有房间')
    return this.roomService.getAllRooms()
  }

  /**
   * 获取单个房间详情
   */
  @Get(':id')
  getRoomById(@Param('id') id: string): Room | { error: string } {
    console.log(`[Room] GET /api/rooms/${id}`)
    const room = this.roomService.getRoomById(id)
    if (!room) {
      return { error: '房间不存在' }
    }
    return room
  }

  /**
   * 创建新房间
   */
  @Post()
  createRoom(@Body() request: CreateRoomRequest): Room {
    console.log('[Room] POST /api/rooms - 创建房间', request)
    return this.roomService.createRoom(request)
  }

  /**
   * 加入房间
   */
  @Post('join')
  joinRoom(@Body() request: JoinRoomRequest): { success: boolean; room?: Room; message: string } {
    console.log('[Room] POST /api/rooms/join - 加入房间', request)
    return this.roomService.joinRoom(request)
  }

  /**
   * 退出房间
   */
  @Post('leave')
  leaveRoom(@Body() request: LeaveRoomRequest): { success: boolean; message: string } {
    console.log('[Room] POST /api/rooms/leave - 退出房间', request)
    return this.roomService.leaveRoom(request)
  }

  /**
   * 删除房间
   */
  @Delete(':id')
  deleteRoom(
    @Param('id') roomId: string,
    @Body() body: { creatorId: string }
  ): { success: boolean; message: string } {
    console.log(`[Room] DELETE /api/rooms/${roomId}`)
    return this.roomService.deleteRoom({
      roomId,
      creatorId: body.creatorId,
    })
  }

  /**
   * 移除成员
   */
  @Post('remove-member')
  removeMember(@Body() body: { roomId: string; memberId: string; operatorId: string }): { success: boolean; message: string } {
    console.log('[Room] POST /api/rooms/remove-member', body)
    return this.roomService.removeMember(body.roomId, body.memberId, body.operatorId)
  }
}
