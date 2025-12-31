import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Message {
  id: string;
  room_id: string;
  user_id: string;
  content: string;
  created_at: string;
  image_url?: string;   // <-- ajout pour gérer les images
  username?: string;
}

export interface ChatRoom {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
}

export const useChat = (roomId: string | null) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch chat rooms
  const fetchRooms = useCallback(async () => {
    const { data, error } = await supabase
      .from('chat_rooms')
      .select('*')
      .order('created_at', { ascending: true });

    if (!error && data) {
      setRooms(data);
    }
  }, []);

  // Fetch messages for a room
  const fetchMessages = useCallback(async () => {
    if (!roomId) return;

    setLoading(true);
    const { data: messagesData, error } = await supabase
      .from('messages')
      .select('*')   // <-- récupère aussi image_url
      .eq('room_id', roomId)
      .order('created_at', { ascending: true });

    if (!error && messagesData) {
      // Fetch profiles for all unique user_ids
      const userIds = [...new Set(messagesData.map(m => m.user_id))];
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('id, username')
        .in('id', userIds);

      const profilesMap = new Map(profilesData?.map(p => [p.id, p.username]) || []);

      const messagesWithUsernames = messagesData.map(msg => ({
        ...msg,
        username: profilesMap.get(msg.user_id) || 'Utilisateur'
      }));

      setMessages(messagesWithUsernames);
    }
    setLoading(false);
  }, [roomId]);

  // Send a message (texte + image)
  const sendMessage = async (content: string, userId: string, imageUrl?: string) => {
    if (!roomId || (!content.trim() && !imageUrl)) return;

    const { error } = await supabase
      .from('messages')
      .insert({
        room_id: roomId,
        user_id: userId,
        content: content.trim(),
        image_url: imageUrl || null   // <-- ajout image
      });

    return { error };
  };

  // Create a new room
  const createRoom = async (name: string, description: string, userId: string) => {
    const { data, error } = await supabase
      .from('chat_rooms')
      .insert({
        name,
        description,
        created_by: userId
      })
      .select()
      .single();

    if (!error && data) {
      await fetchRooms();
    }

    return { data, error };
  };

  // Initial fetch
  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  // Real-time subscription
  useEffect(() => {
    if (!roomId) return;

    const channel = supabase
      .channel(`room-${roomId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `room_id=eq.${roomId}`
        },
        async (payload) => {
          // Fetch the username for the new message
          const { data: profileData } = await supabase
            .from('profiles')
            .select('username')
            .eq('id', payload.new.user_id)
            .single();

          const newMessage: Message = {
            id: payload.new.id,
            room_id: payload.new.room_id,
            user_id: payload.new.user_id,
            content: payload.new.content,
            created_at: payload.new.created_at,
            image_url: payload.new.image_url || null,   // <-- ajout image
            username: profileData?.username || 'Utilisateur'
          };

          setMessages(prev => [...prev, newMessage]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomId]);

  return {
    messages,
    rooms,
    loading,
    sendMessage,
    createRoom,
    fetchRooms
  };
};

