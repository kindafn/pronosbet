import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useChat } from '@/hooks/useChat';
import { ChatSidebar } from './ChatSidebar';
import { ChatArea } from './ChatArea';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

export const ChatLayout = () => {
  const { user, signOut } = useAuth();
  const [currentRoomId, setCurrentRoomId] = useState<string | null>(null);
  const [username, setUsername] = useState('Utilisateur');
  const { messages, rooms, loading, sendMessage, createRoom } = useChat(currentRoomId);

  // Fetch user profile
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user?.id) return;

      const { data } = await supabase
        .from('profiles')
        .select('username')
        .eq('id', user.id)
        .single();

      if (data?.username) {
        setUsername(data.username);
      }
    };

    fetchProfile();
  }, [user?.id]);

  // Auto-select first room
  useEffect(() => {
    if (rooms.length > 0 && !currentRoomId) {
      setCurrentRoomId(rooms[0].id);
    }
  }, [rooms, currentRoomId]);

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      toast.error('Erreur lors de la déconnexion');
    }
  };

  const handleSendMessage = async (content: string) => {
    if (!user?.id) return;
    const { error } = await sendMessage(content, user.id);
    if (error) {
      toast.error('Erreur lors de l\'envoi du message');
    }
  };

  const handleCreateRoom = async (name: string, description: string) => {
    if (!user?.id) return;
    const { error } = await createRoom(name, description, user.id);
    if (error) {
      toast.error('Erreur lors de la création du salon');
    } else {
      toast.success('Salon créé !');
    }
  };

  const currentRoom = rooms.find(r => r.id === currentRoomId) || null;

  return (
    <div className="h-screen flex overflow-hidden">
      <ChatSidebar
        rooms={rooms}
        currentRoomId={currentRoomId}
        onRoomSelect={setCurrentRoomId}
        onCreateRoom={handleCreateRoom}
        onSignOut={handleSignOut}
        username={username}
      />
      <ChatArea
        room={currentRoom}
        messages={messages}
        loading={loading}
        userId={user?.id || ''}
        onSendMessage={handleSendMessage}
      />
    </div>
  );
};
