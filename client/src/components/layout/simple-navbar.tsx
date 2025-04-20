import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';
// Importazione diretta del logo
import logoImage from '../../assets/Modern Minimalist Graffiti Dream Brand Logo.jpg';

export function SimpleNavbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [location] = useLocation();

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center">
          <Link href="/" className="flex items-center">
            <img src={logoImage} alt="In&Out Logo" className="h-20 sm:h-24 md:h-28 mr-3" />

          </Link>
        </div>

        {/* Navigation - Desktop */}
        <nav className="hidden md:flex items-center space-x-6">
          <Link href="/" className={`text-neutral-700 hover:text-primary font-medium text-sm ${location === '/' ? 'text-primary' : ''}`}>
            Come funziona
          </Link>
          <Link href="/search" className={`text-neutral-700 hover:text-primary font-medium text-sm ${location === '/search' ? 'text-primary' : ''}`}>
            Cerca alloggi
          </Link>
          <Link href="/properties/new" className={`text-neutral-700 hover:text-primary font-medium text-sm ${location === '/properties/new' ? 'text-primary' : ''}`}>
            Pubblica annuncio
          </Link>
          <Link href="/subscription-plans" className={`text-neutral-700 hover:text-primary font-medium text-sm ${location === '/subscription-plans' ? 'text-primary' : ''}`}>
            Piani e prezzi
          </Link>
        </nav>
        
        {/* Auth buttons */}
        <div className="flex items-center space-x-2">
          <Link href="/auth">
            <Button variant="ghost" className="hidden sm:block text-primary">
              Accedi
            </Button>
          </Link>
          <Link href="/auth">
            <Button className="bg-primary text-white rounded-full hover:bg-primary/90">
              Registrati
            </Button>
          </Link>
          <Button 
            variant="ghost" 
            size="icon" 
            className="block md:hidden"
            onClick={toggleMobileMenu}
          >
            {mobileMenuOpen ? <X /> : <Menu />}
          </Button>
        </div>
      </div>
      
      {/* Mobile navigation */}
      {mobileMenuOpen && (
        <div className="bg-white border-t border-neutral-100 py-3 px-4 md:hidden">
          <nav className="flex flex-col space-y-3">
            <Link href="/" className={`text-neutral-700 hover:text-primary font-medium text-sm ${location === '/' ? 'text-primary' : ''}`}>
              Come funziona
            </Link>
            <Link href="/search" className={`text-neutral-700 hover:text-primary font-medium text-sm ${location === '/search' ? 'text-primary' : ''}`}>
              Cerca alloggi
            </Link>
            <Link href="/properties/new" className={`text-neutral-700 hover:text-primary font-medium text-sm ${location === '/properties/new' ? 'text-primary' : ''}`}>
              Pubblica annuncio
            </Link>
            <Link href="/subscription-plans" className={`text-neutral-700 hover:text-primary font-medium text-sm ${location === '/subscription-plans' ? 'text-primary' : ''}`}>
              Piani e prezzi
            </Link>
            <Link href="/auth" className="text-neutral-700 hover:text-primary font-medium text-sm">
              Accedi
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}