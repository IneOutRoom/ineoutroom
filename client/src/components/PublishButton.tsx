import React, { useState } from 'react';
import { Link } from 'wouter';
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Info, AlertTriangle } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { useAuth } from '@/hooks/use-auth';

type PublishButtonProps = {
  className?: string;
  size?: 'default' | 'sm' | 'lg' | 'icon';
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'link' | 'ghost';
}

export const PublishButton: React.FC<PublishButtonProps> = ({ 
  className = '', 
  size = 'default',
  variant = 'default'
}) => {
  const [showDialog, setShowDialog] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  
  // Ottieni informazioni sui diritti di pubblicazione
  const { data, isLoading, error } = useQuery({
    queryKey: ['/api/user/publishing-rights'],
    enabled: !!user, // Esegui solo se l'utente è autenticato
  });

  if (!user) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className={`inline-block ${className}`}>
              <Button 
                variant={variant} 
                size={size}
                onClick={() => toast({
                  title: "Accesso richiesto",
                  description: "Devi effettuare l'accesso per pubblicare un annuncio",
                })}
              >
                Pubblica annuncio
              </Button>
            </span>
          </TooltipTrigger>
          <TooltipContent>
            <p>Accedi o registrati per pubblicare un annuncio</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  if (isLoading) {
    return (
      <Button variant={variant} size={size} disabled className={className}>
        <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-b-transparent"></span>
        Caricamento...
      </Button>
    );
  }

  if (error || !data) {
    return (
      <Button 
        variant="outline" 
        size={size} 
        onClick={() => toast({
          title: "Errore",
          description: "Impossibile verificare i diritti di pubblicazione. Riprova più tardi.",
          variant: "destructive"
        })}
        className={className}
      >
        <AlertTriangle className="mr-2 h-4 w-4" />
        Verifica non disponibile
      </Button>
    );
  }

  // Se l'utente può pubblicare, mostra il pulsante normale
  if (data.canPublish) {
    // Mostra indicazione della prima inserzione gratuita
    if (data.hasFreeListing) {
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Link href="/properties/new" className={className}>
                <Button variant={variant} size={size}>
                  Pubblica gratis
                  <Info className="ml-1.5 h-4 w-4" />
                </Button>
              </Link>
            </TooltipTrigger>
            <TooltipContent className="max-w-xs text-center">
              <p>La tua prima inserzione è gratuita!</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }
    
    // Se ha un abbonamento attivo o inserzioni rimanenti
    return (
      <Link href="/properties/new" className={className}>
        <Button variant={variant} size={size}>
          {data.remainingListings > 0 ? 
            `Pubblica (${data.remainingListings} rimaste)` : 
            'Pubblica annuncio'
          }
        </Button>
      </Link>
    );
  }

  // Se l'utente non può pubblicare, mostra il pulsante che apre il dialog
  return (
    <>
      <Button 
        variant="outline" 
        size={size} 
        onClick={() => setShowDialog(true)}
        className={className}
      >
        Pubblica annuncio
      </Button>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Acquista crediti per pubblicare</DialogTitle>
            <DialogDescription>
              Non hai abbonamenti attivi o inserzioni disponibili.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
              <h3 className="font-semibold text-amber-800 flex items-center">
                <Info className="h-4 w-4 mr-2" />
                Opzioni disponibili
              </h3>
              <ul className="mt-2 space-y-2 text-sm">
                <li className="flex items-start">
                  <span className="bg-amber-200 text-amber-800 rounded-full px-2 text-xs font-medium mr-2 mt-0.5">1</span>
                  <span>Acquista pacchetto di 5 inserzioni a soli €0,99</span>
                </li>
                <li className="flex items-start">
                  <span className="bg-amber-200 text-amber-800 rounded-full px-2 text-xs font-medium mr-2 mt-0.5">2</span>
                  <span>Abbonati al piano Standard a €5,99/mese per 30 inserzioni</span>
                </li>
                <li className="flex items-start">
                  <span className="bg-amber-200 text-amber-800 rounded-full px-2 text-xs font-medium mr-2 mt-0.5">3</span>
                  <span>Abbonati al piano Premium a €9,99/mese per inserzioni illimitate</span>
                </li>
              </ul>
            </div>
          </div>

          <DialogFooter className="flex-col sm:flex-row sm:justify-between gap-2">
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Annulla
            </Button>
            <div className="flex gap-2">
              <Link href="/checkout?plan=5listings">
                <Button variant="outline">
                  5 inserzioni
                </Button>
              </Link>
              <Link href="/subscription-plans-page">
                <Button>
                  Vedi piani
                </Button>
              </Link>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PublishButton;