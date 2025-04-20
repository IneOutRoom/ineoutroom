import { SentryTest } from '../client/src/components/error-testing/SentryTest';
import { PerformanceTest } from '../client/src/components/error-testing/PerformanceTest';
import Head from 'next/head';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../client/src/components/ui/card';
import { Separator } from '../client/src/components/ui/separator';
import { InfoCircle, AlertTriangle, BarChart, Bug } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../client/src/components/ui/tabs';

export default function SentryTestPage() {
  return (
    <>
      <Head>
        <title>Test del Sistema di Monitoraggio Errori | In&Out Rooms</title>
        <meta name="description" content="Pagina per testare il sistema di monitoraggio errori integrato con Sentry" />
      </Head>
      
      <div className="container max-w-5xl mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-2">Test Monitoraggio e Prestazioni</h1>
        <p className="text-gray-500 mb-6">
          Questa pagina consente di testare il sistema di monitoraggio Sentry integrato nell'applicazione.
        </p>
        
        <Tabs defaultValue="errors" className="mb-8">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
            <TabsTrigger value="errors" className="flex items-center gap-2">
              <Bug className="h-4 w-4" /> Errori
            </TabsTrigger>
            <TabsTrigger value="performance" className="flex items-center gap-2">
              <BarChart className="h-4 w-4" /> Prestazioni
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="errors" className="mt-6">
            <div className="grid md:grid-cols-3 gap-8">
              <div className="col-span-2">
                <SentryTest />
              </div>
              
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex gap-2 items-center">
                      <InfoCircle className="h-5 w-5 text-blue-500" />
                      Informazioni sul Sistema
                    </CardTitle>
                    <CardDescription>
                      Come funziona il monitoraggio errori
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4 text-sm">
                    <p>
                      Il sistema di monitoraggio errori è implementato utilizzando Sentry,
                      un servizio che permette di tracciare, analizzare e risolvere errori in tempo reale.
                    </p>
                    
                    <Separator />
                    
                    <h3 className="font-semibold">Funzionalità implementate:</h3>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Monitoraggio errori frontend</li>
                      <li>Monitoraggio errori backend</li>
                      <li>Tracciamento richieste API</li>
                      <li>Feedback utente</li>
                      <li>Performance monitoring</li>
                    </ul>
                    
                    <Separator />
                    
                    <div className="flex items-start gap-2 p-2 bg-yellow-50 rounded border border-yellow-200">
                      <AlertTriangle className="h-4 w-4 text-yellow-500 shrink-0 mt-0.5" />
                      <p className="text-xs">
                        Gli errori generati in questa pagina di test sono controllati e 
                        non influiscono sul funzionamento dell'applicazione.
                      </p>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Benefici del Monitoraggio</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div className="flex flex-col gap-1.5">
                      <h4 className="font-medium">🔍 Rilevamento Rapido</h4>
                      <p className="text-gray-600 text-xs">
                        Identificazione immediata di errori e problemi
                      </p>
                    </div>
                    
                    <div className="flex flex-col gap-1.5">
                      <h4 className="font-medium">📊 Analisi Dettagliata</h4>
                      <p className="text-gray-600 text-xs">
                        Informazioni complete su stack trace, contesto e ambiente
                      </p>
                    </div>
                    
                    <div className="flex flex-col gap-1.5">
                      <h4 className="font-medium">⚠️ Alerting Intelligente</h4>
                      <p className="text-gray-600 text-xs">
                        Notifiche tempestive in caso di problemi critici
                      </p>
                    </div>
                    
                    <div className="flex flex-col gap-1.5">
                      <h4 className="font-medium">👨‍💻 Miglioramento Continuo</h4>
                      <p className="text-gray-600 text-xs">
                        Dati per migliorare affidabilità e performance
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="performance" className="mt-6">
            <div className="grid md:grid-cols-3 gap-8">
              <div className="col-span-2">
                <PerformanceTest />
              </div>
              
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex gap-2 items-center">
                      <BarChart className="h-5 w-5 text-blue-500" />
                      Performance Monitoring
                    </CardTitle>
                    <CardDescription>
                      Come funziona il monitoraggio prestazioni
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4 text-sm">
                    <p>
                      Il monitoraggio delle prestazioni permette di misurare, analizzare e ottimizzare
                      la velocità e l'efficienza dell'applicazione in tempo reale.
                    </p>
                    
                    <Separator />
                    
                    <h3 className="font-semibold">Metriche tracciate:</h3>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Tempi di caricamento pagina</li>
                      <li>Latenza delle API</li>
                      <li>Tempi di elaborazione backend</li>
                      <li>Operazioni database</li>
                      <li>Tempi di rendering frontend</li>
                    </ul>
                    
                    <Separator />
                    
                    <div className="flex items-start gap-2 p-2 bg-blue-50 rounded border border-blue-200">
                      <InfoCircle className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
                      <p className="text-xs">
                        I test di prestazione generano dati reali che vengono inviati a Sentry
                        per l'analisi e la visualizzazione nelle dashboard.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}