import React from 'react';

interface AccessibleElementProps {
  children: React.ReactNode;
  as?: React.ElementType;
  role?: string;
  label?: string;
  description?: string;
  focusable?: boolean;
  hidden?: boolean;
  className?: string;
  [x: string]: any; // Per qualsiasi altra prop che viene passata
}

/**
 * Componente wrapper che aggiunge attributi ARIA e altre funzionalità
 * di accessibilità a qualsiasi elemento
 */
export const AccessibleElement: React.FC<AccessibleElementProps> = ({
  children,
  as: Component = 'div',
  role,
  label,
  description,
  focusable = false,
  hidden = false,
  className = '',
  ...rest
}) => {
  // Costruisci le props di accessibilità
  const accessibilityProps: Record<string, any> = {};
  
  if (role) {
    accessibilityProps.role = role;
  }
  
  if (label) {
    accessibilityProps['aria-label'] = label;
  }
  
  if (description) {
    accessibilityProps['aria-describedby'] = `desc-${rest.id || Math.random().toString(36).substring(2, 9)}`;
  }
  
  if (focusable) {
    accessibilityProps.tabIndex = 0;
  }
  
  if (hidden) {
    accessibilityProps['aria-hidden'] = true;
  }
  
  return (
    <>
      <Component 
        className={className}
        {...accessibilityProps}
        {...rest}
      >
        {children}
      </Component>
      
      {description && (
        <span 
          id={accessibilityProps['aria-describedby']}
          className="sr-only"
        >
          {description}
        </span>
      )}
    </>
  );
};

export default AccessibleElement;