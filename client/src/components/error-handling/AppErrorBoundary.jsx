import ErrorBoundary from './ErrorBoundary';
import { Button } from '../ui/button';
import { RefreshCw, Bug, Home } from 'lucide-react';
import { Link } from 'wouter';

// Componente di fallback personalizzato per errori a livello di applicazione
const AppErrorFallback = ({ error, resetError }) => {
  const handleRefresh = () => {
    // Ricarica la pagina (utile per errori critici)
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg max-w-lg w-full p-6 text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Bug className="h-8 w-8 text-red-500" />
        </div>
        
        <h1 className="text-2xl font-bold mb-2">Oops, qualcosa è andato storto</h1>
        
        <p className="text-gray-600 mb-6">
          Si è verificato un errore imprevisto nell'applicazione. Abbiamo registrato automaticamente l'errore
          e il nostro team tecnico sta lavorando per risolverlo.
        </p>
        
        {error && (
          <div className="bg-red-50 border border-red-100 rounded-md p-3 mb-6 text-left">
            <p className="text-xs font-mono text-red-800 overflow-auto max-h-[150px]">
              {error.toString()}
            </p>
          </div>
        )}
        
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button 
            onClick={resetError} 
            variant="outline" 
            className="flex gap-2 items-center justify-center"
          >
            <RefreshCw className="h-4 w-4" />
            Riprova
          </Button>
          
          <Button 
            onClick={handleRefresh}
            className="flex gap-2 items-center justify-center"
          >
            Ricarica pagina
          </Button>
          
          <Link href="/">
            <Button 
              variant="secondary" 
              className="flex gap-2 items-center justify-center"
            >
              <Home className="h-4 w-4" />
              Torna alla Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

// Componente wrapper che racchiude l'intera applicazione in un ErrorBoundary
function AppErrorBoundary({ children }) {
  return (
    <ErrorBoundary 
      componentName="AppRoot"
      fallback={AppErrorFallback}
    >
      {children}
    </ErrorBoundary>
  );
}

export default AppErrorBoundary;