import Taro from '@tarojs/taro'
import { View, Text } from '@tarojs/components'
import { Button } from '@/components/ui/button'
import { House, Users } from 'lucide-react-taro'

export default function RoomFull() {
  const handleGoHome = () => {
    Taro.redirectTo({ url: '/pages/index/index' })
  }
  
  return (
    <View className="min-h-screen bg-stone-50 flex flex-col">
      {/* 顶部 */}
      <View className="bg-gradient-to-b from-gray-600 to-gray-500 pt-8 pb-6 px-4">
        <Text className="block text-white text-lg font-medium text-center">房间详情</Text>
      </View>
      
      {/* 内容 */}
      <View className="flex-1 flex flex-col items-center justify-center px-6">
        {/* 满员图标 */}
        <View className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
          <Users size={48} color="#9CA3AF" />
        </View>
        
        {/* 标题 */}
        <Text className="block text-gray-800 text-2xl font-bold mb-3">
          房间人数已满
        </Text>
        
        {/* 说明 */}
        <Text className="block text-gray-500 text-center text-sm mb-2">
          很抱歉，此房间已有4人加入
        </Text>
        <Text className="block text-gray-500 text-center text-sm mb-8">
          无法再加入新的约局
        </Text>
        
        {/* 装饰麻将 */}
        <View className="flex gap-3 mb-8">
          {['🀄', '🀅', '🀇', '🀄'].map((tile, i) => (
            <Text key={i} className="text-2xl opacity-50">{tile}</Text>
          ))}
        </View>
        
        {/* 返回首页按钮 */}
        <Button 
          className="w-full max-w-xs bg-red-700 hover:bg-red-800 text-white rounded-xl h-12"
          onClick={handleGoHome}
        >
          <View className="flex items-center">
            <House size={18} color="#fff" />
            <Text className="text-white">返回首页</Text>
          </View>
        </Button>
      </View>
      
      {/* 底部提示 */}
      <View className="px-6 py-6 text-center">
        <Text className="block text-gray-400 text-xs">
          您可以发起新的约局邀请好友
        </Text>
      </View>
    </View>
  )
}
