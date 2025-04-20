import React from 'react';
import { Navbar } from '@/components/layout/navbar';
import { SentryTest } from '../components/error-testing/SentryTest';
import { Footer } from '@/components/layout/footer';

export default function SentryTestPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">Sentry Monitoring Test</h1>
            <p className="text-gray-600 mb-8">
              Questa pagina contiene strumenti per testare l'integrazione di Sentry nel progetto In&Out.
              Usala per verificare il funzionamento del monitoraggio errori e performance.
            </p>
            
            <SentryTest />
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}