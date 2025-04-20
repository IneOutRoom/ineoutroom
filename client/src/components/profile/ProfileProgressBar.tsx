import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Info, CheckCircle, Star } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface ProfileProgressBarProps {
  user: any; // Utilizziamo any per semplicità, ma in un'implementazione reale useremmo un'interfaccia User
}

export function ProfileProgressBar({ user }: ProfileProgressBarProps) {
  // Calcola il punteggio di completezza del profilo (da 0 a 100)
  const calculateProfileCompletion = () => {
    let score = 0;
    const totalFields = 8; // Numero totale di campi considerati per la completezza
    
    // Verifica la presenza di campi nel profilo
    if (user.name) score += 1;
    if (user.surname) score += 1;
    if (user.email) score += 1;
    if (user.phone) score += 1;
    if (user.bio && user.bio.length > 20) score += 1;
    if (user.profileImage) score += 1;
    if (user.emailVerified) score += 1;
    if (user.address) score += 1;
    
    return Math.floor((score / totalFields) * 100);
  };
  
  // Calcola la reputazione dell'utente (da 0 a 100)
  const calculateReputation = () => {
    // Questo è un calcolo di esempio
    const baseScore = 50; // Punteggio base
    let bonusPoints = 0;
    
    // Punteggi aggiuntivi basati su attività e recensioni
    if (user.emailVerified) bonusPoints += 10;
    if (user.phoneVerified) bonusPoints += 10;
    if (user.propertyCount > 0) bonusPoints += 5;
    if (user.reviewCount > 0) bonusPoints += 5;
    if (user.responseRate > 0.8) bonusPoints += 10;
    if (user.averageResponseTime < 60) bonusPoints += 10;
    
    return Math.min(100, baseScore + bonusPoints);
  };
  
  const profileCompletionScore = calculateProfileCompletion();
  const reputationScore = calculateReputation();
  
  // Determina il badge di stato dell'account
  const getStatusBadge = () => {
    if (user.emailVerified && user.phoneVerified) {
      return (
        <Badge variant="outline" className="gap-1 bg-emerald-100 border-emerald-300 text-emerald-700">
          <CheckCircle className="h-3 w-3" />
          Verificato
        </Badge>
      );
    } else if (user.emailVerified) {
      return (
        <Badge variant="outline" className="gap-1 bg-amber-100 border-amber-300 text-amber-700">
          <Star className="h-3 w-3" />
          Email verificata
        </Badge>
      );
    } else {
      return (
        <Badge variant="outline" className="gap-1 bg-muted border-muted-foreground/30 text-muted-foreground">
          <Info className="h-3 w-3" />
          In attesa di verifica
        </Badge>
      );
    }
  };
  
  // Ottieni le classi CSS per il colore della barra del progresso
  const getProgressBarColor = (score: number) => {
    if (score >= 80) return "bg-emerald-500";
    if (score >= 50) return "bg-amber-500";
    return "bg-red-500";
  };
  
  return (
    <Card className="border-primary/20">
      <CardContent className="pt-6 space-y-4">
        <div className="flex justify-between items-center mb-1">
          <div className="flex flex-col">
            <div className="text-sm font-medium">Completezza profilo</div>
            <div className="text-xs text-muted-foreground">
              {profileCompletionScore < 75 ? 'Completa il tuo profilo per migliorare la visibilità' : 'Ottimo lavoro!'}
            </div>
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge className="ml-2">
                  {profileCompletionScore}%
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <p>Aggiungi maggiori informazioni per migliorare la tua visibilità</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <Progress value={profileCompletionScore} className={`h-2 ${getProgressBarColor(profileCompletionScore)}`} />
        
        <div className="flex justify-between items-center mb-1 mt-6">
          <div className="flex flex-col">
            <div className="text-sm font-medium">Reputazione</div>
            <div className="text-xs text-muted-foreground">
              Basata su recensioni e interazioni
            </div>
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge className="ml-2">
                  {reputationScore}%
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <p>Basata su verifiche, recensioni e tempi di risposta</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <Progress value={reputationScore} className={`h-2 ${getProgressBarColor(reputationScore)}`} />
        
        <div className="flex justify-between items-center pt-2">
          <div className="text-sm">Stato account</div>
          {getStatusBadge()}
        </div>
      </CardContent>
    </Card>
  );
}