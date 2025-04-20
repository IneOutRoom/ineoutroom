import React from 'react';

/**
 * Componente per l'accessibilità che consente agli utenti di tastiera di saltare 
 * direttamente al contenuto principale della pagina
 */
export const SkipLink = () => {
  return (
    <a 
      href="#main-content" 
      className="skip-link"
      aria-label="Salta al contenuto principale"
    >
      Salta al contenuto principale
    </a>
  );
};

export default SkipLink;