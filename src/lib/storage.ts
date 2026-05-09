// 麻将约局应用类型定义
import Taro from '@tarojs/taro'

export interface Room {
  id: string
  location: string
  start_time: string
  end_time?: string
  creator_id: string
  creator_name: string
  members: Member[]
  created_at: string
}

export interface Member {
  id: string
  name: string
  joined_at: number
}

export interface UserRecord {
  room_id: string
  memberId: string
  joined_at: number
}

export interface UserInfo {
  id: string
  nickname: string
  avatar?: string
}

// 存储键名
const STORAGE_KEYS = {
  ROOMS: 'mahjong_rooms',
  USER_RECORDS: 'mahjong_user_records',
  USER_ID: 'mahjong_user_id',
  USER_INFO: 'mahjong_user_info'
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
  let user_id = Taro.getStorageSync(STORAGE_KEYS.USER_ID)
  if (!user_id) {
    user_id = generateId(8)
    Taro.setStorageSync(STORAGE_KEYS.USER_ID, user_id)
  }
  return user_id
}

// 获取用户信息
export function getUserInfo(): UserInfo | null {
  const data = Taro.getStorageSync(STORAGE_KEYS.USER_INFO)
  return data ? JSON.parse(data) : null
}

// 保存用户信息
export function saveUserInfo(info: UserInfo): void {
  Taro.setStorageSync(STORAGE_KEYS.USER_INFO, JSON.stringify(info))
}

// 获取所有房间
export function getAllRooms(): Room[] {
  const data = Taro.getStorageSync(STORAGE_KEYS.ROOMS)
  return data ? JSON.parse(data) : []
}

// 保存房间
export function saveRooms(rooms: Room[]): void {
  Taro.setStorageSync(STORAGE_KEYS.ROOMS, JSON.stringify(rooms))
}

// 创建房间
export function createRoom(location: string, start_time: string, end_time?: string): Room {
  const user_id = getUserId()
  const userInfo = getUserInfo()
  
  const room: Room = {
    id: generateId(),
    location,
    start_time,
    end_time,
    creator_id: user_id,
    creator_name: userInfo?.nickname || '房主',
    members: [{
      id: user_id,
      name: userInfo?.nickname || '房主',
      joined_at: Date.now()
    }],
    created_at: new Date().toISOString()
  }
  
  const rooms = getAllRooms()
  rooms.push(room)
  saveRooms(rooms)
  
  // 记录用户加入
  recordUserJoin(room.id, user_id)
  
  return room
}

// 获取单个房间
export function getRoom(room_id: string): Room | undefined {
  const rooms = getAllRooms()
  return rooms.find(r => r.id === room_id)
}

// 加入房间
export function joinRoom(room_id: string, memberName: string): boolean {
  const rooms = getAllRooms()
  const room = rooms.find(r => r.id === room_id)
  
  if (!room) return false
  if (room.members.length >= 4) return false
  
  const user_id = getUserId()
  
  // 检查是否已加入
  if (room.members.some(m => m.id === user_id)) return true
  
  room.members.push({
    id: user_id,
    name: memberName,
    joined_at: Date.now()
  })
  
  saveRooms(rooms)
  recordUserJoin(room_id, user_id)
  
  return true
}

// 检查用户是否已加入某房间
export function hasUserJoined(room_id: string): boolean {
  const user_id = getUserId()
  const records = getUserRecords()
  return records.some(r => r.room_id === room_id && r.memberId === user_id)
}

// 获取用户已加入的房间
export function getUserRooms(): Room[] {
  const user_id = getUserId()
  const rooms = getAllRooms()
  return rooms.filter(r => r.members.some(m => m.id === user_id))
}

// 记录用户加入
function recordUserJoin(room_id: string, memberId: string): void {
  const records = getUserRecords()
  if (!records.some(r => r.room_id === room_id && r.memberId === memberId)) {
    records.push({
      room_id,
      memberId,
      joined_at: Date.now()
    })
    Taro.setStorageSync(STORAGE_KEYS.USER_RECORDS, JSON.stringify(records))
  }
}

// 获取用户记录
function getUserRecords(): UserRecord[] {
  const data = Taro.getStorageSync(STORAGE_KEYS.USER_RECORDS)
  return data ? JSON.parse(data) : []
}

// 生成邀请链接（小程序页面路径）
export function generateInviteLink(room_id: string): string {
  return `/pages/room/index?id=${room_id}`
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

// 删除房间（房主操作）
export function deleteRoom(room_id: string): boolean {
  const user_id = getUserId()
  const rooms = getAllRooms()
  const room = rooms.find(r => r.id === room_id)
  
  // 只有房主才能删除
  if (!room || room.creator_id !== user_id) return false
  
  const filteredRooms = rooms.filter(r => r.id !== room_id)
  saveRooms(filteredRooms)
  
  // 清除用户的加入记录
  const records = getUserRecords()
  const filteredRecords = records.filter(r => r.room_id !== room_id)
  Taro.setStorageSync(STORAGE_KEYS.USER_RECORDS, JSON.stringify(filteredRecords))
  
  return true
}

// 退出登录（清除用户信息，保留用户ID用于追踪）
export function logout(): void {
  Taro.removeStorageSync(STORAGE_KEYS.USER_INFO)
}

// 检查用户是否已登录
export function isLoggedIn(): boolean {
  return !!getUserInfo()
}

// 获取房间创建者名称
export function getCreatorName(room: Room): string {
  if (room.members.length > 0 && room.members[0].id === room.creator_id) {
    return room.members[0].name
  }
  const creator = room.members.find(m => m.id === room.creator_id)
  return creator?.name || '未知'
}
