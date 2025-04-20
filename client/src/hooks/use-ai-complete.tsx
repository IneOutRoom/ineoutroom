import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useModal } from '@/hooks/use-modal';
import AICompleteGenerator from '@/components/ai/AICompleteGenerator';
import { PropertyAttributes } from "server/services/descriptionGenerator";

interface UseAICompleteOptions {
  initialTitle?: string;
  initialDescription?: string;
  propertyType?: string;
  city?: string;
  zone?: string;
  size?: number;
}

/**
 * Hook ottimizzato per generare sia titolo che descrizione con una singola chiamata API
 * Utilizza il nuovo componente AICompleteGenerator
 */
export function useAIComplete({ 
  initialTitle = '', 
  initialDescription = '',
  propertyType, 
  city, 
  zone, 
  size 
}: UseAICompleteOptions = {}) {
  const { openModal, closeModal } = useModal();
  const [isGenerating, setIsGenerating] = useState(false);

  // Genera sia titolo che descrizione in un'unica API call
  const generateContent = useMutation({
    mutationFn: async (property: PropertyAttributes): Promise<{ title: string, description: string }> => {
      setIsGenerating(true);
      try {
        // Ottimizzato: una sola chiamata API per ottenere entrambi i contenuti
        const response = await apiRequest("POST", "/api/generaTesto", {
          datiAnnuncio: property
        });
        
        if (!response.ok) {
          throw new Error("Errore nella generazione dei contenuti");
        }
        
        const data = await response.json();
        return {
          title: data.titolo,
          description: data.descrizione
        };
      } finally {
        setIsGenerating(false);
      }
    }
  });

  // Apre la modale con il componente ottimizzato per generare entrambi i contenuti
  const openGeneratorModal = (
    onSelectTitle: (title: string) => void,
    onSelectDescription: (description: string) => void
  ) => {
    openModal({
      title: 'Genera contenuti con AI',
      content: (
        <AICompleteGenerator
          initialTitle={initialTitle}
          initialDescription={initialDescription}
          onSelectTitle={(newTitle) => {
            onSelectTitle(newTitle);
          }}
          onSelectDescription={(newDescription) => {
            onSelectDescription(newDescription);
          }}
          propertyType={propertyType}
          city={city}
          zone={zone}
          size={size}
        />
      ),
      size: 'xl'
    });
  };

  return {
    generateContent,
    openGeneratorModal,
    isGenerating
  };
}