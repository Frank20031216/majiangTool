import { useEffect, useState } from 'react'
import Taro from '@tarojs/taro'
import { View, Text } from '@tarojs/components'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Users, Plus, Clock, User, QrCode, Trash2, LogOut, RefreshCw } from 'lucide-react-taro'
import { formatTime } from '@/lib/storage'
import { Network } from '@/network'
import { wxLogin, getOpenidByCode, registerUser, getLocalUser, saveLocalUser, getUserInfo } from '@/lib/auth'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from '@/components/ui/alert-dialog'

interface Room {
  id: number
  room_code: string
  location: string
  start_time: string
  end_time: string
  creator_id: string
  creator_name: string
  members: { id: string; name: string }[]
  created_at: string
}

interface UserInfo {
  openid: string
  nickName: string
  phone?: string
  avatarUrl?: string
}

export default function Index() {
  const [rooms, setRooms] = useState<Room[]>([])
  const [loading, setLoading] = useState(true)
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null)
  const [showRegisterModal, setShowRegisterModal] = useState(false)
  const [loginCode, setLoginCode] = useState('')
  const [nickName, setNickName] = useState('')
  const [phone, setPhone] = useState('')
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [roomToDelete, setRoomToDelete] = useState<Room | null>(null)
  const [showLogoutDialog, setShowLogoutDialog] = useState(false)
  const [openid, setOpenid] = useState('')

  // 加载房间列表
  const loadRooms = async () => {
    try {
      const res = await Network.request({
        url: '/api/rooms',
        method: 'GET',
      })
      if (res.data.code === 200) {
        setRooms(res.data.data)
      }
    } catch (err) {
      console.error('加载房间失败:', err)
    } finally {
      setLoading(false)
    }
  }

  // 初始化用户状态
  useEffect(() => {
    const localUser = getLocalUser()
    if (localUser) {
      setUserInfo(localUser)
    } else {
      // 未登录，尝试自动登录
      handleAutoLogin()
    }
    loadRooms()
  }, [])

  // 每次显示页面时刷新
  useEffect(() => {
    loadRooms()
  }, [])

  // 自动登录：获取 code 并换取 openid
  const handleAutoLogin = async () => {
    try {
      const code = await wxLogin()
      console.log("code: "+code)
      const { openid, isNewUser } = await getOpenidByCode(code)
      console.log("code: "+code+"\n"+"openid: "+openid)
      
      if (isNewUser) {
        // 新用户，需要注册
        setLoginCode(code)
        setOpenid(openid)
        setShowRegisterModal(true)
      } else {
        // 老用户，自动登录
        const user = await getUserInfo(openid)
        console.log("code: "+code+"\n"+"openid: "+openid)
        console.log("user: "+user.nickName)
        saveLocalUser(user)
        setUserInfo(user)
      }
    } catch (err) {
      console.error('自动登录失败:', err)
    }
  }

  // 登录按钮点击
  const handleLogin = async () => {
    try {
      const code = await wxLogin()
      const { openid, isNewUser } = await getOpenidByCode(code)
      
      setOpenid(openid)
      if (isNewUser) {
        // 新用户，需要注册
        setLoginCode(code)
        setOpenid(openid)
        setShowRegisterModal(true)
      } else {
        // 老用户，自动登录成功
        const user = await getUserInfo(openid)

        saveLocalUser(user)
        setUserInfo(user)
        Taro.showToast({ title: '登录成功', icon: 'success' })
      }
    } catch (err) {
      console.error('登录失败:', err)
      Taro.showToast({ title: '登录失败', icon: 'error' })
    }
  }

  // 确认注册
  const handleRegister = async () => {
    if (!nickName.trim()) {
      Taro.showToast({ title: '请输入昵称', icon: 'none' })
      return
    }
    if (!loginCode) {
      Taro.showToast({ title: '登录凭证已过期，请重新登录', icon: 'none' })
      return
    }

    try {
      
      console.log('注册openid:'+openid)
      const user = await registerUser({
        openid,
        nick_name: nickName.trim(),
        phone: phone.trim() || undefined,
        avatar_url: undefined,
      })
      console.log('user: '+user)
      saveLocalUser(user)
      setUserInfo(user)
      setShowRegisterModal(false)
      Taro.showToast({ title: '注册成功', icon: 'success' })
    } catch (err) {
      console.error('注册失败:', err)
      Taro.showToast({ title: '注册失败', icon: 'error' })
    }
  }

  // 登出
  const handleLogout = () => {
    Taro.removeStorageSync('userInfo')
    setUserInfo(null)
    setShowLogoutDialog(false)
    Taro.showToast({ title: '已退出登录', icon: 'success' })
  }

  // 删除房间
  const handleDeleteRoom = async (room: Room) => {
    try {
      const res = await Network.request({
        url: `/api/rooms/${room.id}`,
        method: 'DELETE',
      })
      if (res.data.code === 200) {
        setRooms(rooms.filter(r => r.id !== room.id))
        Taro.showToast({ title: '删除成功', icon: 'success' })
      } else {
        Taro.showToast({ title: res.data.msg || '删除失败', icon: 'error' })
      }
    } catch (err) {
      console.error('删除房间失败:', err)
      Taro.showToast({ title: '删除失败', icon: 'error' })
    }
    setShowDeleteDialog(false)
  }

  // 确认删除
  const confirmDelete = (room: Room) => {
    setRoomToDelete(room)
    setShowDeleteDialog(true)
  }

  // 获取用户头像首字母
  const getInitials = (name: string) => {
    return name ? name.charAt(0).toUpperCase() : '?'
  }

  return (
    <View className="min-h-screen bg-gradient-to-b from-red-950 to-red-900">
      {/* 顶部区域 */}
      <View className="p-4 flex justify-between items-center">
        <View className="flex items-center gap-3">
          <Avatar className="bg-yellow-500">
            <AvatarFallback className="text-lg font-bold text-red-950">
              {userInfo ? getInitials(userInfo.nickName) : '?'}
            </AvatarFallback>
          </Avatar>
          <View>
            <Text className="block text-lg font-bold text-yellow-500">
                {userInfo ? userInfo.nickName : '未登录'}
            </Text>
            {userInfo?.phone && (
              <Text className="block text-sm text-yellow-200">
                {userInfo.phone}
              </Text>
            )}
          </View>
        </View>
        <View className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            className="border-yellow-500 text-yellow-500"
            onClick={handleLogin}
          >
            <LogOut className="mr-1" size={14} color="#fbbf24" />
            <Text>登录</Text>
          </Button>
          {userInfo && (
            <Button
              size="sm"
              variant="outline"
              className="border-red-400 text-red-200"
              onClick={() => setShowLogoutDialog(true)}
            >
              <LogOut className="mr-1" size={14} color="#fbbf24" />
              <Text>登出</Text>
            </Button>
          )}
        </View>
      </View>

      {/* 页面标题 */}
      <View className="px-4 pb-4">
        <Text className="block text-3xl font-bold text-yellow-500">
          麻将约局
        </Text>
        <Text className="block text-sm text-yellow-200 mt-1">
          轻松约牌，欢乐共享
        </Text>
      </View>

      {/* 房间列表 */}
      <View className="px-4 pb-20">
        <View className="flex justify-between items-center mb-4">
          <Text className="block text-lg font-bold text-yellow-500">
            约局列表
          </Text>
          <View className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              className="border-yellow-500 text-yellow-500"
              onClick={() => {
                setLoading(true)
                loadRooms()
              }}
            >
              <RefreshCw className="mr-1" size={14} color="#fbbf24" />
              <Text>刷新</Text>
            </Button>
            <Button
              size="sm"
              className="bg-yellow-500 text-red-950 hover:bg-yellow-400"
              onClick={() => Taro.navigateTo({ url: '/pages/create/index' })}
            >
              <Plus className="mr-1" size={14} color="#fbbf24" />
              <Text>发起约局</Text>
            </Button>
          </View>
        </View>

        {loading ? (
          <View className="text-center py-10">
            <Text className="text-yellow-200">加载中...</Text>
          </View>
        ) : rooms.length === 0 ? (
          <View className="text-center py-10">
            <Text className="text-yellow-200">暂无约局，快发起一个吧</Text>
          </View>
        ) : (
          rooms.map((room) => (
            <Card key={room.id} className="mb-3 bg-red-900 bg-opacity-50 border-yellow-500 border-opacity-30">
              <CardContent className="p-4">
                <View className="flex justify-between items-start">
                  <View className="flex-1">
                    <Text className="block text-lg font-bold text-yellow-500 mb-2">
                      {room.location}
                    </Text>
                    <View className="flex items-center gap-2 text-sm text-yellow-200 mb-1">
                      <Clock size={14} color="#fbbf24" />
                      <Text>{formatTime(room.start_time)}</Text>
                      {room.end_time && <Text> - {formatTime(room.end_time)}</Text>}
                    </View>
                    <View className="flex items-center gap-2 text-sm text-yellow-200">
                      <User size={14} color="#fbbf24" />
                      <Text>房主: {room.creator_name}</Text>
                    </View>
                    <View className="flex items-center gap-2 text-sm text-yellow-200 mt-1">
                      <Users size={14} color="#fbbf24" />
                      <Text>
                        {room.members?.length || 0}/4 人
                        {room.members?.length > 0 && (
                          <Text> · {room.members.map((m: { name: string }) => m.name).join('、')}</Text>
                        )}
                      </Text>
                    </View>
                  </View>
                  <View className="flex flex-col gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-yellow-500"
                      
                    >
                      <QrCode size={16} color="#fbbf24" />
                    </Button>
                    {userInfo && userInfo.openid === room.creator_id && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-red-400"
                      onClick={() => confirmDelete(room)}
                    >
                      <Trash2 size={16} color="#fbbf24" />
                    </Button>
                    )}
                  </View>
                </View>
                <View className="mt-3 flex gap-2">
                  <Button
                    size="sm"
                    className="flex-1 bg-yellow-500 text-red-950 hover:bg-yellow-400"
                    onClick={() => Taro.navigateTo({ url: `/pages/room/index?id=${room.id}` })}
                  >
                    <Text>进入房间</Text>
                  </Button>
                </View>
              </CardContent>
            </Card>
          ))
        )}
      </View>


      {/* 注册弹窗 */}
      {showRegisterModal && (
        <AlertDialog open={showRegisterModal} onOpenChange={setShowRegisterModal}>
          <AlertDialogContent className="bg-red-900 border-yellow-500">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-yellow-500">完善信息</AlertDialogTitle>
              <AlertDialogDescription className="text-yellow-200">
                请填写您的昵称完成注册
              </AlertDialogDescription>
            </AlertDialogHeader>
            <View className="py-4">
              <View className="mb-4">
                <Text className="block text-sm text-yellow-200 mb-1">昵称 *</Text>
                <View className="bg-red-950 rounded-lg px-3 py-2">
                  <Input
                    className="text-yellow-500"
                    placeholder="请输入昵称"
                    value={nickName}
                    onInput={(e: any) => setNickName(e.detail.value)}
                  />
                </View>
              </View>
              <View className="mb-4">
                <Text className="block text-sm text-yellow-200 mb-1">手机号</Text>
                <View className="bg-red-950 rounded-lg px-3 py-2">
                  <Input
                    className="text-yellow-500"
                    placeholder="请输入手机号（选填）"
                    type="number"
                    value={phone}
                    onInput={(e: any) => setPhone(e.detail.value)}
                  />
                </View>
              </View>
            </View>
            <AlertDialogFooter>
              <AlertDialogCancel
                className="border-yellow-500 text-yellow-500"
                onClick={() => {
                  setShowRegisterModal(false)
                  setNickName('')
                  setPhone('')
                }}
              >
                取消
              </AlertDialogCancel>
              <AlertDialogAction
                className="bg-yellow-500 text-red-950 hover:bg-yellow-400"
                onClick={handleRegister}
              >
                确认注册
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      {/* 删除确认弹窗 */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="bg-red-900 border-yellow-500">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-yellow-500">确认删除</AlertDialogTitle>
            <AlertDialogDescription className="text-yellow-200">
              确定要删除 {roomToDelete?.location} 吗？
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              className="border-yellow-500 text-yellow-500"
              onClick={() => setShowDeleteDialog(false)}
            >
              取消
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 text-white hover:bg-red-500"
              onClick={() => roomToDelete && handleDeleteRoom(roomToDelete)}
            >
              删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* 登出确认弹窗 */}
      <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <AlertDialogContent className="bg-red-900 border-yellow-500">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-yellow-500">确认登出</AlertDialogTitle>
            <AlertDialogDescription className="text-yellow-200">
              确定要退出登录吗？
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              className="border-yellow-500 text-yellow-500"
              onClick={() => setShowLogoutDialog(false)}
            >
              取消
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 text-white hover:bg-red-500"
              onClick={handleLogout}
            >
              确认登出
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </View>
  )
}
