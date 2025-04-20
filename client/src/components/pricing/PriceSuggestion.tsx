import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  AlertCircle, 
  TrendingUp, 
  HelpCircle, 
  DollarSign,
  ThumbsUp
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

type PriceSuggestionProps = {
  city: string;
  zone?: string | null;
  propertyType?: string | null;
  onSuggestedPriceSelect?: (price: number) => void;
};

type PriceSuggestionResponse = {
  available: boolean;
  isExact?: boolean;
  message?: string;
  city?: string;
  zone?: string;
  propertyType?: string;
  averagePrice?: number;
  medianPrice?: number;
  minPrice?: number;
  maxPrice?: number;
  suggestedMin?: number;
  suggestedMax?: number;
  confidence?: "alta" | "media" | "bassa";
  sampleSize?: number;
  lastUpdated?: string;
};

export function PriceSuggestion({ 
  city, 
  zone, 
  propertyType,
  onSuggestedPriceSelect 
}: PriceSuggestionProps) {
  const { toast } = useToast();
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Costruisce la query string per la richiesta
  const queryParams = new URLSearchParams();
  if (city) queryParams.append("city", city);
  if (zone) queryParams.append("zone", zone);
  if (propertyType) queryParams.append("propertyType", propertyType);
  
  const queryString = queryParams.toString();
  
  const { data, isLoading, error } = useQuery<PriceSuggestionResponse>({
    queryKey: ['/api/pricing-suggestion', queryString],
    queryFn: async () => {
      if (!city) return { available: false, message: "Seleziona una città per vedere il suggerimento di prezzo" };
      
      const res = await apiRequest("GET", `/api/pricing-suggestion?${queryString}`);
      return await res.json();
    },
    enabled: !!city,
    refetchOnWindowFocus: false,
  });
  
  // Funzione per applicare il prezzo suggerito
  const applyPrice = (price: number) => {
    if (onSuggestedPriceSelect) {
      onSuggestedPriceSelect(price);
      toast({
        title: "Prezzo applicato",
        description: `Il prezzo suggerito di €${price} è stato applicato all'annuncio.`,
      });
    }
  };
  
  // Se non c'è una città selezionata, mostra un messaggio
  if (!city) {
    return (
      <Card className="mt-4 border-dashed border-muted-foreground/50">
        <CardContent className="pt-6 flex items-center">
          <HelpCircle className="h-5 w-5 mr-2 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            Seleziona una città per vedere suggerimenti sul prezzo di mercato
          </p>
        </CardContent>
      </Card>
    );
  }
  
  // Se è in caricamento, mostra uno skeleton
  if (isLoading) {
    return (
      <Card className="mt-4">
        <CardContent className="pt-6">
          <div className="flex items-center space-x-2 mb-2">
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-4 w-40" />
          </div>
          <Skeleton className="h-4 w-full mt-2" />
          <div className="flex justify-between mt-4">
            <Skeleton className="h-9 w-20" />
            <Skeleton className="h-9 w-20" />
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // Se c'è un errore, mostra un messaggio di errore
  if (error || !data) {
    return (
      <Card className="mt-4 border-destructive">
        <CardContent className="pt-6 flex items-center">
          <AlertCircle className="h-5 w-5 mr-2 text-destructive" />
          <p className="text-sm text-destructive">
            Errore nel caricamento dei suggerimenti di prezzo
          </p>
        </CardContent>
      </Card>
    );
  }
  
  // Se non ci sono dati disponibili
  if (!data.available) {
    return (
      <Card className="mt-4 border-muted">
        <CardContent className="pt-6 flex items-center">
          <AlertCircle className="h-5 w-5 mr-2 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            {data.message || "Nessun dato disponibile per questa zona"}
          </p>
        </CardContent>
      </Card>
    );
  }
  
  // Formatta la data dell'ultimo aggiornamento
  const formattedDate = data.lastUpdated 
    ? new Date(data.lastUpdated).toLocaleDateString('it-IT', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      })
    : 'N/A';
  
  // Badge per il livello di confidenza
  const confidenceBadge = () => {
    switch(data.confidence) {
      case 'alta':
        return <Badge variant="default" className="bg-green-500">Affidabilità Alta</Badge>;
      case 'media':
        return <Badge variant="default" className="bg-yellow-500">Affidabilità Media</Badge>;
      case 'bassa':
        return <Badge variant="default" className="bg-orange-500">Affidabilità Bassa</Badge>;
      default:
        return null;
    }
  };
  
  return (
    <Card className="mt-4 border-primary/20">
      <CardContent className="pt-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center">
            <TrendingUp className="h-5 w-5 mr-2 text-primary" />
            <h3 className="text-base font-medium">Suggerimento Prezzo</h3>
          </div>
          {confidenceBadge()}
        </div>
        
        <div className="space-y-2">
          <p className="text-sm">
            {data.isExact
              ? `Prezzo suggerito per ${propertyType ? propertyType.replace('_', ' ') : 'proprietà'} a ${city}${zone ? `, ${zone}` : ''}`
              : `Prezzo suggerito per proprietà a ${city} (dati generali)`}
          </p>
          
          <div className="flex flex-wrap gap-2 justify-between items-center mt-3">
            <div className="flex flex-col items-center p-2 bg-muted rounded-md max-w-xs flex-grow">
              <span className="text-xs mb-1 text-muted-foreground">Suggerito Min</span>
              <span className="text-xl font-bold">€{data.suggestedMin}</span>
              <Button 
                variant="ghost" 
                size="sm" 
                className="mt-1" 
                onClick={() => data.suggestedMin && applyPrice(data.suggestedMin)}
              >
                <ThumbsUp className="h-3 w-3 mr-1" /> Applica
              </Button>
            </div>
            
            <DollarSign className="h-5 w-5 text-primary" />
            
            <div className="flex flex-col items-center p-2 bg-muted rounded-md max-w-xs flex-grow">
              <span className="text-xs mb-1 text-muted-foreground">Suggerito Max</span>
              <span className="text-xl font-bold">€{data.suggestedMax}</span>
              <Button 
                variant="ghost" 
                size="sm" 
                className="mt-1" 
                onClick={() => data.suggestedMax && applyPrice(data.suggestedMax)}
              >
                <ThumbsUp className="h-3 w-3 mr-1" /> Applica
              </Button>
            </div>
          </div>
          
          {isExpanded && (
            <div className="mt-4 space-y-2 text-sm">
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2 bg-muted/50 rounded-md">
                  <p className="text-xs text-muted-foreground">Prezzo Medio</p>
                  <p className="font-medium">€{data.averagePrice}</p>
                </div>
                <div className="p-2 bg-muted/50 rounded-md">
                  <p className="text-xs text-muted-foreground">Prezzo Mediano</p>
                  <p className="font-medium">€{data.medianPrice}</p>
                </div>
                <div className="p-2 bg-muted/50 rounded-md">
                  <p className="text-xs text-muted-foreground">Min. registrato</p>
                  <p className="font-medium">€{data.minPrice}</p>
                </div>
                <div className="p-2 bg-muted/50 rounded-md">
                  <p className="text-xs text-muted-foreground">Max. registrato</p>
                  <p className="font-medium">€{data.maxPrice}</p>
                </div>
              </div>
              
              <div className="mt-3 text-xs text-muted-foreground flex justify-between">
                <div>Campione: {data.sampleSize} proprietà</div>
                <div>Aggiornato il: {formattedDate}</div>
              </div>
            </div>
          )}
          
          <Button
            variant="ghost"
            size="sm"
            className="w-full mt-2 text-xs"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? 'Mostra meno' : 'Mostra dettagli'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}