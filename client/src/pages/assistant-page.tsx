import React from "react";
import AIAssistant from "@/components/ai/AIAssistant";
import { Card } from "@/components/ui/card";

export default function AssistantPage() {
  return (
    <div className="container max-w-6xl mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6 text-center">Assistente Virtuale In&Out</h1>
      
      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <AIAssistant />
        </div>
        
        <div className="space-y-6">
          <Card className="p-4 bg-primary/5 border-primary/20">
            <h2 className="text-xl font-semibold mb-3">Come posso aiutarti?</h2>
            <ul className="space-y-2 list-disc pl-5">
              <li>Trovare proprietà in base alle tue esigenze</li>
              <li>Informazioni sulle diverse zone e città</li>
              <li>Consigli sul processo di ricerca alloggio</li>
              <li>Spiegazioni sui termini immobiliari</li>
              <li>Suggerimenti per risparmiare tempo</li>
            </ul>
          </Card>
          
          <Card className="p-4 bg-primary/5 border-primary/20">
            <h2 className="text-xl font-semibold mb-3">Domande frequenti</h2>
            <div className="space-y-3">
              <div>
                <h3 className="font-medium">Quali documenti servono per affittare?</h3>
                <p className="text-sm text-muted-foreground">Chiedi all'assistente!</p>
              </div>
              <div>
                <h3 className="font-medium">Quanto costa vivere a Milano?</h3>
                <p className="text-sm text-muted-foreground">Chiedi all'assistente!</p>
              </div>
              <div>
                <h3 className="font-medium">Come funziona il deposito cauzionale?</h3>
                <p className="text-sm text-muted-foreground">Chiedi all'assistente!</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}