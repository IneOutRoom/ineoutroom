import { useQuery } from "@tanstack/react-query";
import { Property } from "@shared/schema";

/**
 * Hook per recuperare proprietà simili a una proprietà specifica
 * 
 * @param propertyId - ID della proprietà di cui trovare quelle simili
 * @returns Oggetto con le proprietà simili e lo stato della query
 */
export function useSimilarProperties(propertyId: number) {
  const {
    data: similarProperties = [],
    isLoading,
    error,
  } = useQuery<Property[]>({
    queryKey: [`/api/properties/${propertyId}/similar`],
    enabled: Boolean(propertyId),
  });

  return {
    similarProperties,
    isLoading,
    error,
  };
}