import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Loader2, TrendingUp, TrendingDown, Percent } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

interface DynamicPricingWidgetProps {
  propertyId?: number;
  currentPrice?: number;
  onPriceChange?: (newPrice: number) => void;
}

/**
 * Widget per visualizzare suggerimenti di prezzo dinamico
 */
export default function DynamicPricingWidget({ 
  propertyId, 
  currentPrice,
  onPriceChange 
}: DynamicPricingWidgetProps) {
  const { toast } = useToast();
  const [showDetails, setShowDetails] = useState(false);
  
  // Query per ottenere i dati di prezzo dinamico
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['/api/ml/dynamic-pricing', propertyId],
    queryFn: async () => {
      if (!propertyId) return null;
      
      const res = await apiRequest('POST', '/api/ml/dynamic-pricing', { 
        propertyId 
      });
      
      return res.json();
    },
    enabled: !!propertyId, // Esegui solo se propertyId è disponibile
  });
  
  // Mutazione per applicare la modifica del prezzo
  const { mutate: applyPriceChange, isPending } = useMutation({
    mutationFn: async () => {
      if (!propertyId || !data || !currentPrice) return null;
      
      const changePercent = data.recommended_price_change_percentage;
      const newPrice = Math.round(currentPrice * (1 + changePercent/100));
      
      // Qui potresti implementare la chiamata API per aggiornare il prezzo
      // Per ora, utilizziamo solo il callback
      if (onPriceChange) {
        onPriceChange(newPrice);
      }
      
      return { newPrice };
    },
    onSuccess: (data) => {
      if (data?.newPrice) {
        toast({
          title: "Prezzo aggiornato",
          description: `Il prezzo è stato aggiornato a €${data.newPrice}`,
        });
      }
    },
    onError: (error: any) => {
      toast({
        title: "Errore nell'aggiornamento del prezzo",
        description: error.message || "Si è verificato un errore. Riprova più tardi.",
        variant: "destructive",
      });
    }
  });
  
  // Se non abbiamo un propertyId, mostra un messaggio
  if (!propertyId) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Pricing Dinamico</CardTitle>
          <CardDescription>
            Seleziona una proprietà per ottenere suggerimenti sul prezzo
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }
  
  // Se stiamo caricando, mostra uno spinner
  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Analisi del prezzo in corso</CardTitle>
          <CardDescription>
            Stiamo analizzando i dati di mercato...
          </CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-6">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }
  
  // Se c'è stato un errore, mostra un messaggio
  if (isError || !data) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Servizio non disponibile</CardTitle>
          <CardDescription>
            Non è stato possibile analizzare il prezzo al momento
          </CardDescription>
        </CardHeader>
        <CardFooter>
          <Button variant="outline" onClick={() => refetch()}>
            Riprova
          </Button>
        </CardFooter>
      </Card>
    );
  }
  
  // Estrai i dati
  const { recommended_price_change_percentage, confidence } = data;
  
  // Calcola il nuovo prezzo suggerito
  const newPrice = currentPrice 
    ? Math.round(currentPrice * (1 + recommended_price_change_percentage/100)) 
    : 0;
  
  // Determina se è un aumento o una diminuzione
  const isPriceIncrease = recommended_price_change_percentage > 0;
  const isNeutral = recommended_price_change_percentage === 0;
  
  // Formatta la percentuale
  const formattedPercentage = `${recommended_price_change_percentage > 0 ? '+' : ''}${recommended_price_change_percentage}%`;
  
  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Suggerimento Prezzo</CardTitle>
            <CardDescription>
              Basato su analisi di mercato avanzata
            </CardDescription>
          </div>
          <Badge variant={isPriceIncrease ? "default" : isNeutral ? "outline" : "destructive"}>
            {isPriceIncrease ? (
              <TrendingUp className="h-4 w-4 mr-1" />
            ) : isNeutral ? (
              <Percent className="h-4 w-4 mr-1" />
            ) : (
              <TrendingDown className="h-4 w-4 mr-1" />
            )}
            {formattedPercentage}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {currentPrice && (
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Prezzo attuale</p>
              <p className="text-2xl font-semibold">€{currentPrice}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Prezzo suggerito</p>
              <p className="text-2xl font-semibold text-primary">€{newPrice}</p>
            </div>
          </div>
        )}
        
        {showDetails && (
          <div className="mt-4 space-y-2 bg-muted p-3 rounded-md">
            <p className="text-sm">
              <span className="font-medium">Confidenza:</span> {(confidence * 100).toFixed(0)}%
            </p>
            <p className="text-sm">
              Questo suggerimento è basato sull'analisi di fattori come la posizione, la domanda di mercato, la stagionalità e le caratteristiche della proprietà.
            </p>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="flex justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowDetails(!showDetails)}
        >
          {showDetails ? "Nascondi dettagli" : "Mostra dettagli"}
        </Button>
        
        {currentPrice && onPriceChange && (
          <Button
            onClick={() => applyPriceChange()}
            disabled={isPending}
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Aggiornamento...
              </>
            ) : (
              "Applica prezzo suggerito"
            )}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}