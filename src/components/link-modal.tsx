import { View, Text } from "@tarojs/components"
import Taro from "@tarojs/taro"

interface LinkModalProps {
  show: boolean
  roomId: string
  roomName?: string
  onClose: () => void
}

export default function LinkModal({ show, roomId, roomName, onClose }: LinkModalProps) {
  if (!show) return null

  // 小程序页面路径
  const miniPagePath = `/pages/room/index?id=${roomId}`

  // 复制小程序链接
  const handleCopyMiniLink = () => {
    Taro.setClipboardData({
      data: miniPagePath,
      success: () => {
        Taro.showToast({
          title: "已复制小程序路径",
          icon: "success"
        })
      }
    })
  }

  return (
    <View className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <View 
        className="bg-white rounded-2xl p-6 w-full max-w-xs flex flex-col items-center"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 标题 */}
        <Text className="block text-lg font-bold text-gray-800 mb-1">邀请加入约局</Text>
        {roomName && (
          <Text className="block text-sm text-gray-500 mb-4">{roomName}</Text>
        )}
        
        {/* 房间号 */}
        <View className="bg-red-50 rounded-xl px-6 py-3 mb-4">
          <Text className="block text-sm text-red-600 mb-1 text-center">房间号</Text>
          <Text className="block text-3xl font-bold text-red-700 tracking-widest text-center">
            {roomId}
          </Text>
        </View>
        
        {/* 小程序页面路径 */}
        <View className="bg-gray-50 rounded-xl px-4 py-3 mb-3 w-full">
          <Text className="block text-xs text-gray-500 mb-1">小程序路径</Text>
          <Text className="block text-sm text-gray-700 break-all leading-relaxed">
            {miniPagePath}
          </Text>
        </View>

        {/* 提示 */}
        <Text className="block text-xs text-gray-400 text-center mb-4">
          复制路径后发送给好友{"\n"}好友打开小程序并粘贴路径即可加入
        </Text>
        
        {/* 操作按钮 */}
        <View className="flex gap-3 w-full">
          <View 
            className="flex-1 bg-gray-100 rounded-xl py-3 text-center"
            onClick={onClose}
          >
            <Text className="block text-gray-600">关闭</Text>
          </View>
          <View 
            className="flex-1 bg-red-600 rounded-xl py-3 text-center"
            onClick={handleCopyMiniLink}
          >
            <Text className="block text-white">复制路径</Text>
          </View>
        </View>
      </View>
    </View>
  )
}
