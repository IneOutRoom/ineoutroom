import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Loader2, AlertTriangle, AlertCircle, Users } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

interface ChurnRiskProps {
  userId?: number;
  hideDetails?: boolean;
}

/**
 * Componente per visualizzare il rischio di churn di un utente
 */
export default function ChurnRisk({ userId, hideDetails = false }: ChurnRiskProps) {
  // Query per ottenere i dati di rischio churn
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['/api/ml/churn', userId],
    queryFn: async () => {
      if (!userId) return null;
      
      const res = await apiRequest('POST', '/api/ml/churn', { 
        userId 
      });
      
      return res.json();
    },
    enabled: !!userId, // Esegui solo se userId è disponibile
  });
  
  // Se non abbiamo un userId, mostra un messaggio
  if (!userId) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Rischio Abbandono</CardTitle>
          <CardDescription>
            Seleziona un utente per valutare il rischio di abbandono
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }
  
  // Se stiamo caricando, mostra uno spinner
  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Analisi del rischio in corso</CardTitle>
          <CardDescription>
            Stiamo analizzando i dati di engagement...
          </CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-6">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }
  
  // Se c'è stato un errore, mostra un messaggio
  if (isError || !data) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Servizio non disponibile</CardTitle>
          <CardDescription>
            Non è stato possibile analizzare il rischio al momento
          </CardDescription>
        </CardHeader>
        <CardFooter>
          <Button variant="outline" onClick={() => refetch()}>
            Riprova
          </Button>
        </CardFooter>
      </Card>
    );
  }
  
  // Estrai i dati
  const { churn_probability, risk_level, risk_factors } = data;
  
  // Determina il colore e l'icona in base al livello di rischio
  const getRiskColor = () => {
    switch (risk_level) {
      case 'alto': return 'bg-destructive text-destructive-foreground';
      case 'medio': return 'bg-warning text-warning-foreground';
      case 'basso': return 'bg-success text-success-foreground';
      default: return 'bg-primary text-primary-foreground';
    }
  };
  
  const getRiskIcon = () => {
    switch (risk_level) {
      case 'alto': return <AlertTriangle className="h-4 w-4" />;
      case 'medio': return <AlertCircle className="h-4 w-4" />;
      case 'basso': return <Users className="h-4 w-4" />;
      default: return <Users className="h-4 w-4" />;
    }
  };
  
  const getProgressColor = () => {
    if (churn_probability > 0.7) return 'bg-destructive';
    if (churn_probability > 0.4) return 'bg-warning';
    return 'bg-success';
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Rischio Abbandono</CardTitle>
            <CardDescription>
              Analisi basata sul comportamento dell'utente
            </CardDescription>
          </div>
          <Badge variant="outline" className={getRiskColor()}>
            {getRiskIcon()}
            <span className="ml-1 capitalize">{risk_level}</span>
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-sm font-medium">Probabilità di abbandono</span>
            <span className="text-sm font-medium">{(churn_probability * 100).toFixed(0)}%</span>
          </div>
          <Progress 
            value={churn_probability * 100} 
            className="h-2"
            indicatorClassName={getProgressColor()}
          />
        </div>
        
        {!hideDetails && risk_factors && risk_factors.length > 0 && (
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="factors">
              <AccordionTrigger>Fattori di rischio</AccordionTrigger>
              <AccordionContent>
                <ul className="space-y-2 mt-2">
                  {risk_factors.map((factor, index) => (
                    <li key={index} className="flex items-start space-x-2 text-sm">
                      <Badge variant={
                        factor.importance === 'alta' ? 'destructive' : 
                        factor.importance === 'media' ? 'warning' : 'outline'
                      } className="mt-0.5">
                        {factor.importance}
                      </Badge>
                      <span>{factor.message}</span>
                    </li>
                  ))}
                </ul>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        )}
      </CardContent>
      
      {!hideDetails && (
        <CardFooter>
          <Button variant="outline" size="sm" className="w-full">
            Visualizza azioni consigliate
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}