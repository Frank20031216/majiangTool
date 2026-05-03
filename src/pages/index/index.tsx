import { useEffect, useState } from 'react'
import Taro from '@tarojs/taro'
import { View, Text } from '@tarojs/components'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Users, Plus, Clock, MapPin } from 'lucide-react-taro'
import { getUserRooms, formatTime } from '@/lib/storage'

interface RoomPreview {
  id: string
  location: string
  startTime: string
  membersCount: number
  isFull: boolean
}

export default function Index() {
  const [myRooms, setMyRooms] = useState<RoomPreview[]>([])
  
  useEffect(() => {
    loadMyRooms()
  }, [])
  
  const loadMyRooms = () => {
    const rooms = getUserRooms()
    setMyRooms(rooms.slice(-3).reverse().map(r => ({
      id: r.id,
      location: r.location,
      startTime: r.startTime,
      membersCount: r.members.length,
      isFull: r.members.length >= 4
    })))
  }
  
  const handleCreate = () => {
    Taro.navigateTo({ url: '/pages/create/index' })
  }
  
  const handleEnterRoom = (roomId: string) => {
    Taro.navigateTo({ url: `/pages/room/index?id=${roomId}` })
  }
  
  return (
    <View className="min-h-screen bg-stone-50 flex flex-col">
      {/* 顶部装饰 */}
      <View className="bg-gradient-to-b from-red-800 to-red-700 pt-8 pb-12 px-4 rounded-b-3xl shadow-lg">
        <View className="text-center">
          <Text className="block text-amber-400 text-lg font-medium mb-2">国风麻将</Text>
          <Text className="block text-white text-3xl font-bold tracking-wider">约局神器</Text>
          <Text className="block text-red-200 text-sm mt-2">轻松发起，畅快开局</Text>
        </View>
        
        {/* 麻将牌装饰 */}
        <View className="flex justify-center gap-2 mt-6">
          {['🀄', '🀅', '🀇', '🀄'].map((tile, i) => (
            <Text key={i} className="text-3xl opacity-80">{tile}</Text>
          ))}
        </View>
      </View>
      
      {/* 主内容区 */}
      <View className="flex-1 px-4 -mt-6">
        {/* 创建房间卡片 */}
        <Card className="shadow-md border-0 mb-4 overflow-hidden">
          <CardContent className="p-0">
            <View className="bg-white rounded-2xl p-5">
              <View className="flex items-center gap-3 mb-4">
                <View className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                  <Plus size={24} color="#B91C1C" />
                </View>
                <View className="flex-1">
                  <Text className="block text-gray-800 text-lg font-semibold">发起约局</Text>
                  <Text className="block text-gray-500 text-sm">创建房间，邀请好友</Text>
                </View>
              </View>
              
              <Button 
                className="w-full bg-red-700 hover:bg-red-800 text-white rounded-xl h-12 text-base font-medium"
                onClick={handleCreate}
              >
                <Text className="text-white">发起麻将约局</Text>
              </Button>
            </View>
          </CardContent>
        </Card>
        
        {/* 我的房间列表 */}
        {myRooms.length > 0 && (
          <View className="mb-4">
            <View className="flex items-center justify-between mb-3">
              <Text className="block text-gray-700 text-base font-semibold">我的房间</Text>
              <Badge variant="secondary" className="bg-red-50 text-red-700 rounded-full px-3">
                {myRooms.length}个
              </Badge>
            </View>
            
            {myRooms.map(room => (
              <Card 
                key={room.id} 
                className="shadow-sm border-0 mb-3"
                onClick={() => handleEnterRoom(room.id)}
              >
                <CardContent className="p-4">
                  <View className="flex items-start justify-between">
                    <View className="flex-1">
                      <View className="flex items-center gap-2 mb-2">
                        <MapPin size={14} color="#9CA3AF" />
                        <Text className="block text-gray-800 font-medium">{room.location}</Text>
                      </View>
                      <View className="flex items-center gap-2 mb-2">
                        <Clock size={14} color="#9CA3AF" />
                        <Text className="block text-gray-500 text-sm">{formatTime(room.startTime)}</Text>
                      </View>
                      <View className="flex items-center gap-2">
                        <Users size={14} color="#9CA3AF" />
                        <Text className="block text-gray-500 text-sm">
                          {room.membersCount}/4人
                        </Text>
                        {room.isFull && (
                          <Badge variant="destructive" className="rounded-full text-xs ml-1">
                            已满
                          </Badge>
                        )}
                      </View>
                    </View>
                    <Badge variant="outline" className="text-gray-500 border-gray-300 rounded-lg">
                      #{room.id}
                    </Badge>
                  </View>
                </CardContent>
              </Card>
            ))}
          </View>
        )}
        
        {/* 底部说明 */}
        <View className="text-center py-6">
          <Text className="block text-gray-400 text-xs">
            数据仅保存在本地 · 刷新不丢失
          </Text>
        </View>
      </View>
    </View>
  )
}
