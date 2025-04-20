import React from 'react';
import { Star, StarHalf } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RatingStarsDisplayProps {
  rating: number;
  maxRating?: number;
  showValue?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

/**
 * Componente per visualizzare stelle di rating (da 1 a 5)
 */
export const RatingStarsDisplay: React.FC<RatingStarsDisplayProps> = ({
  rating,
  maxRating = 5,
  showValue = false,
  size = 'md',
  className
}) => {
  // Limitiamo il rating tra 0 e maxRating
  const safeRating = Math.max(0, Math.min(rating, maxRating));
  
  // Arrotondiamo a 0.5 più vicino per visualizzare mezze stelle
  const roundedRating = Math.round(safeRating * 2) / 2;
  
  // Determiniamo le dimensioni in base al prop size
  const sizeClass = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  }[size];
  
  // Creiamo un array di stelle basato sul rating
  const stars = [];
  for (let i = 1; i <= maxRating; i++) {
    if (i <= roundedRating) {
      // Stella piena
      stars.push(
        <Star 
          key={i} 
          className={cn('fill-yellow-400 text-yellow-400', sizeClass)} 
        />
      );
    } else if (i - 0.5 === roundedRating) {
      // Mezza stella
      stars.push(
        <div key={i} className="relative">
          <Star className={cn('text-gray-300', sizeClass)} />
          <div className="absolute top-0 left-0 overflow-hidden w-1/2">
            <Star className={cn('fill-yellow-400 text-yellow-400', sizeClass)} />
          </div>
        </div>
      );
    } else {
      // Stella vuota
      stars.push(
        <Star 
          key={i} 
          className={cn('text-gray-300', sizeClass)} 
        />
      );
    }
  }
  
  return (
    <div className={cn('flex items-center', className)}>
      <div className="flex">
        {stars}
      </div>
      {showValue && (
        <span className={cn('ml-1 text-gray-700', {
          'text-sm': size === 'sm',
          'text-base': size === 'md',
          'text-lg': size === 'lg'
        })}>
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
};

export default RatingStarsDisplay;