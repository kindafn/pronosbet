import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input"; // ton composant générique
import { Smile, Paperclip, Send } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface ChatInputProps {
  roomName: string;
  onSendMessage: (content: string, imageUrl?: string) => Promise<void>;
}

export const ChatInput = ({ roomName, onSendMessage }: ChatInputProps) => {
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

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

    // Envoie un message vide avec image
    await onSendMessage("", publicUrl);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    setSending(true);
    await onSendMessage(newMessage.trim());
    setNewMessage("");
    setSending(false);
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-end gap-2 px-2 py-2 bg-white border-t border-border">
      {/* Zone texte */}
      <div className="flex items-center gap-2 w-full max-w-md bg-muted/50 rounded-full px-3 py-2">
        <button type="button" className="text-muted-foreground hover:text-foreground">
          <Smile className="w-5 h-5" />
        </button>

        <textarea
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder={`Message à ${roomName}`}
          rows={1}
          className="flex-1 resize-none bg-transparent outline-none text-sm leading-6 max-h-[120px]"
          style={{ height: "40px" }}
        />

        {/* Upload image */}
        <Input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden" // caché, tu peux le déclencher avec Paperclip
          id="chat-image-upload"
        />
        <label htmlFor="chat-image-upload" className="cursor-pointer text-muted-foreground hover:text-foreground">
          <Paperclip className="w-5 h-5" />
        </label>
      </div>

      {/* Bouton envoyer */}
      {newMessage.trim().length > 0 ? (
        <Button type="submit" disabled={sending} className="rounded-full px-4 h-10">
          <Send className="w-5 h-5" />
        </Button>
      ) : null}
    </form>
  );
};

