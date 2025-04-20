import { Link } from 'wouter';
import {
  Facebook,
  Instagram,
  Twitter,
  Linkedin,
  Mail,
  Phone,
  MapPin,
  CreditCard,
  Shield,
  Server
} from 'lucide-react';

export function Footer() {
  // Anno corrente per il copyright
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-white pt-12 pb-6">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Colonna 1: Chi siamo */}
          <div>
            <h3 className="text-xl font-bold mb-4">Chi siamo</h3>
            <p className="text-gray-300 mb-4">
              In&Out è la piattaforma leader europea per la ricerca di stanze e alloggi, 
              pensata per risolvere le esigenze abitative di studenti e professionisti.
            </p>
            <div className="flex space-x-4 mt-4">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" 
                 className="text-gray-400 hover:text-primary transition-colors" 
                 aria-label="Facebook">
                <Facebook size={20} />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" 
                 className="text-gray-400 hover:text-primary transition-colors" 
                 aria-label="Instagram">
                <Instagram size={20} />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" 
                 className="text-gray-400 hover:text-primary transition-colors" 
                 aria-label="Twitter">
                <Twitter size={20} />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" 
                 className="text-gray-400 hover:text-primary transition-colors" 
                 aria-label="LinkedIn">
                <Linkedin size={20} />
              </a>
            </div>
          </div>

          {/* Colonna 2: Link utili */}
          <div>
            <h3 className="text-xl font-bold mb-4">Link utili</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/how-it-works" className="text-gray-300 hover:text-primary transition-colors">
                  Come funziona
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-gray-300 hover:text-primary transition-colors">
                  Domande frequenti
                </Link>
              </li>
              <li>
                <Link href="/guida" className="text-gray-300 hover:text-primary transition-colors">
                  Guida all'uso
                </Link>
              </li>
              <li>
                <Link href="/subscription-plans" className="text-gray-300 hover:text-primary transition-colors">
                  Piani e prezzi
                </Link>
              </li>
              <li>
                <Link href="/ai-content" className="text-gray-300 hover:text-primary transition-colors">
                  Generatore AI
                </Link>
              </li>
              <li>
                <Link href="/contatti" className="text-gray-300 hover:text-primary transition-colors">
                  Contattaci
                </Link>
              </li>
            </ul>
          </div>

          {/* Colonna 3: Informazioni legali */}
          <div>
            <h3 className="text-xl font-bold mb-4">Informazioni legali</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/legal-terms" className="text-gray-300 hover:text-primary transition-colors">
                  Termini e condizioni
                </Link>
              </li>
              <li>
                <Link href="/legal-privacy" className="text-gray-300 hover:text-primary transition-colors">
                  Privacy policy
                </Link>
              </li>
              <li>
                <Link href="/legal-cookies" className="text-gray-300 hover:text-primary transition-colors">
                  Cookie policy
                </Link>
              </li>
              <li>
                <Link href="/legal/info" className="text-gray-300 hover:text-primary transition-colors">
                  Informazioni legali
                </Link>
              </li>
            </ul>
          </div>

          {/* Colonna 4: Contatti */}
          <div>
            <h3 className="text-xl font-bold mb-4">Contatti</h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <MapPin className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                <span className="text-gray-300">Via Roma 123, 20100 Milano, Italia</span>
              </li>
              <li className="flex items-center">
                <Phone className="h-5 w-5 text-primary mr-2 flex-shrink-0" />
                <span className="text-gray-300">+39 02 1234567</span>
              </li>
              <li className="flex items-center">
                <Mail className="h-5 w-5 text-primary mr-2 flex-shrink-0" />
                <a href="mailto:info@ineoutroom.eu" className="text-gray-300 hover:text-primary transition-colors">
                  info@ineoutroom.eu
                </a>
              </li>
            </ul>
            <div className="mt-4 flex space-x-3">
              <CreditCard className="h-6 w-6 text-primary" aria-label="Pagamenti sicuri" />
              <Shield className="h-6 w-6 text-primary" aria-label="Protezione dati" />
              <Server className="h-6 w-6 text-primary" aria-label="Server europei" />
            </div>
          </div>
        </div>

        {/* Linea divisoria */}
        <hr className="border-gray-700 my-8" />

        {/* Copyright */}
        <div className="text-center text-gray-400 text-sm">
          <p>© {currentYear} In&Out Room. Tutti i diritti riservati.</p>
          <p className="mt-2">
            P.IVA: 12345678901 | REA: MI-1234567 | Cap. Soc.: € 10.000,00
          </p>
        </div>
      </div>
    </footer>
  );
}