// 麻将约局应用 - API 请求模块
import Taro from '@tarojs/taro'
import { Network } from '@/network'

// API 基础URL（仅用于相对路径，Network会自动处理）
const API_BASE = '/api'

// 类型定义
export interface Room {
  id: string
  location: string
  startTime: string
  endTime?: string
  creatorName: string
  creatorId: string
  members: Member[]
  createdAt: number
  isPermanent?: boolean
  weekDay?: number
}

export interface Member {
  id: string
  name: string
  joinedAt: number
}

export interface UserInfo {
  id: string
  nickname: string
  avatar?: string
}

export interface UserRecord {
  roomId: string
  memberId: string
  joinedAt: number
}

// 存储键名
const STORAGE_KEYS = {
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
  let userId = Taro.getStorageSync(STORAGE_KEYS.USER_ID)
  if (!userId) {
    userId = generateId(8)
    Taro.setStorageSync(STORAGE_KEYS.USER_ID, userId)
  }
  return userId
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

// 检查用户是否已登录
export function isLoggedIn(): boolean {
  return !!getUserInfo()
}

// 退出登录（清除用户信息，保留用户ID用于追踪）
export function logout(): void {
  Taro.removeStorageSync(STORAGE_KEYS.USER_INFO)
}

// ==================== API 请求 ====================

/**
 * 获取所有房间列表
 */
export async function fetchAllRooms(): Promise<Room[]> {
  try {
    const res = await Network.request({
      url: `${API_BASE}/rooms`,
      method: 'GET'
    })
    console.log('[API] GET /rooms', res.data)
    return res.data || []
  } catch (error) {
    console.error('[API] 获取房间列表失败', error)
    return []
  }
}

/**
 * 获取单个房间详情
 */
export async function fetchRoom(roomId: string): Promise<Room | null> {
  try {
    const res = await Network.request({
      url: `${API_BASE}/rooms/${roomId}`,
      method: 'GET'
    })
    if (res.data?.error) {
      console.error('[API] 房间不存在', roomId)
      return null
    }
    console.log('[API] GET /rooms/:id', res.data)
    return res.data
  } catch (error) {
    console.error('[API] 获取房间详情失败', error)
    return null
  }
}

/**
 * 创建新房间
 */
export async function apiCreateRoom(
  location: string,
  startTime: string,
  endTime?: string
): Promise<Room | null> {
  try {
    const userId = getUserId()
    const userInfo = getUserInfo()
    
    const res = await Network.request({
      url: `${API_BASE}/rooms`,
      method: 'POST',
      data: {
        location,
        startTime,
        endTime,
        creatorName: userInfo?.nickname || '匿名',
        creatorId: userId
      }
    })
    console.log('[API] POST /rooms', res.data)
    return res.data
  } catch (error) {
    console.error('[API] 创建房间失败', error)
    return null
  }
}

/**
 * 加入房间
 */
export async function apiJoinRoom(roomId: string): Promise<{ success: boolean; room?: Room; message: string }> {
  try {
    const userId = getUserId()
    const userInfo = getUserInfo()
    
    const res = await Network.request({
      url: `${API_BASE}/rooms/join`,
      method: 'POST',
      data: {
        roomId,
        memberId: userId,
        memberName: userInfo?.nickname || '匿名'
      }
    })
    console.log('[API] POST /rooms/join', res.data)
    return res.data || { success: false, message: '加入失败' }
  } catch (error) {
    console.error('[API] 加入房间失败', error)
    return { success: false, message: '网络错误' }
  }
}

/**
 * 退出房间
 */
export async function apiLeaveRoom(roomId: string): Promise<{ success: boolean; message: string }> {
  try {
    const userId = getUserId()
    
    const res = await Network.request({
      url: `${API_BASE}/rooms/leave`,
      method: 'POST',
      data: {
        roomId,
        memberId: userId
      }
    })
    console.log('[API] POST /rooms/leave', res.data)
    return res.data || { success: false, message: '退出失败' }
  } catch (error) {
    console.error('[API] 退出房间失败', error)
    return { success: false, message: '网络错误' }
  }
}

/**
 * 删除房间（房主操作）
 */
export async function apiDeleteRoom(roomId: string): Promise<{ success: boolean; message: string }> {
  try {
    const userId = getUserId()
    
    const res = await Network.request({
      url: `${API_BASE}/rooms/${roomId}`,
      method: 'DELETE',
      data: { creatorId: userId }
    })
    console.log('[API] DELETE /rooms/:id', res.data)
    return res.data || { success: false, message: '删除失败' }
  } catch (error) {
    console.error('[API] 删除房间失败', error)
    return { success: false, message: '网络错误' }
  }
}

/**
 * 移除成员（房主操作）
 */
export async function apiRemoveMember(roomId: string, memberId: string): Promise<{ success: boolean; message: string }> {
  try {
    const userId = getUserId()
    
    const res = await Network.request({
      url: `${API_BASE}/rooms/remove-member`,
      method: 'POST',
      data: { roomId, memberId, operatorId: userId }
    })
    console.log('[API] POST /rooms/remove-member', res.data)
    return res.data || { success: false, message: '移除失败' }
  } catch (error) {
    console.error('[API] 移除成员失败', error)
    return { success: false, message: '网络错误' }
  }
}

/**
 * 检查用户是否已加入某房间
 */
export function hasUserJoined(room: Room): boolean {
  const userId = getUserId()
  return room.members.some(m => m.id === userId)
}

/**
 * 检查用户是否是房主
 */
export function isRoomCreator(room: Room): boolean {
  const userId = getUserId()
  return room.creatorId === userId
}

/**
 * 获取用户在房间中的信息
 */
export function getMemberInfo(room: Room): Member | undefined {
  const userId = getUserId()
  return room.members.find(m => m.id === userId)
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

// 生成邀请链接（小程序页面路径）
export function generateInviteLink(roomId: string): string {
  return `/pages/room/index?id=${roomId}`
}
