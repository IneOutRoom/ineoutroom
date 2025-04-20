import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { 
  HomeIcon, 
  Users, 
  Building2, 
  Star, 
  Flag,
  AlertTriangle
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { it } from "date-fns/locale";

const COLORS = ["#6a0dad", "#8e44ad", "#9b59b6", "#d559b6", "#ff9ff3"];

export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("overview");

  const { data: stats, isLoading, error } = useQuery({
    queryKey: ["/api/admin/stats"],
    retry: false
  });

  const { data: reports, isLoading: isLoadingReports } = useQuery({
    queryKey: ["/api/admin/reports"],
    retry: false
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="mb-6">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Errore di accesso</AlertTitle>
        <AlertDescription>
          Non hai i permessi di amministratore necessari per visualizzare questa pagina.
        </AlertDescription>
      </Alert>
    );
  }

  const formatMonthData = (monthlyData: any[]) => {
    return monthlyData.map(item => ({
      month: format(parseISO(item.month), "MMM yyyy", { locale: it }),
      count: Number(item.count)
    }));
  };

  return (
    <div className="container mx-auto py-10 px-4 md:px-6">
      <div className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard Amministrativa</h1>
        <p className="text-muted-foreground mt-2">
          Gestisci il tuo sito immobiliare e monitora le metriche chiave
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-primary/10 rounded-md">
                <Building2 className="h-8 w-8 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Annunci Totali</p>
                <h4 className="text-3xl font-bold">{stats?.totalProperties || 0}</h4>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-primary/10 rounded-md">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Utenti Registrati</p>
                <h4 className="text-3xl font-bold">{stats?.totalUsers || 0}</h4>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-primary/10 rounded-md">
                <Star className="h-8 w-8 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Recensioni</p>
                <h4 className="text-3xl font-bold">{stats?.totalReviews || 0}</h4>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-primary/10 rounded-md">
                <Flag className="h-8 w-8 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Segnalazioni</p>
                <h4 className="text-3xl font-bold">{reports?.length || 0}</h4>
                {reports?.filter((r: any) => r.status === "pending").length > 0 && (
                  <Badge variant="destructive" className="ml-2">
                    {reports?.filter((r: any) => r.status === "pending").length} in attesa
                  </Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
        <TabsList className="mb-6">
          <TabsTrigger value="overview">
            <HomeIcon className="h-4 w-4 mr-2" />
            Panoramica
          </TabsTrigger>
          <TabsTrigger value="users">
            <Users className="h-4 w-4 mr-2" />
            Utenti
          </TabsTrigger>
          <TabsTrigger value="reports">
            <Flag className="h-4 w-4 mr-2" />
            Segnalazioni
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="col-span-2 md:col-span-1">
              <CardHeader>
                <CardTitle>Registrazioni Mensili</CardTitle>
                <CardDescription>Andamento delle registrazioni degli utenti</CardDescription>
              </CardHeader>
              <CardContent className="pl-2">
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={stats?.monthlySignups ? formatMonthData(stats.monthlySignups) : []}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="count" name="Nuovi Utenti" fill="#6a0dad" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="col-span-2 md:col-span-1">
              <CardHeader>
                <CardTitle>Piani di Abbonamento</CardTitle>
                <CardDescription>Distribuzione dei piani attivi</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  {stats?.planSales && stats.planSales.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={stats.planSales.map((s: any) => ({
                            name: s.plan === "single" ? "Base" : s.plan === "standard" ? "Standard" : "Premium",
                            value: Number(s.count)
                          }))}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {stats.planSales.map((_: any, index: number) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value: any) => [`${value} utenti`, 'Totale']} />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <p className="text-muted-foreground">Nessun dato disponibile</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="col-span-2 md:col-span-1">
              <CardHeader>
                <CardTitle>Città Più Popolari</CardTitle>
                <CardDescription>Le città con più annunci</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  {stats?.topCities && stats.topCities.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        layout="vertical"
                        data={stats.topCities}
                        margin={{ top: 20, right: 30, left: 60, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" />
                        <YAxis type="category" dataKey="city" />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="count" name="Annunci" fill="#8e44ad" />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <p className="text-muted-foreground">Nessun dato disponibile</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="col-span-2 md:col-span-1">
              <CardHeader>
                <CardTitle>Tipologie di Proprietà</CardTitle>
                <CardDescription>Distribuzione per tipo di alloggio</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  {stats?.propertiesByType && stats.propertiesByType.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={stats.propertiesByType.map((s: any) => ({
                            name: s.type === "stanza_singola" ? "Stanza Singola" : 
                                  s.type === "stanza_doppia" ? "Stanza Doppia" : 
                                  s.type === "monolocale" ? "Monolocale" : 
                                  s.type === "bilocale" ? "Bilocale" : "Altro",
                            value: Number(s.count)
                          }))}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {stats.propertiesByType.map((_: any, index: number) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value: any) => [`${value} proprietà`, 'Totale']} />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <p className="text-muted-foreground">Nessun dato disponibile</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Ultimi Utenti Registrati</CardTitle>
              <CardDescription>Saranno implementati nella prossima versione</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Implementazione futura della lista utenti */}
              <div className="flex flex-col items-center justify-center py-10">
                <p className="text-muted-foreground mb-4">Funzionalità in sviluppo</p>
                <Button disabled variant="outline">Visualizza Tutti gli Utenti</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Segnalazioni di Recensioni</CardTitle>
              <CardDescription>Gestisci le segnalazioni degli utenti</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingReports ? (
                <div className="flex justify-center py-10">
                  <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
                </div>
              ) : reports && reports.length > 0 ? (
                <div className="space-y-8">
                  {reports.map((report: any) => (
                    <div key={report.id} className="space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center space-x-4">
                          <Avatar>
                            <AvatarFallback>{report.userId.toString().substring(0, 2)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">Utente #{report.userId}</p>
                            <p className="text-sm text-muted-foreground">
                              {format(new Date(report.createdAt), "dd/MM/yyyy HH:mm")}
                            </p>
                          </div>
                        </div>
                        <Badge
                          variant={
                            report.status === "pending" ? "outline" :
                            report.status === "resolved" ? "default" : "destructive"
                          }
                        >
                          {report.status === "pending" ? "In attesa" :
                           report.status === "resolved" ? "Risolta" : "Respinta"}
                        </Badge>
                      </div>
                      
                      <div className="bg-muted p-4 rounded-md">
                        <p className="font-medium mb-2">Motivo: {report.reason}</p>
                        {report.details && <p className="text-sm">{report.details}</p>}
                      </div>
                      
                      <div className="flex flex-wrap gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          disabled={report.status !== "pending"}
                          onClick={() => {
                            // Implementazione della funzione per vedere la recensione segnalata
                          }}
                        >
                          Vedi Recensione
                        </Button>
                        <Button 
                          variant="default" 
                          size="sm" 
                          disabled={report.status !== "pending"}
                          onClick={() => {
                            // Implementazione della funzione per approvare la segnalazione
                          }}
                        >
                          Approva
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="sm" 
                          disabled={report.status !== "pending"}
                          onClick={() => {
                            // Implementazione della funzione per respingere la segnalazione
                          }}
                        >
                          Respingi
                        </Button>
                      </div>
                      
                      <Separator />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-10">
                  <p className="text-muted-foreground">Nessuna segnalazione da gestire</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}