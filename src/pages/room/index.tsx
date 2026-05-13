import { useEffect, useState, useCallback } from 'react'
import Taro, { useRouter, useShareAppMessage } from '@tarojs/taro'
import { View, Text, Button } from '@tarojs/components'
//import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { ArrowLeft, MapPin, Clock, Users, Share2 } from 'lucide-react-taro'
import { getUserId, formatTime } from '@/lib/storage'
import { Network } from '@/network'


interface Member {
  id: string
  name: string
  joined_at: string
}

interface RoomData {
  id: string
  location: string
  start_time: string
  end_time?: string
  creator_id: string
  creator_name: string
  members: Member[]
}

export default function RoomDetail() {
  const router = useRouter()
  const [room, setRoom] = useState<RoomData | null>(null)
  const [roomId, setRoomId] = useState('')
  const [hasJoined, setHasJoined] = useState(false)
  const [showJoinConfirm, setShowJoinConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  // 获取本地用户信息（从 auth.ts 的存储键 'userInfo'）
  const getLocalUser = (): { id: string; nickname: string } | null => {
    try {
      const data = Taro.getStorageSync('userInfo')
      if (data) {
        const user = JSON.parse(data)
        return {
          id: user.openid || '',
          nickname: user.nickName || ''
        }
      }
    } catch (e) {
      console.error('获取用户信息失败:', e)
    }
    return null
  }
  
  useEffect(() => {
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
    try {
      const res = await Network.request({ url: `/api/rooms/${id}` })
      const data = res.data?.data
      
      if (!data) {
        setError('房间不存在或已失效')
        return
      }
      const userInfo = getLocalUser()
      const uid  = userInfo?.id
      setRoom(data)
      setHasJoined(data.members?.some((m: Member) => m.id === uid) || false)
      setError('')
    } catch (err) {
      console.error('获取房间失败:', err)
      setError('房间不存在或已失效')
    }
  }, [])
  
  const handleJoin = () => {
    setShowJoinConfirm(true)
  }
  
  const confirmJoin = async () => {
    setLoading(true)
    setShowJoinConfirm(false)
    
    const userInfo = getLocalUser()
    if (!userInfo) {
      Taro.showToast({ title: '请先设置昵称', icon: 'none' })
      setLoading(false)
      return
    }
    
    try {
      await Network.request({
        url: '/api/rooms/join',
        method: 'POST',
        data: {
          room_id: roomId,
          member: {
            id: userInfo.id,
            name: userInfo.nickname
          }
        }
      })
      Taro.showToast({ title: '加入成功', icon: 'success' })
      // 返回首页并刷新
      setTimeout(() => {
        Taro.navigateBack()
      }, 1000)

       const currentCount = room?.members?.length || 0
    console.log('当前房间人数:', currentCount)
    if(currentCount == 4){
        


      
    }



      
    } catch (err) {
      console.error('加入房间失败:', err)
      Taro.showToast({ title: '加入失败', icon: 'none' })
    } finally {
      setLoading(false)
    }
  }
  
  const handleLeave = async () => {
    const userInfo = getLocalUser()
    if (!userInfo) return
    
    setLoading(true)
    try {
      await Network.request({
        url: '/api/rooms/leave',
        method: 'POST',
        data: {
          room_id: roomId,
          member_id: userInfo.id
        }
      })
      Taro.showToast({ title: '已退出房间', icon: 'success' })
      // 返回首页并刷新
      setTimeout(() => {
        Taro.navigateBack()
      }, 1000)
    } catch (err) {
      console.error('退出房间失败:', err)
      Taro.showToast({ title: '退出失败', icon: 'none' })
    } finally {
      setLoading(false)
    }
  }
  
  const handleBack = () => {
    Taro.navigateBack()
  }






  


  useShareAppMessage(() => {
    return {
      title: '邀请你进入房间', // 分享卡片标题
      path: `/pages/index/index`, // 别人点开跳转的页面
      
    }
  })




  

  
  
  if (error) {
    return (
      <View className="min-h-screen bg-stone-50 flex flex-col">
        <View className="bg-gradient-to-b from-red-800 to-red-700 pt-12 pb-4 px-4">
          <View className="flex items-center">
            <View onClick={handleBack} className="p-2">
              <ArrowLeft size={24} color="white" />
            </View>
            <Text className="text-white text-lg font-medium flex-1 text-center pr-10">房间详情</Text>
          </View>
        </View>
        <View className="flex-1 flex items-center justify-center p-8">
          <View className="text-center">
            <Text className="block text-gray-500 text-lg mb-4">{error}</Text>
            <Button onClick={handleBack}>返回首页</Button>
          </View>
        </View>
      </View>
    )
  }
  
  if (!room) {
    return (
      <View className="min-h-screen bg-stone-50 flex items-center justify-center">
        <Text className="text-gray-500">加载中...</Text>
      </View>
    )
  }
  
  const isFull = room.members?.length >= 4
  
  return (
    <View className="min-h-screen bg-stone-50 flex flex-col">
      {/* 顶部 */}
      <View className="bg-gradient-to-b from-red-800 to-red-700 pt-12 pb-4 px-4">
        <View className="flex items-center">
          <View onClick={handleBack} className="p-2">
            <ArrowLeft size={24} color="white" />
          </View>
          <Text className="text-white text-lg font-medium flex-1 text-center pr-10">房间详情</Text>
        </View>
      </View>
      
      {/* 内容 */}
      <View className="flex-1 px-4 py-6">
        {/* 房间信息卡片 */}
        <Card className="mb-4">
          <CardContent className="p-5">
            {/* 房间号 */}
            <View className="flex items-center justify-center mb-4 pb-4 border-b border-gray-100">
              <Text className="text-amber-600 text-lg font-bold mr-2">房间号</Text>
              <Text className="text-gray-800 text-2xl font-bold tracking-wider">{room.id}</Text>
            </View>
            
            {/* 地点 */}
            <View className="flex items-center mb-3">
              <MapPin size={18} color="#92400e" />
              <Text className="block text-gray-700 ml-2 text-base">{room.location}</Text>
            </View>
            
            {/* 开始时间 */}
            <View className="flex items-center mb-3">
              <Clock size={18} color="#92400e" />
              <Text className="block text-gray-700 ml-2 text-base">
                开始：{formatTime(room.start_time)}
              </Text>
            </View>
            
            {/* 结束时间 */}
            {room.end_time && (
              <View className="flex items-center mb-3">
                <Clock size={18} color="#92400e" />
                <Text className="block text-gray-700 ml-2 text-base">
                  结束：{formatTime(room.end_time)}
                </Text>
              </View>
            )}
            
            {/* 人数 */}
            <View className="flex items-center">
              <Users size={18} color="#92400e" />
              <Text className="block text-gray-700 ml-2 text-base">
                {room.members?.length || 0}/4 人
              </Text>
              {isFull && (
                <Badge variant="destructive" className="ml-2">
                  已满
                </Badge>
              )}
            </View>
          </CardContent>
        </Card>
        
        {/* 成员列表 */}
        <Card className="mb-4">
          <CardContent className="p-5">
            <Text className="block text-gray-800 font-semibold mb-4">已加入成员</Text>
            {room.members?.length > 0 ? (
              <View className="space-y-3">
                {room.members.map((member, index) => (
                  <View key={member.id || index} className="flex items-center p-3 bg-stone-50 rounded-xl">
                    <Avatar className="w-10 h-10 bg-amber-100">
                      <AvatarFallback className="text-amber-700 font-semibold">
                        {member.name?.charAt(0) || '?'}
                      </AvatarFallback>
                    </Avatar>
                    <View className="ml-3 flex-1">
                      <Text className="block text-gray-800 font-medium">
                        {member.name}
                        {member.id === room.creator_id && (
                          <Text className="text-amber-600 text-sm ml-1">(房主)</Text>
                        )}
                      </Text>
                      <Text className="block text-gray-400 text-xs">
                        {member.joined_at ? new Date(member.joined_at).toLocaleString() : ''}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            ) : (
              <Text className="block text-gray-400 text-center py-4">暂无成员</Text>
            )}
          </CardContent>
        </Card>
        
        {/* 操作按钮 */}
        <View className="mt-auto">
          {!hasJoined && !isFull && (
            <Button
              className="w-full bg-red-700 hover:bg-red-800 text-white"
              onClick={handleJoin}
              disabled={loading}
            >
              <Text className="text-white">加入约局</Text>
            </Button>
          )}
          
          {hasJoined && (
            <>
              <View className="flex gap-3 mb-3">
                <View className="flex-1">
                  <Button
                    variant="outline"
                    className="w-full border-red-300 text-red-700"
                    onClick={handleLeave}
                    disabled={loading}
                  >
                    <Text className="text-red-700">退出房间</Text>
                  </Button>
                </View>
                <View className="flex-1">
                  <Button
                    className="w-full bg-yellow-500 hover:bg-yellow-600 text-white"
                    open-type="share"
                  >
                    <Share2 size={16} color="white" className="mr-1" />
                    <Text className="text-white">分享邀请</Text>
                  </Button>
                </View>
              </View>
            </>
          )}




          
          
          {isFull && !hasJoined && (
            <Button className="w-full bg-gray-300 text-gray-500" disabled>
              <Text className="text-gray-500">房间人数已满</Text>
            </Button>
          )}
        </View>
      </View>
      
      {/* 加入确认弹窗 */}
      {showJoinConfirm && (
        <View className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <View className="bg-white rounded-2xl w-full max-w-sm p-6">
            <Text className="block text-xl font-bold text-gray-800 text-center mb-2">确认加入</Text>
            <Text className="block text-gray-500 text-center mb-6">
              确定要加入这个麻将约局吗？
            </Text>
            <View className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setShowJoinConfirm(false)}>
                <Text>取消</Text>
              </Button>
              <Button className="flex-1 bg-red-700" onClick={confirmJoin}>
                <Text className="text-white">确定</Text>
              </Button>
            </View>
          </View>
        </View>
      )}
    </View>
  )
}
