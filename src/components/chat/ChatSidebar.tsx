import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, LogOut, User } from "lucide-react";
import { ChatRoom } from "@/hooks/useChat";
import { cn } from "@/lib/utils";
import { getUserRole } from "@/lib/getUserRole";

interface ChatSidebarProps {
  rooms: ChatRoom[];
  currentRoomId: string | null;
  onRoomSelect: (roomId: string) => void;
  onCreateRoom: (name: string, description: string) => Promise<void>;
  onSignOut: () => void;
  username: string;
  closeSidebar?: () => void; // 👈 utilisé pour bouton X et auto-fermeture
}

export const ChatSidebar = ({
  rooms,
  currentRoomId,
  onRoomSelect,
  onCreateRoom,
  onSignOut,
  username,
  closeSidebar,
}: ChatSidebarProps) => {
  const [newRoomName, setNewRoomName] = useState("");
  const [newRoomDescription, setNewRoomDescription] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    getUserRole().then(setRole);
  }, []);

  const handleCreateRoom = async () => {
    if (!newRoomName.trim()) return;

    setCreating(true);
    await onCreateRoom(newRoomName, newRoomDescription);
    setNewRoomName("");
    setNewRoomDescription("");
    setIsDialogOpen(false);
    setCreating(false);
  };

  return (
  
    <div className="w-full md:w-72 bg-sidebar flex flex-col h-screen md:border-r-2 md:border-red-600 overflow-y-auto">
      {/* Header fixé */}
      <div className="sticky top-0 z-10 p-4 border-b border-border flex justify-between items-center bg-sidebar">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 rounded-xl flex items-center justify-center overflow-hidden">
            <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
          </div>
          <div>
            <h1 className="font-display font-semibold text-foreground">ZP</h1>
            <p className="text-xs text-muted-foreground">🎯 Zone Parieurs</p>
          </div>
        </div>

        {/* Bouton X (mobile seulement) */}
        {closeSidebar && (
          <button
            onClick={closeSidebar}
            className="md:hidden text-muted-foreground hover:text-destructive"
          >
            ✕
          </button>
        )}
      </div>

      {/* Liste des salons */}
      <div className="flex-1 flex flex-col">
        <div className="p-4 flex items-center justify-between">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Salons
          </span>

          {/* Bouton + visible uniquement pour l’admin */}
          {role === "admin" && (
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
                    {creating ? "Création..." : "Créer le salon"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>

        <ScrollArea className="flex-1 px-2">
          <div className="space-y-1">
            {rooms.map((room) => (
              <button
                key={room.id}
                onClick={() => {
                  onRoomSelect(room.id);
                  // Ferme automatiquement la sidebar sur mobile
                  if (closeSidebar && window.innerWidth < 768) {
                    closeSidebar();
                  }
                }}
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

      {/* Section utilisateur */}
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
          <Button
            variant="ghost"
            size="icon"
            onClick={onSignOut}
            className="text-muted-foreground hover:text-destructive"
          >
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

