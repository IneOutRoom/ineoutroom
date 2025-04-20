import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useAI } from '@/hooks/use-ai';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function AIDemo() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  
  const { generateTitle, generateDescription, isGenerating } = useAI({
    propertyType: "bilocale",
    city: "Milano",
    zone: "Navigli",
    size: 75
  });

  return (
    <div className="container mx-auto p-6 max-w-5xl">
      <h1 className="text-3xl font-bold mb-8">Demo AI Content Generator</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Generatore di Titoli</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-2">Titolo attuale:</p>
              <Input 
                value={title} 
                onChange={(e) => setTitle(e.target.value)} 
                placeholder="Nessun titolo generato..." 
              />
            </div>
            
            <Button
              onClick={() => {
                generateTitle(title, (newTitle) => {
                  setTitle(newTitle);
                });
              }}
              disabled={isGenerating}
            >
              Genera Titolo
            </Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Generatore di Descrizioni</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-2">Descrizione attuale:</p>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Nessuna descrizione generata..."
                rows={5}
              />
            </div>
            
            <Button
              onClick={() => {
                generateDescription(description, (newDescription) => {
                  setDescription(newDescription);
                });
              }}
              disabled={isGenerating}
            >
              Genera Descrizione
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}