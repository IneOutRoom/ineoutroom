import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Loader2, User, Home, File, Settings, LogOut, Upload, Mail, CreditCard, Star } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import SEO from './components/SEO';
import { generateWebPageSchema } from '../client/src/components/seo/SchemaGenerator';
import ReviewList from '../client/src/components/reviews/ReviewList';
import ReviewForm from '../client/src/components/reviews/ReviewForm';

// Schema di validazione per il modulo di aggiornamento profilo
const profileSchema = z.object({
  name: z.string().optional(),
  email: z.string().email({ message: "Email non valida" }),
  profileImage: z.string().optional(),
});

export default function ProfilePage() {
  const { user, logoutMutation } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("info");
  
  // Se l'utente non è autenticato, reindirizza alla pagina di login
  useEffect(() => {
    if (!user && typeof window !== 'undefined') {
      router.push('/auth?redirect=/profilo');
    }
  }, [user, router]);
  
  // Query per ottenere le proprietà dell'utente
  const {
    data: properties = [],
    isLoading: isLoadingProperties,
  } = useQuery({
    queryKey: ['/api/user/properties'],
    queryFn: async () => {
      if (!user) return [];
      const response = await apiRequest('GET', '/api/user/properties');
      return response.json();
    },
    enabled: !!user
  });
  
  // Query per ottenere le ricerche salvate dell'utente
  const {
    data: savedSearches = [],
    isLoading: isLoadingSavedSearches,
  } = useQuery({
    queryKey: ['/api/user/saved-searches'],
    queryFn: async () => {
      if (!user) return [];
      const response = await apiRequest('GET', '/api/user/saved-searches');
      return response.json();
    },
    enabled: !!user
  });
  
  // Query per ottenere i documenti dell'utente
  const {
    data: documents = [],
    isLoading: isLoadingDocuments,
  } = useQuery({
    queryKey: ['/api/user/documents'],
    queryFn: async () => {
      if (!user) return [];
      const response = await apiRequest('GET', '/api/user/documents');
      return response.json();
    },
    enabled: !!user
  });
  
  // Mutation per aggiornare il profilo
  const updateProfileMutation = useMutation({
    mutationFn: async (data) => {
      const response = await apiRequest('PUT', '/api/user', data);
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['/api/user'], data);
      toast({
        title: 'Profilo aggiornato',
        description: 'Le tue informazioni sono state aggiornate con successo.',
        variant: 'default',
      });
    },
    onError: (error) => {
      toast({
        title: 'Errore',
        description: error.message || 'Si è verificato un errore durante l\'aggiornamento del profilo.',
        variant: 'destructive',
      });
    },
  });
  
  // Form per la modifica del profilo
  const form = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      profileImage: user?.profileImage || '',
    },
  });
  
  // Funzione per gestire l'invio del form
  const onSubmit = (data) => {
    updateProfileMutation.mutate(data);
  };
  
  // Funzione per gestire il logout
  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => {
        router.push('/');
      },
    });
  };
  
  // Se l'utente non è ancora caricato o non è autenticato, mostra un loader
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  // Formatta la data di creazione account
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };
  
  // Ottieni lo stato dell'abbonamento
  const getSubscriptionStatus = () => {
    if (!user.subscriptionPlan) return 'Nessun abbonamento attivo';
    
    switch (user.subscriptionPlan) {
      case 'single':
        return 'Annuncio singolo';
      case 'standard':
        return 'Piano Standard';
      case 'premium':
        return 'Piano Premium';
      default:
        return 'Nessun abbonamento attivo';
    }
  };
  
  return (
    <>
      <SEO
        title="Il tuo profilo - In&Out Room"
        description="Gestisci il tuo profilo, le tue proprietà, ricerche salvate e impostazioni del tuo account In&Out Room."
        keywords="profilo utente, gestione account, annunci immobiliari, ricerche salvate, impostazioni privacy"
        ogType="website"
        canonical="/profilo"
        schemaData={generateWebPageSchema({
          title: "Il tuo profilo - In&Out Room",
          description: "Gestisci il tuo profilo, le tue proprietà, ricerche salvate e impostazioni del tuo account In&Out Room.",
          url: "https://ineoutroom.eu/profilo",
          lastUpdated: "2025-04-18"
        })}
      />
      
      <div className="min-h-screen flex flex-col">
        <Navbar />
        
        <main className="flex-grow py-10 bg-neutral-50">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row gap-8">
              {/* Sidebar */}
              <aside className="w-full md:w-64 lg:w-72">
                <Card className="sticky top-8">
                  <CardContent className="p-4">
                    <div className="flex flex-col items-center my-6">
                      <Avatar className="h-24 w-24 mb-4">
                        {user.profileImage ? (
                          <AvatarImage src={user.profileImage} alt={user.username} />
                        ) : (
                          <AvatarFallback className="text-xl bg-primary/20">
                            {user.username?.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        )}
                      </Avatar>
                      <h2 className="text-xl font-bold">{user.name || user.username}</h2>
                      <p className="text-sm text-neutral-500">{user.email}</p>
                      <div className="flex items-center mt-2 text-xs text-neutral-500">
                        <span className="mr-1">Membro dal</span>
                        <time>{formatDate(user.createdAt)}</time>
                      </div>
                    </div>
                    
                    <nav className="mt-2 space-y-1">
                      <Button 
                        onClick={() => setActiveTab("info")} 
                        variant={activeTab === "info" ? "default" : "ghost"} 
                        className="w-full justify-start"
                      >
                        <User className="mr-2 h-4 w-4" />
                        Informazioni Profilo
                      </Button>
                      <Button 
                        onClick={() => setActiveTab("properties")} 
                        variant={activeTab === "properties" ? "default" : "ghost"} 
                        className="w-full justify-start"
                      >
                        <Home className="mr-2 h-4 w-4" />
                        Le Tue Proprietà
                      </Button>
                      <Button 
                        onClick={() => setActiveTab("searches")} 
                        variant={activeTab === "searches" ? "default" : "ghost"} 
                        className="w-full justify-start"
                      >
                        <Mail className="mr-2 h-4 w-4" />
                        Ricerche Salvate
                      </Button>
                      <Button 
                        onClick={() => setActiveTab("documents")} 
                        variant={activeTab === "documents" ? "default" : "ghost"} 
                        className="w-full justify-start"
                      >
                        <File className="mr-2 h-4 w-4" />
                        Documenti
                      </Button>
                      <Button 
                        onClick={() => setActiveTab("subscription")} 
                        variant={activeTab === "subscription" ? "default" : "ghost"} 
                        className="w-full justify-start"
                      >
                        <CreditCard className="mr-2 h-4 w-4" />
                        Abbonamento
                      </Button>
                      <Button 
                        onClick={() => setActiveTab("reviews")} 
                        variant={activeTab === "reviews" ? "default" : "ghost"} 
                        className="w-full justify-start"
                      >
                        <Star className="mr-2 h-4 w-4" />
                        Recensioni
                      </Button>
                      <Button 
                        onClick={() => setActiveTab("settings")} 
                        variant={activeTab === "settings" ? "default" : "ghost"} 
                        className="w-full justify-start"
                      >
                        <Settings className="mr-2 h-4 w-4" />
                        Impostazioni
                      </Button>
                      <Separator className="my-2" />
                      <Button 
                        onClick={handleLogout} 
                        variant="outline" 
                        className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50"
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        Logout
                      </Button>
                    </nav>
                  </CardContent>
                </Card>
              </aside>
              
              {/* Content */}
              <div className="flex-1">
                {/* Informazioni profilo */}
                {activeTab === "info" && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Informazioni Profilo</CardTitle>
                      <CardDescription>
                        Visualizza e modifica le tue informazioni personali
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                          <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Nome completo</FormLabel>
                                <FormControl>
                                  <Input placeholder="Il tuo nome completo" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                  <Input type="email" placeholder="La tua email" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="profileImage"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>URL immagine profilo</FormLabel>
                                <FormControl>
                                  <Input placeholder="URL dell'immagine del profilo" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <Button 
                            type="submit" 
                            className="w-full"
                            disabled={updateProfileMutation.isPending}
                          >
                            {updateProfileMutation.isPending ? (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : null}
                            Aggiorna profilo
                          </Button>
                        </form>
                      </Form>
                    </CardContent>
                  </Card>
                )}
                
                {/* Le tue proprietà */}
                {activeTab === "properties" && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Le Tue Proprietà</CardTitle>
                      <CardDescription>
                        Gestisci le proprietà che hai pubblicato su In&Out
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {isLoadingProperties ? (
                        <div className="text-center py-10">
                          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
                          <p className="text-neutral-500">Caricamento proprietà...</p>
                        </div>
                      ) : properties.length === 0 ? (
                        <div className="text-center py-10 border border-dashed rounded-lg">
                          <Home className="h-12 w-12 mx-auto mb-4 text-neutral-300" />
                          <h3 className="text-lg font-medium mb-2">Nessuna proprietà</h3>
                          <p className="text-neutral-500 mb-4">Non hai ancora pubblicato nessuna proprietà su In&Out.</p>
                          <Button onClick={() => router.push('/pubblica')}>Pubblica un annuncio</Button>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {properties.map((property) => (
                            <Card key={property.id} className="overflow-hidden">
                              <div className="h-40 bg-neutral-200 relative">
                                {property.images && property.images.length > 0 ? (
                                  <img 
                                    src={property.images[0]} 
                                    alt={property.title} 
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="flex items-center justify-center h-full bg-neutral-100">
                                    <Home className="h-10 w-10 text-neutral-400" />
                                  </div>
                                )}
                                <div className={`absolute top-2 right-2 px-2 py-1 text-xs font-medium rounded ${property.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                  {property.isActive ? 'Attivo' : 'Non attivo'}
                                </div>
                              </div>
                              <CardContent className="p-4">
                                <h3 className="font-semibold truncate">{property.title}</h3>
                                <p className="text-sm text-neutral-500">{property.city}, {property.country}</p>
                                <p className="font-bold text-primary mt-1">€{property.price}/mese</p>
                                <div className="flex mt-3 gap-2">
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    onClick={() => router.push(`/annunci/${property.id}`)}
                                  >
                                    Visualizza
                                  </Button>
                                  <Button 
                                    variant="default" 
                                    size="sm"
                                    onClick={() => router.push(`/modifica/${property.id}`)}
                                  >
                                    Modifica
                                  </Button>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      )}
                    </CardContent>
                    {properties.length > 0 && (
                      <CardFooter>
                        <Button 
                          variant="outline" 
                          className="w-full" 
                          onClick={() => router.push('/pubblica')}
                        >
                          <Upload className="mr-2 h-4 w-4" />
                          Pubblica un nuovo annuncio
                        </Button>
                      </CardFooter>
                    )}
                  </Card>
                )}
                
                {/* Ricerche salvate */}
                {activeTab === "searches" && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Ricerche Salvate</CardTitle>
                      <CardDescription>
                        Gestisci le tue ricerche salvate per trovare alloggi più velocemente
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {isLoadingSavedSearches ? (
                        <div className="text-center py-10">
                          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
                          <p className="text-neutral-500">Caricamento ricerche salvate...</p>
                        </div>
                      ) : savedSearches.length === 0 ? (
                        <div className="text-center py-10 border border-dashed rounded-lg">
                          <Mail className="h-12 w-12 mx-auto mb-4 text-neutral-300" />
                          <h3 className="text-lg font-medium mb-2">Nessuna ricerca salvata</h3>
                          <p className="text-neutral-500 mb-4">Non hai ancora salvato nessuna ricerca.</p>
                          <Button onClick={() => router.push('/search')}>Cerca alloggi</Button>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {savedSearches.map((search) => {
                            // Costruisci i parametri di ricerca
                            const params = new URLSearchParams();
                            if (search.criteria.city) params.append('city', search.criteria.city);
                            if (search.criteria.propertyType) params.append('propertyType', search.criteria.propertyType);
                            if (search.criteria.maxPrice) params.append('maxPrice', search.criteria.maxPrice);
                            if (search.criteria.minPrice) params.append('minPrice', search.criteria.minPrice);
                            
                            return (
                              <Card key={search.id} className="overflow-hidden">
                                <CardContent className="p-4">
                                  <div className="flex justify-between items-start">
                                    <div>
                                      <h3 className="font-semibold">{search.name}</h3>
                                      <p className="text-sm text-neutral-500">
                                        {search.criteria.city ? `${search.criteria.city}, ` : ''}
                                        {search.criteria.propertyType ? `${search.criteria.propertyType} ` : ''}
                                        {search.criteria.minPrice ? `da €${search.criteria.minPrice} ` : ''}
                                        {search.criteria.maxPrice ? `fino a €${search.criteria.maxPrice}` : ''}
                                      </p>
                                    </div>
                                    <div className="flex gap-2">
                                      <Button 
                                        variant="outline" 
                                        size="sm" 
                                        onClick={() => router.push(`/search?${params.toString()}`)}
                                      >
                                        Cerca
                                      </Button>
                                      <Button 
                                        variant="destructive" 
                                        size="sm"
                                        onClick={() => {
                                          // Implementazione della cancellazione
                                          // TODO: aggiungere la mutation per eliminare la ricerca
                                        }}
                                      >
                                        Elimina
                                      </Button>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            );
                          })}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
                
                {/* Documenti */}
                {activeTab === "documents" && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Documenti</CardTitle>
                      <CardDescription>
                        Gestisci i tuoi documenti caricati e i contratti da firmare
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {isLoadingDocuments ? (
                        <div className="text-center py-10">
                          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
                          <p className="text-neutral-500">Caricamento documenti...</p>
                        </div>
                      ) : documents.length === 0 ? (
                        <div className="text-center py-10 border border-dashed rounded-lg">
                          <File className="h-12 w-12 mx-auto mb-4 text-neutral-300" />
                          <h3 className="text-lg font-medium mb-2">Nessun documento</h3>
                          <p className="text-neutral-500 mb-4">Non hai ancora documenti caricati o contratti da firmare.</p>
                          <Button onClick={() => router.push('/documenti')}>Gestisci documenti</Button>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {documents.map((doc) => (
                            <Card key={doc.id} className="overflow-hidden">
                              <CardContent className="p-4">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <h3 className="font-semibold">{doc.title}</h3>
                                    <p className="text-sm text-neutral-500">
                                      {doc.type} • Caricato: {formatDate(doc.createdAt)}
                                    </p>
                                  </div>
                                  <div className="flex gap-2">
                                    <Button 
                                      variant="outline" 
                                      size="sm" 
                                      onClick={() => window.open(doc.fileUrl, '_blank')}
                                    >
                                      Visualizza
                                    </Button>
                                    {doc.needsSignature && !doc.isSigned && (
                                      <Button 
                                        variant="default" 
                                        size="sm"
                                        onClick={() => router.push(`/documenti/firma/${doc.id}`)}
                                      >
                                        Firma
                                      </Button>
                                    )}
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      )}
                    </CardContent>
                    <CardFooter>
                      <Button 
                        variant="outline" 
                        className="w-full" 
                        onClick={() => router.push('/documenti')}
                      >
                        <File className="mr-2 h-4 w-4" />
                        Gestisci tutti i documenti
                      </Button>
                    </CardFooter>
                  </Card>
                )}
                
                {/* Abbonamento */}
                {activeTab === "subscription" && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Abbonamento</CardTitle>
                      <CardDescription>
                        Gestisci il tuo piano di abbonamento e pagamenti
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="rounded-lg border p-6 mb-6">
                        <h3 className="text-lg font-semibold mb-2">Piano attuale</h3>
                        <div className="flex items-center mb-4">
                          <div className={`w-3 h-3 rounded-full mr-2 ${user.subscriptionPlan ? 'bg-green-500' : 'bg-red-500'}`}></div>
                          <span className="font-medium">{getSubscriptionStatus()}</span>
                        </div>
                        
                        {user.subscriptionExpiresAt && (
                          <p className="text-sm text-neutral-500 mb-4">
                            Scadenza abbonamento: <span className="font-medium">{formatDate(user.subscriptionExpiresAt)}</span>
                          </p>
                        )}
                        
                        <Button onClick={() => router.push('/checkout')}>
                          {user.subscriptionPlan ? 'Cambia piano' : 'Sottoscrivi un piano'}
                        </Button>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Card className="cursor-pointer transition-all hover:border-primary">
                          <CardHeader className="pb-2">
                            <CardTitle className="text-lg">Singolo Annuncio</CardTitle>
                            <div className="text-2xl font-bold text-primary">€0,99</div>
                            <CardDescription>Una tantum</CardDescription>
                          </CardHeader>
                          <CardContent className="text-sm space-y-2">
                            <div className="flex items-start">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-500 mt-0.5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                              <span>1 annuncio pubblicato</span>
                            </div>
                            <div className="flex items-start">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-500 mt-0.5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                              <span>Visibile per 30 giorni</span>
                            </div>
                          </CardContent>
                          <CardFooter>
                            <Button 
                              variant="outline" 
                              className="w-full"
                              onClick={() => router.push('/checkout?plan=single')}
                            >
                              Seleziona
                            </Button>
                          </CardFooter>
                        </Card>
                        
                        <Card className="cursor-pointer transition-all hover:border-primary relative">
                          <div className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-bl-lg">
                            POPOLARE
                          </div>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-lg">Standard</CardTitle>
                            <div className="text-2xl font-bold text-primary">€5,99</div>
                            <CardDescription>Al mese</CardDescription>
                          </CardHeader>
                          <CardContent className="text-sm space-y-2">
                            <div className="flex items-start">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-500 mt-0.5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                              <span>30 annunci pubblicati</span>
                            </div>
                            <div className="flex items-start">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-500 mt-0.5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                              <span>Visibili per 60 giorni</span>
                            </div>
                          </CardContent>
                          <CardFooter>
                            <Button 
                              variant="outline" 
                              className="w-full"
                              onClick={() => router.push('/checkout?plan=standard')}
                            >
                              Seleziona
                            </Button>
                          </CardFooter>
                        </Card>
                        
                        <Card className="cursor-pointer transition-all hover:border-primary">
                          <CardHeader className="pb-2">
                            <CardTitle className="text-lg">Premium</CardTitle>
                            <div className="text-2xl font-bold text-primary">€9,99</div>
                            <CardDescription>Al mese</CardDescription>
                          </CardHeader>
                          <CardContent className="text-sm space-y-2">
                            <div className="flex items-start">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-500 mt-0.5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                              <span>Annunci illimitati</span>
                            </div>
                            <div className="flex items-start">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-500 mt-0.5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                              <span>Visibili per 90 giorni</span>
                            </div>
                          </CardContent>
                          <CardFooter>
                            <Button 
                              variant="outline" 
                              className="w-full"
                              onClick={() => router.push('/checkout?plan=premium')}
                            >
                              Seleziona
                            </Button>
                          </CardFooter>
                        </Card>
                      </div>
                    </CardContent>
                  </Card>
                )}
                
                {/* Recensioni */}
                {activeTab === "reviews" && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Recensioni</CardTitle>
                      <CardDescription>
                        Gestisci le recensioni che hai ricevuto come inserzionista
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        {/* Recensioni ricevute */}
                        <div>
                          <h3 className="text-lg font-medium mb-3">Recensioni ricevute</h3>
                          <ReviewList inserzionistId={user.id} className="mt-4" />
                        </div>
                        
                        {/* Informazioni sulle recensioni */}
                        <div className="bg-neutral-50 rounded-lg p-4 border mt-8">
                          <h3 className="text-lg font-medium mb-2">Informazioni sulle recensioni</h3>
                          <p className="text-sm text-neutral-600">
                            Le recensioni sono un elemento importante per costruire la tua reputazione su In&Out.
                            Gli utenti che hanno interagito con te possono lasciare una recensione valutando la loro esperienza.
                          </p>
                          <div className="mt-4">
                            <h4 className="font-medium text-sm mb-1">Linee guida per le recensioni:</h4>
                            <ul className="list-disc ml-5 mt-1 text-sm text-neutral-600">
                              <li>Le recensioni devono essere oneste e basate su esperienze reali</li>
                              <li>Non è possibile modificare le recensioni ricevute</li>
                              <li>Puoi segnalare recensioni inappropriate</li>
                              <li>Una buona reputazione aumenta la visibilità dei tuoi annunci</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
                
                {/* Impostazioni */}
                {activeTab === "settings" && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Impostazioni</CardTitle>
                      <CardDescription>
                        Gestisci le tue preferenze e impostazioni di sicurezza
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        <div>
                          <h3 className="text-lg font-medium mb-4">Cambia Password</h3>
                          <div className="space-y-4">
                            <div className="grid grid-cols-1 gap-2">
                              <Label htmlFor="current-password">Password attuale</Label>
                              <Input id="current-password" type="password" />
                            </div>
                            <div className="grid grid-cols-1 gap-2">
                              <Label htmlFor="new-password">Nuova password</Label>
                              <Input id="new-password" type="password" />
                            </div>
                            <div className="grid grid-cols-1 gap-2">
                              <Label htmlFor="confirm-password">Conferma nuova password</Label>
                              <Input id="confirm-password" type="password" />
                            </div>
                            <Button>Aggiorna password</Button>
                          </div>
                        </div>
                        
                        <Separator />
                        
                        <div>
                          <h3 className="text-lg font-medium mb-4">Notifiche</h3>
                          <div className="space-y-4">
                            <div className="flex items-start space-x-2">
                              <input type="checkbox" id="email-notif" className="mt-1" />
                              <div>
                                <Label htmlFor="email-notif">Notifiche email</Label>
                                <p className="text-sm text-neutral-500">Ricevi aggiornamenti e notifiche via email</p>
                              </div>
                            </div>
                            <div className="flex items-start space-x-2">
                              <input type="checkbox" id="marketing-notif" className="mt-1" />
                              <div>
                                <Label htmlFor="marketing-notif">Email marketing</Label>
                                <p className="text-sm text-neutral-500">Ricevi offerte speciali e promozioni</p>
                              </div>
                            </div>
                            <Button>Salva preferenze</Button>
                          </div>
                        </div>
                        
                        <Separator />
                        
                        <div>
                          <h3 className="text-lg font-medium mb-4 text-red-600">Elimina Account</h3>
                          <p className="text-sm text-neutral-500 mb-4">
                            L'eliminazione del tuo account cancellerà permanentemente tutti i tuoi dati, inclusi annunci, messaggi e preferenze.
                            Questa azione non può essere annullata.
                          </p>
                          <Button variant="destructive">Elimina account</Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </div>
        </main>
        
        <Footer />
      </div>
    </>
  );
}

// Questa funzione viene eseguita lato server ad ogni richiesta
export async function getServerSideProps(context) {
  return {
    props: {},
  };
}