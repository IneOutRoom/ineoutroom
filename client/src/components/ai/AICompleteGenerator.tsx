import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sparkles, Check, PencilLine, Loader2 } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { FaArrowDown } from 'react-icons/fa';
import { propertyTypeEnum } from "@shared/schema";

interface AICompleteGeneratorProps {
  initialTitle: string;
  initialDescription: string;
  onSelectTitle: (title: string) => void;
  onSelectDescription: (description: string) => void;
  propertyType?: string;
  city?: string;
  zone?: string;
  size?: number;
}

/**
 * Componente ottimizzato per generare sia titolo che descrizione in un'unica chiamata API
 * Utilizza l'endpoint /api/generaTesto per ottenere entrambi i contenuti con una sola richiesta
 */
export default function AICompleteGenerator({
  initialTitle,
  initialDescription,
  onSelectTitle,
  onSelectDescription,
  propertyType = "",
  city = "",
  zone = "",
  size = 0
}: AICompleteGeneratorProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [title, setTitle] = useState(initialTitle);
  const [description, setDescription] = useState(initialDescription);
  const [activeTab, setActiveTab] = useState<string>("anteprima");
  const [titleSelected, setTitleSelected] = useState(false);
  const [descriptionSelected, setDescriptionSelected] = useState(false);
  const [generationFeedback, setGenerationFeedback] = useState("");

  const titleInputRef = useRef<HTMLInputElement>(null);
  const descriptionTextareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    // Resetta lo stato di selezione quando vengono forniti nuovi valori iniziali
    setTitleSelected(false);
    setDescriptionSelected(false);
  }, [initialTitle, initialDescription]);

  // Genera entrambi i contenuti contemporaneamente con una chiamata API ottimizzata
  const generateContents = async () => {
    if (!propertyType || !city) {
      setGenerationFeedback("Compila almeno il tipo di proprietà e la città per generare contenuti migliori.");
      return;
    }

    try {
      setIsLoading(true);
      setGenerationFeedback("Attendere, creazione contenuti in corso...");

      // Prepara i dati della proprietà per la generazione
      const propertyData = {
        propertyType,
        city,
        zone,
        size,
        richiesta: "completa" // Richiediamo sia titolo che descrizione
      };

      // Usa il nuovo endpoint ottimizzato
      const response = await apiRequest("POST", "/api/generaTesto", {
        datiAnnuncio: propertyData
      });

      if (!response.ok) {
        throw new Error("Errore nella generazione dei contenuti");
      }

      const data = await response.json();
      
      // Aggiorna entrambi i campi con i contenuti generati
      if (data.titolo) {
        setTitle(data.titolo);
        setTitleSelected(false);
      }
      
      if (data.descrizione) {
        setDescription(data.descrizione);
        setDescriptionSelected(false);
      }

      setGenerationFeedback("Contenuti generati con successo!");
      setActiveTab("anteprima");
    } catch (error) {
      console.error("Errore durante la generazione dei contenuti:", error);
      setGenerationFeedback("Si è verificato un errore durante la generazione. Riprova più tardi.");
    } finally {
      setIsLoading(false);
    }
  };

  // Gestione selezione titolo
  const handleSelectTitle = () => {
    onSelectTitle(title);
    setTitleSelected(true);
  };

  // Gestione selezione descrizione
  const handleSelectDescription = () => {
    onSelectDescription(description);
    setDescriptionSelected(true);
  };

  // Selezione di entrambi i contenuti
  const handleSelectBoth = () => {
    onSelectTitle(title);
    onSelectDescription(description);
    setTitleSelected(true);
    setDescriptionSelected(true);
  };

  // Helper per mostrare il tipo di proprietà in formato leggibile
  const getPropertyTypeLabel = (type: string): string => {
    switch (type) {
      case 'stanza_singola': return 'Stanza Singola';
      case 'stanza_doppia': return 'Stanza Doppia';
      case 'monolocale': return 'Monolocale';
      case 'bilocale': return 'Bilocale';
      default: return type.charAt(0).toUpperCase() + type.slice(1).replace('_', ' ');
    }
  };

  return (
    <div className="space-y-4">
      {/* Intestazione e informazioni sulla proprietà */}
      <div className="space-y-2">
        <div className="flex flex-wrap gap-2 text-sm">
          {propertyType && (
            <span className="px-2 py-1 bg-primary/10 text-primary rounded-md">
              {getPropertyTypeLabel(propertyType)}
            </span>
          )}
          {city && (
            <span className="px-2 py-1 bg-primary/10 text-primary rounded-md">
              {city}
            </span>
          )}
          {zone && (
            <span className="px-2 py-1 bg-primary/10 text-primary rounded-md">
              {zone}
            </span>
          )}
          {size > 0 && (
            <span className="px-2 py-1 bg-primary/10 text-primary rounded-md">
              {size} m²
            </span>
          )}
        </div>
        
        <p className="text-sm text-muted-foreground">
          {generationFeedback || "Compila i dettagli della proprietà per ottenere i migliori risultati di generazione."}
        </p>
      </div>

      {/* Pulsante di generazione */}
      <Button
        type="button"
        variant="default"
        className="w-full"
        onClick={generateContents}
        disabled={isLoading || !propertyType || !city}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Generazione in corso...
          </>
        ) : (
          <>
            <Sparkles className="mr-2 h-4 w-4" />
            Genera contenuti con AI
          </>
        )}
      </Button>

      {/* Tabs per navigare tra anteprima e modifica */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full mt-4">
        <TabsList className="w-full grid grid-cols-2">
          <TabsTrigger value="anteprima">Anteprima</TabsTrigger>
          <TabsTrigger value="modifica">Modifica</TabsTrigger>
        </TabsList>
        
        {/* Sezione anteprima */}
        <TabsContent value="anteprima" className="p-0 mt-4">
          <Card>
            <CardContent className="p-4 space-y-4">
              {/* Anteprima titolo */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-medium text-muted-foreground">Titolo</h3>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleSelectTitle}
                    disabled={isLoading || titleSelected}
                    className="h-8"
                  >
                    {titleSelected ? (
                      <>
                        <Check className="mr-2 h-4 w-4 text-green-500" />
                        Applicato
                      </>
                    ) : (
                      "Applica titolo"
                    )}
                  </Button>
                </div>
                
                {isLoading ? (
                  <Skeleton className="h-10 w-full" />
                ) : (
                  <div className="p-3 border rounded-md bg-muted/30">
                    <p className="font-medium">{title || "Nessun titolo generato"}</p>
                  </div>
                )}
              </div>
              
              {/* Anteprima descrizione */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-medium text-muted-foreground">Descrizione</h3>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleSelectDescription}
                    disabled={isLoading || descriptionSelected}
                    className="h-8"
                  >
                    {descriptionSelected ? (
                      <>
                        <Check className="mr-2 h-4 w-4 text-green-500" />
                        Applicato
                      </>
                    ) : (
                      "Applica descrizione"
                    )}
                  </Button>
                </div>
                
                {isLoading ? (
                  <Skeleton className="h-40 w-full" />
                ) : (
                  <div className="p-3 border rounded-md bg-muted/30 max-h-60 overflow-y-auto">
                    <p className="whitespace-pre-line">{description || "Nessuna descrizione generata"}</p>
                  </div>
                )}
              </div>
              
              {/* Pulsante applica tutto */}
              <Button
                type="button"
                variant="secondary"
                onClick={handleSelectBoth}
                disabled={isLoading || (titleSelected && descriptionSelected) || (!title && !description)}
                className="w-full mt-4"
              >
                {titleSelected && descriptionSelected ? (
                  <>
                    <Check className="mr-2 h-4 w-4 text-green-500" />
                    Contenuti applicati
                  </>
                ) : (
                  <>
                    <FaArrowDown className="mr-2 h-4 w-4" />
                    Applica entrambi i contenuti
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Sezione modifica */}
        <TabsContent value="modifica" className="p-0 mt-4">
          <Card>
            <CardContent className="p-4 space-y-4">
              {/* Modifica titolo */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-medium text-muted-foreground">Titolo</h3>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleSelectTitle}
                    disabled={isLoading || titleSelected}
                    className="h-8"
                  >
                    {titleSelected ? (
                      <>
                        <Check className="mr-2 h-4 w-4 text-green-500" />
                        Applicato
                      </>
                    ) : (
                      <>
                        <PencilLine className="mr-2 h-4 w-4" />
                        Applica
                      </>
                    )}
                  </Button>
                </div>
                
                <Input
                  ref={titleInputRef}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Inserisci un titolo"
                  disabled={isLoading}
                  className="w-full"
                />
              </div>
              
              {/* Modifica descrizione */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-medium text-muted-foreground">Descrizione</h3>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleSelectDescription}
                    disabled={isLoading || descriptionSelected}
                    className="h-8"
                  >
                    {descriptionSelected ? (
                      <>
                        <Check className="mr-2 h-4 w-4 text-green-500" />
                        Applicato
                      </>
                    ) : (
                      <>
                        <PencilLine className="mr-2 h-4 w-4" />
                        Applica
                      </>
                    )}
                  </Button>
                </div>
                
                <Textarea
                  ref={descriptionTextareaRef}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Inserisci una descrizione"
                  disabled={isLoading}
                  className="min-h-[150px] w-full"
                />
              </div>
              
              {/* Pulsante applica tutto */}
              <Button
                type="button"
                variant="secondary"
                onClick={handleSelectBoth}
                disabled={isLoading || (titleSelected && descriptionSelected) || (!title && !description)}
                className="w-full mt-4"
              >
                {titleSelected && descriptionSelected ? (
                  <>
                    <Check className="mr-2 h-4 w-4 text-green-500" />
                    Contenuti applicati
                  </>
                ) : (
                  <>
                    <FaArrowDown className="mr-2 h-4 w-4" />
                    Applica entrambi i contenuti
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}