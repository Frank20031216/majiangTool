/**
 * 二维码工具 - 用于生成带房间号的二维码
 */

const ROOM_PATH = '/pages/room/index'

/**
 * 生成房间的完整跳转路径
 */
export function getRoomPath(roomId: string): string {
  return `${ROOM_PATH}?id=${roomId}`
}

/**
 * 生成二维码数据 URL
 */
export async function generateQRCodeDataUrl(content: string): Promise<string> {
  const QRCode = require('qrcode')
  
  try {
    const dataUrl = await QRCode.toDataURL(content, {
      width: 200,
      margin: 2,
      color: {
        dark: '#1a1a1a',
        light: '#ffffff'
      },
      errorCorrectionLevel: 'M'
    })
    return dataUrl
  } catch (error) {
    console.error('生成二维码失败:', error)
    throw error
  }
}

/**
 * 生成房间二维码内容（只包含房间ID）
 */
export function getQRCodeContent(roomId: string): string {
  return roomId
}
