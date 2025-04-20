import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import MonitoringDashboard from "@/components/admin/MonitoringDashboard";

export default function AdminMonitoring() {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  // Reindirizza se l'utente non è autenticato
  useEffect(() => {
    if (!isLoading && !user) {
      setLocation("/auth");
    }
  }, [user, isLoading, setLocation]);

  // Verifica se l'utente è amministratore (ID=1)
  const isAdmin = user?.id === 1;
  
  // Mostra una pagina di caricamento durante il controllo dell'autenticazione
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  // Se l'utente non è amministratore, mostra un messaggio di accesso negato
  if (!isAdmin) {
    return (
      <div className="container max-w-3xl py-12">
        <Alert variant="destructive">
          <AlertTriangle className="h-5 w-5" />
          <AlertTitle>Accesso negato</AlertTitle>
          <AlertDescription>
            Non hai i permessi necessari per accedere a questa pagina. Questa funzionalità è riservata agli amministratori.
          </AlertDescription>
        </Alert>
        
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Accesso amministratore richiesto</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Per accedere alla dashboard di monitoraggio del sistema, è necessario avere privilegi amministrativi.</p>
            <p className="mt-2">Se ritieni che questo sia un errore, contatta il supporto tecnico.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Altrimenti, mostra la dashboard di monitoraggio
  return <MonitoringDashboard />;
}