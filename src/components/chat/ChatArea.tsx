import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Send, ChevronDown, Smile, Paperclip, Mic } from 'lucide-react';
import { Message, ChatRoom } from '@/hooks/useChat';
import { MessageBubble } from './MessageBubble';
import { supabase } from '@/integrations/supabase/client';

interface ChatAreaProps {
  room: ChatRoom | null;
  messages: Message[];
  loading: boolean;
  userId: string;
}

export const ChatArea = ({ room, messages, loading, userId }: ChatAreaProps) => {
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

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

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 1️⃣ Upload de la nouvelle image
    const { data, error } = await supabase.storage
      .from("chat-uploads")
      .upload(`images/${Date.now()}-${file.name}`, file);

    if (error) {
      console.error("Erreur upload:", error);
      return;
    }

    const publicUrl = supabase.storage
      .from("chat-uploads")
      .getPublicUrl(data.path).data.publicUrl;

    setSelectedImage(publicUrl);

    // 2️⃣ Vérifier combien d’images sont présentes
    const { data: files, error: listError } = await supabase.storage
      .from("chat-uploads")
      .list("images", { limit: 100, sortBy: { column: "created_at", order: "asc" } });

    if (listError) {
      console.error("Erreur list:", listError);
      return;
    }

    // 3️⃣ Si plus de 30 images → supprimer les plus anciennes
    if (files && files.length > 30) {
      const oldFiles = files.slice(0, files.length - 30); // garder les 30 plus récentes
      const pathsToRemove = oldFiles.map(f => `images/${f.name}`);

      const { error: removeError } = await supabase.storage
        .from("chat-uploads")
        .remove(pathsToRemove);

      if (removeError) {
        console.error("Erreur suppression:", removeError);
      } else {
        console.log("Anciennes images supprimées :", pathsToRemove);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const content = newMessage.trim();
    if ((!content && !selectedImage) || sending) return;

    setSending(true);
    try {
      const { data, error } = await supabase.from("messages").insert({
        content,
        image_url: selectedImage || null,
        user_id: userId,
        room_id: room?.id,
      });

      if (error) {
        console.error("Erreur Supabase insert :", error.message, error);
        throw error;
      }

      console.log("Message inséré :", data);

      setNewMessage('');
      setSelectedImage(null);
    } catch (err) {
      console.error("Erreur lors de l'envoi du message :", err);
    } finally {
      setSending(false);
      if (textareaRef.current) {
        textareaRef.current.style.height = '40px';
      }
      if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }
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
    <div className="flex flex-col h-[85vh] sm:h-[85vh] md:h-screen bg-background">
      {/* Header */}
      <div className="flex items-center px-4 py-5 bg-white border-b border-border">
        <h2 className="font-display font-semibold text-foreground">{room.name}</h2>
        {room.description && (
          <p className="ml-2 text-xs text-muted-foreground">{room.description}</p>
        )}
      </div>
      
      {/* Messages */}
      <div
        className="flex-1 overflow-y-auto overflow-x-hidden px-3 py-2 relative 
                   max-h-[calc(100vh-160px)] md:max-h-full bg-whatsapp text-white"
        ref={scrollRef}
      >
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

	<form onSubmit={handleSubmit} className="flex flex-col gap-2">
	  {/* Barre arrondie */}
	  <div className="flex items-center justify-between w-full max-w-md bg-muted/50 rounded-full px-3 py-2">
	    {/* Icône smile */}
	    <button type="button" className="text-muted-foreground hover:text-foreground">
	      <Smile className="w-5 h-5" />
	    </button>

	    {/* Textarea */}
	    <textarea
	      ref={textareaRef}
	      value={newMessage}
	      onChange={handleChange}
	      onKeyDown={handleKeyDown}
	      placeholder={`Message à ${room.name}`}
	      rows={1}
	      className="flex-1 resize-none bg-transparent outline-none text-sm leading-6 mx-2"
	      style={{ height: '40px' }}
	    />

	    {/* Upload */}
	    <input type="file" accept="image/*" className="hidden" id="chat-image-upload" onChange={handleFileChange} />
	    <label htmlFor="chat-image-upload" className="cursor-pointer text-muted-foreground hover:text-foreground">
	      <Paperclip className="w-5 h-5" />
	    </label>

	    {/* Bouton d’envoi */}
	    {(newMessage.trim().length > 0 || selectedImage) ? (
	      <Button type="submit" disabled={sending} className="ml-2 rounded-full px-3 h-9">
		<Send className="w-4 h-4" />
	      </Button>
	    ) : (
	      <Button type="button" className="ml-2 rounded-full px-3 h-9" aria-label="Micro">
		<Mic className="w-4 h-4" />
	      </Button>
	    )}
	  </div>

	  {/* Aperçu image + commentaire */}
	  {selectedImage && (
	    <div className="flex flex-col items-start mt-2 ml-2">
	      <img src={selectedImage} alt="preview" className="max-h-32 rounded-lg object-cover" />
	      {newMessage.trim().length > 0 && (
		<p className="text-sm text-muted-foreground mt-1">{newMessage}</p>
	      )}
	    </div>
	  )}
	</form>
      </div>
    </div>
  );
};

