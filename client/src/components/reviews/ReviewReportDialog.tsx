import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Flag } from "lucide-react";

// Schema di validazione per la segnalazione
const reportFormSchema = z.object({
  reason: z.string({
    required_error: "Seleziona un motivo per la segnalazione",
  }),
  details: z.string().min(10, {
    message: "Fornisci almeno 10 caratteri di dettagli",
  }).max(500, {
    message: "I dettagli non possono superare 500 caratteri",
  }),
});

// Tipo derivato dallo schema
type ReportFormValues = z.infer<typeof reportFormSchema>;

// Opzioni per i motivi di segnalazione
const reportReasons = [
  { value: "inappropriate", label: "Contenuto inappropriato" },
  { value: "spam", label: "Spam o pubblicità" },
  { value: "offensive", label: "Linguaggio offensivo" },
  { value: "fake", label: "Recensione falsa" },
  { value: "other", label: "Altro" },
];

interface ReviewReportDialogProps {
  reviewId: number;
}

export function ReviewReportDialog({ reviewId }: ReviewReportDialogProps) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  
  // Inizializzazione del form
  const form = useForm<ReportFormValues>({
    resolver: zodResolver(reportFormSchema),
    defaultValues: {
      reason: "",
      details: "",
    },
  });

  // Mutazione per l'invio della segnalazione
  const reportMutation = useMutation({
    mutationFn: async (values: ReportFormValues) => {
      const res = await apiRequest("POST", `/api/reviews/${reviewId}/report`, values);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Segnalazione inviata",
        description: "Grazie per la tua segnalazione. Il nostro team la esaminerà al più presto.",
      });
      form.reset();
      setOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Errore",
        description: error.message || "Impossibile inviare la segnalazione. Riprova più tardi.",
        variant: "destructive",
      });
    },
  });

  // Gestione dell'invio del form
  function onSubmit(data: ReportFormValues) {
    reportMutation.mutate(data);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="text-gray-500 hover:text-red-500">
          <Flag className="h-4 w-4 mr-1" /> Segnala
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Segnala recensione</DialogTitle>
          <DialogDescription>
            Segnala questa recensione se ritieni che violi le linee guida della community.
            La tua segnalazione sarà esaminata dal nostro team.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Motivo della segnalazione</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleziona un motivo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {reportReasons.map((reason) => (
                        <SelectItem key={reason.value} value={reason.value}>
                          {reason.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="details"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Dettagli</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Fornisci maggiori dettagli sulla tua segnalazione..."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Descrivi perché ritieni che questa recensione debba essere segnalata.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter>
              <Button 
                type="submit" 
                disabled={reportMutation.isPending}
                className="bg-red-600 hover:bg-red-700"
              >
                {reportMutation.isPending ? "Invio in corso..." : "Invia segnalazione"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}