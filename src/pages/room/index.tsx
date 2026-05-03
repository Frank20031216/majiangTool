import { useEffect, useState, useCallback } from 'react'
import Taro from '@tarojs/taro'
import { View, Text } from '@tarojs/components'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { ArrowLeft, MapPin, Clock, Users, Copy, Check, X } from 'lucide-react-taro'
import { getRoom, joinRoom, hasUserJoined, generateInviteLink, formatTime, getUserId } from '@/lib/storage'

interface RoomData {
  id: string
  location: string
  startTime: string
  endTime?: string
  members: { id: string; name: string; joinedAt: number }[]
}

export default function RoomDetail() {
  const [room, setRoom] = useState<RoomData | null>(null)
  const [roomId, setRoomId] = useState('')
  const [hasJoined, setHasJoined] = useState(false)
  const [isCreator, setIsCreator] = useState(false)
  const [copied, setCopied] = useState(false)
  const [showJoinConfirm, setShowJoinConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  
  useEffect(() => {
    const params = (Taro.getCurrentInstance().router?.params || {}) as { id?: string }
    const id = params.id
    
    if (!id) {
      Taro.showToast({ title: '房间不存在', icon: 'none' })
      setTimeout(() => Taro.navigateBack(), 1500)
      return
    }
    
    setRoomId(id)
    loadRoom(id)
  }, [])
  
  const loadRoom = useCallback((id: string) => {
    const roomData = getRoom(id)
    
    if (!roomData) {
      Taro.showToast({ title: '房间不存在', icon: 'none' })
      setTimeout(() => Taro.navigateBack(), 1500)
      return
    }
    
    setRoom(roomData)
    setHasJoined(hasUserJoined(id))
    setIsCreator(roomData.creatorId === getUserId())
  }, [])
  
  const handleCopyLink = () => {
    const link = generateInviteLink(roomId)
    Taro.setClipboardData({
      data: link,
      success: () => {
        setCopied(true)
        Taro.showToast({ title: '链接已复制', icon: 'success' })
        setTimeout(() => setCopied(false), 2000)
      }
    })
  }
  
  const handleJoin = () => {
    setShowJoinConfirm(true)
  }
  
  const confirmJoin = () => {
    setLoading(true)
    setShowJoinConfirm(false)
    
    const success = joinRoom(roomId, '牌友')
    
    if (success) {
      Taro.showToast({ title: '加入成功', icon: 'success' })
      setHasJoined(true)
      // 刷新数据
      setTimeout(() => loadRoom(roomId), 500)
    } else {
      Taro.showToast({ title: '加入失败', icon: 'none' })
    }
    
    setLoading(false)
  }
  
  const handleDecline = () => {
    Taro.navigateBack()
  }
  
  const handleBack = () => {
    Taro.navigateBack()
  }
  
  const handleRefresh = () => {
    loadRoom(roomId)
  }
  
  if (!room) {
    return (
      <View className="min-h-screen bg-stone-50 flex items-center justify-center">
        <Text className="text-gray-500">加载中...</Text>
      </View>
    )
  }
  
  const isFull = room.members.length >= 4
  
  // 满员且未加入，跳转满员提示页
  if (isFull && !hasJoined && !isCreator) {
    Taro.redirectTo({ url: `/pages/room/full?id=${roomId}` })
    return null
  }
  
  return (
    <View className="min-h-screen bg-stone-50 flex flex-col">
      {/* 顶部 */}
      <View className="bg-gradient-to-b from-red-800 to-red-700 pt-8 pb-6 px-4">
        <View className="flex items-center justify-between">
          <View onClick={handleBack} className="p-2 -ml-2">
            <ArrowLeft size={24} color="white" />
          </View>
          <Text className="text-white text-lg font-medium">房间详情</Text>
          <View onClick={handleRefresh} className="p-2">
            <Text className="text-white text-xs">刷新</Text>
          </View>
        </View>
        
        {/* 房间号 */}
        <View className="text-center mt-3">
          <Text className="block text-amber-400 text-sm">房间号</Text>
          <Text className="block text-white text-3xl font-bold tracking-widest">{room.id}</Text>
        </View>
      </View>
      
      <View className="flex-1 px-4 py-5">
        {/* 房间信息卡片 */}
        <Card className="shadow-md border-0 mb-4">
          <CardContent className="p-5">
            {/* 地点 */}
            <View className="flex items-start mb-4">
              <View className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center mr-3">
                <MapPin size={20} color="#B91C1C" />
              </View>
              <View className="flex-1">
                <Text className="block text-gray-500 text-xs mb-1">约局地点</Text>
                <Text className="block text-gray-800 text-lg font-semibold">{room.location}</Text>
              </View>
            </View>
            
            {/* 时间 */}
            <View className="flex items-start mb-4">
              <View className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center mr-3">
                <Clock size={20} color="#D4AF37" />
              </View>
              <View className="flex-1">
                <Text className="block text-gray-500 text-xs mb-1">开始时间</Text>
                <Text className="block text-gray-800 font-medium">{formatTime(room.startTime)}</Text>
                {room.endTime && (
                  <Text className="block text-gray-500 text-sm mt-1">至 {formatTime(room.endTime)}</Text>
                )}
              </View>
            </View>
            
            {/* 人数 */}
            <View className="flex items-start">
              <View className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center mr-3">
                <Users size={20} color="#059669" />
              </View>
              <View className="flex-1">
                <Text className="block text-gray-500 text-xs mb-1">当前人数</Text>
                <View className="flex items-center gap-2">
                  <Text className="block text-gray-800 font-semibold text-lg">
                    {room.members.length}/4
                  </Text>
                  {isFull ? (
                    <Badge variant="destructive" className="rounded-full">已满员</Badge>
                  ) : (
                    <Badge variant="secondary" className="bg-green-50 text-green-700 rounded-full">
                      可加入
                    </Badge>
                  )}
                </View>
              </View>
            </View>
          </CardContent>
        </Card>
        
        {/* 成员列表 */}
        <Card className="shadow-md border-0 mb-4">
          <CardContent className="p-5">
            <Text className="block text-gray-700 font-semibold mb-4">已加入成员</Text>
            
            <View className="space-y-3">
              {room.members.map((member, index) => (
                <View key={member.id} className="flex items-center">
                  <Avatar className="w-10 h-10 bg-red-100 mr-3">
                    <AvatarFallback className="bg-red-100 text-red-700 font-semibold">
                      {member.name.slice(0, 1)}
                    </AvatarFallback>
                  </Avatar>
                  <View className="flex-1">
                    <View className="flex items-center gap-2">
                      <Text className="block text-gray-800 font-medium">{member.name}</Text>
                      {member.id === room.members[0].id && (
                        <Badge variant="outline" className="text-amber-600 border-amber-300 rounded-full text-xs">
                          房主
                        </Badge>
                      )}
                    </View>
                    <Text className="block text-gray-400 text-xs">
                      {new Date(member.joinedAt).toLocaleString('zh-CN', {
                        month: 'numeric',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })} 加入
                    </Text>
                  </View>
                  {index < room.members.length - 1 && (
                    <View className="absolute bottom-0 left-14 right-4">
                      <View className="border-b border-gray-100" />
                    </View>
                  )}
                </View>
              ))}
            </View>
          </CardContent>
        </Card>
        
        {/* 邀约链接 */}
        <Card className="shadow-md border-0 mb-5">
          <CardContent className="p-4">
            <View className="flex items-center justify-between">
              <View className="flex-1">
                <Text className="block text-gray-500 text-xs mb-1">邀约链接</Text>
                <Text className="block text-gray-700 text-sm truncate">
                  {generateInviteLink(roomId)}
                </Text>
              </View>
              <Button 
                variant="ghost" 
                size="sm" 
                className="ml-3"
                onClick={handleCopyLink}
              >
                {copied ? <Check size={18} color="#059669" /> : <Copy size={18} color="#6B7280" />}
              </Button>
            </View>
          </CardContent>
        </Card>
        
        {/* 操作按钮 */}
        {(!hasJoined && !isCreator) ? (
          <View className="flex gap-3">
            <View className="flex-1">
              <Button 
                variant="outline"
                className="w-full border-gray-300 text-gray-600 hover:bg-gray-50 rounded-xl h-12"
                onClick={handleDecline}
              >
                <View className="flex items-center">
                  <X size={18} color="#6B7280" />
                  <Text>拒绝加入</Text>
                </View>
              </Button>
            </View>
            <View className="flex-1">
              <Button 
                className="w-full bg-red-700 hover:bg-red-800 text-white rounded-xl h-12"
                onClick={handleJoin}
                disabled={isFull}
              >
                <Text className="text-white">加入约局</Text>
              </Button>
            </View>
          </View>
        ) : (
          <View className="bg-green-50 rounded-xl p-4 text-center">
            <Text className="block text-green-700 font-medium">
              {isCreator ? '您是此房间的房主' : '您已成功加入此房间'}
            </Text>
          </View>
        )}
      </View>
      
      {/* 加入确认弹窗 */}
      {showJoinConfirm && (
        <View className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
          <View className="bg-white rounded-2xl p-6 w-full max-w-sm">
            <Text className="block text-gray-800 text-lg font-semibold text-center mb-2">
              确认加入
            </Text>
            <Text className="block text-gray-500 text-sm text-center mb-6">
              确定要加入「{room.location}」的约局吗？
            </Text>
            <View className="flex gap-3">
              <View className="flex-1">
                <Button 
                  variant="outline"
                  className="w-full border-gray-300 rounded-xl h-11"
                  onClick={() => setShowJoinConfirm(false)}
                >
                  <Text>取消</Text>
                </Button>
              </View>
              <View className="flex-1">
                <Button 
                  className="w-full bg-red-700 rounded-xl h-11"
                  onClick={confirmJoin}
                  disabled={loading}
                >
                  <Text className="text-white">{loading ? '加入中...' : '确认'}</Text>
                </Button>
              </View>
            </View>
          </View>
        </View>
      )}
    </View>
  )
}
