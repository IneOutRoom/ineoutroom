import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { AlertCircle, Wand2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { apiRequest } from '@/lib/queryClient';
import { Loader2 } from 'lucide-react';

interface AIContentGeneratorProps {
  initialValue: string;
  onSelect: (content: string) => void;
  tipo: 'titolo' | 'descrizione';
  propertyType?: string;
  city?: string;
  zone?: string;
  size?: number;
}

export function AIContentGenerator({
  initialValue,
  onSelect,
  tipo,
  propertyType,
  city,
  zone,
  size
}: AIContentGeneratorProps) {
  const [prompt, setPrompt] = useState(initialValue || '');
  const [generatedContent, setGeneratedContent] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorType, setErrorType] = useState<'autenticazione' | 'generico' | null>(null);

  const generateContent = async () => {
    if (!prompt || prompt.length < 10) {
      setError('Inserisci almeno 10 caratteri per ottenere suggerimenti migliori');
      return;
    }

    setIsLoading(true);
    setError(null);
    setGeneratedContent(null);

    try {
      const response = await apiRequest('POST', '/api/openai', {
        prompt,
        campo: tipo,
        propertyType,
        city,
        zone,
        size
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Si è verificato un errore durante la generazione');
        setErrorType(data.tipo || 'generico');
        return;
      }

      setGeneratedContent(data.output);
    } catch (error: any) {
      setError(`Errore di connessione: ${error.message}`);
      setErrorType('generico');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPrompt(e.target.value);
    // Quando l'utente modifica il prompt, azzeriamo eventuali errori
    setError(null);
  };

  const handleUseContent = () => {
    if (generatedContent) {
      onSelect(generatedContent);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wand2 className="h-5 w-5" />
          Genera {tipo === 'titolo' ? 'un titolo' : 'una descrizione'} con AI
        </CardTitle>
        <CardDescription>
          Descrivi brevemente cosa ti piacerebbe includere nel {tipo === 'titolo' ? 'titolo' : 'testo'}
          {tipo === 'descrizione' && ' e lascia che l\'AI crei una descrizione completa'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="prompt">Il tuo input</Label>
          <Textarea
            id="prompt"
            placeholder={
              tipo === 'titolo'
                ? 'Es. Appartamento luminoso vicino alla metro con giardino privato'
                : 'Es. Appartamento al terzo piano con 3 camere da letto, 2 bagni, cucina moderna e ampio balcone. Zona tranquilla con tutti i servizi vicini.'
            }
            value={prompt}
            onChange={handlePromptChange}
            rows={tipo === 'titolo' ? 2 : 4}
          />
        </div>

        {isLoading && (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2">Generazione in corso...</span>
          </div>
        )}

        {error && (
          <Alert variant="destructive" className="mt-2">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Errore</AlertTitle>
            <AlertDescription>
              {error}
              {errorType === 'autenticazione' && (
                <div className="mt-2 text-sm">
                  Sembra che ci sia un problema con l'accesso all'API di OpenAI. 
                  Contatta l'amministratore per verificare la configurazione.
                </div>
              )}
            </AlertDescription>
          </Alert>
        )}

        {generatedContent && !isLoading && (
          <div className="space-y-2 mt-4">
            <Label htmlFor="generated">Contenuto generato</Label>
            <div 
              className="p-3 border rounded-md bg-muted/50 whitespace-pre-wrap"
              style={{ minHeight: tipo === 'titolo' ? '2rem' : '8rem' }}
            >
              {generatedContent}
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button 
          variant="outline" 
          onClick={generateContent} 
          disabled={isLoading || prompt.length < 10}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generazione...
            </>
          ) : (
            <>
              <Wand2 className="mr-2 h-4 w-4" />
              Genera contenuto
            </>
          )}
        </Button>
        
        {generatedContent && !isLoading && (
          <Button onClick={handleUseContent}>
            Usa questo contenuto
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}

export default AIContentGenerator;