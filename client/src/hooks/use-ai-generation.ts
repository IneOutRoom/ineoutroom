import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { PropertyAttributes } from "server/services/descriptionGenerator";

/**
 * Hook per generare titoli e descrizioni utilizzando OpenAI
 * @returns {Object} Mutation e stati per generare titoli e descrizioni
 */
export function useAIGeneration() {
  const [isGeneratingTitle, setIsGeneratingTitle] = useState(false);
  const [isGeneratingDescription, setIsGeneratingDescription] = useState(false);

  const generateTitle = useMutation({
    mutationFn: async (property: PropertyAttributes): Promise<string> => {
      setIsGeneratingTitle(true);
      try {
        const response = await apiRequest("POST", "/api/generate-title-suggestions", property);
        
        if (!response.ok) {
          throw new Error("Errore nella generazione del titolo");
        }
        
        const data = await response.json();
        return data.suggestions; // L'API restituisce una proprietà "suggestions"
      } finally {
        setIsGeneratingTitle(false);
      }
    }
  });

  const generateDescription = useMutation({
    mutationFn: async (property: PropertyAttributes): Promise<string> => {
      setIsGeneratingDescription(true);
      try {
        const response = await apiRequest("POST", "/api/generate-description", property);
        
        if (!response.ok) {
          throw new Error("Errore nella generazione della descrizione");
        }
        
        const data = await response.json();
        return data.description;
      } finally {
        setIsGeneratingDescription(false);
      }
    }
  });

  return {
    generateTitle,
    generateDescription,
    isGeneratingTitle,
    isGeneratingDescription
  };
}