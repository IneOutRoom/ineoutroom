import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { UserReview } from '@shared/schema';

// Tipo per le statistiche delle recensioni
export interface ReviewStats {
  averageRating: number;
  totalReviews: number;
}

// Tipo per i dati delle recensioni comprese le informazioni sull'utente
export interface UserReviewWithAuthor extends UserReview {
  authorName?: string; 
  authorUsername?: string;
  authorProfileImage?: string;
}

// Tipo di risposta per le recensioni di un inserzionista
export interface InserzionistReviewsResponse {
  reviews: UserReviewWithAuthor[];
  stats: ReviewStats;
}

/**
 * Hook personalizzato per gestire le recensioni degli inserzionisti
 */
export function useReviews() {
  const queryClient = useQueryClient();

  // Ottieni tutte le recensioni per un inserzionista
  const useInserzionistReviews = (inserzionistId: number) => {
    return useQuery<InserzionistReviewsResponse>({
      queryKey: ['/api/reviews/user', inserzionistId],
      queryFn: async () => {
        const res = await apiRequest('GET', `/api/reviews/user/${inserzionistId}`);
        return res.json();
      },
      enabled: !!inserzionistId,
    });
  };

  // Ottieni la recensione dell'utente corrente per un inserzionista
  const useUserReviewForInserzionista = (inserzionistId: number, authorId?: number) => {
    return useQuery<UserReview | null>({
      queryKey: ['/api/reviews/user', inserzionistId, 'by', authorId],
      queryFn: async () => {
        if (!authorId) return null;
        try {
          const res = await apiRequest('GET', `/api/reviews/user/${inserzionistId}/by/${authorId}`);
          return res.json();
        } catch (error) {
          // Se la recensione non esiste, restituisci null
          if (error instanceof Response && error.status === 404) {
            return null;
          }
          throw error;
        }
      },
      enabled: !!inserzionistId && !!authorId,
    });
  };

  // Crea una nuova recensione
  const createReview = useMutation({
    mutationFn: async (data: { inserzionistId: number, rating: number, comment?: string }) => {
      const res = await apiRequest('POST', `/api/reviews/user/${data.inserzionistId}`, data);
      return res.json();
    },
    onSuccess: (_, variables) => {
      // Invalida le query relative alle recensioni dell'inserzionista
      queryClient.invalidateQueries({ queryKey: ['/api/reviews/user', variables.inserzionistId] });
    },
  });

  // Aggiorna una recensione esistente
  const updateReview = useMutation({
    mutationFn: async ({ reviewId, data }: { reviewId: number, data: { rating?: number, comment?: string } }) => {
      const res = await apiRequest('PUT', `/api/reviews/${reviewId}`, data);
      return res.json();
    },
    onSuccess: (data) => {
      // Invalida le query relative alle recensioni dell'inserzionista
      queryClient.invalidateQueries({ queryKey: ['/api/reviews/user', data.inserzionistId] });
      // Invalida anche la query specifica per questa recensione
      queryClient.invalidateQueries({ queryKey: ['/api/reviews/user', data.inserzionistId, 'by'] });
    },
  });

  // Elimina una recensione
  const deleteReview = useMutation({
    mutationFn: async (reviewId: number) => {
      await apiRequest('DELETE', `/api/reviews/${reviewId}`);
      return { success: true, reviewId };
    },
    onSuccess: (_, reviewId) => {
      // Invalida tutte le query relative alle recensioni
      queryClient.invalidateQueries({ queryKey: ['/api/reviews'] });
    },
  });

  return {
    useInserzionistReviews,
    useUserReviewForInserzionista,
    createReview,
    updateReview,
    deleteReview,
  };
}

export default useReviews;