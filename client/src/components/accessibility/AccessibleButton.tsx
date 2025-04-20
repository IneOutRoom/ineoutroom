import React from 'react';
import { Button } from '@/components/ui/button';
import { isContrastSufficient, calculateContrastRatio } from '../../utils/accessibility';

interface AccessibleButtonProps {
  children: React.ReactNode;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link' | 'accent';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
  forceAccessible?: boolean;
  accessibleVariant?: 'primary' | 'accent' | 'outline';
  label?: string;
  [x: string]: any; // Per altre props
}

/**
 * Bottone accessibile che rispetta gli standard WCAG di contrasto
 * e include attributi ARIA appropriati
 */
export const AccessibleButton: React.FC<AccessibleButtonProps> = ({
  children,
  variant = 'default',
  size = 'default',
  className = '',
  forceAccessible = false,
  accessibleVariant = 'primary',
  label,
  ...props
}) => {
  // Determina la classe da usare in base all'accessibilità richiesta
  let buttonClass = className;
  
  if (forceAccessible) {
    switch (accessibleVariant) {
      case 'primary':
        buttonClass = `btn-accessible-primary ${className}`;
        break;
      case 'accent':
        buttonClass = `btn-accessible-accent ${className}`;
        break;
      case 'outline':
        buttonClass = `btn-accessible-outline ${className}`;
        break;
      default:
        buttonClass = `btn-accessible-primary ${className}`;
    }
  }
  
  // Aggiungi attributi ARIA
  const ariaProps: Record<string, any> = {};
  
  if (label) {
    ariaProps['aria-label'] = label;
  }
  
  // Se il bottone contiene solo un'icona, dovrebbe avere un'etichetta
  if (size === 'icon' && !label) {
    console.warn('I bottoni con sole icone dovrebbero avere un attributo aria-label');
  }
  
  // Aggiungi role="button" solo se necessario (quando l'elemento non è un button)
  if (props.as && props.as !== 'button') {
    ariaProps.role = 'button';
    ariaProps.tabIndex = 0;
  }
  
  return (
    <Button
      variant={variant}
      size={size}
      className={buttonClass}
      {...ariaProps}
      {...props}
    >
      {children}
    </Button>
  );
};

export default AccessibleButton;