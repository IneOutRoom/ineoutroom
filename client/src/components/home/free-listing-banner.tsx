import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from '@tanstack/react-query';
import { Tag, Gift, ArrowRight, CheckCircle } from 'lucide-react';

export const FreeListingBanner = () => {
  const { user } = useAuth();
  
  // Ottieni informazioni sui diritti di pubblicazione
  const { data } = useQuery({
    queryKey: ['/api/user/publishing-rights'],
    enabled: !!user, // Esegui solo se l'utente è autenticato
  });
  
  // Non mostrare il banner se l'utente ha già usato la prima inserzione gratuita
  if (user && data && data.usedFreeListing === true) {
    return null;
  }
  
  // Stile del banner
  const cardGradient = "bg-gradient-to-r from-purple-900 via-purple-800 to-purple-700";
  
  return (
    <Card className={`border-0 shadow-lg overflow-hidden mb-8 ${cardGradient}`}>
      <CardContent className="p-0">
        <div className="grid md:grid-cols-3 relative">
          {/* Decorazioni grafiche */}
          <div className="absolute top-0 left-0 w-24 h-24 opacity-10">
            <Tag size={96} />
          </div>
          <div className="absolute bottom-0 right-0 w-24 h-24 opacity-10 transform rotate-12">
            <Gift size={96} />
          </div>
          
          {/* Contenuto testuale */}
          <div className="md:col-span-2 p-6 text-white">
            <div className="flex items-center mb-2">
              <Gift className="text-yellow-300 mr-2" />
              <h3 className="text-xl md:text-2xl font-bold text-yellow-300">
                {user ? "La tua prima inserzione è GRATIS!" : "Prima inserzione GRATIS!"}
              </h3>
            </div>
            
            <p className="mb-4 text-gray-100 text-sm md:text-base">
              Pubblica il tuo primo annuncio completamente gratis e 
              raggiungi subito migliaia di potenziali inquilini. 
              Non serve carta di credito!
            </p>
            
            <div className="hidden md:flex space-x-6 text-gray-100 text-sm">
              <div className="flex items-center">
                <CheckCircle className="text-yellow-300 h-4 w-4 mr-1" />
                <span>Visibilità completa</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="text-yellow-300 h-4 w-4 mr-1" />
                <span>Zero commissioni</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="text-yellow-300 h-4 w-4 mr-1" />
                <span>Chat con interessati</span>
              </div>
            </div>
          </div>
          
          {/* Bottone */}
          <div className="flex items-center justify-center p-6 bg-black bg-opacity-30">
            {user ? (
              <Link href="/properties/new">
                <Button className="w-full bg-yellow-400 hover:bg-yellow-500 text-purple-900 font-bold">
                  Pubblica gratis
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            ) : (
              <Link href="/auth">
                <Button className="w-full bg-yellow-400 hover:bg-yellow-500 text-purple-900 font-bold">
                  Registrati ora
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FreeListingBanner;