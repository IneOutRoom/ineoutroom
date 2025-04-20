import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { MessageCircle, Check, X, Edit, Trash } from "lucide-react";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface ReviewResponseProps {
  reviewId: number;
  existingResponse?: string | null;
  isPropertyOwner: boolean;
  onResponseSubmitted: (response: string) => void;
}

export function ReviewResponse({
  reviewId,
  existingResponse,
  isPropertyOwner,
  onResponseSubmitted
}: ReviewResponseProps) {
  const [isEditing, setIsEditing] = useState(!existingResponse);
  const [response, setResponse] = useState(existingResponse || "");
  const { toast } = useToast();

  // Mutazione per salvare/aggiornare la risposta
  const responseMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", `/api/reviews/${reviewId}/respond`, {
        response
      });
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Risposta salvata",
        description: "La tua risposta è stata pubblicata con successo."
      });
      setIsEditing(false);
      onResponseSubmitted(response);
    },
    onError: (error: Error) => {
      toast({
        title: "Errore",
        description: error.message || "Impossibile salvare la risposta. Riprova più tardi.",
        variant: "destructive"
      });
    }
  });

  // Mutazione per eliminare la risposta
  const deleteMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("DELETE", `/api/reviews/${reviewId}/respond`);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Risposta eliminata",
        description: "La tua risposta è stata eliminata con successo."
      });
      setResponse("");
      setIsEditing(true);
      onResponseSubmitted("");
    },
    onError: (error: Error) => {
      toast({
        title: "Errore",
        description: error.message || "Impossibile eliminare la risposta. Riprova più tardi.",
        variant: "destructive"
      });
    }
  });

  // Se l'utente non è il proprietario e non c'è risposta, non mostrare nulla
  if (!isPropertyOwner && !existingResponse) {
    return null;
  }

  // Se non è in modalità modifica, mostra la risposta esistente
  if (!isEditing) {
    return (
      <div className="mt-4 p-4 bg-gray-50 rounded-md border border-gray-200">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center text-gray-700 font-medium">
            <MessageCircle className="h-4 w-4 mr-2" />
            Risposta del proprietario
          </div>
          {isPropertyOwner && (
            <div className="flex space-x-2">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setIsEditing(true)}
                className="h-8 px-2 text-gray-500 hover:text-blue-600"
              >
                <Edit className="h-4 w-4 mr-1" /> Modifica
              </Button>
              
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 px-2 text-gray-500 hover:text-red-600"
                  >
                    <Trash className="h-4 w-4 mr-1" /> Elimina
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Sei sicuro?</AlertDialogTitle>
                    <AlertDialogDescription>
                      La tua risposta sarà eliminata definitivamente. Questa azione non può essere annullata.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Annulla</AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={() => deleteMutation.mutate()}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      {deleteMutation.isPending ? "Eliminazione..." : "Elimina"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          )}
        </div>
        <p className="text-gray-600">{existingResponse}</p>
      </div>
    );
  }

  // Modalità modifica
  return (
    <div className="mt-4 p-4 bg-gray-50 rounded-md border border-gray-200">
      <div className="flex items-center text-gray-700 font-medium mb-2">
        <MessageCircle className="h-4 w-4 mr-2" />
        {existingResponse ? "Modifica risposta" : "Rispondi alla recensione"}
      </div>
      
      <Textarea
        value={response}
        onChange={(e) => setResponse(e.target.value)}
        placeholder="Scrivi una risposta pubblica a questa recensione..."
        className="min-h-[100px] mb-3"
      />
      
      <div className="flex justify-end space-x-2">
        {existingResponse && (
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => {
              setResponse(existingResponse);
              setIsEditing(false);
            }}
          >
            <X className="h-4 w-4 mr-1" /> Annulla
          </Button>
        )}
        
        <Button 
          size="sm"
          onClick={() => responseMutation.mutate()}
          disabled={responseMutation.isPending || !response.trim()}
        >
          <Check className="h-4 w-4 mr-1" /> {responseMutation.isPending ? "Salvataggio..." : "Salva risposta"}
        </Button>
      </div>
    </div>
  );
}