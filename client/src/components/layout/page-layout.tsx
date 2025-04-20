import React, { useState, useEffect } from 'react';
import { Navbar } from './navbar';
import { Footer } from './footer';
import SentryUser from '../error-handling/SentryUser';

interface PageLayoutProps {
  children: React.ReactNode;
}

export function PageLayout({ children }: PageLayoutProps) {
  const [navbarHeight, setNavbarHeight] = useState(110); // Altezza predefinita

  // Misura l'altezza della navbar una volta che il componente è montato
  useEffect(() => {
    const updateNavbarHeight = () => {
      const navbar = document.querySelector('header');
      if (navbar) {
        setNavbarHeight(navbar.offsetHeight);
      }
    };

    // Aggiorna l'altezza subito e dopo un breve ritardo per catturare transizioni
    updateNavbarHeight();
    const timeoutId = setTimeout(updateNavbarHeight, 300);

    // Aggiorna l'altezza quando la finestra viene ridimensionata
    window.addEventListener('resize', updateNavbarHeight);
    
    return () => {
      window.removeEventListener('resize', updateNavbarHeight);
      clearTimeout(timeoutId);
    };
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Componente invisibile per tracciamento utente in Sentry */}
      <SentryUser />
      <Navbar />
      <main 
        className="flex-grow" 
        style={{ paddingTop: `${navbarHeight}px` }}
      >
        {children}
      </main>
      <Footer />
    </div>
  );
}