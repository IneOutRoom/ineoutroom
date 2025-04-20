import { Star } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  rating: number;
  onRatingChange?: (rating: number) => void;
  readOnly?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function StarRating({ 
  rating, 
  onRatingChange, 
  readOnly = false, 
  size = "md",
  className
}: StarRatingProps) {
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  
  // Dimensioni delle stelle in base alla proprietà size
  const starSizes = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6"
  };
  
  const starSize = starSizes[size];
  
  // Gestione del click sulla stella
  const handleClick = (index: number) => {
    if (!readOnly && onRatingChange) {
      onRatingChange(index);
    }
  };
  
  // Gestione dell'hover sulle stelle
  const handleMouseEnter = (index: number) => {
    if (!readOnly) {
      setHoverRating(index);
    }
  };
  
  const handleMouseLeave = () => {
    if (!readOnly) {
      setHoverRating(null);
    }
  };
  
  return (
    <div 
      className={cn("flex items-center", className)}
      onMouseLeave={handleMouseLeave}
    >
      {[1, 2, 3, 4, 5].map((index) => {
        // Determina se la stella è piena o vuota
        const filled = (hoverRating !== null ? index <= hoverRating : index <= rating);
        
        return (
          <Star
            key={index}
            className={cn(
              starSize,
              "transition-colors duration-200 cursor-pointer",
              { 
                "text-yellow-400 fill-current": filled,
                "text-gray-300": !filled,
                "cursor-default": readOnly
              }
            )}
            onClick={() => handleClick(index)}
            onMouseEnter={() => handleMouseEnter(index)}
          />
        );
      })}
    </div>
  );
}