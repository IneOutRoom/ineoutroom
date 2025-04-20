import { AdminDashboard } from "@/components/admin/AdminDashboard";
import AdminKPIs from "@/components/admin/AdminKPIs";
import { useAuth } from "@/hooks/use-auth";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Loader2 } from "lucide-react";
import { useLocation } from "wouter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";

export default function AdminDashboardPage() {
  const { user, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState("dashboard");
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  const [_, navigate] = useLocation();
  
  // Se l'utente non è autenticato, reindirizza alla pagina di login
  if (!user) {
    navigate("/auth");
    return null;
  }
  
  // Per questa implementazione, consideriamo solo l'utente con ID=1 come amministratore
  // In una versione più avanzata, avremmo un campo isAdmin nello schema utente
  if (user.id !== 1) {
    return (
      <div className="container mx-auto py-10 px-4 max-w-3xl">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Accesso negato</AlertTitle>
          <AlertDescription>
            Non hai i permessi necessari per accedere alla dashboard amministrativa.
          </AlertDescription>
        </Alert>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-6">Area Amministrativa In&Out</h1>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList>
          <TabsTrigger value="dashboard">Dashboard Classica</TabsTrigger>
          <TabsTrigger value="kpis">KPI Avanzati</TabsTrigger>
        </TabsList>
        
        <TabsContent value="dashboard" className="pt-6">
          <AdminDashboard />
        </TabsContent>
        
        <TabsContent value="kpis" className="pt-6">
          <AdminKPIs />
        </TabsContent>
      </Tabs>
    </div>
  );
}