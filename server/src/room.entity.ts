export interface Room {
  id: string
  location: string
  startTime: string
  endTime?: string
  creatorName: string
  creatorId: string
  members: RoomMember[]
  createdAt: number
  isPermanent: boolean // 是否是系统自动创建的固定房间
  weekDay?: number // 0=周日, 1=周一... 6=周六
}

export interface RoomMember {
  id: string
  name: string
  joinedAt: number
}

export interface CreateRoomRequest {
  location: string
  startTime: string
  endTime?: string
  creatorName: string
  creatorId: string
}

export interface JoinRoomRequest {
  roomId: string
  memberId: string
  memberName: string
}

export interface LeaveRoomRequest {
  roomId: string
  memberId: string
}

export interface DeleteRoomRequest {
  roomId: string
  creatorId: string
}
