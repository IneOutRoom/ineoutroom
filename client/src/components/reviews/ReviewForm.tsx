import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import useReviews from '@/hooks/use-reviews';
import { UserReview } from '@shared/schema';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

// Schema di validazione per il form
const formSchema = z.object({
  rating: z.number().min(1, 'Seleziona almeno una stella').max(5),
  comment: z.string().optional(),
});

// Tipo per i dati del form
type FormValues = z.infer<typeof formSchema>;

interface ReviewFormProps {
  inserzionistId: number;
  onSuccess?: () => void;
  existingReview?: UserReview | null;
  hideLabel?: boolean;
  className?: string;
}

/**
 * Form per la creazione o modifica di una recensione
 */
export const ReviewForm: React.FC<ReviewFormProps> = ({
  inserzionistId,
  onSuccess,
  existingReview,
  hideLabel = false,
  className
}) => {
  const { toast } = useToast();
  const { createReview, updateReview } = useReviews();
  const [hoveredRating, setHoveredRating] = useState<number | null>(null);

  // Configura il form con valori iniziali se c'è una recensione esistente
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      rating: existingReview?.rating || 0,
      comment: existingReview?.comment || '',
    },
  });

  // Gestisce l'invio del form
  const onSubmit = async (values: FormValues) => {
    try {
      if (existingReview) {
        // Aggiorna una recensione esistente
        await updateReview.mutateAsync({
          reviewId: existingReview.id,
          data: values
        });
        
        toast({
          title: 'Recensione aggiornata',
          description: 'La tua recensione è stata aggiornata con successo.',
        });
      } else {
        // Crea una nuova recensione
        await createReview.mutateAsync({
          inserzionistId,
          ...values
        });
        
        toast({
          title: 'Recensione inviata',
          description: 'La tua recensione è stata inviata con successo.',
        });
      }
      
      // Reset del form e callback di successo
      if (!existingReview) {
        form.reset();
      }
      
      onSuccess?.();
    } catch (error: any) {
      console.error('Errore durante l\'invio della recensione:', error);
      
      let errorMessage = 'Si è verificato un errore durante l\'invio della recensione.';
      if (error.status === 409) {
        errorMessage = 'Hai già recensito questo inserzionista.';
      } else if (error.status === 403) {
        errorMessage = 'Non puoi recensire te stesso.';
      }
      
      toast({
        title: 'Errore',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  };

  // Stato di caricamento
  const isLoading = createReview.isPending || updateReview.isPending;

  // Render
  return (
    <Form {...form}>
      <form 
        onSubmit={form.handleSubmit(onSubmit)} 
        className={cn('space-y-4', className)}
      >
        <FormField
          control={form.control}
          name="rating"
          render={({ field }) => (
            <FormItem>
              {!hideLabel && (
                <FormLabel>Valutazione</FormLabel>
              )}
              <FormControl>
                <div className="flex items-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={cn(
                        'w-6 h-6 cursor-pointer transition-colors',
                        (hoveredRating !== null ? star <= hoveredRating : star <= field.value)
                          ? 'text-yellow-400 fill-yellow-400'
                          : 'text-gray-300'
                      )}
                      onClick={() => field.onChange(star)}
                      onMouseEnter={() => setHoveredRating(star)}
                      onMouseLeave={() => setHoveredRating(null)}
                    />
                  ))}
                  <span className="ml-2 text-sm text-gray-500">
                    {field.value ? `${field.value} stelle` : 'Seleziona una valutazione'}
                  </span>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="comment"
          render={({ field }) => (
            <FormItem>
              {!hideLabel && (
                <FormLabel>Commento (facoltativo)</FormLabel>
              )}
              <FormControl>
                <Textarea
                  placeholder="Scrivi qui il tuo commento..."
                  className="resize-y"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
          {isLoading ? 'Invio in corso...' : existingReview ? 'Aggiorna recensione' : 'Pubblica recensione'}
        </Button>
      </form>
    </Form>
  );
};

export default ReviewForm;