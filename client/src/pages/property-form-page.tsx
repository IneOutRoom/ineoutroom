import React, { useState, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useLocation, useParams } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { Loader2, AlertTriangle, Check, HelpCircle } from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import PropertyForm from "@/components/forms/property-form";
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";

interface FormPageProps {
  isEditing?: boolean;
}

// Utility function to check if user has subscription or available single listings
const hasPublishingRights = (user: any): boolean => {
  // If user has an active subscription
  if (
    user.subscriptionPlan && 
    user.subscriptionExpiresAt && 
    new Date(user.subscriptionExpiresAt) > new Date()
  ) {
    return true;
  }
  
  // TODO: Check for remaining single listings quota
  // This would need to be implemented based on your backend logic
  
  return false;
};

const PropertyFormPage: React.FC<FormPageProps> = ({ isEditing = false }) => {
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const { user, isLoading: authLoading } = useAuth();
  const params = useParams();
  const propertyId = isEditing ? params?.id : null;
  const [formData, setFormData] = useState<any>(null);
  const [showPublishDialog, setShowPublishDialog] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<'single' | 'subscription'>('single');
  
  // Recupera i dati della proprietà in caso di modifica
  const { data: property, isLoading: propertyLoading } = useQuery({
    queryKey: propertyId ? ['/api/properties', parseInt(propertyId)] : null,
    enabled: isEditing && propertyId !== null,
  });

  // Verifica che l'utente sia proprietario
  const isOwner = user && property ? property.userId === user.id : false;

  // Get user publishing rights
  const { data: publishingRights, isLoading: rightsLoading } = useQuery({
    queryKey: ['/api/user/publishing-rights'],
    enabled: !!user && !isEditing,
  });

  // Gestione submit
  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/properties", data);
      if (!response.ok) {
        throw new Error("Errore durante la creazione dell'annuncio");
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Annuncio pubblicato",
        description: "Il tuo annuncio è stato pubblicato con successo."
      });
      navigate("/");
      queryClient.invalidateQueries({ queryKey: ['/api/properties'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Errore",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const updateMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("PUT", `/api/properties/${propertyId}`, data);
      if (!response.ok) {
        throw new Error("Errore durante l'aggiornamento dell'annuncio");
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Annuncio aggiornato",
        description: "Il tuo annuncio è stato aggiornato con successo."
      });
      navigate(`/properties/${propertyId}`);
      queryClient.invalidateQueries({ queryKey: ['/api/properties', parseInt(propertyId!)] });
    },
    onError: (error: Error) => {
      toast({
        title: "Errore",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const handleSubmit = (data: any) => {
    if (isEditing && propertyId) {
      updateMutation.mutate(data);
    } else {
      // Se l'utente ha la prima inserzione gratuita o ha un abbonamento attivo o altre inserzioni,
      // procedi con la creazione
      if (publishingRights?.canPublish) {
        // User has rights, proceed with creation
        createMutation.mutate(data);
      } else {
        // Altrimenti, mostra il dialogo per acquistare inserzioni
        setFormData(data);
        setShowPublishDialog(true);
      }
    }
  };

  const handleProceedToPayment = () => {
    // Navigate to checkout with appropriate plan parameter
    if (selectedPlan === 'single') {
      navigate('/checkout?plan=single&returnTo=' + encodeURIComponent('/properties/new'));
    } else {
      navigate('/subscription-plans');
    }
  };

  // Gestione caricamento e controllo autorizzazioni
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-border" />
      </div>
    );
  }

  if (!user) {
    // Redirect to login if not authenticated
    navigate("/auth");
    return null;
  }

  if (isEditing && propertyLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow container py-8">
          <h1 className="text-2xl font-bold mb-6">Modifica annuncio</h1>
          <div className="flex items-center justify-center p-12">
            <Loader2 className="h-8 w-8 animate-spin text-border" />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (isEditing && !isOwner) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow container py-8">
          <h1 className="text-2xl font-bold mb-6">Accesso negato</h1>
          <p>Non sei autorizzato a modificare questo annuncio.</p>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow container py-8">
        <div className="mb-8 bg-gradient-to-r from-[#6a0dad]/90 to-[#6a0dad]/70 p-6 rounded-lg shadow-lg text-white">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center mb-4 md:mb-0">
              <picture>
                <source srcSet="/logo.jpg" type="image/jpeg" />
                <source srcSet="/logo.png" type="image/png" />
                <img 
                  src="/logo.jpg" 
                  alt="In&Out Logo" 
                  className="h-16 mr-4"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = '/logo.jpg';
                  }} 
                />
              </picture>
              <div>
                <h1 className="text-3xl font-bold mb-2" style={{ textShadow: "2px 2px 4px rgba(0,0,0,0.3)" }}>
                  {isEditing ? "Modifica il tuo annuncio" : "Pubblica il tuo annuncio"}
                </h1>
                <p className="text-white/90">
                  {isEditing 
                    ? "Aggiorna le informazioni della tua proprietà per attirare più clienti" 
                    : "Crea un annuncio accattivante per trovare velocemente il tuo inquilino ideale"}
                </p>
              </div>
            </div>
            {!isEditing && (
              <div className="flex items-center bg-[#ffcb05] text-[#333] p-3 rounded-lg shadow-md">
                <HelpCircle className="h-5 w-5 mr-2" />
                <p className="text-sm font-medium">Usa l'AI per generare descrizioni e ottenere suggerimenti sul prezzo!</p>
              </div>
            )}
          </div>
        </div>

        {!isEditing && publishingRights && (
          <div className={`p-5 mb-8 rounded-lg border shadow-md ${publishingRights.canPublish ? 'bg-gradient-to-r from-green-50 to-green-100 border-green-200' : 'bg-gradient-to-r from-amber-50 to-amber-100 border-amber-200'}`}>
            <div className="flex items-start">
              {publishingRights.canPublish ? (
                <div className="rounded-full bg-green-500 p-2 mr-4 shadow-md">
                  <Check className="h-6 w-6 text-white" />
                </div>
              ) : (
                <div className="rounded-full bg-amber-500 p-2 mr-4 shadow-md">
                  <AlertTriangle className="h-6 w-6 text-white" />
                </div>
              )}
              
              <div>
                <h3 className="text-lg font-bold text-neutral-900" style={{ textShadow: "1px 1px 2px rgba(0,0,0,0.1)" }}>
                  {publishingRights.canPublish 
                    ? publishingRights.hasFreeListing 
                      ? "Hai diritto alla tua prima inserzione gratuita" 
                      : publishingRights.hasActiveSubscription
                        ? "Hai un abbonamento attivo"
                        : "Hai inserzioni disponibili"
                    : "Hai esaurito le tue inserzioni disponibili"
                  }
                </h3>
                <p className="text-neutral-700 mt-2">
                  {publishingRights.canPublish
                    ? publishingRights.hasFreeListing
                      ? "La tua prima inserzione è completamente gratuita! Procedi pure con la pubblicazione."
                      : publishingRights.remainingListings > 0
                        ? `Hai ${publishingRights.remainingListings} inserzioni disponibili nel pacchetto acquistato.`
                        : `Il tuo abbonamento ${publishingRights.subscriptionPlan} è attivo fino al ${new Date(publishingRights.expiresAt).toLocaleDateString('it-IT')}`
                    : "Per pubblicare altri annunci, puoi acquistare il pacchetto da 5 inserzioni o sottoscrivere un abbonamento mensile."
                  }
                </p>
                
                {!publishingRights.canPublish && (
                  <div className="mt-4 flex flex-wrap gap-3">
                    <Link href="/subscription-plans">
                      <Button 
                        className="bg-[#6a0dad] hover:bg-[#6a0dad]/80 shadow-md transition-all transform hover:scale-105"
                      >
                        Scopri i piani
                      </Button>
                    </Link>
                    
                    <Link href="/checkout?plan=single">
                      <Button 
                        variant="outline" 
                        className="border-[#6a0dad] text-[#6a0dad] hover:bg-[#ffcb05] hover:text-[#333] hover:border-[#ffcb05] shadow-md transition-all transform hover:scale-105"
                      >
                        Pacchetto 5 inserzioni (€0,99)
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <Card className="border-[#6a0dad]/20 shadow-lg mb-6">
          <CardContent className="p-6">
            <PropertyForm 
              initialData={isEditing ? property : undefined}
              onSubmit={handleSubmit}
              isSubmitting={isEditing ? updateMutation.isPending : createMutation.isPending}
            />
          </CardContent>
        </Card>
      </main>
      
      <Footer />
      
      {/* Dialog per le opzioni di pubblicazione */}
      <Dialog open={showPublishDialog} onOpenChange={setShowPublishDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Scegli un'opzione per pubblicare</DialogTitle>
            <DialogDescription>
              Per pubblicare altri annunci, puoi acquistare il pacchetto da 5 inserzioni o sottoscrivere un abbonamento mensile.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            <Card 
              className={`cursor-pointer border transition-all ${selectedPlan === 'single' ? 'border-primary' : 'border-neutral-200'}`}
              onClick={() => setSelectedPlan('single')}
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Pacchetto 5 inserzioni</CardTitle>
                <div className="text-lg font-bold text-primary">€0,99</div>
                <CardDescription className="text-xs">Una tantum</CardDescription>
              </CardHeader>
              <CardContent className="text-xs">
                <p>5 inserzioni utilizzabili quando vuoi, validità illimitata</p>
              </CardContent>
              <CardFooter>
                {selectedPlan === 'single' && (
                  <Badge variant="outline" className="bg-primary/10 border-primary text-primary">Selezionato</Badge>
                )}
              </CardFooter>
            </Card>
            
            <Card 
              className={`cursor-pointer border transition-all ${selectedPlan === 'subscription' ? 'border-primary' : 'border-neutral-200'}`}
              onClick={() => setSelectedPlan('subscription')}
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Abbonamento</CardTitle>
                <div className="text-lg font-bold text-primary">da €5,99</div>
                <CardDescription className="text-xs">Al mese</CardDescription>
              </CardHeader>
              <CardContent className="text-xs">
                <p>Pubblica fino a decine di annunci ogni mese con funzionalità avanzate</p>
              </CardContent>
              <CardFooter>
                {selectedPlan === 'subscription' && (
                  <Badge variant="outline" className="bg-primary/10 border-primary text-primary">Selezionato</Badge>
                )}
              </CardFooter>
            </Card>
          </div>
          
          <DialogFooter className="sm:justify-between">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setShowPublishDialog(false)}
            >
              Annulla
            </Button>
            <Button 
              type="button" 
              onClick={handleProceedToPayment}
            >
              Procedi al pagamento
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PropertyFormPage;