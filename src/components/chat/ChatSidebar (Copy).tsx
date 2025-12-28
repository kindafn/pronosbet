import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { MessageCircle, Plus, Hash, LogOut, User } from 'lucide-react';
import { ChatRoom } from '@/hooks/useChat';
import { cn } from '@/lib/utils';


interface ChatSidebarProps {
  rooms: ChatRoom[];
  currentRoomId: string | null;
  onRoomSelect: (roomId: string) => void;
  onCreateRoom: (name: string, description: string) => Promise<void>;
  onSignOut: () => void;
  username: string;
}

export const ChatSidebar = ({
  rooms,
  currentRoomId,
  onRoomSelect,
  onCreateRoom,
  onSignOut,
  username
}: ChatSidebarProps) => {
  const [newRoomName, setNewRoomName] = useState('');
  const [newRoomDescription, setNewRoomDescription] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  
  

  const handleCreateRoom = async () => {
    if (!newRoomName.trim()) return;
    
    setCreating(true);
    await onCreateRoom(newRoomName, newRoomDescription);
    setNewRoomName('');
    setNewRoomDescription('');
    setIsDialogOpen(false);
    setCreating(false);
  };

  return (
    <div className="w-72 bg-sidebar border-r border-border flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center overflow-hidden">
  		<img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
	  </div>
	  <div>
  		<h1 className="font-display font-semibold text-foreground">iPP</h1>
  		<p className="text-xs text-muted-foreground">international Public Pronostic</p>
	  </div>
        </div>
      </div>

      {/* Rooms List */}
      <div className="flex-1 flex flex-col">
        <div className="p-4 flex items-center justify-between">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Salons
          </span>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon" className="h-6 w-6">
                <Plus className="w-4 h-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Créer un nouveau salon</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="room-name">Nom du salon</Label>
                  <Input
                    id="room-name"
                    placeholder="ex: Projets"
                    value={newRoomName}
                    onChange={(e) => setNewRoomName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="room-desc">Description (optionnel)</Label>
                  <Textarea
                    id="room-desc"
                    placeholder="À propos de ce salon..."
                    value={newRoomDescription}
                    onChange={(e) => setNewRoomDescription(e.target.value)}
                    rows={3}
                  />
                </div>
                <Button 
                  onClick={handleCreateRoom} 
                  className="w-full"
                  disabled={creating || !newRoomName.trim()}
                >
                  {creating ? 'Création...' : 'Créer le salon'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>


        <ScrollArea className="flex-1 px-2">
          <div className="space-y-1">
		  {rooms.map((room) => (
		  <button
		    key={room.id}
		    onClick={() => onRoomSelect(room.id)}
		    className={cn(
		      "w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left transition-colors",
		      currentRoomId === room.id
			? "bg-primary/10 text-primary"
			: "text-foreground hover:bg-muted"
		    )}
		  >
		    <img
		      src="/logo.png"
		      alt="Logo"
		      className="w-4 h-4 flex-shrink-0 object-contain"
		    />
		    <span className="truncate text-sm font-medium">{room.name}</span>
		  </button>
		))}
          </div>
        </ScrollArea>
      </div>
           

      {/* User Section */}
      <div className="p-4 border-t border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{username}</p>
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 bg-online rounded-full animate-pulse-dot" />
                <span className="text-xs text-muted-foreground">En ligne</span>
              </div>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onSignOut} className="text-muted-foreground hover:text-destructive">
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
  
};
