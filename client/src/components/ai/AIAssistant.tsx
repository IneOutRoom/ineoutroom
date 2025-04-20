import React, { useState, useRef, useEffect } from "react";
import { useAI } from "@/hooks/use-ai";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Send } from "lucide-react";

export interface Message {
  role: "system" | "user" | "assistant";
  content: string;
}

export default function AIAssistant() {
  const { chatWithAssistant, isChatting } = useAI();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Aggiunge il messaggio di benvenuto all'inizio
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          role: "assistant",
          content: "Ciao! Sono l'assistente virtuale di In&Out. Come posso aiutarti oggi nella tua ricerca di alloggi?"
        }
      ]);
    }
  }, []);

  // Scorrimento automatico verso il basso quando arrivano nuovi messaggi
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!input.trim() || isChatting) return;
    
    const userMessage = { role: "user" as const, content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    
    try {
      const response = await chatWithAssistant(messages, input);
      
      setMessages(response.conversationHistory);
    } catch (error) {
      // L'errore è già gestito dall'hook useAI con un toast
      console.error("Errore nella chat:", error);
    }
  };

  return (
    <Card className="w-full max-w-3xl mx-auto border-primary/20 shadow-lg">
      <CardHeader className="bg-primary/5 border-b border-primary/10">
        <CardTitle className="text-2xl flex items-center gap-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src="/assistant-icon.png" alt="AI" />
            <AvatarFallback className="bg-primary text-white">AI</AvatarFallback>
          </Avatar>
          Assistente In&Out
        </CardTitle>
        <CardDescription>
          Il tuo assistente virtuale per la ricerca di alloggi in Europa
        </CardDescription>
      </CardHeader>
      
      <CardContent className="p-0">
        <ScrollArea 
          ref={scrollAreaRef} 
          className="h-[400px] p-4 overflow-y-auto"
        >
          <div className="space-y-4">
            {messages.map((message, index) => (
              <div 
                key={index} 
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div 
                  className={`max-w-[80%] rounded-lg p-3 ${
                    message.role === 'user' 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-muted'
                  }`}
                >
                  {message.content}
                </div>
              </div>
            ))}
            
            {isChatting && (
              <div className="flex justify-start">
                <div className="max-w-[80%] rounded-lg p-3 bg-muted flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>L'assistente sta scrivendo...</span>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
      
      <CardFooter className="p-3 border-t border-primary/10">
        <form onSubmit={handleSendMessage} className="flex w-full gap-2">
          <Input
            placeholder="Scrivi un messaggio..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isChatting}
            className="flex-1"
          />
          <Button 
            type="submit" 
            size="icon" 
            disabled={isChatting || !input.trim()}
          >
            {isChatting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
}