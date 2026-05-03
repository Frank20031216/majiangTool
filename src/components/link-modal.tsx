import { View, Text, Button } from '@tarojs/components'
import { useState } from 'react'
import { Copy } from 'lucide-react-taro'
import Taro from '@tarojs/taro'

// TODO: 请修改为实际的 H5 页面域名
const H5_DOMAIN = 'https://your-domain.com'

interface Props {
  roomId: string
  visible: boolean
  onClose: () => void
}

export default function LinkModal({ roomId, visible, onClose }: Props) {
  const [copied, setCopied] = useState(false)

  if (!visible) return null

  const linkUrl = `${H5_DOMAIN}/h5/invite.html?id=${roomId}`

  const handleCopy = async () => {
    try {
      await Taro.setClipboardData({ data: linkUrl })
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (e) {
      console.error('复制失败', e)
    }
  }

  const handleShare = () => {
    Taro.showShareMenu({
      withShareTicket: true
    })
  }

  return (
    <View className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4">
      <View className="bg-[#1a1a2e] rounded-2xl w-full max-w-sm overflow-hidden">
        {/* 标题 */}
        <View className="bg-gradient-to-r from-[#B91C1C] to-[#991B1B] px-4 py-3">
          <Text className="block text-lg font-bold text-white text-center">
            邀请好友加入
          </Text>
        </View>

        {/* 内容 */}
        <View className="p-4">
          {/* 房间号 */}
          <View className="bg-[#2a2a4e] rounded-xl p-4 mb-4">
            <Text className="block text-sm text-[#a1a1aa] text-center mb-2">房间号</Text>
            <Text className="block text-3xl font-bold text-[#D4AF37] text-center tracking-widest">
              {roomId}
            </Text>
          </View>

          {/* 链接 */}
          <View className="bg-[#2a2a4e] rounded-xl p-3 mb-4">
            <Text className="block text-xs text-[#a1a1aa] mb-1">邀请链接</Text>
            <Text className="block text-sm text-white break-all">{linkUrl}</Text>
          </View>

          {/* 操作按钮 */}
          <View className="flex gap-3">
            <Button
              className="flex-1 bg-[#2a2a4e] text-white text-sm py-2 rounded-xl"
              onClick={handleCopy}
            >
              <View className="flex items-center justify-center gap-1">
                <Copy size={14} color="#fff" />
                <Text className="block">{copied ? '已复制' : '复制链接'}</Text>
              </View>
            </Button>
            <Button
              className="flex-1 bg-[#D4AF37] text-[#1a1a2e] text-sm py-2 rounded-xl font-bold"
              onClick={handleShare}
            >
              分享给好友
            </Button>
          </View>

          {/* 说明 */}
          <View className="mt-4 bg-[#2a2a4e]/50 rounded-lg p-3">
            <Text className="block text-xs text-[#71717a] text-center">
              好友点击链接后，会自动进入房间查看信息并加入
            </Text>
          </View>
        </View>

        {/* 关闭按钮 */}
        <View className="px-4 pb-4">
          <Button
            className="w-full bg-transparent text-[#a1a1aa] text-sm py-2"
            onClick={onClose}
          >
            关闭
          </Button>
        </View>
      </View>
    </View>
  )
}
