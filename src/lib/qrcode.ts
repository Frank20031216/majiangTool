import QRCode from 'qrcode'

// 生成小程序页面二维码的 URL
export function generateRoomUrl(roomId: string): string {
  // 小程序内直接使用页面路径
  return `/pages/room/index?id=${roomId}`
}

// 生成二维码图片的 Data URL
export async function generateQRCodeDataUrl(roomId: string): Promise<string> {
  const url = generateRoomUrl(roomId)
  
  try {
    const dataUrl = await QRCode.toDataURL(url, {
      width: 200,
      margin: 2,
      color: {
        dark: '#374151',
        light: '#FFFFFF'
      },
      errorCorrectionLevel: 'M'
    })
    return dataUrl
  } catch (err) {
    console.error('生成二维码失败:', err)
    return ''
  }
}
