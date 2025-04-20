import React from 'react';
import { MapPin } from 'lucide-react';
import { LocationResult } from '@/hooks/useLocationSearch';

interface LocationResultDropdownProps {
  results: LocationResult[];
  loading: boolean;
  error: string | null;
  onSelect: (result: LocationResult) => void;
  formatLocation: (result: LocationResult) => string;
  isVisible: boolean;
}

export function LocationResultDropdown({
  results,
  loading,
  error,
  onSelect,
  formatLocation,
  isVisible
}: LocationResultDropdownProps) {
  
  if (!isVisible) return null;
  
  return (
    <div className="absolute z-10 mt-1 w-full bg-white rounded-md shadow-lg border border-gray-200 overflow-hidden max-h-60 overflow-y-auto">
      {loading && (
        <div className="p-3 text-sm text-center text-gray-500">
          <div className="animate-pulse flex items-center justify-center">
            <div className="h-4 w-4 bg-gray-200 rounded-full mr-2"></div>
            <div className="h-2 w-24 bg-gray-200 rounded"></div>
          </div>
        </div>
      )}
      
      {error && (
        <div className="p-3 text-sm text-red-500 flex items-center">
          <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>Errore: {error}</span>
        </div>
      )}
      
      {!loading && !error && results.length === 0 && (
        <div className="p-3 text-sm text-gray-500 flex items-center">
          <span className="mr-2" role="img" aria-label="Confused face">😕</span>
          <span>Nessun risultato. Prova con un'altra città.</span>
        </div>
      )}
      
      {results.length > 0 && (
        <ul className="py-1">
          {results.map((result) => (
            <li 
              key={result.place_id}
              className="px-3 py-2 hover:bg-primary/5 cursor-pointer transition-colors duration-150 flex items-center"
              onClick={() => onSelect(result)}
            >
              <MapPin className="h-4 w-4 text-primary mr-2 flex-shrink-0" />
              <div className="flex flex-col truncate">
                <span className="text-sm font-medium text-gray-800 truncate">
                  {formatLocation(result)}
                </span>
                <span className="text-xs text-gray-500 truncate">
                  {result.type && result.type.charAt(0).toUpperCase() + result.type.slice(1)}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}