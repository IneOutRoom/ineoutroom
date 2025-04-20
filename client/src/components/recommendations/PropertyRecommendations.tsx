import { useQuery } from "@tanstack/react-query";
import { Property } from "@shared/schema";
import { Link } from "wouter";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ArrowUpRight, Home, Euro, MapPin, Calendar } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";

interface PropertyRecommendationsProps {
  limit?: number;
  title?: string;
  onPropertyClick?: (property: Property) => void;
}

export function PropertyRecommendations({ 
  limit = 3, 
  title = "Proprietà consigliate per te",
  onPropertyClick
}: PropertyRecommendationsProps) {
  const { user } = useAuth();
  const { toast } = useToast();

  // Funzione per registrare le interazioni
  const recordInteraction = async (property: Property, interactionType: 'view' | 'save' | 'contact') => {
    if (!user) return;
    
    try {
      await apiRequest("POST", "/api/interactions", {
        propertyId: property.id,
        interactionType
      });
      
      // Invalida la cache delle raccomandazioni quando si registra una nuova interazione
      if (interactionType !== 'view') {
        queryClient.invalidateQueries({ queryKey: ["/api/recommendations"] });
      }
    } catch (error) {
      console.error("Errore durante la registrazione dell'interazione:", error);
    }
  };

  // Query per ottenere le proprietà raccomandate
  const { data: recommendedProperties, isLoading, error } = useQuery<Property[]>({
    queryKey: ["/api/recommendations"],
    queryFn: () => fetch(`/api/recommendations?limit=${limit}`).then(res => {
      if (!res.ok) throw new Error("Errore durante il recupero delle raccomandazioni");
      return res.json();
    }),
    enabled: !!user, // Esegui la query solo se l'utente è autenticato
    staleTime: 5 * 60 * 1000, // 5 minuti
  });

  // Gestione dell'errore
  if (error) {
    toast({
      title: "Errore",
      description: "Impossibile caricare le proprietà consigliate",
      variant: "destructive",
    });
  }

  // Click sulla proprietà
  const handlePropertyClick = (property: Property) => {
    // Registra l'interazione di visualizzazione
    recordInteraction(property, 'view');
    
    // Se è stata fornita una funzione di callback, chiamala
    if (onPropertyClick) {
      onPropertyClick(property);
    }
  };

  // Preferisci una proprietà (salvataggio)
  const handleSaveProperty = (e: React.MouseEvent, property: Property) => {
    e.preventDefault();
    e.stopPropagation();
    
    recordInteraction(property, 'save');
    
    toast({
      title: "Proprietà salvata",
      description: "La proprietà è stata aggiunta ai tuoi preferiti",
    });
  };

  // Contatta il proprietario
  const handleContactOwner = (e: React.MouseEvent, property: Property) => {
    e.preventDefault();
    e.stopPropagation();
    
    recordInteraction(property, 'contact');
    
    // Qui potrebbe essere aggiunta la logica per aprire la chat o inviare un messaggio
    toast({
      title: "Azione registrata",
      description: "La tua richiesta di contatto è stata inviata",
    });
  };

  // Se non ci sono proprietà raccomandate, non mostrare nulla
  if (!isLoading && (!recommendedProperties || recommendedProperties.length === 0)) {
    return null;
  }

  return (
    <div className="w-full py-6">
      <div className="container">
        <h2 className="text-2xl font-bold mb-6">{title}</h2>
        
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recommendedProperties?.map((property) => (
              <Link key={property.id} href={`/properties/${property.id}`} onClick={() => handlePropertyClick(property)}>
                <Card className="h-full cursor-pointer hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <Badge className="mb-2">{property.propertyType.replace('_', ' ')}</Badge>
                      <Badge variant="outline" className="bg-primary/10">
                        {property.price}&euro; /mese
                      </Badge>
                    </div>
                    <CardTitle className="line-clamp-1" title={property.title}>{property.title}</CardTitle>
                    <CardDescription className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {property.city}{property.zone ? `, ${property.zone}` : ''}
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{property.description}</p>
                    <div className="flex flex-wrap gap-2 text-sm">
                      {property.features && (
                        <Badge variant="outline" className="flex items-center gap-1">
                          <Home className="h-3 w-3" />
                          Vedi dettagli
                        </Badge>
                      )}
                      {property.availableFrom && (
                        <Badge variant="outline" className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDate(new Date(property.availableFrom))}
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                  
                  <CardFooter className="flex justify-between pt-3">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={(e) => handleSaveProperty(e, property)}
                    >
                      Salva
                    </Button>
                    <Button 
                      size="sm"
                      onClick={(e) => handleContactOwner(e, property)}
                    >
                      Contatta <ArrowUpRight className="ml-1 h-4 w-4" />
                    </Button>
                  </CardFooter>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}