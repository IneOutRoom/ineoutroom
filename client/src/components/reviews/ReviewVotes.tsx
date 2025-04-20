import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { ThumbsUp, ThumbsDown } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

interface ReviewVotesProps {
  reviewId: number;
  helpfulCount: number;
  unhelpfulCount: number;
  userVote?: {
    isHelpful: boolean;
  } | null;
}

export function ReviewVotes({ 
  reviewId, 
  helpfulCount = 0, 
  unhelpfulCount = 0, 
  userVote = null 
}: ReviewVotesProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Stato per la UI ottimistica
  const [optimisticVote, setOptimisticVote] = useState<boolean | null>(
    userVote ? userVote.isHelpful : null
  );
  
  const [optimisticCounts, setOptimisticCounts] = useState({
    helpful: helpfulCount,
    unhelpful: unhelpfulCount
  });

  // Mutazione per votare la recensione
  const voteMutation = useMutation({
    mutationFn: async (isHelpful: boolean) => {
      const res = await apiRequest("POST", `/api/reviews/${reviewId}/vote`, {
        isHelpful
      });
      return res.json();
    },
    onMutate: async (isHelpful) => {
      // Se l'utente sta cambiando il suo voto
      if (optimisticVote !== null && optimisticVote !== isHelpful) {
        // Decrementa il conteggio opposto
        setOptimisticCounts(prev => ({
          helpful: optimisticVote ? prev.helpful - 1 : prev.helpful,
          unhelpful: !optimisticVote ? prev.unhelpful - 1 : prev.unhelpful
        }));
      }
      
      // Incrementa il nuovo conteggio
      setOptimisticCounts(prev => ({
        helpful: isHelpful ? prev.helpful + 1 : prev.helpful,
        unhelpful: !isHelpful ? prev.unhelpful + 1 : prev.unhelpful
      }));
      
      // Aggiorna l'UI
      setOptimisticVote(isHelpful);
    },
    onSuccess: () => {
      // Invalidare la query per aggiornare i dati
      queryClient.invalidateQueries({ queryKey: ['/api/properties'] });
    },
    onError: (error: Error) => {
      // Ripristina i conteggi originali in caso di errore
      setOptimisticCounts({
        helpful: helpfulCount,
        unhelpful: unhelpfulCount
      });
      setOptimisticVote(userVote ? userVote.isHelpful : null);
      
      toast({
        title: "Errore",
        description: error.message || "Impossibile votare questa recensione. Riprova più tardi.",
        variant: "destructive"
      });
    }
  });

  const handleVote = (isHelpful: boolean) => {
    if (!user) {
      toast({
        title: "Accesso richiesto",
        description: "Accedi per votare questa recensione",
        variant: "default"
      });
      return;
    }
    
    voteMutation.mutate(isHelpful);
  };

  return (
    <div className="flex items-center space-x-4 mt-2">
      <span className="text-sm text-gray-500">Questa recensione è stata utile?</span>
      
      <div className="flex items-center space-x-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleVote(true)}
          className={`flex items-center px-2 h-8 ${optimisticVote === true ? 'text-green-600 bg-green-50' : 'text-gray-500'}`}
          disabled={voteMutation.isPending}
        >
          <ThumbsUp className="h-4 w-4 mr-1" />
          <span>{optimisticCounts.helpful}</span>
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleVote(false)}
          className={`flex items-center px-2 h-8 ${optimisticVote === false ? 'text-red-600 bg-red-50' : 'text-gray-500'}`}
          disabled={voteMutation.isPending}
        >
          <ThumbsDown className="h-4 w-4 mr-1" />
          <span>{optimisticCounts.unhelpful}</span>
        </Button>
      </div>
    </div>
  );
}