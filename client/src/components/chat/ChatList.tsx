import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Loader2, MessageCircle } from "lucide-react";

interface Chat {
  propertyId: number;
  userId: number;
  propertyTitle: string;
  lastMessage: string;
  unreadCount: number;
}

interface ChatListProps {
  onChatSelect: (propertyId: number, userId: number, propertyTitle: string) => void;
  selectedChat?: { propertyId: number; userId: number };
}

export function ChatList({ onChatSelect, selectedChat }: ChatListProps) {
  const { user } = useAuth();

  // Fetch della lista delle chat
  const { data: chats, isLoading, error } = useQuery<Chat[]>({
    queryKey: ["/api/chats"],
    queryFn: async () => {
      if (!user) throw new Error("Utente non autenticato");
      const res = await apiRequest("GET", "/api/chats");
      return await res.json();
    },
    enabled: !!user, // Esegui solo se l'utente è autenticato
  });

  if (isLoading) {
    return (
      <div className="p-4 h-full flex items-center justify-center">
        <Loader2 className="h-10 w-10 text-primary animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-center text-red-500">
        <p>Errore nel caricamento delle chat</p>
        <p className="text-sm">{(error as Error).message}</p>
      </div>
    );
  }

  if (!chats?.length) {
    return (
      <div className="p-8 text-center text-neutral-500">
        <MessageCircle className="h-12 w-12 mx-auto mb-4 text-neutral-300" />
        <h3 className="text-lg font-semibold mb-2">Nessuna chat</h3>
        <p>
          Inizia a chattare con i proprietari degli annunci che ti interessano!
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-y-auto h-full">
      {chats.map((chat) => (
        <div
          key={`${chat.propertyId}-${chat.userId}`}
          className={cn(
            "p-4 border-b border-neutral-100 cursor-pointer hover:bg-neutral-50 transition-colors",
            selectedChat &&
              selectedChat.propertyId === chat.propertyId &&
              selectedChat.userId === chat.userId &&
              "bg-primary/5"
          )}
          onClick={() => onChatSelect(chat.propertyId, chat.userId, chat.propertyTitle)}
        >
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage
                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                  chat.propertyTitle
                )}&background=6a0dad&color=fff`}
              />
              <AvatarFallback>
                {chat.propertyTitle.substring(0, 2)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-start">
                <h3 className="font-montserrat font-semibold text-sm truncate">
                  {chat.propertyTitle}
                </h3>
                {chat.unreadCount > 0 && (
                  <Badge variant="default" className="ml-2 bg-accent">
                    {chat.unreadCount}
                  </Badge>
                )}
              </div>
              <p className="text-xs text-neutral-500 truncate mt-1">
                {chat.lastMessage || "Nessun messaggio"}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}