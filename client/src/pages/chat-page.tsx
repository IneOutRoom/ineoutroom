import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Navbar } from "@/components/layout/navbar";
import { ChatList } from "@/components/chat/ChatList";
import { ChatWindow } from "@/components/chat/ChatWindow";
import { Loader2, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Redirect } from "wouter";

export default function ChatPage() {
  const { user, isLoading } = useAuth();
  const [selectedChat, setSelectedChat] = useState<{
    propertyId: number;
    userId: number;
    propertyTitle: string;
  } | null>(null);

  // Gestione dello stato di caricamento
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="bg-[#6a0dad]/10 p-4 rounded-full">
          <Loader2 className="w-12 h-12 animate-spin text-[#6a0dad]" />
        </div>
        <p className="mt-4 text-neutral-600 font-medium">Caricamento...</p>
      </div>
    );
  }

  // Redirect se non autenticato
  if (!user) {
    return <Redirect to="/auth" />;
  }

  const handleChatSelect = (propertyId: number, userId: number, propertyTitle: string) => {
    setSelectedChat({ propertyId, userId, propertyTitle });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      {/* Banner header */}
      <div className="bg-gradient-to-r from-[#6a0dad]/90 to-[#6a0dad]/70 py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold text-white" style={{ textShadow: "2px 2px 4px rgba(0,0,0,0.3)" }}>
            Le tue conversazioni
          </h1>
          <p className="text-white/80 mt-2 max-w-2xl">
            Comunica direttamente con proprietari e inquilini per organizzare visite e dettagli
          </p>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-8 flex-1 flex flex-col">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden flex-1 flex flex-col md:flex-row border border-gray-100">
          {/* Lista delle chat */}
          <div className="w-full md:w-1/3 border-r border-neutral-100">
            <div className="p-4 bg-gradient-to-r from-[#6a0dad]/10 to-transparent border-b border-neutral-100">
              <h2 className="font-semibold text-[#6a0dad]">Conversazioni recenti</h2>
            </div>
            <ChatList 
              onChatSelect={(propertyId, userId, propertyTitle) => 
                handleChatSelect(propertyId, userId, propertyTitle)
              }
              selectedChat={selectedChat ?? undefined}
            />
          </div>
          
          {/* Finestra di chat */}
          <div className="w-full md:w-2/3 flex flex-col">
            {selectedChat ? (
              <ChatWindow
                propertyId={selectedChat.propertyId}
                userId={selectedChat.userId}
                propertyTitle={selectedChat.propertyTitle}
              />
            ) : (
              <div className="h-full flex flex-col items-center justify-center p-8 text-center">
                <div className="bg-[#6a0dad]/10 rounded-full p-6 w-24 h-24 flex items-center justify-center mb-6">
                  <MessageSquare className="h-10 w-10 text-[#6a0dad]" />
                </div>
                <h2 className="text-xl font-semibold mb-2 text-gray-800">Nessuna chat selezionata</h2>
                <p className="max-w-md text-gray-600">
                  Seleziona una chat dalla lista per visualizzare la conversazione o inizia una nuova chat da un annuncio.
                </p>
                <Button 
                  className="mt-6 bg-[#6a0dad] hover:bg-[#6a0dad]/90 text-white" 
                  onClick={() => window.location.href = '/search'}
                >
                  Cerca annunci
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}