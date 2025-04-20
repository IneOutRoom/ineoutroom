import React from "react";
import { Helmet } from "react-helmet";
import { ModernAddressAutocompleteDemo } from "@/components/maps/ModernAddressAutocompleteDemo";

/**
 * Pagina di dimostrazione per il componente ModernAddressAutocompleteInput
 * Questa pagina mostra la nuova API PlaceAutocompleteElement rispetto alla vecchia Autocomplete
 */
export default function AutocompleteModernDemoPage() {
  return (
    <>
      <Helmet>
        <title>Demo Moderno Autocomplete - In&Out</title>
        <meta 
          name="description" 
          content="Pagina di dimostrazione che confronta l'API moderna PlaceAutocompleteElement con l'API legacy Autocomplete di Google Maps" 
        />
      </Helmet>
      
      <div className="container mx-auto py-8 px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary mb-2">
            Demo Moderna Autocomplete
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Confronto tra l'API legacy e l'API moderna di Google Maps per autocompletamento indirizzi.
            <br />
            <span className="text-sm italic">
              A partire da marzo 2025, Google consiglia di migrare all'API PlaceAutocompleteElement.
            </span>
          </p>
        </div>
        
        <ModernAddressAutocompleteDemo />

        <div className="bg-muted p-6 rounded-lg mt-10 max-w-3xl mx-auto shadow-sm">
          <h2 className="font-semibold text-xl mb-4">Informazioni sulla migrazione API</h2>
          
          <div className="space-y-4 text-sm">
            <div>
              <h3 className="font-medium text-primary">Perché questa migrazione?</h3>
              <p>
                Google sta aggiornando le API Places per migliorare performance, accessibilità e 
                rispetto della privacy. La nuova API PlaceAutocompleteElement offre funzionalità
                avanzate e migliore integrazione con gli standard web moderni.
              </p>
            </div>
            
            <div>
              <h3 className="font-medium text-primary">Cosa succede all'API Autocomplete legacy?</h3>
              <p>
                L'API Autocomplete continuerà a funzionare per gli account esistenti, ma non sarà
                disponibile per nuovi clienti dopo marzo 2025. Google garantisce almeno 12 mesi di 
                preavviso prima della dismissione completa.
              </p>
            </div>
            
            <div>
              <h3 className="font-medium text-primary">Vantaggi della nuova API</h3>
              <ul className="list-disc pl-5 space-y-1">
                <li>Migliore accessibilità e supporto per screen reader</li>
                <li>Supporto nativo per i componenti web</li>
                <li>Gestione più efficiente delle restrizioni geografiche</li>
                <li>Miglior supporto per dispositivi mobili e touch</li>
                <li>Rispetto delle linee guida WCAG 2.1</li>
              </ul>
            </div>
            
            <p className="text-muted-foreground italic">
              Fonte: <a href="https://developers.google.com/maps/documentation/javascript/places-migration-overview" 
                       target="_blank" rel="noopener noreferrer" 
                       className="underline hover:text-primary">
                Documentazione ufficiale Google Maps Platform
              </a>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}