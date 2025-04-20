import React from 'react';
import { AccessibleElement } from './AccessibleElement';

interface AccessiblePropertyCardProps {
  children: React.ReactNode;
  title: string;
  price?: number;
  location?: string;
  propertyType?: string;
  onCardClick?: () => void;
  className?: string;
  id: string | number;
}

/**
 * Versione accessibile della PropertyCard con attributi ARIA appropriati
 * per migliorare la navigazione da tastiera e la compatibilità con screen reader
 */
export const AccessiblePropertyCard: React.FC<AccessiblePropertyCardProps> = ({
  children,
  title,
  price,
  location,
  propertyType,
  onCardClick,
  className = '',
  id,
}) => {
  // Costruisci una descrizione adeguata per gli screen reader
  const buildDescription = () => {
    let description = `Proprietà: ${title}`;
    
    if (price) {
      description += `, Prezzo: ${price} Euro`;
    }
    
    if (location) {
      description += `, Posizione: ${location}`;
    }
    
    if (propertyType) {
      description += `, Tipologia: ${propertyType}`;
    }
    
    return description;
  };
  
  return (
    <AccessibleElement
      as="article"
      role="article"
      className={`property-card ${className}`}
      aria-labelledby={`property-title-${id}`}
      description={buildDescription()}
      focusable={true}
      onClick={onCardClick}
      onKeyDown={(e: React.KeyboardEvent) => {
        // Attiva il click anche quando si preme Enter o Space
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onCardClick && onCardClick();
        }
      }}
      tabIndex={0}
      id={`property-card-${id}`}
    >
      <div className="sr-only" aria-live="polite">
        {buildDescription()}
      </div>
      
      {/* Contenuto della card */}
      {children}
    </AccessibleElement>
  );
};

export default AccessiblePropertyCard;