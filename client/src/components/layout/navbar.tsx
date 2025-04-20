import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { 
  Menu, 
  X, 
  ChevronDown, 
  ChevronUp, 
  HelpCircle, 
  User, 
  MessageSquare, 
  Search, 
  Home, 
  PlusCircle, 
  LogOut, 
  LogIn, 
  UserPlus,
  Sparkles,
  CreditCard,
  MapPin
} from 'lucide-react';
// Importazione diretta del logo
import logoImage from '../../assets/Modern Minimalist Graffiti Dream Brand Logo.jpg';

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();
  const location = router.pathname;
  const { user, logoutMutation } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [helpMenuOpen, setHelpMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileSubmenus, setMobileSubmenus] = useState({
    help: false,
    user: false
  });

  // Gestisce la chiusura del menu mobile quando si naviga a una nuova pagina
  useEffect(() => {
    setMobileMenuOpen(false);
    setMobileSubmenus({ help: false, user: false });
  }, [location]);

  // Gestisce la chiusura del menu mobile quando si clicca fuori
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (mobileMenuOpen && !target.closest('.mobile-menu') && !target.closest('.menu-button')) {
        setMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [mobileMenuOpen]);

  // Gestisce l'effetto di scroll per la navbar
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const toggleMobileSubmenu = (submenu: 'help' | 'user') => {
    setMobileSubmenus(prev => ({
      ...prev,
      [submenu]: !prev[submenu]
    }));
  };

  const toggleHelpMenu = () => {
    setHelpMenuOpen(!helpMenuOpen);
    if (userMenuOpen) setUserMenuOpen(false);
  };

  const toggleUserMenu = () => {
    setUserMenuOpen(!userMenuOpen);
    if (helpMenuOpen) setHelpMenuOpen(false);
  };

  return (
    <header className={`bg-white fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'shadow-md py-1 backdrop-blur-md bg-white/90' : 'shadow-sm py-2'}`}>
      <div className="container mx-auto px-3 sm:px-4 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center">
          <Link href="/" className="logo-link flex items-center">
            <img 
              src={logoImage} 
              alt="In&Out Logo" 
              className={`transition-all duration-300 ${scrolled ? 'h-12 sm:h-14 md:h-16 lg:h-20' : 'h-14 sm:h-16 md:h-20 lg:h-24'} mr-2 sm:mr-3`} 
            />
          </Link>
        </div>

        {/* Navigation - Desktop */}
        <nav className="hidden md:flex items-center space-x-4 lg:space-x-6">
          {/* Menu Home */}
          <Link 
            href="/" 
            className={`flex items-center text-neutral-700 hover:text-primary font-medium text-sm transition-all duration-200
            ${location === '/' ? 'text-primary border-b-2 border-primary pb-1' : ''}`}
          >
            <Home className="h-4 w-4 mr-1.5" />
            <span>Home</span>
          </Link>
          
          {/* Menu Cerca */}
          <Link 
            href="/search" 
            className={`flex items-center text-neutral-700 hover:text-primary font-medium text-sm transition-all duration-200
            ${location === '/search' ? 'text-primary border-b-2 border-primary pb-1' : ''}`}
          >
            <Search className="h-4 w-4 mr-1.5" />
            <span>Cerca alloggi</span>
          </Link>
          
          {/* Menu Mappa */}
          <Link 
            href="/mappa" 
            className={`flex items-center text-neutral-700 hover:text-primary font-medium text-sm transition-all duration-200
            ${location === '/mappa' ? 'text-primary border-b-2 border-primary pb-1' : ''}`}
          >
            <MapPin className="h-4 w-4 mr-1.5" />
            <span>Mappa interattiva</span>
          </Link>
          
          {/* Menu Pubblica */}
          <Link 
            href="/properties/new" 
            className={`flex items-center text-neutral-700 hover:text-primary font-medium text-sm transition-all duration-200
            ${location === '/properties/new' ? 'text-primary border-b-2 border-primary pb-1' : ''}`}
          >
            <PlusCircle className="h-4 w-4 mr-1.5" />
            <span>Pubblica annuncio</span>
          </Link>
          
          {/* Menu Aiuto/Come Funziona - Dropdown */}
          <div className="relative group">
            <button 
              onClick={toggleHelpMenu}
              className={`flex items-center text-neutral-700 hover:text-primary font-medium text-sm px-2 py-1 rounded-md transition-all duration-200
              ${helpMenuOpen ? 'text-primary bg-primary/5' : ''}
              ${['/how-it-works', '/faq', '/contatti', '/guida'].includes(location) ? 'text-primary border-b-2 border-primary pb-1' : ''}`}
            >
              <HelpCircle className="h-4 w-4 mr-1.5" />
              <span>Aiuto</span>
              {helpMenuOpen ? <ChevronUp className="h-3 w-3 ml-1" /> : <ChevronDown className="h-3 w-3 ml-1" />}
            </button>
            
            {/* Dropdown Help Menu */}
            {helpMenuOpen && (
              <div className="absolute left-0 mt-2 w-56 bg-white rounded-md shadow-lg border border-gray-100 overflow-hidden z-30">
                <div className="py-1">
                  <Link 
                    href="/how-it-works" 
                    className={`block px-4 py-2 text-sm ${location === '/how-it-works' ? 'bg-primary/5 text-primary' : 'text-neutral-700 hover:bg-gray-50'}`}
                  >
                    Come funziona
                  </Link>
                  <Link 
                    href="/faq" 
                    className={`block px-4 py-2 text-sm ${location === '/faq' ? 'bg-primary/5 text-primary' : 'text-neutral-700 hover:bg-gray-50'}`}
                  >
                    Domande frequenti
                  </Link>
                  <Link 
                    href="/guida" 
                    className={`block px-4 py-2 text-sm ${location === '/guida' ? 'bg-primary/5 text-primary' : 'text-neutral-700 hover:bg-gray-50'}`}
                  >
                    Guida all'uso
                  </Link>
                  <Link 
                    href="/contatti" 
                    className={`block px-4 py-2 text-sm ${location === '/contatti' ? 'bg-primary/5 text-primary' : 'text-neutral-700 hover:bg-gray-50'}`}
                  >
                    Contattaci
                  </Link>
                  <Link 
                    href="/sentry-test" 
                    className={`block px-4 py-2 text-sm ${location === '/sentry-test' ? 'bg-primary/5 text-primary' : 'text-neutral-700 hover:bg-gray-50'}`}
                  >
                    Monitora Errori
                  </Link>
                </div>
              </div>
            )}
          </div>
          
          {/* Menu speciali per utenti loggati */}
          {user && (
            <>
              <Link 
                href="/chat" 
                className={`flex items-center text-neutral-700 hover:text-primary font-medium text-sm transition-all duration-200
                ${location === '/chat' ? 'text-primary border-b-2 border-primary pb-1' : ''}`}
              >
                <MessageSquare className="h-4 w-4 mr-1.5" />
                <span>Messaggi</span>
              </Link>
              
              <Link 
                href="/ai-content" 
                className={`flex items-center text-neutral-700 hover:text-primary font-medium text-sm transition-all duration-200
                ${location === '/ai-content' ? 'text-primary border-b-2 border-primary pb-1' : ''}`}
              >
                <Sparkles className="h-4 w-4 mr-1.5" />
                <span>Generatore AI</span>
              </Link>
            </>
          )}
          
          {/* Menu Piani e Prezzi */}
          <Link 
            href="/subscription-plans" 
            className={`flex items-center text-neutral-700 hover:text-primary font-medium text-sm transition-all duration-200
            ${location === '/subscription-plans' ? 'text-primary border-b-2 border-primary pb-1' : ''}`}
          >
            <CreditCard className="h-4 w-4 mr-1.5" />
            <span>Piani e prezzi</span>
          </Link>
        </nav>
        
        {/* Auth buttons */}
        <div className="flex items-center space-x-2">
          {user ? (
            <div className="relative">
              <button
                onClick={toggleUserMenu}
                className={`flex items-center space-x-1 text-sm font-medium ${userMenuOpen ? 'text-primary' : 'text-neutral-700'} hover:text-primary px-2 py-1 rounded-md`}
              >
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">Ciao, {user.username}</span>
                {userMenuOpen ? <ChevronUp className="h-3 w-3 ml-1" /> : <ChevronDown className="h-3 w-3 ml-1" />}
              </button>
              
              {/* User dropdown menu */}
              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-100 overflow-hidden z-30">
                  <div className="py-1">
                    <Link 
                      href="/profile" 
                      className={`block px-4 py-2 text-sm ${location === '/profile' ? 'bg-primary/5 text-primary' : 'text-neutral-700 hover:bg-gray-50'}`}
                    >
                      Il mio profilo
                    </Link>
                    <Link 
                      href="/my-properties" 
                      className={`block px-4 py-2 text-sm ${location === '/my-properties' ? 'bg-primary/5 text-primary' : 'text-neutral-700 hover:bg-gray-50'}`}
                    >
                      I miei annunci
                    </Link>
                    <Link 
                      href="/saved-searches" 
                      className={`block px-4 py-2 text-sm ${location === '/saved-searches' ? 'bg-primary/5 text-primary' : 'text-neutral-700 hover:bg-gray-50'}`}
                    >
                      Ricerche salvate
                    </Link>
                    <hr className="my-1" />
                    <button
                      onClick={() => logoutMutation.mutate()}
                      className="w-full text-left block px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      Esci
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link href="/auth">
                <Button variant="ghost" className="hidden sm:flex items-center space-x-1 text-primary">
                  <LogIn className="h-4 w-4 mr-1" />
                  <span>Accedi</span>
                </Button>
              </Link>
              <Link href="/auth">
                <Button className="register-button bg-primary text-white rounded-full hover:bg-primary/90 flex items-center space-x-1">
                  <UserPlus className="h-4 w-4 mr-1" />
                  <span>Registrati</span>
                </Button>
              </Link>
            </>
          )}
          
          {/* Mobile menu button */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="menu-button block md:hidden h-9 w-9"
            onClick={toggleMobileMenu}
            aria-label="Menu principale"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>
      
      {/* Mobile navigation */}
      {mobileMenuOpen && (
        <div className="mobile-menu bg-white border-t border-neutral-100 py-3 px-3 sm:px-4 md:hidden max-h-[80vh] overflow-y-auto shadow-md">
          <nav className="flex flex-col space-y-2 pb-safe">
            <Link 
              href="/" 
              className={`flex items-center text-neutral-700 hover:text-primary font-medium text-sm p-2 rounded-md
              ${location === '/' ? 'bg-primary/5 text-primary' : ''}`}
            >
              <Home className="h-5 w-5 mr-3" />
              <span>Home</span>
            </Link>
            
            <Link 
              href="/search" 
              className={`flex items-center text-neutral-700 hover:text-primary font-medium text-sm p-2 rounded-md
              ${location === '/search' ? 'bg-primary/5 text-primary' : ''}`}
            >
              <Search className="h-5 w-5 mr-3" />
              <span>Cerca alloggi</span>
            </Link>
            
            <Link 
              href="/mappa" 
              className={`flex items-center text-neutral-700 hover:text-primary font-medium text-sm p-2 rounded-md
              ${location === '/mappa' ? 'bg-primary/5 text-primary' : ''}`}
            >
              <MapPin className="h-5 w-5 mr-3" />
              <span>Mappa interattiva</span>
            </Link>
            
            <Link 
              href="/properties/new" 
              className={`flex items-center text-neutral-700 hover:text-primary font-medium text-sm p-2 rounded-md
              ${location === '/properties/new' ? 'bg-primary/5 text-primary' : ''}`}
            >
              <PlusCircle className="h-5 w-5 mr-3" />
              <span>Pubblica annuncio</span>
            </Link>
            
            {/* Menu Aiuto/Come Funziona - Dropdown */}
            <div>
              <button
                onClick={() => toggleMobileSubmenu('help')}
                className={`w-full flex items-center justify-between text-neutral-700 hover:text-primary font-medium text-sm p-2 rounded-md
                ${['/how-it-works', '/faq', '/contatti', '/guida'].includes(location) ? 'bg-primary/5 text-primary' : ''}
                ${mobileSubmenus.help ? 'bg-gray-50' : ''}`}
              >
                <div className="flex items-center">
                  <HelpCircle className="h-5 w-5 mr-3" />
                  <span>Aiuto e supporto</span>
                </div>
                {mobileSubmenus.help ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </button>
              
              {mobileSubmenus.help && (
                <div className="ml-10 mt-1 space-y-1">
                  <Link 
                    href="/how-it-works" 
                    className={`block p-2 text-sm rounded-md ${location === '/how-it-works' ? 'bg-primary/5 text-primary' : 'text-neutral-700'}`}
                  >
                    Come funziona
                  </Link>
                  <Link 
                    href="/faq" 
                    className={`block p-2 text-sm rounded-md ${location === '/faq' ? 'bg-primary/5 text-primary' : 'text-neutral-700'}`}
                  >
                    Domande frequenti
                  </Link>
                  <Link 
                    href="/guida" 
                    className={`block p-2 text-sm rounded-md ${location === '/guida' ? 'bg-primary/5 text-primary' : 'text-neutral-700'}`}
                  >
                    Guida all'uso
                  </Link>
                  <Link 
                    href="/contatti" 
                    className={`block p-2 text-sm rounded-md ${location === '/contatti' ? 'bg-primary/5 text-primary' : 'text-neutral-700'}`}
                  >
                    Contattaci
                  </Link>
                  <Link 
                    href="/sentry-test" 
                    className={`block p-2 text-sm rounded-md ${location === '/sentry-test' ? 'bg-primary/5 text-primary' : 'text-neutral-700'}`}
                  >
                    Monitora Errori
                  </Link>
                </div>
              )}
            </div>
            
            {/* Opzioni utente se loggato */}
            {user && (
              <>
                <div>
                  <button
                    onClick={() => toggleMobileSubmenu('user')}
                    className={`w-full flex items-center justify-between text-neutral-700 hover:text-primary font-medium text-sm p-2 rounded-md
                    ${['/profile', '/my-properties', '/saved-searches'].includes(location) ? 'bg-primary/5 text-primary' : ''}
                    ${mobileSubmenus.user ? 'bg-gray-50' : ''}`}
                  >
                    <div className="flex items-center">
                      <User className="h-5 w-5 mr-3" />
                      <span>Il mio account</span>
                    </div>
                    {mobileSubmenus.user ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </button>
                  
                  {mobileSubmenus.user && (
                    <div className="ml-10 mt-1 space-y-1">
                      <Link 
                        href="/profile" 
                        className={`block p-2 text-sm rounded-md ${location === '/profile' ? 'bg-primary/5 text-primary' : 'text-neutral-700'}`}
                      >
                        Il mio profilo
                      </Link>
                      <Link 
                        href="/my-properties" 
                        className={`block p-2 text-sm rounded-md ${location === '/my-properties' ? 'bg-primary/5 text-primary' : 'text-neutral-700'}`}
                      >
                        I miei annunci
                      </Link>
                      <Link 
                        href="/saved-searches" 
                        className={`block p-2 text-sm rounded-md ${location === '/saved-searches' ? 'bg-primary/5 text-primary' : 'text-neutral-700'}`}
                      >
                        Ricerche salvate
                      </Link>
                    </div>
                  )}
                </div>
                
                <Link 
                  href="/chat" 
                  className={`flex items-center text-neutral-700 hover:text-primary font-medium text-sm p-2 rounded-md
                  ${location === '/chat' ? 'bg-primary/5 text-primary' : ''}`}
                >
                  <MessageSquare className="h-5 w-5 mr-3" />
                  <span>Messaggi</span>
                </Link>
                
                <Link 
                  href="/ai-content" 
                  className={`flex items-center text-neutral-700 hover:text-primary font-medium text-sm p-2 rounded-md
                  ${location === '/ai-content' ? 'bg-primary/5 text-primary' : ''}`}
                >
                  <Sparkles className="h-5 w-5 mr-3" />
                  <span>Generatore AI</span>
                </Link>
              </>
            )}
            
            <Link 
              href="/subscription-plans" 
              className={`flex items-center text-neutral-700 hover:text-primary font-medium text-sm p-2 rounded-md
              ${location === '/subscription-plans' ? 'bg-primary/5 text-primary' : ''}`}
            >
              <CreditCard className="h-5 w-5 mr-3" />
              <span>Piani e prezzi</span>
            </Link>
            
            {!user ? (
              <div className="pt-3 mt-1 border-t border-gray-100 flex flex-col space-y-3">
                <Link href="/auth" className="w-full">
                  <Button 
                    variant="outline" 
                    className="w-full flex items-center justify-center h-10 sm:h-11 text-sm sm:text-base"
                  >
                    <LogIn className="h-4 w-4 mr-1.5" />
                    <span>Accedi</span>
                  </Button>
                </Link>
                <Link href="/auth" className="w-full">
                  <Button 
                    className="w-full bg-primary text-white hover:bg-primary/90 flex items-center justify-center h-10 sm:h-11 text-sm sm:text-base rounded-full"
                  >
                    <UserPlus className="h-4 w-4 mr-1.5" />
                    <span>Registrati</span>
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="pt-3 mt-1 border-t border-gray-100">
                <Button 
                  onClick={() => logoutMutation.mutate()}
                  variant="outline"
                  className="w-full flex items-center justify-center text-red-600 hover:bg-red-50 border-red-200 h-10 sm:h-11 text-sm sm:text-base"
                >
                  <LogOut className="h-4 w-4 mr-1.5" />
                  <span>Esci</span>
                </Button>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
