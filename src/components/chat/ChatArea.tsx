import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Hash } from 'lucide-react';
import { Message, ChatRoom } from '@/hooks/useChat';
import { MessageBubble } from './MessageBubble';

interface ChatAreaProps {
  room: ChatRoom | null;
  messages: Message[];
  loading: boolean;
  userId: string;
  onSendMessage: (content: string) => Promise<void>;
}

export const ChatArea = ({ room, messages, loading, userId, onSendMessage }: ChatAreaProps) => {
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    setSending(true);
    await onSendMessage(newMessage);
    setNewMessage('');
    setSending(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  if (!room) {
    return (
      <div className="flex-1 flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-4">
            	<img
		  src="/logo.png"
		  alt="Logo"
		  className="w-8 h-8 object-contain"
		/>
          </div>
          <h2 className="font-display text-xl text-foreground mb-2">Sélectionnez un salon</h2>
          <p className="text-muted-foreground text-sm">Choisissez un salon pour commencer à discuter</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-background">
      {/* Header */}
      <div className="h-16 border-b border-border flex items-center px-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
            	<img
		  src="/logo.png"
		  alt="Logo"
		  className="w-5 h-5 object-contain"
		/>

          </div>
          <div>
            <h2 className="font-display font-semibold text-foreground">{room.name}</h2>
            {room.description && (
              <p className="text-xs text-muted-foreground">{room.description}</p>
            )}
          </div>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-6" ref={scrollRef}>
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <p className="text-muted-foreground">Aucun message pour l'instant</p>
              <p className="text-sm text-muted-foreground mt-1">Soyez le premier à écrire !</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message) => (
              <MessageBubble
                key={message.id}
                message={message}
                isOwn={message.user_id === userId}
              />
            ))}
          </div>
        )}
      </ScrollArea>

      {/* Input */}
      <div className="p-4 border-t border-border">
        <form onSubmit={handleSubmit} className="flex gap-3">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Envoyer un message dans ${room.name}...`}
            className="flex-1"
            disabled={sending}
          />
          <Button type="submit" disabled={sending || !newMessage.trim()}>
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </div>
  );
};
