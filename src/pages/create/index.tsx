import { useState } from 'react'
import Taro from '@tarojs/taro'
import { View, Text, Picker } from '@tarojs/components'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ArrowLeft, MapPin, Clock, Calendar, Check } from 'lucide-react-taro'
import { generateInviteLink } from '@/lib/storage'
import { Network } from '@/network'

export default function CreateRoom() {
  // 获取默认日期（今天）
  const getDefaultDate = () => {
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const day = String(now.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }
  
  // 获取默认时间（当前时间 + 1小时，向上取整）
  const getDefaultTime = () => {
    const now = new Date()
    const hours = String(now.getHours() + 1).padStart(2, '0')
    return `${hours}:00`
  }
  
  const [location, setLocation] = useState('')
  const [startDate, setStartDate] = useState(getDefaultDate)
  const [startTime, setStartTime] = useState(getDefaultTime)
  const [endDate, setEndDate] = useState('')
  const [endTime, setEndTime] = useState('')
  const [created, setCreated] = useState(false)
  const [roomId, setRoomId] = useState('')
  const [inviteLink, setInviteLink] = useState('')
  const [loading, setLoading] = useState(false)


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
 
  
  const handleCreate = async () => {
    if (!location.trim()) {
      Taro.showToast({ title: '请填写约局地点', icon: 'none' })
      return
    }
    if (!startDate || !startTime) {
      Taro.showToast({ title: '请填写开始时间', icon: 'none' })
      return
    }
    
    setLoading(true)
    
    try {
      const startDateTime = `${startDate} ${startTime}`
      const endDateTime = endDate && endTime ? `${endDate} ${endTime}` : undefined
      
      // 调用后端API创建房间
      const res = await Network.request({
        url: '/api/rooms',
        method: 'POST',
        data: {
          location: location.trim(),
          start_time: startDateTime,
          end_time: endDateTime,
          creator_name: getLocalUser()?.nickname || '房主',
          creator_id: getLocalUser()?.id || ''
        }
      })
      
      const newRoom = res.data?.data
      if (!newRoom) {
        throw new Error('创建失败')
      }
      
      console.log('创建房间成功，返回数据:', res.data)
      setRoomId(newRoom.id)
      setInviteLink(generateInviteLink(newRoom.id))
      setCreated(true)
    } catch (e) {
      Taro.showToast({ title: '创建失败', icon: 'none' })
    } finally {
      setLoading(false)
    }
  }



////////////////////
  
  const handleCopyLink = () => {
    Taro.setClipboardData({
      data: inviteLink,
      success: () => {
        Taro.showToast({ title: '链接已复制', icon: 'success' })
      }
    })
  }



///////////////////////

  
  const handleViewRoom = () => {
    // 返回首页并刷新
    Taro.navigateBack()
  }
  
  const handleBack = () => {
    // 返回首页并刷新
    Taro.navigateBack()
  }

  // 创建成功页面
  if (created) {
    return (
      <View className="min-h-screen bg-stone-50 flex flex-col">
        {/* 顶部装饰 */}
        <View className="bg-gradient-to-b from-red-800 to-red-700 pt-8 pb-6 px-4">
          <View className="flex items-center justify-between">
            <View onClick={handleBack} className="p-2">
              <ArrowLeft size={24} color="white" />
            </View>
            <Text className="text-white text-lg font-medium">创建成功</Text>
            <View className="w-10" />
          </View>
        </View>
        
        <View className="flex-1 px-4 py-6">
          {/* 成功提示 */}
          <View className="bg-white rounded-2xl p-6 shadow-md mb-4">
            <View className="flex flex-col items-center mb-6">
              <View className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <Check size={32} color="#059669" />
              </View>
              <Text className="block text-gray-800 text-xl font-bold">房间创建成功</Text>
              <Text className="block text-gray-500 text-sm mt-2">邀请好友一起打麻将吧</Text>
            </View>
            
            {/* 房间信息 */}
            <View className="bg-stone-50 rounded-xl p-4 mb-4">
              <View className="flex items-center justify-between mb-3">
                <Text className="block text-gray-500 text-sm">房间号</Text>
                <Text className="block text-red-700 text-xl font-bold">{roomId}</Text>
              </View>
            </View>
            
            {/* 分享按钮 */}
            <Button 
              className="w-full bg-red-700 hover:bg-red-800 text-white rounded-xl h-12"
              onClick={handleCopyLink}
            >
              <Text className="text-white mr-2">分享</Text>
            </Button>
          </View>
          
          
          {/* 进入房间 */}
          <Button 
            variant="outline"
            className="w-full border-red-200 text-red-700 hover:bg-red-50 rounded-xl h-12"
            onClick={handleViewRoom}
          >
            <Text>完成</Text>
          </Button>
        </View>
      </View>
    )
  }
  
  // 创建表单页面
  return (
    <View className="min-h-screen bg-stone-50 flex flex-col">
      {/* 顶部 */}
      <View className="bg-gradient-to-b from-red-800 to-red-700 pt-8 pb-6 px-4">
        <View className="flex items-center">
          <View onClick={handleBack} className="p-2 -ml-2">
            <ArrowLeft size={24} color="white" />
          </View>
          <Text className="text-white text-lg font-medium ml-2">发起约局</Text>
        </View>
      </View>
      
      {/* 表单内容 */}
      <View className="flex-1 px-4 py-6">
        <Card className="shadow-md border-0">
          <CardContent className="p-5">
            {/* 地点 */}
            <View className="mb-5">
              <Label className="text-gray-700 font-medium mb-2 block">
                <MapPin size={14} color="#EF4444" />
                约局地点
              </Label>
              <View className="bg-gray-50 rounded-xl px-4 py-3">
                <Input 
                  className="w-full bg-transparent text-gray-800"
                  placeholder="例如：朝阳棋牌室"
                  value={location}
                  onInput={(e: any) => setLocation(e.detail.value)}
                />
              </View>
            </View>
            
            {/* 开始时间 */}
            <View className="mb-5">
              <Label className="text-gray-700 font-medium mb-2 block">
                <Calendar size={14} color="#EF4444" />
                开始时间
              </Label>
              <View className="flex gap-3">
                {/* 开始日期选择 */}
                <View className="flex-1">
                  <Picker
                    mode="date"
                    value={startDate || getDefaultDate()}
                    onChange={(e: any) => setStartDate(e.detail.value)}
                  >
                    <View className="bg-gray-50 rounded-xl px-4 py-3 flex items-center">
                      <Calendar size={16} color="#9CA3AF" className="mr-2" />
                      <Text className="text-gray-800 flex-1">{startDate || getDefaultDate()}</Text>
                    </View>
                  </Picker>
                </View>
                {/* 开始时间选择 */}
                <View className="flex-1">
                  <Picker
                    mode="time"
                    value={startTime || getDefaultTime()}
                    onChange={(e: any) => setStartTime(e.detail.value)}
                  >
                    <View className="bg-gray-50 rounded-xl px-4 py-3 flex items-center">
                      <Clock size={16} color="#9CA3AF" className="mr-2" />
                      <Text className="text-gray-800 flex-1">{startTime || getDefaultTime()}</Text>
                    </View>
                  </Picker>
                </View>
              </View>
            </View>
            
            {/* 结束时间（选填） */}
            <View className="mb-6">
              <Label className="text-gray-700 font-medium mb-2 block">
                <Clock size={14} color="#9CA3AF" />
                结束时间
                <Text className="text-gray-400 text-xs ml-1">(选填)</Text>
              </Label>
              <View className="flex gap-3">
                {/* 结束日期选择 */}
                <View className="flex-1">
                  <Picker
                    mode="date"
                    value={endDate}
                    onChange={(e: any) => setEndDate(e.detail.value)}
                  >
                    <View className="bg-gray-50 rounded-xl px-4 py-3 flex items-center">
                      <Calendar size={16} color="#9CA3AF" className="mr-2" />
                      <Text className={endDate ? "text-gray-800 flex-1" : "text-gray-400 flex-1"}>
                        {endDate || '选填'}
                      </Text>
                    </View>
                  </Picker>
                </View>
                {/* 结束时间选择 */}
                <View className="flex-1">
                  <Picker
                    mode="time"
                    value={endTime}
                    onChange={(e: any) => setEndTime(e.detail.value)}
                  >
                    <View className="bg-gray-50 rounded-xl px-4 py-3 flex items-center">
                      <Clock size={16} color="#9CA3AF" className="mr-2" />
                      <Text className={endTime ? "text-gray-800 flex-1" : "text-gray-400 flex-1"}>
                        {endTime || '选填'}
                      </Text>
                    </View>
                  </Picker>
                </View>
              </View>
            </View>
            
            {/* 提示 */}
            <View className="bg-amber-50 rounded-xl p-3 mb-5">
              <Text className="block text-amber-700 text-xs">
                房间最多容纳4人，请确保信息填写正确
              </Text>
            </View>
            
            {/* 创建按钮 */}
            <Button 
              className="w-full bg-red-700 hover:bg-red-800 text-white rounded-xl h-12"
              onClick={handleCreate}
              disabled={loading}
            >
              <Text className="text-white">{loading ? '创建中...' : '确认创建'}</Text>
            </Button>
          </CardContent>
        </Card>
      </View>
    </View>
  )
}
