import { useEffect, useState } from 'react'
import Taro from '@tarojs/taro'
import { View, Text } from '@tarojs/components'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Users, Plus, Clock, User, LogIn, Pencil, QrCode } from 'lucide-react-taro'
import { getAllRooms, getUserInfo, saveUserInfo, getUserId, formatTime, getCreatorName } from '@/lib/storage'
import QRCodeModal from '@/components/qrcode-modal'

interface RoomPreview {
  id: string
  location: string
  startTime: string
  creatorName: string
  membersCount: number
  isFull: boolean
}

export default function Index() {
  const [allRooms, setAllRooms] = useState<RoomPreview[]>([])
  const [userInfo, setUserInfo] = useState<{ nickname: string } | null>(null)
  const [showNicknameInput, setShowNicknameInput] = useState(false)
  const [nickname, setNickname] = useState('')
  const [showQRModal, setShowQRModal] = useState(false)
  const [currentQRRoom, setCurrentQRRoom] = useState<RoomPreview | null>(null)
  
  useEffect(() => {
    loadData()
  }, [])
  
  const loadData = () => {
    // 加载用户信息
    const info = getUserInfo()
    setUserInfo(info)
    
    // 加载所有房间
    loadAllRooms()
  }
  
  const loadAllRooms = () => {
    const rooms = getAllRooms()
    // 按创建时间倒序排列
    const sortedRooms = [...rooms].sort((a, b) => b.createdAt - a.createdAt)
    setAllRooms(sortedRooms.map(r => ({
      id: r.id,
      location: r.location,
      startTime: r.startTime,
      creatorName: getCreatorName(r),
      membersCount: r.members.length,
      isFull: r.members.length >= 4
    })))
  }
  
  const handleLogin = () => {
    setShowNicknameInput(true)
  }
  
  const handleNicknameConfirm = () => {
    const name = nickname.trim() || `牌友${Math.floor(Math.random() * 100)}`
    const info = {
      id: getUserId(),
      nickname: name
    }
    saveUserInfo(info)
    setUserInfo({ nickname: info.nickname })
    setShowNicknameInput(false)
    setNickname('')
    Taro.showToast({ title: `欢迎 ${info.nickname}`, icon: 'success' })
  }
  
  const handleNicknameCancel = () => {
    setShowNicknameInput(false)
    setNickname('')
  }
  
  const handleCreate = () => {
    if (!userInfo) {
      Taro.showToast({ title: '请先设置昵称', icon: 'none' })
      return
    }
    Taro.navigateTo({ url: '/pages/create/index' })
  }
  
  const handleEnterRoom = (roomId: string) => {
    Taro.navigateTo({ url: `/pages/room/index?id=${roomId}` })
  }
  
  const handleShowQRCode = (room: RoomPreview) => {
    setCurrentQRRoom(room)
    setShowQRModal(true)
  }
  
  const refreshRooms = () => {
    loadAllRooms()
    Taro.showToast({ title: '已刷新', icon: 'none' })
  }
  
  return (
    <View className="min-h-screen bg-stone-50 flex flex-col">
      {/* 顶部装饰 */}
      <View className="bg-gradient-to-b from-red-800 to-red-700 pt-8 pb-10 px-4 rounded-b-3xl shadow-lg">
        <View className="flex items-center justify-between mb-4">
          <View className="flex items-center">
            {userInfo ? (
              <View className="flex items-center bg-white bg-opacity-20 rounded-full px-3 py-2">
                <Avatar className="w-8 h-8 mr-2">
                  <AvatarFallback className="bg-red-500 text-white text-sm">
                    {userInfo.nickname.slice(0, 1)}
                  </AvatarFallback>
                </Avatar>
                <Text className="text-white text-sm font-medium">{userInfo.nickname}</Text>
                <View 
                  onClick={handleLogin}
                  className="ml-2 p-1"
                >
                  <Pencil size={12} color="#fff" />
                </View>
              </View>
            ) : (
              <Button 
                size="sm"
                className="bg-white bg-opacity-20 hover:bg-white bg-opacity-30 text-white rounded-full border-0"
                onClick={handleLogin}
              >
                <LogIn size={14} color="#fff" />
                <Text className="text-white ml-1 text-sm">登录</Text>
              </Button>
            )}
          </View>
          <View onClick={refreshRooms} className="p-2">
            <Text className="text-white bg-opacity-80 text-xs">刷新</Text>
          </View>
        </View>
        
        <View className="text-center">
          <Text className="block text-amber-400 text-lg font-medium mb-1">国风麻将</Text>
          <Text className="block text-white text-3xl font-bold tracking-wider">约局神器</Text>
          <Text className="block text-red-200 text-sm mt-1">轻松发起，畅快开局</Text>
        </View>
        
        {/* 麻将牌装饰 */}
        <View className="flex justify-center gap-2 mt-4">
          {['🀄', '🀅', '🀇', '🀄'].map((tile, i) => (
            <Text key={i} className="text-2xl opacity-80">{tile}</Text>
          ))}
        </View>
      </View>
      
      {/* 主内容区 */}
      <View className="flex-1 px-4 -mt-4">
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
        
        {/* 全部房间列表 */}
        <View className="mb-4">
          <View className="flex items-center justify-between mb-3">
            <Text className="block text-gray-700 text-base font-semibold">全部约局</Text>
            <Badge variant="secondary" className="bg-red-50 text-red-700 rounded-full px-3">
              {allRooms.length}个房间
            </Badge>
          </View>
          
          {allRooms.length === 0 ? (
            <Card className="shadow-sm border-0">
              <CardContent className="p-8 text-center">
                <Text className="block text-gray-400 text-sm">暂无约局</Text>
                <Text className="block text-gray-300 text-xs mt-1">成为第一个发起约局的人吧</Text>
              </CardContent>
            </Card>
          ) : (
            allRooms.map(room => (
              <Card 
                key={room.id} 
                className="shadow-sm border-0 mb-2"
              >
                <CardContent className="p-4">
                  <View onClick={() => handleEnterRoom(room.id)}>
                    <View className="flex items-start justify-between mb-2">
                      <View className="flex items-center gap-2">
                        <Text className="block text-gray-800 font-medium">{room.location}</Text>
                        {room.isFull && (
                          <Badge variant="destructive" className="rounded-full text-xs">
                            已满
                          </Badge>
                        )}
                      </View>
                      <View className="flex items-center gap-2">
                        <Badge variant="outline" className="text-gray-500 border-gray-300 rounded-lg text-xs">
                          #{room.id}
                        </Badge>
                      </View>
                    </View>
                    
                    <View className="flex items-center gap-2 mb-2">
                      <Clock size={12} color="#9CA3AF" />
                      <Text className="block text-gray-500 text-sm">{formatTime(room.startTime)}</Text>
                    </View>
                    <View className="flex items-center gap-2 mb-2">
                      <User size={12} color="#9CA3AF" />
                      <Text className="block text-gray-500 text-sm">发局人: {room.creatorName}</Text>
                    </View>
                    <View className="flex items-center justify-between">
                      <View className="flex items-center gap-2">
                        <Users size={12} color="#9CA3AF" />
                        <Text className="block text-gray-500 text-sm">
                          {room.membersCount}/4人
                        </Text>
                      </View>
                    </View>
                  </View>
                  
                  {/* 操作按钮 */}
                  <View className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100">
                    <View className="flex-1">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="w-full border-red-200 text-red-700 rounded-lg h-8"
                        onClick={() => handleShowQRCode(room)}
                      >
                        <QrCode size={12} color="#B91C1C" />
                        <Text className="text-red-700 ml-1 text-xs">邀请二维码</Text>
                      </Button>
                    </View>
                    <View className="flex-1">
                      <Button 
                        size="sm" 
                        className="w-full bg-red-700 rounded-lg h-8"
                        onClick={() => handleEnterRoom(room.id)}
                      >
                        <Text className="text-white text-xs">进入房间</Text>
                      </Button>
                    </View>
                  </View>
                </CardContent>
              </Card>
            ))
          )}
        </View>
        
        {/* 底部说明 */}
        <View className="text-center py-6">
          <Text className="block text-gray-400 text-xs">
            数据仅保存在本地 · 刷新不丢失
          </Text>
        </View>
      </View>
      
      {/* 昵称输入弹窗 */}
      {showNicknameInput && (
        <View className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
          <View className="bg-white rounded-2xl p-6 w-full max-w-sm">
            <Text className="block text-gray-800 text-lg font-semibold text-center mb-2">
              {userInfo ? '修改昵称' : '设置昵称'}
            </Text>
            <Text className="block text-gray-500 text-sm text-center mb-4">
              给自己起个好听的昵称吧
            </Text>
            
            <View className="bg-gray-50 rounded-xl px-4 py-3 mb-4">
              <Input 
                className="w-full text-gray-800"
                placeholder="请输入昵称"
                value={nickname}
                onInput={(e: any) => setNickname(e.detail.value)}
                maxlength={10}
              />
            </View>
            
            <View className="flex gap-3">
              <View className="flex-1">
                <Button 
                  variant="outline"
                  className="w-full border-gray-300 rounded-xl h-11"
                  onClick={handleNicknameCancel}
                >
                  <Text>取消</Text>
                </Button>
              </View>
              <View className="flex-1">
                <Button 
                  className="w-full bg-red-700 rounded-xl h-11"
                  onClick={handleNicknameConfirm}
                >
                  <Text className="text-white">确定</Text>
                </Button>
              </View>
            </View>
          </View>
        </View>
      )}
      
      {/* 二维码弹窗 */}
      <QRCodeModal
        show={showQRModal}
        roomId={currentQRRoom?.id || ''}
        roomName={currentQRRoom?.location}
        onClose={() => setShowQRModal(false)}
      />
    </View>
  )
}
