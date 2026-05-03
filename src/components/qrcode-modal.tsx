import { useState, useEffect } from "react"
import { View, Text, Image } from "@tarojs/components"
import Taro from "@tarojs/taro"
import { generateQRCodeDataUrl } from "@/lib/qrcode"

interface QRCodeModalProps {
  show: boolean
  roomId: string
  roomName?: string
  onClose: () => void
}

export default function QRCodeModal({ show, roomId, roomName, onClose }: QRCodeModalProps) {
  const [qrCodeUrl, setQrCodeUrl] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (show && roomId) {
      generateQRCode()
    }
  }, [show, roomId])

  const generateQRCode = async () => {
    if (!roomId) return
    
    setLoading(true)
    setError("")
    
    try {
      const content = roomId
      const dataUrl = await generateQRCodeDataUrl(content)
      setQrCodeUrl(dataUrl)
    } catch (err) {
      console.error("生成二维码失败:", err)
      setError("生成二维码失败")
    } finally {
      setLoading(false)
    }
  }

  const handleSaveQRCode = () => {
    if (!qrCodeUrl) return
    
    Taro.saveImageToPhotosAlbum({
      filePath: qrCodeUrl,
      success: () => {
        Taro.showToast({
          title: "已保存到相册",
          icon: "success"
        })
      },
      fail: () => {
        Taro.showToast({
          title: "保存失败",
          icon: "none"
        })
      }
    })
  }

  if (!show) return null

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
        
        {/* 二维码 */}
        <View className="bg-white rounded-xl p-3 mb-4 border-2 border-red-100">
          {loading ? (
            <View className="w-48 h-48 flex items-center justify-center bg-gray-50 rounded-lg">
              <Text className="block text-gray-400">生成中...</Text>
            </View>
          ) : error ? (
            <View className="w-48 h-48 flex items-center justify-center bg-gray-50 rounded-lg">
              <Text className="block text-red-500">{error}</Text>
            </View>
          ) : qrCodeUrl ? (
            <Image
              src={qrCodeUrl}
              className="w-48 h-48"
              mode="aspectFit"
            />
          ) : null}
        </View>
        
        {/* 提示 */}
        <Text className="block text-xs text-gray-400 text-center mb-4">
          扫描二维码进入房间{"\n"}或让好友输入上方房间号
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
            onClick={handleSaveQRCode}
          >
            <Text className="block text-white">保存图片</Text>
          </View>
        </View>
      </View>
    </View>
  )
}
