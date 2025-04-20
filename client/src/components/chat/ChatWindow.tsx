import { useState, useEffect, useRef, FormEvent } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Send, Info } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { it } from "date-fns/locale";

interface Message {
  id: number;
  propertyId: number;
  senderId: number;
  receiverId: number;
  content: string;
  createdAt: string;
  isRead: boolean;
}

interface ChatWindowProps {
  propertyId: number;
  userId: number;
  propertyTitle: string;
}

export function ChatWindow({ propertyId, userId, propertyTitle }: ChatWindowProps) {
  const { user } = useAuth();
  const [newMessage, setNewMessage] = useState("");
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // WebSocket connection
  useEffect(() => {
    if (!user) return;

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log("WebSocket connected");
      // Autenticazione con l'id utente
      ws.send(JSON.stringify({ type: "auth", userId: user.id }));
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        if (data.type === "new_message") {
          // Controlla se il messaggio appartiene a questa chat
          if (
            data.message.propertyId === propertyId &&
            ((data.message.senderId === user.id && data.message.receiverId === userId) ||
             (data.message.senderId === userId && data.message.receiverId === user.id))
          ) {
            // Aggiorna la query dei messaggi
            queryClient.setQueryData(
              [`/api/messages/${propertyId}/${userId}`],
              (oldData: Message[] | undefined) => {
                if (!oldData) return [data.message];
                return [...oldData, data.message];
              }
            );
            
            // Se il messaggio è da un altro utente, mostra una notifica
            if (data.message.senderId !== user.id) {
              toast({
                title: "Nuovo messaggio",
                description: `Hai ricevuto un nuovo messaggio per "${propertyTitle}"`,
              });
            }
          }
          
          // Aggiorna la lista delle chat
          queryClient.invalidateQueries({ queryKey: ["/api/chats"] });
        }
      } catch (error) {
        console.error("Error parsing WebSocket message:", error);
      }
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    ws.onclose = () => {
      console.log("WebSocket disconnected");
    };

    setSocket(ws);

    return () => {
      ws.close();
    };
  }, [user, propertyId, userId, propertyTitle, queryClient, toast]);

  // Fetch dei messaggi
  const { data: messages, isLoading, error } = useQuery<Message[]>({
    queryKey: [`/api/messages/${propertyId}/${userId}`],
    queryFn: async () => {
      if (!user) throw new Error("Utente non autenticato");
      const res = await apiRequest("GET", `/api/messages/${propertyId}/${userId}`);
      return await res.json();
    },
    enabled: !!user && !!propertyId && !!userId,
  });

  // Scroll automatico ai messaggi più recenti
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Invio di un nuovo messaggio
  const handleSendMessage = (e: FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !user) return;

    // Invio tramite WebSocket
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(
        JSON.stringify({
          type: "message",
          propertyId,
          senderId: user.id,
          receiverId: userId,
          content: newMessage,
        })
      );
    } else {
      // Fallback: invio tramite API REST
      apiRequest("POST", "/api/messages", {
        propertyId,
        receiverId: userId,
        content: newMessage,
      })
        .then((res) => res.json())
        .then((message) => {
          // Aggiorna la query dei messaggi
          queryClient.setQueryData(
            [`/api/messages/${propertyId}/${userId}`],
            (oldData: Message[] | undefined) => {
              if (!oldData) return [message];
              return [...oldData, message];
            }
          );
          // Aggiorna la lista delle chat
          queryClient.invalidateQueries({ queryKey: ["/api/chats"] });
        })
        .catch((error) => {
          toast({
            title: "Errore",
            description: "Impossibile inviare il messaggio",
            variant: "destructive",
          });
        });
    }

    setNewMessage("");
  };

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-red-500 p-4">
        <Info className="h-8 w-8 mb-2" />
        <p>Errore nel caricamento dei messaggi</p>
        <p className="text-sm">{(error as Error).message}</p>
      </div>
    );
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="py-3 px-4 border-b">
        <CardTitle className="text-lg font-montserrat flex items-center">
          <Avatar className="h-8 w-8 mr-2">
            <AvatarImage
              src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                propertyTitle
              )}&background=6a0dad&color=fff`}
            />
            <AvatarFallback>{propertyTitle.substring(0, 2)}</AvatarFallback>
          </Avatar>
          {propertyTitle}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto p-4 flex flex-col space-y-4">
        {messages && messages.length > 0 ? (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.senderId === user?.id ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[70%] rounded-lg p-3 ${
                  message.senderId === user?.id
                    ? "bg-primary text-white"
                    : "bg-neutral-100"
                }`}
              >
                <p className="text-sm">{message.content}</p>
                <p
                  className={`text-xs mt-1 ${
                    message.senderId === user?.id
                      ? "text-primary-foreground/70"
                      : "text-neutral-500"
                  }`}
                >
                  {formatDistanceToNow(new Date(message.createdAt), {
                    addSuffix: true,
                    locale: it,
                  })}
                </p>
              </div>
            </div>
          ))
        ) : (
          <div className="flex-1 flex items-center justify-center text-neutral-400 text-center">
            <div>
              <p>Nessun messaggio</p>
              <p className="text-sm mt-1">
                Inizia la conversazione con un messaggio!
              </p>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </CardContent>
      <div className="p-3 border-t">
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <Input
            type="text"
            placeholder="Scrivi un messaggio..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="flex-1"
          />
          <Button type="submit" disabled={!newMessage.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </Card>
  );
}