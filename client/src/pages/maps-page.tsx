import React from 'react';
import { Link } from 'wouter';
import { MapIntegration } from '@/components/maps/MapIntegration';
import { Button } from '@/components/ui/button';
import { Home, Map } from 'lucide-react';

export default function MapsPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-8">
        <Link href="/">
          <Button variant="outline" className="flex items-center gap-2">
            <Home size={18} />
            <span>Torna alla Home</span>
          </Button>
        </Link>
      </div>
      
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-primary mb-2">In&Out Maps</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Esplora immobili, visualizza la loro posizione su mappa e utilizza Street View per un'esperienza immersiva
        </p>
      </div>
      
      <MapIntegration />
      
      <div className="mt-8 text-center">
        <p className="text-sm text-muted-foreground mb-4">
          Utilizza questa funzionalità integrata per trovare facilmente la posizione di qualsiasi immobile in Europa.
          Puoi cercare indirizzi, visualizzare la posizione sulla mappa e utilizzare Street View per esplorare il quartiere.
        </p>
        
        <Link href="/search">
          <Button className="flex items-center gap-2">
            <Map size={18} />
            <span>Cerca immobili</span>
          </Button>
        </Link>
      </div>
    </div>
  );
}