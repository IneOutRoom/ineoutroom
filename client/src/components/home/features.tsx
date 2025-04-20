import { Search, MapPin, Bell, MessageSquare, Map } from 'lucide-react';
import { Link } from 'wouter';
import { Button } from "@/components/ui/button";

export function Features() {
  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="font-montserrat font-bold text-2xl md:text-3xl">Perché scegliere In&Out</h2>
          <p className="text-neutral-600 mt-4">La piattaforma che rivoluziona la ricerca di alloggi in Europa con funzionalità uniche ed esclusive.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Feature 1 */}
          <div className="text-center p-6">
            <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="h-6 w-6" />
            </div>
            <h3 className="font-montserrat font-semibold text-lg mb-2">Aggregazione in tempo reale</h3>
            <p className="text-neutral-600 text-sm">Cerchiamo per te sui principali portali immobiliari, risparmiandoti tempo prezioso.</p>
          </div>
          
          {/* Feature 2 */}
          <div className="text-center p-6">
            <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-4">
              <MapPin className="h-6 w-6" />
            </div>
            <h3 className="font-montserrat font-semibold text-lg mb-2">Ricerca geolocalizzata</h3>
            <p className="text-neutral-600 text-sm">Trova facilmente alloggi vicino a te o nelle zone che ti interessano di più.</p>
          </div>
          
          {/* Feature 3 */}
          <div className="text-center p-6">
            <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-4">
              <Bell className="h-6 w-6" />
            </div>
            <h3 className="font-montserrat font-semibold text-lg mb-2">Notifiche personalizzate</h3>
            <p className="text-neutral-600 text-sm">Ricevi avvisi quando vengono pubblicati nuovi annunci che corrispondono ai tuoi criteri.</p>
          </div>
          
          {/* Feature 4 */}
          <div className="text-center p-6">
            <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="h-6 w-6" />
            </div>
            <h3 className="font-montserrat font-semibold text-lg mb-2">Chat integrata</h3>
            <p className="text-neutral-600 text-sm">Comunica direttamente con proprietari o inquilini interessati attraverso la nostra piattaforma.</p>
          </div>
        </div>
        
        {/* Pulsante per accedere alla nuova funzionalità di In&Out Maps */}
        <div className="mt-12 text-center">
          <div className="flex flex-col items-center p-6 border rounded-xl shadow-sm bg-white mb-4 mx-auto max-w-md">
            <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-4">
              <Map className="h-6 w-6" />
            </div>
            <h3 className="font-montserrat font-semibold text-xl mb-2">Scopri In&Out Maps</h3>
            <p className="text-neutral-600 mb-6">
              Visualizza e cerca immobili sulla mappa interattiva con Street View integrata. Scopri il quartiere e le zone circostanti in prima persona!
            </p>
            <Link href="/cartografia">
              <Button className="bg-primary hover:bg-primary/90 text-white px-6 py-2">
                Prova In&Out Maps
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
