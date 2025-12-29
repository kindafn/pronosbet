import { Message } from '@/hooks/useChat';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
}

export const MessageBubble = ({ message, isOwn }: MessageBubbleProps) => {
  const username = message.username || 'Utilisateur';
  const time = format(new Date(message.created_at), 'HH:mm', { locale: fr });

  return (
    <div
      className={cn(
        "flex gap-2 animate-slide-up",
        isOwn ? "flex-row-reverse" : "flex-row"
      )}
    >
      {/* Avatar */}
      <div
        className={cn(
          "w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs sm:text-sm font-medium",
          isOwn ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
        )}
      >
        {username.charAt(0).toUpperCase()}
      </div>

      {/* Message Content */}
      <div className={cn("flex flex-col max-w-[60%] sm:max-w-[70%]", isOwn ? "items-end" : "items-start")}>
        <div className="flex items-center gap-1 sm:gap-2 mb-1">
          <span
            className={cn(
              "text-[10px] sm:text-xs font-medium",
              isOwn ? "text-primary" : "text-foreground"
            )}
          >
            {isOwn ? 'Vous' : username}
          </span>
          <span className="text-[10px] sm:text-xs text-muted-foreground">{time}</span>
        </div>
        <div
          className={cn(
            "px-2 sm:px-4 py-1 sm:py-2 rounded-xl sm:rounded-2xl",
            isOwn
              ? "bg-chat-sent text-primary-foreground rounded-tr-md"
              : "bg-chat-received text-secondary-foreground rounded-tl-md"
          )}
        >
          <p className="text-xs sm:text-sm whitespace-pre-wrap break-words leading-relaxed">
            {message.content}
          </p>
        </div>
      </div>
    </div>
  );
};

