import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { InsertReview } from "@shared/schema"; 
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { StarRating } from "./StarRating";
import { Loader2 } from "lucide-react";

// Schema di validazione per la recensione
const reviewSchema = z.object({
  rating: z.number().min(1, {
    message: "Seleziona una valutazione da 1 a 5 stelle",
  }).max(5),
  comment: z.string().min(10, {
    message: "Il commento deve contenere almeno 10 caratteri",
  }).max(500, {
    message: "Il commento non può superare i 500 caratteri",
  }).nullable(),
});

// Tipo derivato dallo schema
type ReviewFormValues = z.infer<typeof reviewSchema>;

interface ReviewFormDialogProps {
  propertyId: number;
  existingReview?: {
    id: number;
    rating: number;
    comment: string | null;
  } | null;
  onReviewSubmitted: () => void;
}

export function ReviewFormDialog({ 
  propertyId, 
  existingReview = null,
  onReviewSubmitted 
}: ReviewFormDialogProps) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Inizializzazione del form
  const form = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      rating: existingReview?.rating || 0,
      comment: existingReview?.comment || "",
    },
  });

  // Mutazione per inviare la recensione
  const reviewMutation = useMutation({
    mutationFn: async (values: ReviewFormValues) => {
      const endpoint = existingReview 
        ? `/api/reviews/${existingReview.id}` 
        : `/api/properties/${propertyId}/reviews`;
      
      const method = existingReview ? "PATCH" : "POST";
      const res = await apiRequest(method, endpoint, {
        ...values,
        propertyId: existingReview ? undefined : propertyId
      });
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: existingReview ? "Recensione aggiornata" : "Recensione inviata",
        description: existingReview 
          ? "La tua recensione è stata aggiornata con successo." 
          : "La tua recensione è stata pubblicata con successo."
      });
      queryClient.invalidateQueries({ queryKey: [`/api/properties/${propertyId}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/properties/${propertyId}/reviews`] });
      form.reset();
      setOpen(false);
      onReviewSubmitted();
    },
    onError: (error: Error) => {
      toast({
        title: "Errore",
        description: error.message || "Impossibile inviare la recensione. Riprova più tardi.",
        variant: "destructive"
      });
    }
  });

  // Gestione dell'invio del form
  function onSubmit(data: ReviewFormValues) {
    reviewMutation.mutate(data);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          {existingReview ? "Modifica recensione" : "Scrivi una recensione"}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {existingReview ? "Modifica la tua recensione" : "Lascia una recensione"}
          </DialogTitle>
          <DialogDescription>
            Condividi la tua esperienza con questa proprietà. La tua opinione aiuterà altri utenti a prendere decisioni informate.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="rating"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Valutazione</FormLabel>
                  <FormControl>
                    <StarRating 
                      rating={field.value} 
                      onRatingChange={field.onChange}
                      size="lg"
                    />
                  </FormControl>
                  <FormDescription>
                    Seleziona una valutazione da 1 a 5 stelle
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="comment"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Commento</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Condividi la tua esperienza con questa proprietà..."
                      className="min-h-[120px] resize-none"
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormDescription>
                    Il tuo commento sarà visibile pubblicamente
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end">
              <Button 
                type="submit"
                disabled={reviewMutation.isPending}
              >
                {reviewMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {existingReview ? "Aggiorna recensione" : "Pubblica recensione"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}