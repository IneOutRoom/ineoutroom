import { Component } from 'react';
import * as Sentry from '@sentry/nextjs';
import { Alert, AlertTitle, AlertDescription } from '../ui/alert';
import { Button } from '../ui/button';
import { AlertTriangle, RefreshCw } from 'lucide-react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error) {
    // Aggiorna lo stato in modo che il prossimo render mostri l'UI di fallback
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Catturiamo l'errore e le informazioni sullo stack trace
    this.setState({ errorInfo });
    
    // Inviamo l'errore a Sentry
    Sentry.withScope((scope) => {
      scope.setExtras(errorInfo);
      scope.setTag('component', this.props.componentName || 'unknown');
      scope.setLevel(Sentry.Severity.Error);
      Sentry.captureException(error);
    });

    // Possiamo anche loggare l'errore nella console per debugging
    console.error('Errore React catturato da ErrorBoundary:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ 
      hasError: false,
      error: null,
      errorInfo: null
    });
  }

  handleReport = () => {
    // Genera un ID evento e mostra il dialog di feedback di Sentry
    const eventId = Sentry.captureMessage('Segnalazione utente: errore UI');
    Sentry.showReportDialog({ eventId });
  }

  render() {
    if (this.state.hasError) {
      // Rendering dell'UI di fallback
      const ErrorFallback = this.props.fallback;
      
      if (ErrorFallback) {
        return <ErrorFallback 
          error={this.state.error}
          errorInfo={this.state.errorInfo}
          resetError={this.handleReset}
          reportError={this.handleReport}
        />;
      }
      
      // Fallback predefinito se non è stato fornito un componente custom
      return (
        <div className="p-4 flex items-center justify-center min-h-[200px]">
          <Alert variant="destructive" className="max-w-lg w-full">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>
              Si è verificato un errore in questa sezione
            </AlertTitle>
            <AlertDescription className="mt-2">
              <p className="mb-3">
                Si è verificato un problema imprevisto durante la visualizzazione di questo contenuto. 
                Il nostro team è stato automaticamente notificato dell'errore.
              </p>
              
              {this.state.error && (
                <p className="text-xs font-mono bg-red-100/50 p-2 rounded mb-3 overflow-auto max-h-[100px]">
                  {this.state.error.toString()}
                </p>
              )}
              
              <div className="flex gap-3 mt-4">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={this.handleReset}
                  className="flex items-center gap-1"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  Riprova
                </Button>
                <Button 
                  variant="destructive" 
                  size="sm" 
                  onClick={this.handleReport}
                >
                  Segnala problema
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        </div>
      );
    }

    // Se non ci sono errori, renderizza normalmente i figli
    return this.props.children;
  }
}

export default ErrorBoundary;