import { Injectable } from '@nestjs/common'
import {
  Room,
  RoomMember,
  CreateRoomRequest,
  JoinRoomRequest,
  LeaveRoomRequest,
  DeleteRoomRequest,
} from './room.entity'

@Injectable()
export class RoomService {
  private rooms: Map<string, Room> = new Map()

  constructor() {
    // 初始化时创建本周五、六、日的房间
    this.initializeWeeklyRooms()
  }

  /**
   * 初始化本周五、六、日的房间
   */
  private initializeWeeklyRooms() {
    const today = new Date()
    const dayOfWeek = today.getDay() // 0=周日, 1=周一... 6=周六
    
    // 计算本周五、六、日的日期
    const daysUntilFriday = (5 - dayOfWeek + 7) % 7 || 7
    const friday = new Date(today)
    friday.setDate(today.getDate() + daysUntilFriday)
    
    const saturday = new Date(friday)
    saturday.setDate(friday.getDate() + 1)
    
    const sunday = new Date(friday)
    sunday.setDate(friday.getDate() + 2)

    // 格式化日期为 YYYY-MM-DD
    const formatDate = (date: Date) => {
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
    }

    // 固定时间 14:00-18:00
    const defaultStartTime = '14:00'
    const defaultEndTime = '18:00'

    // 创建周五房间（如果没有）
    const fridayId = `weekday_fri_${formatDate(friday)}`
    if (!this.rooms.has(fridayId)) {
      this.rooms.set(fridayId, {
        id: fridayId,
        location: '棋牌室A',
        startTime: `${formatDate(friday)} ${defaultStartTime}`,
        endTime: `${formatDate(friday)} ${defaultEndTime}`,
        creatorName: '系统',
        creatorId: 'system',
        members: [],
        createdAt: Date.now(),
        isPermanent: true,
        weekDay: 5,
      })
    }

    // 创建周六房间（如果没有）
    const saturdayId = `weekday_sat_${formatDate(saturday)}`
    if (!this.rooms.has(saturdayId)) {
      this.rooms.set(saturdayId, {
        id: saturdayId,
        location: '棋牌室B',
        startTime: `${formatDate(saturday)} ${defaultStartTime}`,
        endTime: `${formatDate(saturday)} ${defaultEndTime}`,
        creatorName: '系统',
        creatorId: 'system',
        members: [],
        createdAt: Date.now(),
        isPermanent: true,
        weekDay: 6,
      })
    }

    // 创建周日房间（如果没有）
    const sundayId = `weekday_sun_${formatDate(sunday)}`
    if (!this.rooms.has(sundayId)) {
      this.rooms.set(sundayId, {
        id: sundayId,
        location: '棋牌室C',
        startTime: `${formatDate(sunday)} ${defaultStartTime}`,
        endTime: `${formatDate(sunday)} ${defaultEndTime}`,
        creatorName: '系统',
        creatorId: 'system',
        members: [],
        createdAt: Date.now(),
        isPermanent: true,
        weekDay: 0,
      })
    }
  }

  /**
   * 生成6位随机房间号
   */
  private generateRoomCode(): string {
    return Math.random().toString(36).substring(2, 8).toUpperCase()
  }

  /**
   * 获取所有房间列表
   */
  getAllRooms(): Room[] {
    return Array.from(this.rooms.values()).sort((a, b) => {
      // 系统房间优先，按周五、六、日排序
      if (a.isPermanent && b.isPermanent) {
        return (a.weekDay || 0) - (b.weekDay || 0)
      }
      // 系统房间在前
      if (a.isPermanent) return -1
      if (b.isPermanent) return 1
      // 其他房间按创建时间倒序
      return b.createdAt - a.createdAt
    })
  }

  /**
   * 根据ID获取房间
   */
  getRoomById(id: string): Room | undefined {
    return this.rooms.get(id)
  }

  /**
   * 创建新房间
   */
  createRoom(request: CreateRoomRequest): Room {
    let roomCode = this.generateRoomCode()
    // 确保房间号唯一
    while (this.rooms.has(roomCode)) {
      roomCode = this.generateRoomCode()
    }

    const room: Room = {
      id: roomCode,
      location: request.location,
      startTime: request.startTime,
      endTime: request.endTime,
      creatorName: request.creatorName,
      creatorId: request.creatorId,
      members: [{
        id: request.creatorId,
        name: request.creatorName,
        joinedAt: Date.now(),
      }],
      createdAt: Date.now(),
      isPermanent: false,
    }

    this.rooms.set(roomCode, room)
    return room
  }

  /**
   * 加入房间
   */
  joinRoom(request: JoinRoomRequest): { success: boolean; room?: Room; message: string } {
    const room = this.rooms.get(request.roomId)
    
    if (!room) {
      return { success: false, message: '房间不存在' }
    }

    if (room.members.length >= 4) {
      return { success: false, message: '房间人数已满' }
    }

    // 检查是否已加入
    const existingMember = room.members.find(m => m.id === request.memberId)
    if (existingMember) {
      return { success: true, room, message: '你已经在房间里了' }
    }

    // 添加成员
    const member: RoomMember = {
      id: request.memberId,
      name: request.memberName,
      joinedAt: Date.now(),
    }
    room.members.push(member)

    return { success: true, room, message: '加入成功' }
  }

  /**
   * 退出房间
   */
  leaveRoom(request: LeaveRoomRequest): { success: boolean; message: string } {
    const room = this.rooms.get(request.roomId)
    
    if (!room) {
      return { success: false, message: '房间不存在' }
    }

    // 检查是否是房主
    if (room.creatorId === request.memberId) {
      return { success: false, message: '房主不能退出房间' }
    }

    const memberIndex = room.members.findIndex(m => m.id === request.memberId)
    if (memberIndex === -1) {
      return { success: false, message: '你不在这个房间' }
    }

    room.members.splice(memberIndex, 1)
    return { success: true, message: '已退出房间' }
  }

  /**
   * 删除房间
   */
  deleteRoom(request: DeleteRoomRequest): { success: boolean; message: string } {
    const room = this.rooms.get(request.roomId)
    
    if (!room) {
      return { success: false, message: '房间不存在' }
    }

    // 只有房主可以删除
    if (room.creatorId !== request.creatorId) {
      return { success: false, message: '只有房主可以删除房间' }
    }

    // 系统房间不能删除
    if (room.isPermanent) {
      return { success: false, message: '系统房间不能删除' }
    }

    this.rooms.delete(request.roomId)
    return { success: true, message: '房间已删除' }
  }

  /**
   * 移除成员（房主操作）
   */
  removeMember(roomId: string, memberId: string, operatorId: string): { success: boolean; message: string } {
    const room = this.rooms.get(roomId)
    
    if (!room) {
      return { success: false, message: '房间不存在' }
    }

    // 只有房主可以移除成员
    if (room.creatorId !== operatorId) {
      return { success: false, message: '只有房主可以移除成员' }
    }

    const memberIndex = room.members.findIndex(m => m.id === memberId)
    if (memberIndex === -1) {
      return { success: false, message: '该成员不在房间里' }
    }

    room.members.splice(memberIndex, 1)
    return { success: true, message: '已移除该成员' }
  }
}
