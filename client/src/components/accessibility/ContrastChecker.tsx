import React, { useState, useEffect } from 'react';
import { calculateContrastRatio, isContrastSufficient } from '../../utils/accessibility';

interface ContrastCheckerProps {
  foregroundColor: string;
  backgroundColor: string;
  textSize?: 'small' | 'large';
  level?: 'AA' | 'AAA';
  showText?: boolean;
}

/**
 * Componente per verificare e visualizzare il contrasto tra due colori
 * Utile per sviluppatori e designer per garantire l'accessibilità
 */
export const ContrastChecker: React.FC<ContrastCheckerProps> = ({
  foregroundColor,
  backgroundColor,
  textSize = 'small',
  level = 'AA',
  showText = true
}) => {
  const [contrast, setContrast] = useState<number>(0);
  const [isPassing, setIsPassing] = useState<boolean>(false);
  
  useEffect(() => {
    const ratio = calculateContrastRatio(foregroundColor, backgroundColor);
    setContrast(ratio);
    setIsPassing(isContrastSufficient(ratio, level, textSize === 'large'));
  }, [foregroundColor, backgroundColor, level, textSize]);

  return (
    <div className="p-4 border rounded-lg">
      <div 
        className="flex items-center justify-center p-6 rounded mb-4" 
        style={{ backgroundColor, color: foregroundColor }}
      >
        {showText && (
          <p className={textSize === 'large' ? 'text-xl font-bold' : 'text-base'}>
            Testo di esempio con questi colori
          </p>
        )}
      </div>
      
      <div className="mt-2 space-y-2">
        <p>
          <span className="font-semibold">Rapporto di contrasto:</span> {contrast.toFixed(2)}:1
        </p>
        
        <div className={`p-2 rounded ${isPassing ? 'bg-green-100' : 'bg-red-100'}`}>
          <p className={`font-semibold ${isPassing ? 'text-green-800' : 'text-red-800'}`}>
            {isPassing 
              ? `Passa WCAG ${level} per testo ${textSize === 'large' ? 'grande' : 'normale'}`
              : `Non passa WCAG ${level} per testo ${textSize === 'large' ? 'grande' : 'normale'}`
            }
          </p>
          
          <p className="text-sm mt-1">
            {textSize === 'small' 
              ? `WCAG ${level === 'AA' ? 'AA richiede 4.5:1' : 'AAA richiede 7:1'}`
              : `WCAG ${level === 'AA' ? 'AA richiede 3:1' : 'AAA richiede 4.5:1'}`
            }
          </p>
        </div>
      </div>
    </div>
  );
};

export default ContrastChecker;