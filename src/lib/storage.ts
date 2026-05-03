// 麻将约局应用类型定义
export interface Room {
  id: string
  location: string
  startTime: string
  endTime?: string
  creatorId: string
  members: Member[]
  createdAt: number
}

export interface Member {
  id: string
  name: string
  joinedAt: number
}

export interface UserRecord {
  roomId: string
  memberId: string
  joinedAt: number
}

// 存储键名
const STORAGE_KEYS = {
  ROOMS: 'mahjong_rooms',
  USER_RECORDS: 'mahjong_user_records',
  USER_ID: 'mahjong_user_id'
}

// 生成唯一ID
export function generateId(length = 6): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

// 获取用户ID（首次访问时生成）
export function getUserId(): string {
  let userId = localStorage.getItem(STORAGE_KEYS.USER_ID)
  if (!userId) {
    userId = generateId(8)
    localStorage.setItem(STORAGE_KEYS.USER_ID, userId)
  }
  return userId
}

// 获取所有房间
export function getRooms(): Room[] {
  const data = localStorage.getItem(STORAGE_KEYS.ROOMS)
  return data ? JSON.parse(data) : []
}

// 保存房间
export function saveRooms(rooms: Room[]): void {
  localStorage.setItem(STORAGE_KEYS.ROOMS, JSON.stringify(rooms))
}

// 创建房间
export function createRoom(location: string, startTime: string, endTime?: string): Room {
  const userId = getUserId()
  const room: Room = {
    id: generateId(),
    location,
    startTime,
    endTime,
    creatorId: userId,
    members: [{
      id: userId,
      name: '房主',
      joinedAt: Date.now()
    }],
    createdAt: Date.now()
  }
  
  const rooms = getRooms()
  rooms.push(room)
  saveRooms(rooms)
  
  // 记录用户加入
  recordUserJoin(room.id, userId)
  
  return room
}

// 获取单个房间
export function getRoom(roomId: string): Room | undefined {
  const rooms = getRooms()
  return rooms.find(r => r.id === roomId)
}

// 加入房间
export function joinRoom(roomId: string, memberName: string): boolean {
  const rooms = getRooms()
  const room = rooms.find(r => r.id === roomId)
  
  if (!room) return false
  if (room.members.length >= 4) return false
  
  const userId = getUserId()
  
  // 检查是否已加入
  if (room.members.some(m => m.id === userId)) return true
  
  room.members.push({
    id: userId,
    name: memberName || '牌友',
    joinedAt: Date.now()
  })
  
  saveRooms(rooms)
  recordUserJoin(roomId, userId)
  
  return true
}

// 检查用户是否已加入某房间
export function hasUserJoined(roomId: string): boolean {
  const userId = getUserId()
  const records = getUserRecords()
  return records.some(r => r.roomId === roomId && r.memberId === userId)
}

// 获取用户已加入的房间
export function getUserRooms(): Room[] {
  const userId = getUserId()
  const rooms = getRooms()
  return rooms.filter(r => r.members.some(m => m.id === userId))
}

// 记录用户加入
function recordUserJoin(roomId: string, memberId: string): void {
  const records = getUserRecords()
  if (!records.some(r => r.roomId === roomId && r.memberId === memberId)) {
    records.push({
      roomId,
      memberId,
      joinedAt: Date.now()
    })
    localStorage.setItem(STORAGE_KEYS.USER_RECORDS, JSON.stringify(records))
  }
}

// 获取用户记录
function getUserRecords(): UserRecord[] {
  const data = localStorage.getItem(STORAGE_KEYS.USER_RECORDS)
  return data ? JSON.parse(data) : []
}

// 生成邀请链接
export function generateInviteLink(roomId: string): string {
  const baseUrl = window.location.origin
  return `${baseUrl}/pages/room/index?id=${roomId}`
}

// 格式化时间
export function formatTime(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleString('zh-CN', {
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}
