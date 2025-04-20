import React, { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import useReviews from '@/hooks/use-reviews';
import RatingStarsDisplay from './RatingStarsDisplay';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Loader2, Pencil, Trash2 } from 'lucide-react';
import { UserReviewWithAuthor } from '@/hooks/use-reviews';
import { formatDistanceToNow } from 'date-fns';
import { it } from 'date-fns/locale';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import ReviewForm from './ReviewForm';
import { cn } from '@/lib/utils';

interface ReviewListProps {
  inserzionistId: number;
  className?: string;
}

/**
 * Componente che visualizza la lista delle recensioni di un inserzionista
 */
export const ReviewList: React.FC<ReviewListProps> = ({ inserzionistId, className }) => {
  const { user } = useAuth();
  const { useInserzionistReviews, deleteReview } = useReviews();
  const { data, isLoading, isError } = useInserzionistReviews(inserzionistId);
  const [reviewToEdit, setReviewToEdit] = useState<UserReviewWithAuthor | null>(null);
  const [reviewToDelete, setReviewToDelete] = useState<UserReviewWithAuthor | null>(null);
  const [showAllReviews, setShowAllReviews] = useState(false);

  // Numero di recensioni da mostrare inizialmente
  const initialReviewCount = 3;
  
  // Filtra le recensioni da mostrare in base allo stato showAllReviews
  const visibleReviews = showAllReviews 
    ? data?.reviews 
    : data?.reviews?.slice(0, initialReviewCount);

  // Gestisce l'eliminazione di una recensione
  const handleDeleteReview = async () => {
    if (!reviewToDelete) return;
    
    try {
      await deleteReview.mutateAsync(reviewToDelete.id);
      setReviewToDelete(null);
    } catch (error) {
      console.error('Errore durante l\'eliminazione della recensione:', error);
    }
  };

  // Se sta caricando, mostra un loader
  if (isLoading) {
    return (
      <div className="flex justify-center p-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Se c'è un errore, mostra un messaggio
  if (isError) {
    return (
      <div className="text-center p-4 text-red-500">
        Si è verificato un errore durante il caricamento delle recensioni.
      </div>
    );
  }

  // Se non ci sono recensioni, mostra un messaggio
  if (!data || data.reviews.length === 0) {
    return (
      <div className="text-center p-4 text-gray-500">
        Questo inserzionista non ha ancora ricevuto recensioni.
      </div>
    );
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Intestazione con statistiche */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <RatingStarsDisplay
            rating={data.stats.averageRating}
            size="lg"
            showValue
          />
          <span className="text-gray-500">
            {data.stats.totalReviews} {data.stats.totalReviews === 1 ? 'recensione' : 'recensioni'}
          </span>
        </div>
      </div>

      {/* Lista recensioni */}
      <div className="space-y-4">
        {visibleReviews?.map((review) => (
          <Card key={review.id} className="overflow-hidden">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <div className="flex items-center space-x-3">
                <Avatar>
                  <AvatarImage 
                    src={review.authorProfileImage || undefined} 
                    alt={review.authorName || review.authorUsername || 'Utente'} 
                  />
                  <AvatarFallback>
                    {(review.authorName?.[0] || review.authorUsername?.[0] || 'U').toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium">
                    {review.authorName || review.authorUsername || 'Utente anonimo'}
                  </div>
                  <div className="text-sm text-gray-500">
                    {review.createdAt 
                      ? formatDistanceToNow(new Date(review.createdAt), { 
                          addSuffix: true, 
                          locale: it 
                        })
                      : 'Data sconosciuta'
                    }
                    {review.updatedAt && ' (modificata)'}
                  </div>
                </div>
              </div>
              
              <RatingStarsDisplay rating={review.rating} />
            </CardHeader>
            
            <CardContent>
              {review.comment ? (
                <p className="text-gray-700">{review.comment}</p>
              ) : (
                <p className="italic text-gray-500">Nessun commento</p>
              )}
            </CardContent>
            
            {user && user.id === review.authorId && (
              <CardFooter className="pt-0 flex justify-end gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setReviewToEdit(review)}
                >
                  <Pencil className="h-4 w-4 mr-1" />
                  Modifica
                </Button>
                <Button 
                  variant="destructive" 
                  size="sm"
                  onClick={() => setReviewToDelete(review)}
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Elimina
                </Button>
              </CardFooter>
            )}
          </Card>
        ))}
      </div>

      {/* Bottone "Vedi tutte le recensioni" se ce ne sono più di 3 */}
      {data && data.reviews.length > initialReviewCount && !showAllReviews && (
        <div className="text-center">
          <Button 
            variant="outline" 
            onClick={() => setShowAllReviews(true)}
          >
            Vedi tutte le {data.reviews.length} recensioni
          </Button>
        </div>
      )}

      {/* Dialog per la modifica della recensione */}
      {reviewToEdit && (
        <AlertDialog open={!!reviewToEdit} onOpenChange={(open) => !open && setReviewToEdit(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Modifica la tua recensione</AlertDialogTitle>
              <AlertDialogDescription>
                Puoi modificare la valutazione e il commento della tua recensione.
              </AlertDialogDescription>
            </AlertDialogHeader>
            
            <ReviewForm 
              inserzionistId={inserzionistId}
              existingReview={reviewToEdit}
              onSuccess={() => setReviewToEdit(null)}
              hideLabel
            />
            
            <AlertDialogFooter>
              <AlertDialogCancel>Annulla</AlertDialogCancel>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      {/* Dialog per la conferma dell'eliminazione */}
      <AlertDialog open={!!reviewToDelete} onOpenChange={(open) => !open && setReviewToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Sei sicuro di voler eliminare questa recensione?</AlertDialogTitle>
            <AlertDialogDescription>
              Questa azione non può essere annullata. La recensione sarà eliminata permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annulla</AlertDialogCancel>
            <AlertDialogAction 
              className="bg-red-500 hover:bg-red-600"
              onClick={handleDeleteReview}
              disabled={deleteReview.isPending}
            >
              {deleteReview.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Eliminazione...
                </>
              ) : (
                'Elimina'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ReviewList;