import { View, Text } from "@tarojs/components"
import Taro from "@tarojs/taro"
import { useState } from "react"
import { Network } from "@/network"

interface LinkModalProps {
  show: boolean
  roomId: string
  roomName?: string
  onClose: () => void
}

export default function LinkModal({ show, roomId, roomName, onClose }: LinkModalProps) {
  const [urlScheme, setUrlScheme] = useState<string>("")
  const [loading, setLoading] = useState(false)

  if (!show) return null

  // 小程序页面路径
  const miniPagePath = `/pages/room/index?id=${roomId}`

  // 生成 URL Scheme
  const handleGenerateUrlScheme = async () => {
    if (urlScheme) {
      // 已有则直接复制
      handleCopyUrlScheme()
      return
    }

    setLoading(true)
    try {
      const res = await Network.request({
        url: '/api/url-scheme/generate',
        data: { path: miniPagePath }
      })
      
      console.log('生成 URL Scheme 响应:', res)
      
      if (res.statusCode === 200 && res.data?.data) {
        setUrlScheme(res.data.data)
        // 自动复制
        Taro.setClipboardData({
          data: res.data.data,
          success: () => {
            Taro.showToast({
              title: "已复制链接",
              icon: "success"
            })
          }
        })
      } else {
        // 接口未配置时，使用备用方案
        Taro.showToast({
          title: "请配置微信AppId",
          icon: "none"
        })
      }
    } catch (error) {
      console.error('生成 URL Scheme 失败:', error)
      Taro.showToast({
        title: "生成失败，请重试",
        icon: "none"
      })
    } finally {
      setLoading(false)
    }
  }

  // 复制 URL Scheme
  const handleCopyUrlScheme = () => {
    if (!urlScheme) {
      handleGenerateUrlScheme()
      return
    }
    Taro.setClipboardData({
      data: urlScheme,
      success: () => {
        Taro.showToast({
          title: "已复制链接",
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

        {/* URL Scheme */}
        {urlScheme && (
          <View className="bg-gray-50 rounded-xl px-4 py-3 mb-3 w-full">
            <Text className="block text-xs text-gray-500 mb-1">邀请链接（可粘贴到微信）</Text>
            <Text className="block text-xs text-gray-700 break-all leading-relaxed">
              {urlScheme}
            </Text>
          </View>
        )}
        
        {/* 小程序页面路径 */}
        <View className="bg-gray-50 rounded-xl px-4 py-3 mb-3 w-full">
          <Text className="block text-xs text-gray-500 mb-1">小程序路径</Text>
          <Text className="block text-xs text-gray-700 break-all leading-relaxed">
            {miniPagePath}
          </Text>
        </View>

        {/* 提示 */}
        <Text className="block text-xs text-gray-400 text-center mb-4">
          {urlScheme 
            ? "链接已生成，可直接粘贴到微信发送给好友"
            : "点击下方按钮生成分享链接"
          }
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
            className={`flex-1 rounded-xl py-3 text-center ${urlScheme ? 'bg-green-600' : 'bg-red-600'}`}
            onClick={handleGenerateUrlScheme}
          >
            <Text className="block text-white">
              {loading ? "生成中..." : urlScheme ? "复制链接" : "生成分享链接"}
            </Text>
          </View>
        </View>
      </View>
    </View>
  )
}
