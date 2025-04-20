import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { Loader2, Check, X, AlertTriangle } from 'lucide-react';

export default function VerifyEmailPage() {
  const router = useRouter();
  const { token } = router.query;
  
  const [status, setStatus] = useState('loading'); // loading, success, error
  const [message, setMessage] = useState('');
  
  useEffect(() => {
    // Non fare nulla finché il token non è disponibile
    if (!token) return;
    
    const verifyEmail = async () => {
      try {
        const response = await fetch(`/api/auth/verify-email?token=${token}`);
        const data = await response.json();
        
        if (response.ok) {
          setStatus('success');
          setMessage(data.message || 'Email verificata con successo!');
        } else {
          setStatus('error');
          setMessage(data.message || 'Si è verificato un errore durante la verifica dell\'email.');
        }
      } catch (error) {
        console.error('Errore durante la verifica dell\'email:', error);
        setStatus('error');
        setMessage('Si è verificato un errore durante la verifica dell\'email.');
      }
    };
    
    verifyEmail();
  }, [token]);
  
  return (
    <>
      <Head>
        <title>Verifica Email - In&Out</title>
        <meta name="description" content="Verifica il tuo indirizzo email per accedere a tutte le funzionalità di In&Out." />
        <meta property="og:title" content="Verifica Email - In&Out" />
        <meta property="og:description" content="Verifica il tuo indirizzo email per accedere a tutte le funzionalità di In&Out." />
        <meta property="og:type" content="website" />
      </Head>
      
      <div className="min-h-screen flex items-center justify-center bg-neutral-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
          <div className="text-center">
            <Link href="/" className="flex justify-center mb-6">
              <img 
                src="/logo.png" 
                alt="In&Out Logo" 
                className="h-12" 
              />
            </Link>
            
            <h2 className="text-3xl font-bold text-primary mb-6">Verifica Email</h2>
            
            {status === 'loading' && (
              <div className="flex flex-col items-center justify-center">
                <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
                <p className="text-gray-600">Verifica dell'email in corso...</p>
              </div>
            )}
            
            {status === 'success' && (
              <div className="flex flex-col items-center justify-center">
                <div className="bg-green-100 p-3 rounded-full mb-4">
                  <Check className="h-12 w-12 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-green-600 mb-2">Email Verificata!</h3>
                <p className="text-gray-600 mb-6">{message}</p>
                <div className="mt-4">
                  <Link href="/auth" className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90 transition-colors">
                    Vai al Login
                  </Link>
                </div>
              </div>
            )}
            
            {status === 'error' && (
              <div className="flex flex-col items-center justify-center">
                <div className="bg-red-100 p-3 rounded-full mb-4">
                  <AlertTriangle className="h-12 w-12 text-red-600" />
                </div>
                <h3 className="text-xl font-semibold text-red-600 mb-2">Verifica Fallita</h3>
                <p className="text-gray-600 mb-6">{message}</p>
                <p className="text-sm text-gray-500 mb-4">
                  Il link potrebbe essere scaduto o non valido. Puoi richiedere un nuovo link di verifica.
                </p>
                <div className="mt-4">
                  <Link href="/auth" className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90 transition-colors">
                    Torna al Login
                  </Link>
                </div>
              </div>
            )}
          </div>
          
          <div className="mt-8 text-center text-sm text-gray-500">
            <p>
              Hai bisogno di aiuto?{" "}
              <Link href="/contatti" className="text-primary hover:underline">
                Contattaci
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}