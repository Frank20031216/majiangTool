import { useEffect, useState, useCallback } from 'react'
import Taro, { useRouter } from '@tarojs/taro'
import { View, Text } from '@tarojs/components'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { ArrowLeft, MapPin, Clock, Users, QrCode } from 'lucide-react-taro'
import {
  fetchRoom,
  apiJoinRoom,
  apiLeaveRoom,
  hasUserJoined,
  formatTime,
  getUserId,
  isRoomCreator,
  Room
} from '@/lib/storage'
import LinkModal from '@/components/link-modal'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from '@/components/ui/alert-dialog'

export default function RoomDetail() {
  const router = useRouter()
  const [room, setRoom] = useState<Room | null>(null)
  const [roomId, setRoomId] = useState('')
  const [hasJoined, setHasJoined] = useState(false)
  const [isCreator, setIsCreator] = useState(false)
  const [showJoinConfirm, setShowJoinConfirm] = useState(false)
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showQRModal, setShowQRModal] = useState(false)
  
  useEffect(() => {
    // 从路由参数获取房间ID
    const id = router.params.id || router.params.roomId
    
    console.log('Room page params:', router.params)
    
    if (!id) {
      setError('房间ID不存在')
      return
    }
    
    setRoomId(id)
    loadRoom(id)
  }, [])
  
  const loadRoom = useCallback(async (id: string) => {
    console.log('Loading room:', id)
    setLoading(true)
    
    try {
      const roomData = await fetchRoom(id)
      
      if (!roomData) {
        setError('房间不存在或已失效')
        return
      }
      
      setRoom(roomData)
      setHasJoined(hasUserJoined(roomData))
      setIsCreator(isRoomCreator(roomData))
      setError('')
    } catch (e) {
      console.error('Load room error:', e)
      setError('加载失败，请重试')
    } finally {
      setLoading(false)
    }
  }, [])
  
  const handleJoin = () => {
    setShowJoinConfirm(true)
  }
  
  const confirmJoin = async () => {
    setLoading(true)
    setShowJoinConfirm(false)
    
    try {
      const result = await apiJoinRoom(roomId)
      
      if (result.success) {
        Taro.showToast({ title: '加入成功', icon: 'success' })
        setHasJoined(true)
        // 刷新数据
        await loadRoom(roomId)
      } else {
        Taro.showToast({ title: result.message, icon: 'none' })
      }
    } catch (e) {
      Taro.showToast({ title: '加入失败', icon: 'none' })
    }
    
    setLoading(false)
  }
  
  const handleLeave = () => {
    setShowLeaveConfirm(true)
  }
  
  const confirmLeave = async () => {
    setLoading(true)
    setShowLeaveConfirm(false)
    
    try {
      const result = await apiLeaveRoom(roomId)
      
      if (result.success) {
        Taro.showToast({ title: '已退出房间', icon: 'success' })
        setHasJoined(false)
        // 刷新数据
        await loadRoom(roomId)
      } else {
        Taro.showToast({ title: result.message, icon: 'none' })
      }
    } catch (e) {
      Taro.showToast({ title: '退出失败', icon: 'none' })
    }
    
    setLoading(false)
  }
  
  const handleBack = () => {
    Taro.navigateBack()
  }
  
  // 错误状态
  if (error) {
    return (
      <View className="min-h-screen bg-stone-50 flex flex-col">
        <View className="bg-gradient-to-b from-red-800 to-red-700 pt-8 pb-6 px-4">
          <View className="flex items-center">
            <View onClick={handleBack} className="p-2 -ml-2">
              <ArrowLeft size={24} color="white" />
            </View>
            <Text className="text-white text-lg font-medium ml-2">房间详情</Text>
          </View>
        </View>
        
        <View className="flex-1 flex items-center justify-center px-4">
          <View className="text-center">
            <Text className="block text-gray-500 text-lg mb-2">{error}</Text>
            <Button onClick={handleBack} variant="outline" className="border-red-200 text-red-700 rounded-xl">
              <Text className="text-red-700">返回首页</Text>
            </Button>
          </View>
        </View>
      </View>
    )
  }
  
  // 加载状态
  if (loading && !room) {
    return (
      <View className="min-h-screen bg-stone-50 flex flex-col">
        <View className="bg-gradient-to-b from-red-800 to-red-700 pt-8 pb-6 px-4">
          <View className="flex items-center">
            <View onClick={handleBack} className="p-2 -ml-2">
              <ArrowLeft size={24} color="white" />
            </View>
            <Text className="text-white text-lg font-medium ml-2">房间详情</Text>
          </View>
        </View>
        
        <View className="flex-1 flex items-center justify-center">
          <Text className="block text-gray-500">加载中...</Text>
        </View>
      </View>
    )
  }
  
  if (!room) return null
  
  const isFull = room.members.length >= 4
  
  return (
    <View className="min-h-screen bg-stone-50 flex flex-col">
      {/* 顶部装饰 */}
      <View className="bg-gradient-to-b from-red-800 to-red-700 pt-8 pb-6 px-4">
        <View className="flex items-center justify-between">
          <View onClick={handleBack} className="p-2 -ml-2">
            <ArrowLeft size={24} color="white" />
          </View>
          <Text className="text-white text-lg font-medium">房间详情</Text>
          <View className="p-2" onClick={() => setShowQRModal(true)}>
            <QrCode size={20} color="white" />
          </View>
        </View>
        
        {/* 房间号 */}
        <View className="text-center mt-4">
          <Badge variant="outline" className="bg-white bg-opacity-20 border-white border text-white rounded-full px-4 py-1">
            <Text className="text-white">#{room.id}</Text>
          </Badge>
        </View>
      </View>
      
      {/* 房间信息 */}
      <View className="flex-1 px-4 -mt-4">
        <Card className="shadow-md border-0 mb-4">
          <CardContent className="p-5">
            <View className="flex items-center gap-3 mb-4">
              <View className="w-14 h-14 bg-red-100 rounded-xl flex items-center justify-center">
                <MapPin size={24} color="#B91C1C" />
              </View>
              <View className="flex-1">
                <Text className="block text-gray-800 text-xl font-bold">{room.location}</Text>
                <View className="flex items-center gap-2 mt-1">
                  {isFull ? (
                    <Badge variant="destructive" className="rounded-full">
                      <Text className="text-xs">已满</Text>
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="bg-green-100 text-green-700 rounded-full">
                      <Text className="text-xs">可加入</Text>
                    </Badge>
                  )}
                  {room.isPermanent && (
                    <Badge variant="outline" className="border-blue-400 text-blue-600 rounded-full">
                      <Text className="text-xs">固定场</Text>
                    </Badge>
                  )}
                </View>
              </View>
            </View>
            
            <View className="space-y-3">
              <View className="flex items-center">
                <Clock size={16} color="#9CA3AF" />
                <Text className="block text-gray-600 ml-2">
                  {formatTime(room.startTime)}
                  {room.endTime && ` - ${formatTime(room.endTime)}`}
                </Text>
              </View>
              <View className="flex items-center">
                <Users size={16} color="#9CA3AF" />
                <Text className="block text-gray-600 ml-2">
                  {room.members.length}/4 人
                </Text>
              </View>
            </View>
          </CardContent>
        </Card>
        
        {/* 成员列表 */}
        <Card className="shadow-md border-0 mb-4">
          <CardContent className="p-5">
            <Text className="block text-gray-700 font-semibold mb-4">已加入成员</Text>
            
            <View className="space-y-3">
              {room.members.map((member) => (
                <View key={member.id} className="flex items-center">
                  <Avatar className="w-10 h-10 mr-3">
                    <AvatarFallback className="bg-red-100 text-red-700">
                      {member.name.slice(0, 1)}
                    </AvatarFallback>
                  </Avatar>
                  <View className="flex-1">
                    <View className="flex items-center gap-2">
                      <Text className="block text-gray-800 font-medium">{member.name}</Text>
                      {member.id === room.creatorId && (
                        <Badge variant="outline" className="border-amber-400 text-amber-600 rounded-full text-xs">
                          房主
                        </Badge>
                      )}
                      {member.id === getUserId() && (
                        <Badge variant="secondary" className="bg-gray-100 text-gray-600 rounded-full text-xs">
                          我
                        </Badge>
                      )}
                    </View>
                  </View>
                </View>
              ))}
              
              {room.members.length === 0 && (
                <View className="text-center py-4">
                  <Text className="block text-gray-400 text-sm">暂无成员</Text>
                </View>
              )}
              
              {/* 空位提示 */}
              {room.members.length < 4 && (
                <View className="flex items-center py-2 text-gray-400">
                  <View className="flex-1 border-t border-dashed border-gray-200" />
                  <Text className="px-3 text-xs">还剩 {4 - room.members.length} 个位置</Text>
                  <View className="flex-1 border-t border-dashed border-gray-200" />
                </View>
              )}
            </View>
          </CardContent>
        </Card>
        
        {/* 操作按钮 */}
        <View className="pb-6">
          {!hasJoined ? (
            <Button 
              className="w-full bg-red-700 hover:bg-red-800 text-white rounded-xl h-12 text-base"
              onClick={handleJoin}
              disabled={isFull}
            >
              <Text className="text-white">{isFull ? '房间已满' : '加入约局'}</Text>
            </Button>
          ) : !isCreator ? (
            <Button 
              variant="outline"
              className="w-full border-gray-300 text-gray-600 rounded-xl h-12 text-base"
              onClick={handleLeave}
            >
              <Text>退出房间</Text>
            </Button>
          ) : (
            <View className="text-center">
              <Text className="block text-gray-500 text-sm">你是房主，无法退出房间</Text>
            </View>
          )}
        </View>
      </View>
      
      {/* 加入确认弹窗 */}
      <AlertDialog open={showJoinConfirm} onOpenChange={setShowJoinConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认加入</AlertDialogTitle>
            <AlertDialogDescription>
              确定要加入这个约局吗？加入后可随时退出。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowJoinConfirm(false)}>
              <Text>取消</Text>
            </AlertDialogCancel>
            <AlertDialogAction onClick={confirmJoin}>
              <Text>确定加入</Text>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* 退出确认弹窗 */}
      <AlertDialog open={showLeaveConfirm} onOpenChange={setShowLeaveConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>退出房间</AlertDialogTitle>
            <AlertDialogDescription>
              确定要退出这个房间吗？退出后仍可通过链接重新加入。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowLeaveConfirm(false)}>
              <Text>取消</Text>
            </AlertDialogCancel>
            <AlertDialogAction onClick={confirmLeave}>
              <Text>确定退出</Text>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* 邀请链接弹窗 */}
      <LinkModal
        show={showQRModal}
        roomId={room.id}
        roomName={room.location}
        onClose={() => setShowQRModal(false)}
      />
    </View>
  )
}
