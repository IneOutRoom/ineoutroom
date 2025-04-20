import { useState, useCallback } from 'react';
import { useModal } from '@/hooks/use-modal';
import AIContentGenerator from '@/components/ai/AIContentGenerator';

interface UseAIOptions {
  initialValue?: string;
  propertyType?: string;
  city?: string;
  zone?: string;
  size?: number;
}

/**
 * Hook per integrare facilmente le funzionalità AI di generazione contenuti
 * in qualsiasi componente
 */
export function useAI({ initialValue = '', propertyType, city, zone, size }: UseAIOptions = {}) {
  const { openModal, closeModal, bindTrigger } = useModal();
  const [generatingField, setGeneratingField] = useState<'titolo' | 'descrizione' | null>(null);

  // Callback chiamata quando viene selezionato un contenuto generato
  const [onSelectCallback, setOnSelectCallback] = useState<((value: string) => void) | null>(null);

  // Apre la modale per generare un titolo
  const generateTitle = useCallback((currentValue: string, onSelect: (title: string) => void) => {
    setGeneratingField('titolo');
    setOnSelectCallback(() => (newValue: string) => {
      onSelect(newValue);
      closeModal();
    });
    
    openModal({
      title: 'Genera un titolo con l\'AI',
      content: (
        <AIContentGenerator
          initialValue={currentValue || initialValue}
          onSelect={(newTitle) => {
            onSelect(newTitle);
            closeModal();
          }}
          tipo="titolo"
          propertyType={propertyType}
          city={city}
          zone={zone}
          size={size}
        />
      ),
      size: 'lg'
    });
  }, [openModal, closeModal, initialValue, propertyType, city, zone, size]);

  // Apre la modale per generare una descrizione
  const generateDescription = useCallback((currentValue: string, onSelect: (description: string) => void) => {
    setGeneratingField('descrizione');
    setOnSelectCallback(() => (newValue: string) => {
      onSelect(newValue);
      closeModal();
    });
    
    openModal({
      title: 'Genera una descrizione con l\'AI',
      content: (
        <AIContentGenerator
          initialValue={currentValue || initialValue}
          onSelect={(newDescription) => {
            onSelect(newDescription);
            closeModal();
          }}
          tipo="descrizione"
          propertyType={propertyType}
          city={city}
          zone={zone}
          size={size}
        />
      ),
      size: 'xl'
    });
  }, [openModal, closeModal, initialValue, propertyType, city, zone, size]);

  return {
    generateTitle,
    generateDescription,
    isGenerating: generatingField !== null
  };
}