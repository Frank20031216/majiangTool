import { useEffect, useState } from 'react'
import { View, Text, Image } from '@tarojs/components'
import { Button } from '@/components/ui/button'
import { generateQRCodeDataUrl } from '@/lib/qrcode'

interface QRCodeModalProps {
  roomId: string
  location: string
  visible: boolean
  onClose: () => void
}

export default function QRCodeModal({ roomId, location, visible, onClose }: QRCodeModalProps) {
  const [qrCodeUrl, setQrCodeUrl] = useState('')
  const [loading, setLoading] = useState(false)
  
  useEffect(() => {
    if (visible && roomId) {
      generateQR()
    }
  }, [visible, roomId])
  
  const generateQR = async () => {
    setLoading(true)
    try {
      const url = await generateQRCodeDataUrl(roomId)
      setQrCodeUrl(url)
    } catch (e) {
      console.error('生成二维码失败', e)
    }
    setLoading(false)
  }
  
  if (!visible) return null
  
  return (
    <View className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 px-4">
      <View className="bg-white rounded-2xl p-6 w-full max-w-xs">
        <Text className="block text-gray-800 text-lg font-semibold text-center mb-2">
          邀约二维码
        </Text>
        <Text className="block text-gray-500 text-sm text-center mb-4">
          扫码加入「{location}」
        </Text>
        
        {/* 二维码 */}
        <View className="flex justify-center mb-4">
          {loading ? (
            <View className="w-48 h-48 bg-gray-100 rounded-xl flex items-center justify-center">
              <Text className="text-gray-400 text-sm">生成中...</Text>
            </View>
          ) : qrCodeUrl ? (
            <Image 
              src={qrCodeUrl}
              className="w-48 h-48 rounded-xl"
              mode="aspectFit"
            />
          ) : (
            <View className="w-48 h-48 bg-gray-100 rounded-xl flex items-center justify-center">
              <Text className="text-gray-400 text-sm">生成失败</Text>
            </View>
          )}
        </View>
        
        {/* 房间号 */}
        <View className="bg-gray-50 rounded-xl p-3 mb-4">
          <Text className="block text-gray-500 text-xs text-center">房间号</Text>
          <Text className="block text-gray-800 text-xl font-bold text-center tracking-widest">
            {roomId}
          </Text>
        </View>
        
        {/* 关闭按钮 */}
        <Button 
          className="w-full bg-red-700 text-white rounded-xl h-11"
          onClick={onClose}
        >
          <Text className="text-white">关闭</Text>
        </Button>
      </View>
    </View>
  )
}
