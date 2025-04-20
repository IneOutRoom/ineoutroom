import React from 'react';
import { Search, Home, Send, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';

export function HowItWorks() {
  return (
    <section className="py-16 bg-gray-50 dark:bg-zinc-900">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="font-montserrat font-bold text-2xl md:text-3xl">Come funziona</h2>
          <p className="text-neutral-600 dark:text-neutral-400 mt-4">
            Trovare casa o pubblicare il tuo annuncio non è mai stato così semplice
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
          {/* Step 1 */}
          <div className="bg-white dark:bg-zinc-800 rounded-lg p-6 shadow-sm relative">
            <div className="w-10 h-10 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-4">
              <Search className="h-5 w-5" />
            </div>
            <div className="absolute top-6 right-6 w-8 h-8 rounded-full bg-gray-200 dark:bg-zinc-700 flex items-center justify-center text-sm font-bold">
              1
            </div>
            <h3 className="font-montserrat font-semibold text-lg mb-2">Cerca l'alloggio ideale</h3>
            <p className="text-neutral-600 dark:text-neutral-400 text-sm mb-4">
              Utilizza i nostri filtri avanzati per trovare l'alloggio perfetto in base a zona, prezzo e caratteristiche.
            </p>
          </div>
          
          {/* Step 2 */}
          <div className="bg-white dark:bg-zinc-800 rounded-lg p-6 shadow-sm relative">
            <div className="w-10 h-10 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-4">
              <Send className="h-5 w-5" />
            </div>
            <div className="absolute top-6 right-6 w-8 h-8 rounded-full bg-gray-200 dark:bg-zinc-700 flex items-center justify-center text-sm font-bold">
              2
            </div>
            <h3 className="font-montserrat font-semibold text-lg mb-2">Contatta direttamente</h3>
            <p className="text-neutral-600 dark:text-neutral-400 text-sm mb-4">
              Chatta con i proprietari, organizza visite virtuali e ottieni tutte le informazioni che desideri.
            </p>
          </div>
          
          {/* Step 3 */}
          <div className="bg-white dark:bg-zinc-800 rounded-lg p-6 shadow-sm relative">
            <div className="w-10 h-10 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-4">
              <Home className="h-5 w-5" />
            </div>
            <div className="absolute top-6 right-6 w-8 h-8 rounded-full bg-gray-200 dark:bg-zinc-700 flex items-center justify-center text-sm font-bold">
              3
            </div>
            <h3 className="font-montserrat font-semibold text-lg mb-2">Trova casa e trasloca</h3>
            <p className="text-neutral-600 dark:text-neutral-400 text-sm mb-4">
              Finalizza l'accordo, firma i documenti digitalmente e preparati per il tuo nuovo alloggio.
            </p>
          </div>
        </div>
        
        {/* Proprietari section */}
        <div className="bg-gradient-to-r from-purple-900 to-purple-700 rounded-lg shadow-md overflow-hidden mt-12">
          <div className="grid md:grid-cols-2">
            <div className="p-8 text-white">
              <h3 className="font-montserrat font-bold text-xl mb-4">Sei un proprietario?</h3>
              <p className="mb-6">Pubblica il tuo annuncio e trova inquilini affidabili in poco tempo.</p>
              
              <ul className="space-y-3 mb-6">
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-yellow-300 mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">La tua <strong>prima inserzione è completamente gratuita</strong> - nessun pagamento richiesto!</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-yellow-300 mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Pacchetto conveniente da 5 inserzioni a soli €0,99 - nessun abbonamento</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-yellow-300 mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Pubblica foto, descrizioni dettagliate e la tua zona di preferenza</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-yellow-300 mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Ricevi richieste mirate da inquilini realmente interessati</span>
                </li>
              </ul>
              
              <Link href="/auth">
                <Button className="bg-yellow-400 hover:bg-yellow-500 text-purple-900 border-0">
                  Pubblica gratis
                </Button>
              </Link>
            </div>
            
            <div className="bg-purple-800 p-8 flex items-center justify-center">
              <div className="bg-white dark:bg-zinc-800 p-6 rounded-lg max-w-sm w-full shadow-lg">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="h-3 w-3/4 bg-gray-200 dark:bg-zinc-700 rounded"></div>
                    <div className="h-3 w-1/2 bg-gray-200 dark:bg-zinc-700 rounded"></div>
                  </div>
                  
                  <div className="h-32 bg-gray-200 dark:bg-zinc-700 rounded-md"></div>
                  
                  <div className="space-y-2">
                    <div className="h-3 w-full bg-gray-200 dark:bg-zinc-700 rounded"></div>
                    <div className="h-3 w-5/6 bg-gray-200 dark:bg-zinc-700 rounded"></div>
                    <div className="h-3 w-3/4 bg-gray-200 dark:bg-zinc-700 rounded"></div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div className="h-6 w-1/4 bg-purple-200 dark:bg-purple-900 rounded"></div>
                    <div className="h-8 w-1/4 bg-yellow-400 rounded"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default HowItWorks;