import React, { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PropertyFormPriceSuggestionProps {
  city: string;
  zone: string;
  propertyType: string;
  onSuggestionApply: (price: number) => void;
}

interface PriceSuggestion {
  suggestedPrice: number;
  minPrice: number;
  maxPrice: number;
  confidence: number;
  propertyCount: number;
}

const PropertyFormPriceSuggestion: React.FC<PropertyFormPriceSuggestionProps> = ({
  city,
  zone,
  propertyType,
  onSuggestionApply
}) => {
  const { toast } = useToast();
  const [suggestion, setSuggestion] = useState<PriceSuggestion | null>(null);
  const [lastQueryParams, setLastQueryParams] = useState<{
    city: string;
    zone: string;
    propertyType: string;
  } | null>(null);

  // Mutation per ottenere suggerimenti di prezzo
  const priceSuggestionMutation = useMutation({
    mutationFn: async (params: { city: string; zone: string; propertyType: string }) => {
      if (!params.city || !params.propertyType) {
        return null;
      }
      
      const searchParams = new URLSearchParams();
      if (params.city) searchParams.append('city', params.city);
      if (params.zone) searchParams.append('zone', params.zone);
      if (params.propertyType) searchParams.append('propertyType', params.propertyType);
      
      const response = await apiRequest("GET", `/api/price-suggestion?${searchParams.toString()}`);
      
      if (!response.ok) {
        throw new Error("Errore nel recupero dei suggerimenti di prezzo");
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      if (data) {
        setSuggestion(data);
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Errore suggerimento prezzo",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  // Richiedi suggerimenti quando i parametri cambiano
  useEffect(() => {
    // Controlla se almeno ci sono città e tipo proprietà
    if (city && propertyType) {
      // Non richiedere se i parametri non sono cambiati
      if (!lastQueryParams || 
          lastQueryParams.city !== city || 
          lastQueryParams.zone !== zone || 
          lastQueryParams.propertyType !== propertyType) {
        
        priceSuggestionMutation.mutate({ city, zone, propertyType });
        setLastQueryParams({ city, zone, propertyType });
      }
    }
  }, [city, zone, propertyType]);
  
  // Applica il prezzo suggerito
  const handleApplySuggestion = () => {
    if (suggestion) {
      onSuggestionApply(suggestion.suggestedPrice);
      toast({
        title: "Prezzo suggerito applicato",
        description: `Prezzo di €${suggestion.suggestedPrice} impostato.`
      });
    }
  };
  
  const renderContent = () => {
    if (!city || !propertyType) {
      return (
        <div className="text-center text-muted-foreground py-4">
          <p>Inserisci città e tipo di proprietà per ricevere suggerimenti sul prezzo</p>
        </div>
      );
    }
    
    if (priceSuggestionMutation.isPending) {
      return (
        <div className="flex flex-col items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Calcolando il prezzo ottimale...</p>
        </div>
      );
    }
    
    if (!suggestion || priceSuggestionMutation.isError) {
      return (
        <div className="text-center text-muted-foreground py-4">
          <p>Dati insufficienti per fornire un suggerimento accurato.</p>
          <p className="mt-2 text-sm">
            Prova a modificare la zona o la città per ottenere suggerimenti.
          </p>
        </div>
      );
    }
    
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-muted-foreground text-sm">Min</p>
            <p className="font-semibold">€{suggestion.minPrice}</p>
          </div>
          <div className="bg-primary/10 rounded-md py-2 px-1">
            <p className="text-primary text-sm font-medium">Suggerito</p>
            <p className="font-bold text-xl text-primary">€{suggestion.suggestedPrice}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-sm">Max</p>
            <p className="font-semibold">€{suggestion.maxPrice}</p>
          </div>
        </div>
        
        <div className="text-center text-sm text-muted-foreground">
          <p>Basato su {suggestion.propertyCount} annunci simili</p>
          <p>Livello di confidenza: {Math.round(suggestion.confidence * 100)}%</p>
        </div>
        
        <Button 
          onClick={handleApplySuggestion}
          className="w-full"
          variant="outline"
        >
          Applica prezzo suggerito
        </Button>
      </div>
    );
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center text-lg">
          <TrendingUp className="h-5 w-5 mr-2 text-primary" />
          Suggerimento prezzo
        </CardTitle>
        <CardDescription>
          Calcolo automatico del prezzo ottimale basato sugli annunci simili nella zona
        </CardDescription>
      </CardHeader>
      <CardContent>
        {renderContent()}
      </CardContent>
    </Card>
  );
};

export default PropertyFormPriceSuggestion;