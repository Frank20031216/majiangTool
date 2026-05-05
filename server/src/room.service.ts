import { Injectable } from '@nestjs/common';
import { getSupabaseClient } from '@/storage/database/supabase-client';

export interface Member {
  id: string;
  name: string;
  joinedAt: string;
}

export interface RoomData {
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

  async getAllRooms(): Promise<RoomData[]> {
    const { data, error } = await this.supabase
      .from('rooms')
      .select('*')
      .order('start_time', { ascending: true });
    if (error) throw new Error(`获取房间列表失败: ${error.message}`);
    return data || [];
  }

  async getRoomById(id: number): Promise<RoomData | null> {
    const { data, error } = await this.supabase
      .from('rooms')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    if (error) throw new Error(`获取房间失败: ${error.message}`);
    return data;
  }

  async getRoomByCode(roomCode: string): Promise<RoomData | null> {
    const { data, error } = await this.supabase
      .from('rooms')
      .select('*')
      .eq('room_code', roomCode)
      .maybeSingle();
    if (error) throw new Error(`获取房间失败: ${error.message}`);
    return data;
  }

  private generateRoomCode(): string {
    // 使用时间戳后6位 + 随机2位，格式如: 05051423
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 100).toString().padStart(2, '0');
    return timestamp + random;
  }

  async createRoom(room: Omit<RoomData, 'id' | 'created_at'>): Promise<RoomData> {
    // 使用时间戳生成房间号
    const roomCode = this.generateRoomCode();
    console.log(`新建房间号:${roomCode}`);
    const { data, error } = await this.supabase
      .from('rooms')
      .insert({
        room_code: roomCode,
        location: room.location,
        start_time: room.start_time,
        end_time: room.end_time,
        creator_name: room.creator_name,
        creator_id: room.creator_id,
        members: room.members,
        is_permanent: room.is_permanent,
      })
      .select()
      .single();
    if (error) throw new Error(`创建房间失败: ${error.message}`);
    return data;
  }

  async joinRoom(roomId: number, member: Member): Promise<RoomData> {
    const room = await this.getRoomById(roomId);
    if (!room) throw new Error('房间不存在');

    if (room.members.length >= 4) {
      throw new Error('房间人数已满');
    }

    const exists = room.members.some((m) => m.id === member.id);
    if (exists) throw new Error('您已加入该房间');

    const updatedMembers = [...room.members, member];
    const { data, error } = await this.supabase
      .from('rooms')
      .update({ members: updatedMembers })
      .eq('id', roomId)
      .select()
      .single();
    if (error) throw new Error(`加入房间失败: ${error.message}`);
    return data;
  }

  async leaveRoom(roomId: number, memberId: string): Promise<RoomData> {
    const room = await this.getRoomById(roomId);
    if (!room) throw new Error('房间不存在');

    const updatedMembers = room.members.filter((m) => m.id !== memberId);
    const { data, error } = await this.supabase
      .from('rooms')
      .update({ members: updatedMembers })
      .eq('id', roomId)
      .select()
      .single();
    if (error) throw new Error(`退出房间失败: ${error.message}`);
    return data;
  }

  async deleteRoom(roomId: number, creatorId?: string): Promise<void> {
    const room = await this.getRoomById(roomId);
    if (!room) throw new Error('房间不存在');

    // 小程序场景下，直接信任删除请求
    if (room.is_permanent) {
      throw new Error('系统房间无法删除');
    }

    const { error } = await this.supabase.from('rooms').delete().eq('id', roomId);
    if (error) throw new Error(`删除房间失败: ${error.message}`);
  }

  async removeMember(roomId: number, memberId: string, creatorId?: string): Promise<RoomData> {
    const room = await this.getRoomById(roomId);
    if (!room) throw new Error('房间不存在');

    // 小程序场景下，直接信任移除请求
    if (memberId === room.creator_id) {
      throw new Error('无法移除房主');
    }

    const updatedMembers = room.members.filter((m) => m.id !== memberId);
    const { data, error } = await this.supabase
      .from('rooms')
      .update({ members: updatedMembers })
      .eq('id', roomId)
      .select()
      .single();
    if (error) throw new Error(`移除成员失败: ${error.message}`);
    return data;
  }

  async initPermanentRooms(): Promise<void> {
    const existing = await this.getAllRooms();
    const permanentRooms = existing.filter((r) => r.is_permanent);

    if (permanentRooms.length > 0) {
      return;
    }

    const now = new Date();
    const currentDay = now.getDay();
    const fridayIndex = 5 - currentDay;
    const saturdayIndex = 6 - currentDay;
    const sundayIndex = 0 - currentDay;

    const friday = new Date(now);
    friday.setDate(now.getDate() + fridayIndex);
    const saturday = new Date(now);
    saturday.setDate(now.getDate() + saturdayIndex);
    const sunday = new Date(now);
    sunday.setDate(now.getDate() + sundayIndex);

    const rooms = [
      {
        room_code: this.generateRoomCode(),
        location: '棋牌室A',
        start_time: new Date(friday.setHours(14, 0, 0, 0)).toISOString(),
        end_time: new Date(friday.setHours(18, 0, 0, 0)).toISOString(),
        creator_name: '系统',
        creator_id: 'system',
        members: [],
        is_permanent: true,
      },
      {
        room_code: this.generateRoomCode(),
        location: '棋牌室B',
        start_time: new Date(saturday.setHours(14, 0, 0, 0)).toISOString(),
        end_time: new Date(saturday.setHours(18, 0, 0, 0)).toISOString(),
        creator_name: '系统',
        creator_id: 'system',
        members: [],
        is_permanent: true,
      },
      {
        room_code: this.generateRoomCode(),
        location: '棋牌室C',
        start_time: new Date(sunday.setHours(14, 0, 0, 0)).toISOString(),
        end_time: new Date(sunday.setHours(18, 0, 0, 0)).toISOString(),
        creator_name: '系统',
        creator_id: 'system',
        members: [],
        is_permanent: true,
      },
    ];

    for (const room of rooms) {
      await this.createRoom(room);
    }
  }

}
