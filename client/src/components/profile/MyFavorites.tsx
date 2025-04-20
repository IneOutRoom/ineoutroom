import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Heart, Eye, MessageCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Link, useLocation } from 'wouter';
import { Badge } from '@/components/ui/badge';
import { formatPrice } from '@/lib/utils';
import { apiRequest } from '@/lib/queryClient';

// Tipo per la proprietà con l'ID del preferito
type PropertyWithFavoriteId = {
  id: number;
  favoriteId: number;
  title: string;
  description: string;
  price: number;
  address: string;
  city: string;
  propertyType: "stanza_singola" | "stanza_doppia" | "monolocale" | "bilocale" | "altro";
  features: string[];
  [key: string]: any;
};

export default function MyFavorites() {
  const { toast } = useToast();
  const [_, navigate] = useLocation();
  const queryClient = useQueryClient();
  
  // Carica i preferiti dell'utente
  const { data: favorites, isLoading, isError, refetch } = useQuery<PropertyWithFavoriteId[]>({
    queryKey: ['/api/favorites'],
  });

  // Mutation per rimuovere un preferito
  const removeFavoriteMutation = useMutation({
    mutationFn: async (favoriteId: number) => {
      const res = await apiRequest('DELETE', `/api/favorites/${favoriteId}`);
      return favoriteId;
    },
    onSuccess: () => {
      // Invalida la query dei preferiti per aggiornare i dati
      queryClient.invalidateQueries({ queryKey: ['/api/favorites'] });
      
      toast({
        title: 'Preferito rimosso',
        description: 'La proprietà è stata rimossa dai preferiti',
      });
    },
    onError: (error: any) => {
      console.error('Errore nella rimozione dai preferiti:', error);
      toast({
        title: 'Errore',
        description: error.message || 'Non è stato possibile rimuovere il preferito',
        variant: 'destructive',
      });
    }
  });

  // Funzione per rimuovere un preferito
  const handleRemoveFavorite = (favoriteId: number) => {
    removeFavoriteMutation.mutate(favoriteId);
  };

  // Funzione per visualizzare i dettagli della proprietà
  const handleViewProperty = (propertyId: number) => {
    navigate(`/properties/${propertyId}`);
  };

  // Funzione per contattare il proprietario
  const handleContactOwner = (propertyId: number) => {
    navigate(`/chat?propertyId=${propertyId}`);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center py-10">
        <p className="text-destructive mb-4">Si è verificato un errore nel caricamento dei preferiti</p>
        <Button onClick={() => refetch()}>Riprova</Button>
      </div>
    );
  }

  if (!favorites || favorites.length === 0) {
    return (
      <div className="text-center py-10 space-y-4">
        <p className="text-muted-foreground mb-4">Non hai ancora salvato proprietà tra i preferiti</p>
        <Button onClick={() => navigate('/search')}>
          Cerca proprietà
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Le tue proprietà preferite ({favorites.length})</h3>
        <Button variant="outline" onClick={() => navigate('/search')}>
          Cerca altre proprietà
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {favorites.map((property) => (
          <Card key={property.favoriteId} className="overflow-hidden">
            <CardHeader className="pb-2">
              <div className="flex justify-between">
                <CardTitle className="line-clamp-1">{property.title}</CardTitle>
                <Badge variant="outline">
                  {property.propertyType.replace('_', ' ')}
                </Badge>
              </div>
              <CardDescription>
                {property.city}, {property.address}
              </CardDescription>
            </CardHeader>
            <CardContent className="pb-2">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-lg font-bold">
                    {formatPrice(property.price)}
                  </p>
                </div>
                <div className="flex gap-1">
                  {property.features && property.features.slice(0, 2).map((feature, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {feature}
                    </Badge>
                  ))}
                  {property.features && property.features.length > 2 && (
                    <Badge variant="secondary" className="text-xs">
                      +{property.features.length - 2}
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between gap-2 pt-2">
              <Button 
                size="sm" 
                variant="outline"
                className="flex-1"
                onClick={() => handleViewProperty(property.id)}
              >
                <Eye className="h-4 w-4 mr-1" />
                Visualizza
              </Button>
              <Button 
                size="sm" 
                variant="outline"
                className="flex-1"
                onClick={() => handleContactOwner(property.id)}
              >
                <MessageCircle className="h-4 w-4 mr-1" />
                Contatta
              </Button>
              <Button 
                size="sm" 
                variant="destructive"
                className="flex-1"
                onClick={() => handleRemoveFavorite(property.favoriteId)}
                disabled={removeFavoriteMutation.isPending}
              >
                <Heart className="h-4 w-4 mr-1" />
                Rimuovi
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}