import { Injectable } from '@nestjs/common';
import { getSupabaseClient } from '@/storage/database/supabase-client';

export interface Member {
  id: string;
  nick_name: string;

}

export interface Room {
  id: number;
  room_code: string;
  location: string;
  start_time: string;
  end_time: string | null;
  creator_name: string;
  creator_id: string;
  members: Member[];
  is_permanent: boolean;
  created_at: string;
}

@Injectable()
export class RoomService {
  private supabase = getSupabaseClient();

  async findAll(): Promise<Room[]> {
    const { data, error } = await this.supabase
      .from('rooms')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('查询所有房间失败:', error);
      return [];
    }

    return data || [];
  }

  async findById(id: number): Promise<Room | null> {
    const { data, error } = await this.supabase
      .from('rooms')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('查询房间失败:', error);
      return null;
    }

    return data;
  }

  async create(roomData: Partial<Room>): Promise<Room> {
    const { data, error } = await this.supabase
      .from('rooms')
      .insert([roomData])
      .select()
      .single();

    if (error) {
      console.error('创建房间失败:', error);
      throw new Error(`创建房间失败: ${error.message}`);
    }

    return data;
  }

  async joinRoom(roomId: number, member: Member): Promise<Room> {
    
    
    const room = await this.findById(roomId);
    if (!room) {
      throw new Error('房间不存在');
    }
    const existingMember = room.members?.find(m => m.id === member.id);
    console.log(existingMember)
    if (existingMember) {
      throw new Error('已在房间中');
    }
    if (room.members && room.members.length >= 4) {
      throw new Error('房间人数已满');
    }
    const updatedMembers = [...(room.members || []), member];
    const { data, error } = await this.supabase
      .from('rooms')
      .update({ members: updatedMembers })
      .eq('id', roomId)
      .select()
      .single();

    if (error) {
      console.error('加入房间失败:', error);
      throw new Error(`加入房间失败: ${error.message}`);
    }

    // 检查是否满员（第4人加入），发送通知给房主
    if (updatedMembers.length === 4) {
      console.log(`房间 ${roomId} 已满员，向房主 ${room.creator_id} 发送通知`);
      await this.createNotification({
        user_id: room.creator_id,
        type: 'room_full',
        title: '房间已满员',
        message: `您的房间"${room.location || '麻将约局'}"已满4人，可以开始游戏了！`,
        room_id: roomId,
      });
    }

    return data;
  }

  private async createNotification(notification: {
    user_id: string;
    type: string;
    title: string;
    message: string;
    room_id: number;
  }): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('notifications')
        .insert({
          user_id: notification.user_id,
          type: notification.type,
          title: notification.title,
          message: notification.message,
          room_id: notification.room_id,
          is_read: false,
        });
      if (error) {
        console.error('创建通知失败:', error);
      }
    } catch (err) {
      console.error('创建通知异常:', err);
    }
  }

  async leaveRoom(roomId: number, member_id: string): Promise<Room> {
    const room = await this.findById(roomId);
    if (!room) {
      throw new Error('房间不存在');
    }

    const updatedMembers = (room.members || []).filter(m => m.id !== member_id);

    const { data, error } = await this.supabase
      .from('rooms')
      .update({ members: updatedMembers })
      .eq('id', roomId)
      .select()
      .single();

    if (error) {
      console.error('退出房间失败:', error);
      throw new Error(`退出房间失败: ${error.message}`);
    }

    return data;
  }

  async delete(id: number): Promise<void> {
    const { error } = await this.supabase
      .from('rooms')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('删除房间失败:', error);
      throw new Error(`删除房间失败: ${error.message}`);
    }
  }

  async removeMember(roomId: number, userId: string): Promise<Room> {
    return this.leaveRoom(roomId, userId);
  }

  async getNotifications(userId: string): Promise<any[]> {
    const { data, error } = await this.supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .eq('is_read', false)
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) {
      console.error('获取通知失败:', error);
      return [];
    }
    return data || [];
  }

  async markNotificationRead(id: number): Promise<void> {
    const { error } = await this.supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', id);

    if (error) {
      console.error('标记通知已读失败:', error);
    }
  }
}
