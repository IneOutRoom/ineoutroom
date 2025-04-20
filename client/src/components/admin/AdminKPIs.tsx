import { useState, useEffect } from 'react';
import { 
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, Legend, AreaChart, Area 
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Loader2, TrendingUp, Users, Home, Clock } from 'lucide-react';

/**
 * Componente che visualizza i KPI dell'area amministrativa tramite grafici
 */
export default function AdminKPIs() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState({
    signupsLast30Days: [] as { date: string; count: number }[],
    announcementsLast30Days: [] as { date: string; count: number }[],
    avgSessionTimeData: [] as { date: string; avgMinutes: number }[],
    avgSessionTime: 0
  });

  useEffect(() => {
    // Recupera i dati dall'API
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/admin/kpis');
        
        if (!response.ok) {
          throw new Error(`Errore ${response.status}: ${response.statusText}`);
        }
        
        const result = await response.json();
        setData(result);
      } catch (err) {
        console.error('Errore nel recupero dei KPI:', err);
        setError(err instanceof Error ? err.message : 'Errore sconosciuto');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Se i dati sono in caricamento
  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-lg">Caricamento KPI in corso...</span>
      </div>
    );
  }

  // Se c'è stato un errore
  if (error) {
    return (
      <div className="p-4 rounded-md bg-red-50 border border-red-200">
        <h3 className="text-lg font-medium text-red-800">Errore nel caricamento dei KPI</h3>
        <p className="mt-2 text-sm text-red-700">{error}</p>
        <p className="mt-2 text-sm text-red-700">
          Verifica che tu abbia i permessi di amministratore per accedere a questa sezione.
        </p>
      </div>
    );
  }

  // Verifica che i dati siano definiti
  const { signupsLast30Days, announcementsLast30Days, avgSessionTimeData, avgSessionTime } = data;

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-1.5">
        <h2 className="text-2xl font-bold tracking-tight">Dashboard Amministrativa</h2>
        <p className="text-muted-foreground">
          Panoramica delle metriche chiave della piattaforma negli ultimi 30 giorni.
        </p>
      </div>

      <Separator />

      {/* Cards con KPI principali */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Nuovi Utenti</CardTitle>
            <Users className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {signupsLast30Days.reduce((sum, item) => sum + item.count, 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              +{signupsLast30Days.slice(-7).reduce((sum, item) => sum + item.count, 0)} ultimi 7 giorni
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Nuovi Annunci</CardTitle>
            <Home className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {announcementsLast30Days.reduce((sum, item) => sum + item.count, 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              +{announcementsLast30Days.slice(-7).reduce((sum, item) => sum + item.count, 0)} ultimi 7 giorni
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Tempo Medio Sessione</CardTitle>
            <Clock className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgSessionTime} min</div>
            <p className="text-xs text-muted-foreground">
              Media ultimi 30 giorni
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs con grafici dettagliati */}
      <Tabs defaultValue="signups" className="space-y-4">
        <TabsList>
          <TabsTrigger value="signups">Iscrizioni</TabsTrigger>
          <TabsTrigger value="announcements">Annunci</TabsTrigger>
          <TabsTrigger value="session">Tempo Sessione</TabsTrigger>
        </TabsList>
        
        <TabsContent value="signups" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Nuove iscrizioni utenti</CardTitle>
              <CardDescription>
                Numero di nuovi utenti registrati negli ultimi 30 giorni
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={signupsLast30Days}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis allowDecimals={false} />
                  <Tooltip 
                    formatter={(value: number) => [`${value} utenti`, 'Iscrizioni']}
                    labelFormatter={(label: string) => `Data: ${label}`}
                  />
                  <Legend />
                  <Bar dataKey="count" name="Nuovi utenti" fill="#6a0dad" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="announcements" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Nuovi annunci pubblicati</CardTitle>
              <CardDescription>
                Numero di nuovi annunci pubblicati negli ultimi 30 giorni
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={announcementsLast30Days}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis allowDecimals={false} />
                  <Tooltip 
                    formatter={(value: number) => [`${value} annunci`, 'Pubblicati']}
                    labelFormatter={(label: string) => `Data: ${label}`}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="count" 
                    name="Nuovi annunci" 
                    stroke="#6a0dad" 
                    strokeWidth={2}
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="session" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Tempo medio di sessione</CardTitle>
              <CardDescription>
                Durata media delle sessioni utente negli ultimi 30 giorni
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={avgSessionTimeData}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorAvg" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6a0dad" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#6a0dad" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis domain={[0, 'dataMax + 1']} />
                  <Tooltip 
                    formatter={(value: number) => [`${value} minuti`, 'Durata media']}
                    labelFormatter={(label: string) => `Data: ${label}`}
                  />
                  <Legend />
                  <Area 
                    type="monotone" 
                    dataKey="avgMinutes" 
                    name="Tempo medio" 
                    stroke="#6a0dad" 
                    fillOpacity={1} 
                    fill="url(#colorAvg)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}