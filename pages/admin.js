import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { useAuth } from '@/hooks/use-auth';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Loader2 } from 'lucide-react';
import { AdminDashboard } from '@/components/admin/AdminDashboard';

export default function AdminDashboardPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  
  // Redirect se l'utente non è autenticato
  useEffect(() => {
    if (!isLoading && !user && typeof window !== 'undefined') {
      router.push('/auth?redirect=/admin');
    }
  }, [user, isLoading, router]);
  
  // Loader mentre verifichiamo l'autenticazione
  if (isLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  // Per questa implementazione, consideriamo solo l'utente con ID=1 come amministratore
  // In una versione più avanzata, avremmo un campo isAdmin nello schema utente
  if (user.id !== 1) {
    return (
      <>
        <Head>
          <title>Accesso negato - Dashboard Amministrativa</title>
          <meta name="description" content="Accesso negato alla dashboard amministrativa" />
          <meta property="og:title" content="Accesso negato - Dashboard Amministrativa" />
          <meta property="og:description" content="Accesso negato alla dashboard amministrativa" />
          <meta property="og:type" content="website" />
        </Head>
        
        <div className="container mx-auto py-10 px-4 max-w-3xl">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Accesso negato</AlertTitle>
            <AlertDescription>
              Non hai i permessi necessari per accedere alla dashboard amministrativa.
            </AlertDescription>
          </Alert>
          
          <div className="mt-6 text-center">
            <button 
              onClick={() => router.push('/')}
              className="text-primary hover:underline"
            >
              Torna alla homepage
            </button>
          </div>
        </div>
      </>
    );
  }
  
  return (
    <>
      <Head>
        <title>Dashboard Amministrativa - In&Out</title>
        <meta name="description" content="Dashboard amministrativa per la gestione di In&Out" />
        <meta property="og:title" content="Dashboard Amministrativa - In&Out" />
        <meta property="og:description" content="Dashboard amministrativa per la gestione di In&Out" />
        <meta property="og:type" content="website" />
      </Head>
      
      <AdminDashboard />
    </>
  );
}

// SSR per verificare l'accesso ai dati amministrativi
export async function getServerSideProps(context) {
  return {
    props: {},
  };
}