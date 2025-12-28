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
  const [sidebarOpen, setSidebarOpen] = useState(false); // 👈 nouvel état pour mobile

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
      toast.error("Erreur lors de l'envoi du message");
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
    <div className="h-screen flex flex-col md:flex-row overflow-hidden">
      {/* Bouton mobile */}
      <div className="md:hidden flex justify-between items-center p-2 border-b">
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-xl">
          ☰
        </button>
        <span className="font-bold">Chat</span>
      </div>

      {/* Sidebar */}
      <div
      className={`fixed inset-y-0 left-0 w-64 bg-[hsl(var(--sidebar-background))] z-50 transform transition-transform duration-300 md:relative md:translate-x-0 ${ sidebarOpen ? "translate-x-0" : "-translate-x-full" }`}
      >
      
      <ChatSidebar
	  rooms={rooms}
	  currentRoomId={currentRoomId}
	  onRoomSelect={(roomId) => {
	    setCurrentRoomId(roomId);
	    if (window.innerWidth < 768) {
	      setSidebarOpen(false); // ferme automatiquement sur mobile
	    }
	  }}
	  onCreateRoom={handleCreateRoom}
	  onSignOut={handleSignOut}
	  username={username}
	  closeSidebar={() => setSidebarOpen(false)} // 👈 bouton X ferme la sidebar
	/>
      </div>

      {/* Zone de chat */}
      <div className="flex-1">
        <ChatArea
          room={currentRoom}
          messages={messages}
          loading={loading}
          userId={user?.id || ''}
          onSendMessage={handleSendMessage}
        />
      </div>
    </div>
  );
};

