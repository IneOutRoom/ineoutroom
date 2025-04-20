import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Loader2, AlertTriangle, CheckCircle, Clock, Search, FileText, ServerCrash, ArrowDownUp } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Tipi per le metriche e i log
type SystemMetrics = {
  status: 'online' | 'degraded' | 'offline';
  uptime: number;
  responseTime: {
    avg: number;
    max: number;
    min: number;
  };
  errorRate: number;
  requestCount: number;
  memoryUsage: {
    used: number;
    total: number;
    percentage: number;
  };
  activeUsers: number;
  cpuUsage: number;
};

type LogEntry = {
  timestamp: string;
  level: 'error' | 'warn' | 'info' | 'http' | 'debug';
  message: string;
  metadata?: Record<string, any>;
};

type ServerAlert = {
  id: string;
  timestamp: string;
  level: 'critical' | 'warning' | 'info';
  message: string;
  status: 'active' | 'acknowledged' | 'resolved';
};

// Componente per i log con filtri
const LogViewer = () => {
  const [filter, setFilter] = useState('');
  const [level, setLevel] = useState<string>('all');
  
  // In produzione, questi dati proverrebbero da una query API
  const { data: logs = [], isLoading } = useQuery<LogEntry[]>({
    queryKey: ['/api/admin/logs', level, filter],
    queryFn: async () => {
      try {
        const res = await apiRequest("GET", `/api/admin/logs?level=${level}&filter=${filter}`);
        return await res.json();
      } catch (error) {
        // In fase di sviluppo, restituiamo dati di esempio
        return getMockLogs();
      }
    }
  });
  
  const filteredLogs = logs.filter(log => 
    (level === 'all' || log.level === level) && 
    (filter === '' || log.message.toLowerCase().includes(filter.toLowerCase()))
  );

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex space-x-2">
        <div className="flex-1">
          <div className="relative w-full">
            <Input
              placeholder="Filtra log per contenuto..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-full pl-10"
            />
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
          </div>
        </div>
        <Select value={level} onValueChange={setLevel}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Livello log" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tutti i livelli</SelectItem>
            <SelectItem value="error">Error</SelectItem>
            <SelectItem value="warn">Warning</SelectItem>
            <SelectItem value="info">Info</SelectItem>
            <SelectItem value="http">HTTP</SelectItem>
            <SelectItem value="debug">Debug</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <ScrollArea className="h-96 w-full rounded-md border">
        {filteredLogs.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground">
            Nessun log trovato con i filtri selezionati
          </div>
        ) : (
          <div className="p-0">
            {filteredLogs.map((log, i) => (
              <div key={i} className="group">
                <div className={`p-3 ${getLogBgColor(log.level)} hover:bg-accent flex flex-col gap-1`}>
                  <div className="flex items-center justify-between">
                    <Badge variant={getBadgeVariant(log.level)}>
                      {log.level.toUpperCase()}
                    </Badge>
                    <span className="text-xs text-muted-foreground">{log.timestamp}</span>
                  </div>
                  <div className="font-mono text-sm">{log.message}</div>
                  {log.metadata && (
                    <div className="mt-1 pt-1 border-t border-border text-xs font-mono text-muted-foreground group-hover:block hidden">
                      {JSON.stringify(log.metadata, null, 2)}
                    </div>
                  )}
                </div>
                {i < filteredLogs.length - 1 && <Separator />}
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
};

// Componente per gli allarmi attivi
const AlertsViewer = () => {
  // In produzione, questi dati proverrebbero da una query API
  const { data: alerts = [], isLoading } = useQuery<ServerAlert[]>({
    queryKey: ['/api/admin/alerts'],
    queryFn: async () => {
      try {
        const res = await apiRequest("GET", "/api/admin/alerts");
        return await res.json();
      } catch (error) {
        // In fase di sviluppo, restituiamo dati di esempio
        return getMockAlerts();
      }
    }
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Raggruppa gli allarmi per stato
  const activeAlerts = alerts.filter(a => a.status === 'active');
  const acknowledgedAlerts = alerts.filter(a => a.status === 'acknowledged');
  const resolvedAlerts = alerts.filter(a => a.status === 'resolved');

  return (
    <div className="space-y-6">
      {activeAlerts.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-semibold">Allarmi attivi</h4>
          {activeAlerts.map(alert => (
            <Alert key={alert.id} variant={getAlertVariant(alert.level)}>
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle className="flex items-center justify-between">
                <span>{getAlertTitle(alert.level)}</span>
                <span className="text-xs">{alert.timestamp}</span>
              </AlertTitle>
              <AlertDescription>
                <div className="mt-1">{alert.message}</div>
                <div className="mt-2 flex justify-end space-x-2">
                  <Button variant="outline" size="sm">
                    Riconosci
                  </Button>
                  <Button variant="default" size="sm">
                    Risolvi
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          ))}
        </div>
      )}

      {acknowledgedAlerts.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-semibold">Allarmi riconosciuti</h4>
          {acknowledgedAlerts.map(alert => (
            <Alert key={alert.id}>
              <Clock className="h-4 w-4" />
              <AlertTitle className="flex items-center justify-between">
                <span>{getAlertTitle(alert.level)}</span>
                <span className="text-xs">{alert.timestamp}</span>
              </AlertTitle>
              <AlertDescription>
                <div className="mt-1">{alert.message}</div>
                <div className="mt-2 flex justify-end space-x-2">
                  <Button variant="default" size="sm">
                    Risolvi
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          ))}
        </div>
      )}

      {resolvedAlerts.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-semibold">Allarmi risolti recentemente</h4>
          {resolvedAlerts.map(alert => (
            <Alert key={alert.id} className="bg-muted/50">
              <CheckCircle className="h-4 w-4" />
              <AlertTitle className="flex items-center justify-between">
                <span>{getAlertTitle(alert.level)}</span>
                <span className="text-xs">{alert.timestamp}</span>
              </AlertTitle>
              <AlertDescription>
                {alert.message}
              </AlertDescription>
            </Alert>
          ))}
        </div>
      )}

      {alerts.length === 0 && (
        <div className="p-8 text-center text-muted-foreground border rounded-md">
          <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-500" />
          <h4 className="font-medium">Nessun allarme attivo</h4>
          <p className="text-sm mt-1">Il sistema funziona correttamente senza anomalie</p>
        </div>
      )}
    </div>
  );
};

// Componente per le metriche di sistema
const SystemMetricsViewer = () => {
  // In produzione, questi dati proverrebbero da una query API
  const { data: metrics, isLoading } = useQuery<SystemMetrics>({
    queryKey: ['/api/admin/metrics'],
    queryFn: async () => {
      try {
        const res = await apiRequest("GET", "/api/admin/metrics");
        return await res.json();
      } catch (error) {
        // In fase di sviluppo, restituiamo dati di esempio
        return getMockMetrics();
      }
    },
    refetchInterval: 30000, // Aggiorna ogni 30 secondi
  });

  if (isLoading || !metrics) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Stato del server</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              {metrics.status === 'online' && (
                <div className="bg-green-500 rounded-full w-3 h-3 mr-2" />
              )}
              {metrics.status === 'degraded' && (
                <div className="bg-yellow-500 rounded-full w-3 h-3 mr-2" />
              )}
              {metrics.status === 'offline' && (
                <div className="bg-red-500 rounded-full w-3 h-3 mr-2" />
              )}
              <span className="font-medium capitalize">{metrics.status}</span>
            </div>
            <Badge variant="outline">
              {formatUptime(metrics.uptime)}
            </Badge>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Tempo di risposta</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.responseTime.avg} ms</div>
          <div className="mt-1 text-xs text-muted-foreground flex justify-between">
            <span>Min: {metrics.responseTime.min} ms</span>
            <span>Max: {metrics.responseTime.max} ms</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Errori</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {(metrics.errorRate * 100).toFixed(2)}%
          </div>
          <div className="mt-1 text-xs text-muted-foreground">
            su {metrics.requestCount} richieste totali
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Utilizzo memoria</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-end justify-between">
            <div className="text-2xl font-bold">
              {metrics.memoryUsage.percentage.toFixed(1)}%
            </div>
            <div className="text-xs text-muted-foreground">
              {formatMemory(metrics.memoryUsage.used)} / {formatMemory(metrics.memoryUsage.total)}
            </div>
          </div>
          <div className="mt-3 h-2 bg-muted rounded overflow-hidden">
            <div 
              className={`h-full ${getMemoryUsageColor(metrics.memoryUsage.percentage)}`} 
              style={{ width: `${metrics.memoryUsage.percentage}%` }}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Utenti attivi</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.activeUsers}</div>
          <div className="mt-1 text-xs text-muted-foreground">
            utenti connessi ora
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Utilizzo CPU</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.cpuUsage.toFixed(1)}%</div>
          <div className="mt-3 h-2 bg-muted rounded overflow-hidden">
            <div 
              className={`h-full ${getCpuUsageColor(metrics.cpuUsage)}`} 
              style={{ width: `${metrics.cpuUsage}%` }}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Componente principale della dashboard
const MonitoringDashboard = () => {
  return (
    <div className="container py-8 space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard di monitoraggio</h2>
        <Button variant="outline" size="sm">
          <ArrowDownUp className="w-4 h-4 mr-2" />
          Aggiorna dati
        </Button>
      </div>
      
      <Tabs defaultValue="metrics" className="space-y-6">
        <TabsList>
          <TabsTrigger value="metrics">Metriche</TabsTrigger>
          <TabsTrigger value="alerts">Allarmi</TabsTrigger>
          <TabsTrigger value="logs">Log</TabsTrigger>
        </TabsList>
        
        <TabsContent value="metrics" className="space-y-6">
          <SystemMetricsViewer />
        </TabsContent>
        
        <TabsContent value="alerts" className="space-y-6">
          <AlertsViewer />
        </TabsContent>
        
        <TabsContent value="logs" className="space-y-6">
          <LogViewer />
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Funzioni di utilità per la formattazione e la generazione di dati mock
function formatUptime(uptime: number): string {
  const days = Math.floor(uptime / 86400);
  const hours = Math.floor((uptime % 86400) / 3600);
  const minutes = Math.floor((uptime % 3600) / 60);
  
  if (days > 0) {
    return `${days}d ${hours}h ${minutes}m`;
  } else if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else {
    return `${minutes}m`;
  }
}

function formatMemory(bytes: number): string {
  const mb = bytes / 1024 / 1024;
  if (mb < 1000) {
    return `${mb.toFixed(1)} MB`;
  } else {
    return `${(mb / 1024).toFixed(2)} GB`;
  }
}

function getLogBgColor(level: string): string {
  switch (level) {
    case 'error': return 'bg-red-500/5';
    case 'warn': return 'bg-yellow-500/5';
    case 'info': return 'bg-blue-500/5';
    case 'http': return 'bg-purple-500/5';
    case 'debug': return 'bg-gray-500/5';
    default: return '';
  }
}

function getBadgeVariant(level: string): 'destructive' | 'default' | 'outline' | 'secondary' {
  switch (level) {
    case 'error': return 'destructive';
    case 'warn': return 'default';
    case 'info': return 'secondary';
    case 'http': return 'secondary';
    case 'debug': return 'outline';
    default: return 'outline';
  }
}

function getAlertVariant(level: string): 'destructive' | 'default' {
  switch (level) {
    case 'critical': return 'destructive';
    case 'warning': return 'default';
    default: return 'default';
  }
}

function getAlertTitle(level: string): string {
  switch (level) {
    case 'critical': return 'Allarme critico';
    case 'warning': return 'Avviso';
    case 'info': return 'Informazione';
    default: return 'Notifica';
  }
}

function getMemoryUsageColor(percentage: number): string {
  if (percentage > 85) return 'bg-red-500';
  if (percentage > 70) return 'bg-yellow-500';
  return 'bg-green-500';
}

function getCpuUsageColor(percentage: number): string {
  if (percentage > 80) return 'bg-red-500';
  if (percentage > 60) return 'bg-yellow-500';
  return 'bg-green-500';
}

// Funzioni che generano dati mock per lo sviluppo
function getMockLogs(): LogEntry[] {
  return [
    {
      timestamp: '2025-04-17 23:45:40',
      level: 'error',
      message: 'Risposta di errore: GET /api/user 401',
      metadata: {
        statusCode: 401,
        responseTime: '3ms',
        requestId: 'req-1234567890',
      }
    },
    {
      timestamp: '2025-04-17 23:45:36',
      level: 'info',
      message: 'Server avviato sulla porta 5000',
    },
    {
      timestamp: '2025-04-17 23:45:32',
      level: 'http',
      message: 'Richiesta ricevuta: GET /api/properties',
      metadata: {
        method: 'GET',
        url: '/api/properties',
        ip: '127.0.0.1',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
      }
    },
    {
      timestamp: '2025-04-17 23:43:15',
      level: 'warn',
      message: 'Tempo di risposta lento rilevato: GET /api/properties/search ha impiegato 2345ms',
      metadata: {
        threshold: '2000ms'
      }
    },
    {
      timestamp: '2025-04-17 23:40:22',
      level: 'debug',
      message: 'Esecuzione query database completata',
      metadata: {
        query: 'SELECT * FROM properties WHERE city = ? AND price < ?',
        params: ['Roma', 1000],
        duration: '45ms'
      }
    },
    {
      timestamp: '2025-04-17 23:32:18',
      level: 'error',
      message: 'Errore connessione database: Connection reset by peer',
      metadata: {
        error: 'ECONNRESET',
        attempt: 1,
        willRetry: true
      }
    }
  ];
}

function getMockAlerts(): ServerAlert[] {
  return [
    {
      id: 'alert-1',
      timestamp: '2025-04-17 23:32:18',
      level: 'critical',
      message: 'Errore connessione database: Connection reset by peer. Il sistema tenterà automaticamente la riconnessione.',
      status: 'active'
    },
    {
      id: 'alert-2',
      timestamp: '2025-04-17 23:35:42',
      level: 'warning',
      message: 'Utilizzo memoria elevato: 87.5% (1.4 GB / 1.6 GB). Considera di aumentare la memoria disponibile o ottimizzare le query.',
      status: 'acknowledged'
    },
    {
      id: 'alert-3',
      timestamp: '2025-04-17 22:15:31',
      level: 'warning',
      message: 'Alto tasso di errori rilevato: 15.2% su 235 richieste negli ultimi 5 minuti.',
      status: 'resolved'
    }
  ];
}

function getMockMetrics(): SystemMetrics {
  return {
    status: 'online',
    uptime: 14502, // secondi 
    responseTime: {
      avg: 187,
      max: 2345,
      min: 12
    },
    errorRate: 0.032, // 3.2%
    requestCount: 562,
    memoryUsage: {
      used: 1073741824, // 1 GB in bytes
      total: 1610612736, // 1.5 GB in bytes
      percentage: 66.7
    },
    activeUsers: 42,
    cpuUsage: 35.2
  };
}

export default MonitoringDashboard;