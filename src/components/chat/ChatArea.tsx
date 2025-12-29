import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Send, ChevronDown, Smile, Paperclip, Mic } from 'lucide-react';
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
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Scroll vers le bas quand les messages changent
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Scroll vers le bas quand l'input est focus (clavier ouvert)
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;

    const handleFocus = () => {
      if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }
    };

    el.addEventListener('focus', handleFocus);
    return () => el.removeEventListener('focus', handleFocus);
  }, []);

  const autoResizeTextarea = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = '0px';
    const next = Math.min(el.scrollHeight, 120); // max 4 lignes
    el.style.height = `${next}px`;
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNewMessage(e.target.value);
    autoResizeTextarea();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void handleSubmit(e as unknown as React.FormEvent);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const content = newMessage.trim();
    if (!content || sending) return;

    setSending(true);
    await onSendMessage(content);
    setNewMessage('');
    setSending(false);

    // Reset hauteur du textarea
    const el = textareaRef.current;
    if (el) {
      el.style.height = '40px';
    }

    // Scroll en bas
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  };

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  };

  if (!room) {
    return (
      <div className="flex-1 flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-4">
            <img src="/logo.png" alt="Logo" className="w-8 h-8 object-contain" />
          </div>
          <h2 className="font-display text-xl text-foreground mb-2">Sélectionnez un salon</h2>
          <p className="text-muted-foreground text-sm">Choisissez un salon pour commencer à discuter</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <div className="flex items-center px-4 py-2 bg-white border-b border-border">
        <h2 className="font-display font-semibold text-foreground">{room.name}</h2>
        {room.description && (
          <p className="ml-2 text-xs text-muted-foreground">{room.description}</p>
        )}
      </div>
      
     {/* Messages */}
	<div
	
	 className="flex-1 overflow-y-auto overflow-x-hidden px-3 py-2 relative 
                max-h-[calc(100vh-160px)] md:max-h-full bg-whatsapp text-white"
     	ref={scrollRef}>

	  {loading ? (
	    <div className="flex items-center justify-center h-full">
	      <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
	    </div>
	  ) : messages.length === 0 ? (
	    <div className="flex items-center justify-center h-full">
	      <p className="text-muted-foreground text-xs sm:text-sm">
		Aucun message pour l'instant
	      </p>
	    </div>
	  ) : (
	    <>
	      {messages.map((message) => (
		<MessageBubble
		  key={message.id}
		  message={message}
		  isOwn={message.user_id === userId}
		/>
	      ))}

            {/* Flèche vers le bas */}
            <button
              onClick={scrollToBottom}
              className="absolute bottom-4 right-4 bg-primary text-white rounded-full p-3 shadow-lg hover:bg-primary/80 transition"
              aria-label="Scroll to bottom"
            >
              <ChevronDown className="w-5 h-5" />
            </button>
          </>
        )}
      </div>

      {/* Barre d'entrée */}
      <div className="px-2 py-2 bg-white border-t border-border">
        <form onSubmit={handleSubmit} className="flex items-end gap-2 justify-center">
          <div className="flex items-center gap-2 w-full max-w-md bg-muted/50 rounded-full px-3 py-2">
            <button type="button" className="text-muted-foreground hover:text-foreground">
              <Smile className="w-5 h-5" />
            </button>

            <textarea
              ref={textareaRef}
              value={newMessage}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              placeholder={`Message à ${room.name}`}
              rows={1}
              className="flex-1 resize-none bg-transparent outline-none text-sm leading-6 max-h-[120px]"
              style={{ height: '40px' }}
              
            />

            <button type="button" className="text-muted-foreground hover:text-foreground">
              <Paperclip className="w-5 h-5" />
            </button>
          </div>

          {newMessage.trim().length > 0 ? (
            <Button type="submit" disabled={sending} className="rounded-full px-4 h-10">
              <Send className="w-5 h-5" />
            </Button>
          ) : (
            <Button type="button" className="rounded-full px-4 h-10" aria-label="Micro">
              <Mic className="w-5 h-5" />
            </Button>
          )}
        </form>
      </div>
    </div>
  );
};

