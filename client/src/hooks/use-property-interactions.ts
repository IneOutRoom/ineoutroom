import { useMutation } from "@tanstack/react-query";
import { Property } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";

/**
 * Hook per gestire le interazioni degli utenti con le proprietà
 * (visualizzazioni, salvataggi, contatti)
 */
export function usePropertyInteractions() {
  const { toast } = useToast();
  const { user } = useAuth();

  // Mutation per tracciare le interazioni degli utenti
  const interactionMutation = useMutation({
    mutationFn: async (data: { propertyId: number; interactionType: 'view' | 'save' | 'contact' }) => {
      const response = await apiRequest("POST", "/api/user-interactions", data);
      return response.json();
    },
    onError: (error: Error) => {
      console.error("Errore durante il tracciamento dell'interazione:", error);
    }
  });

  /**
   * Registra una visualizzazione quando l'utente clicca su una proprietà
   */
  const handlePropertyClick = (property: Property) => {
    if (user) {
      interactionMutation.mutate({
        propertyId: property.id,
        interactionType: 'view'
      });
    }
  };

  /**
   * Registra un salvataggio quando l'utente salva una proprietà
   */
  const handleSaveProperty = (e: React.MouseEvent, property: Property) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user) {
      toast({
        title: "Accesso richiesto",
        description: "Accedi o registrati per salvare questa proprietà",
        variant: "destructive"
      });
      return;
    }
    
    interactionMutation.mutate({
      propertyId: property.id,
      interactionType: 'save'
    });
    
    toast({
      title: "Proprietà salvata",
      description: "Questa proprietà è stata aggiunta ai tuoi preferiti"
    });
  };

  /**
   * Registra un contatto quando l'utente vuole contattare il proprietario
   */
  const handleContactOwner = (e: React.MouseEvent, property: Property) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user) {
      toast({
        title: "Accesso richiesto",
        description: "Accedi o registrati per contattare il proprietario",
        variant: "destructive"
      });
      return;
    }
    
    interactionMutation.mutate({
      propertyId: property.id,
      interactionType: 'contact'
    });
    
    // Qui potremmo reindirizzare alla pagina della chat o aprire un modale
    // Per ora mostriamo un messaggio di successo
    toast({
      title: "Proprietario contattato",
      description: "Vai alla chat per iniziare la conversazione"
    });

    // In un'implementazione completa, redirezionare alla pagina della chat con il proprietario
    // window.location.href = `/chat/${property.id}/${property.userId}`;
  };

  return {
    handlePropertyClick,
    handleSaveProperty,
    handleContactOwner,
    isLoading: interactionMutation.isPending
  };
}