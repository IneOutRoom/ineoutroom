import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip
} from 'recharts';
import { Loader2, Users, UserCog, UserCircle, UserMinus, UserPlus } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

// Colori per i diversi cluster
const COLORS = ['#6a0dad', '#8e44ad', '#9b59b6', '#d559b6', '#ff9ff3'];

// Icone per i diversi cluster
const CLUSTER_ICONS = [
  <UserCog key="0" className="h-4 w-4" />,
  <UserCircle key="1" className="h-4 w-4" />,
  <Users key="2" className="h-4 w-4" />,
  <UserPlus key="3" className="h-4 w-4" />,
  <UserMinus key="4" className="h-4 w-4" />
];

interface UserClustersProps {
  userId?: number;
  showAllClusters?: boolean;
}

/**
 * Componente per visualizzare il clustering degli utenti
 */
export default function UserClusters({ userId, showAllClusters = false }: UserClustersProps) {
  const [tab, setTab] = useState('info');
  
  // Query per ottenere i dati di clustering
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['/api/ml/cluster', userId],
    queryFn: async () => {
      if (!userId) return null;
      
      const res = await apiRequest('POST', '/api/ml/cluster', { 
        userId 
      });
      
      return res.json();
    },
    enabled: !!userId, // Esegui solo se userId è disponibile
  });
  
  // Se showAllClusters è true, mostriamo informazioni generali sui cluster
  if (showAllClusters) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Segmentazione Utenti</CardTitle>
          <CardDescription>
            Clusterizzazione basata sul comportamento
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-muted p-4 rounded-md">
                <h3 className="flex items-center text-sm font-medium text-primary mb-2">
                  {CLUSTER_ICONS[0]} <span className="ml-2">Proprietari attivi</span>
                </h3>
                <p className="text-sm text-muted-foreground">
                  Utenti che pubblicano regolarmente annunci e sono molto attivi sulla piattaforma
                </p>
              </div>
              
              <div className="bg-muted p-4 rounded-md">
                <h3 className="flex items-center text-sm font-medium text-primary mb-2">
                  {CLUSTER_ICONS[1]} <span className="ml-2">Cercatori occasionali</span>
                </h3>
                <p className="text-sm text-muted-foreground">
                  Utenti che cercano proprietà occasionalmente e raramente finalizzano
                </p>
              </div>
              
              <div className="bg-muted p-4 rounded-md">
                <h3 className="flex items-center text-sm font-medium text-primary mb-2">
                  {CLUSTER_ICONS[2]} <span className="ml-2">Utenti premium</span>
                </h3>
                <p className="text-sm text-muted-foreground">
                  Sottoscrizioni premium con alto tasso di completamento transazioni
                </p>
              </div>
              
              <div className="bg-muted p-4 rounded-md">
                <h3 className="flex items-center text-sm font-medium text-primary mb-2">
                  {CLUSTER_ICONS[3]} <span className="ml-2">Nuovi iscritti</span>
                </h3>
                <p className="text-sm text-muted-foreground">
                  Account recenti in fase di esplorazione della piattaforma
                </p>
              </div>
              
              <div className="bg-muted p-4 rounded-md md:col-span-2">
                <h3 className="flex items-center text-sm font-medium text-primary mb-2">
                  {CLUSTER_ICONS[4]} <span className="ml-2">Utenti inattivi</span>
                </h3>
                <p className="text-sm text-muted-foreground">
                  Login poco frequenti, sessioni brevi e nessuna transazione recente
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // Se non abbiamo un userId, mostra un messaggio
  if (!userId) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Segmentazione Utente</CardTitle>
          <CardDescription>
            Seleziona un utente per vedere a quale segmento appartiene
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }
  
  // Se stiamo caricando, mostra uno spinner
  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Analisi del segmento in corso</CardTitle>
          <CardDescription>
            Stiamo analizzando i dati comportamentali...
          </CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-6">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }
  
  // Se c'è stato un errore, mostra un messaggio
  if (isError || !data) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Servizio non disponibile</CardTitle>
          <CardDescription>
            Non è stato possibile analizzare il segmento al momento
          </CardDescription>
        </CardHeader>
        <CardFooter>
          <Button variant="outline" onClick={() => refetch()}>
            Riprova
          </Button>
        </CardFooter>
      </Card>
    );
  }
  
  // Estrai i dati
  const { 
    cluster_id, 
    cluster_name, 
    confidence, 
    cluster_features, 
    user_distinctive_features,
    cluster_distribution 
  } = data;
  
  // Prepara i dati per il grafico a torta
  const pieData = Object.entries(cluster_distribution).map(([id, value]) => ({
    id: parseInt(id),
    name: id === cluster_id.toString() ? cluster_name : `Cluster ${id}`,
    value: parseFloat(value as string) * 100,
    isMain: id === cluster_id.toString()
  }));
  
  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Segmentazione Utente</CardTitle>
            <CardDescription>
              Analisi basata sul comportamento dell'utente
            </CardDescription>
          </div>
          <Badge variant="outline" className="bg-primary text-primary-foreground">
            {CLUSTER_ICONS[cluster_id]}
            <span className="ml-1">{cluster_name}</span>
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent>
        <Tabs value={tab} onValueChange={setTab} className="w-full">
          <TabsList className="w-full">
            <TabsTrigger value="info" className="flex-1">Info</TabsTrigger>
            <TabsTrigger value="chart" className="flex-1">Distribuzione</TabsTrigger>
          </TabsList>
          
          <TabsContent value="info" className="space-y-4 mt-4">
            <div>
              <h3 className="text-sm font-medium mb-2">Caratteristiche del segmento</h3>
              <ul className="list-disc pl-5 space-y-1">
                {cluster_features.map((feature, index) => (
                  <li key={index} className="text-sm text-muted-foreground">
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
            
            {user_distinctive_features && user_distinctive_features.length > 0 && (
              <div>
                <h3 className="text-sm font-medium mb-2">Caratteristiche distintive dell'utente</h3>
                <ul className="list-disc pl-5 space-y-1">
                  {user_distinctive_features.map((feature, index) => (
                    <li key={index} className="text-sm text-muted-foreground">
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            <div className="pt-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Confidenza:</span>
                <span className="text-sm">{(confidence * 100).toFixed(0)}%</span>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="chart" className="mt-4">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {pieData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={COLORS[entry.id % COLORS.length]} 
                        strokeWidth={entry.isMain ? 3 : 1}
                      />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value.toFixed(0)}%`, 'Compatibilità']} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}