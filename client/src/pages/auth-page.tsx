import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Loader2 } from 'lucide-react';
import { signInWithGoogle, handleGoogleRedirect } from '@/lib/firebase';
import { Separator } from '@/components/ui/separator';

// Schema di validazione per il login
const loginSchema = z.object({
  username: z.string().min(1, { message: "Username richiesto" }),
  password: z.string().min(1, { message: "Password richiesta" }),
});

// Schema di validazione per la registrazione
const registerSchema = z.object({
  username: z.string().min(3, { message: "Username deve avere almeno 3 caratteri" }),
  email: z.string().email({ message: "Email non valida" }),
  password: z.string().min(6, { message: "La password deve avere almeno 6 caratteri" }),
});

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState<string>("login");
  const { user, loginMutation, registerMutation } = useAuth();
  const [location, navigate] = useLocation();
  const { toast } = useToast();

  // Form di login
  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  // Form di registrazione
  const registerForm = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
    },
  });

  // Ottieni il parametro di redirect dall'URL, se presente
  const searchParams = new URLSearchParams(window.location.search);
  const redirectTo = searchParams.get('redirect') || '/';
  
  // Gestisci il redirect di Google e autenticazione all'inizializzazione
  useEffect(() => {
    // Gestione redirect Google
    handleGoogleRedirect()
      .then((result) => {
        if (result) {
          toast({
            title: "Login effettuato!",
            description: "Hai effettuato l'accesso con Google.",
            variant: "default",
          });
          navigate(redirectTo);
        }
      })
      .catch((error) => {
        console.error("Errore durante la gestione del redirect Google:", error);
      });
    
    // Redirigi se l'utente è già autenticato
    if (user) {
      console.log('Utente autenticato, reindirizzamento a:', redirectTo);
      navigate(redirectTo);
    }
  }, [user, navigate, redirectTo, toast]);

  // Funzione per gestire il login
  const onLoginSubmit = (data: z.infer<typeof loginSchema>) => {
    loginMutation.mutate(data, {
      onSuccess: () => {
        console.log('Login effettuato, reindirizzamento a:', redirectTo);
        navigate(redirectTo);
      }
    });
  };

  // Funzione per gestire la registrazione
  const onRegisterSubmit = (data: z.infer<typeof registerSchema>) => {
    registerMutation.mutate(data, {
      onSuccess: () => {
        console.log('Registrazione effettuata, reindirizzamento a:', redirectTo);
        // Mostra un toast di conferma
        toast({
          title: "Registrazione completata!",
          description: "Il tuo account è stato creato con successo.",
          variant: "default",
        });
        // Breve ritardo prima del redirect per mostrare il toast
        setTimeout(() => navigate(redirectTo), 1500);
      }
    });
  };

  // Se l'utente è già autenticato, non mostrare la pagina di autenticazione
  if (user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow py-10 bg-neutral-50">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-8 items-center">
            {/* Colonna di sinistra - Form di autenticazione */}
            <div className="w-full md:w-1/2 max-w-md mx-auto md:mx-0">
              <Card className="shadow-lg border-0">
                <CardContent className="pt-6">
                  <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-2 mb-6">
                      <TabsTrigger value="login">Accedi</TabsTrigger>
                      <TabsTrigger value="register">Registrati</TabsTrigger>
                    </TabsList>
                    
                    {/* Form di login */}
                    <TabsContent value="login">
                      <Form {...loginForm}>
                        <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                          <FormField
                            control={loginForm.control}
                            name="username"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Username o Email</FormLabel>
                                <FormControl>
                                  <Input placeholder="Il tuo username o email" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={loginForm.control}
                            name="password"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Password</FormLabel>
                                <FormControl>
                                  <Input type="password" placeholder="La tua password" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <Button 
                            type="submit" 
                            className="w-full bg-primary hover:bg-primary/90"
                            disabled={loginMutation.isPending}
                          >
                            {loginMutation.isPending ? (
                              <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            ) : null}
                            Accedi
                          </Button>
                        </form>
                      </Form>
                      
                      <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                          <Separator className="w-full" />
                        </div>
                        <div className="relative flex justify-center">
                          <span className="bg-card px-2 text-xs text-muted-foreground">oppure</span>
                        </div>
                      </div>
                      
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full"
                        onClick={() => {
                          // Mostra un toast che stiamo procedendo
                          toast({
                            title: "Accesso con Google in corso...",
                            description: "Stai per essere reindirizzato a Google.",
                            variant: "default",
                          });
                          
                          // Utilizza un try-catch per gestire eventuali errori
                          try {
                            signInWithGoogle()
                              .then((result) => {
                                if (result?.redirecting) {
                                  // Non fare nulla qui, siamo in fase di reindirizzamento
                                  return;
                                }
                                
                                toast({
                                  title: "Login effettuato!",
                                  description: "Hai effettuato l'accesso con Google.",
                                  variant: "default",
                                });
                                navigate(redirectTo);
                              })
                              .catch((error) => {
                                console.error('Errore durante il login con Google:', error);
                                toast({
                                  title: "Errore di login",
                                  description: error.message || "Si è verificato un errore durante l'accesso con Google",
                                  variant: "destructive",
                                });
                              });
                          } catch (error: any) {
                            console.error('Errore catturato localmente:', error);
                            toast({
                              title: "Errore di login",
                              description: error.message || "Si è verificato un errore durante l'accesso con Google",
                              variant: "destructive",
                            });
                          }
                        }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="20" height="20" className="mr-2">
                          <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" />
                          <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" />
                          <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z" />
                          <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z" />
                        </svg>
                        Accedi con Google
                      </Button>
                      
                      <div className="mt-4 text-center">
                        <p className="text-sm text-neutral-500">
                          Non hai ancora un account?{" "}
                          <button 
                            onClick={() => setActiveTab("register")}
                            className="text-primary hover:underline font-medium"
                          >
                            Registrati qui
                          </button>
                        </p>
                      </div>
                    </TabsContent>
                    
                    {/* Form di registrazione */}
                    <TabsContent value="register">
                      <Form {...registerForm}>
                        <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                          <FormField
                            control={registerForm.control}
                            name="username"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Username</FormLabel>
                                <FormControl>
                                  <Input placeholder="Scegli un username" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={registerForm.control}
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
                            control={registerForm.control}
                            name="password"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Password</FormLabel>
                                <FormControl>
                                  <Input type="password" placeholder="Crea una password" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <Button 
                            type="submit" 
                            className="w-full bg-primary hover:bg-primary/90"
                            disabled={registerMutation.isPending}
                          >
                            {registerMutation.isPending ? (
                              <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            ) : null}
                            Registrati
                          </Button>
                        </form>
                      </Form>
                      
                      <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                          <Separator className="w-full" />
                        </div>
                        <div className="relative flex justify-center">
                          <span className="bg-card px-2 text-xs text-muted-foreground">oppure</span>
                        </div>
                      </div>
                      
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full"
                        onClick={() => {
                          // Mostra un toast che stiamo procedendo
                          toast({
                            title: "Registrazione con Google in corso...",
                            description: "Stai per essere reindirizzato a Google.",
                            variant: "default",
                          });
                          
                          // Utilizza un try-catch per gestire eventuali errori
                          try {
                            signInWithGoogle()
                              .then((result) => {
                                if (result?.redirecting) {
                                  // Non fare nulla qui, siamo in fase di reindirizzamento
                                  return;
                                }
                                
                                toast({
                                  title: "Registrazione completata!",
                                  description: "Il tuo account è stato creato con Google.",
                                  variant: "default",
                                });
                                navigate(redirectTo);
                              })
                              .catch((error) => {
                                console.error('Errore durante la registrazione con Google:', error);
                                toast({
                                  title: "Errore di registrazione",
                                  description: error.message || "Si è verificato un errore durante la registrazione con Google",
                                  variant: "destructive",
                                });
                              });
                          } catch (error: any) {
                            console.error('Errore catturato localmente:', error);
                            toast({
                              title: "Errore di registrazione",
                              description: error.message || "Si è verificato un errore durante la registrazione con Google",
                              variant: "destructive",
                            });
                          }
                        }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="20" height="20" className="mr-2">
                          <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" />
                          <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" />
                          <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z" />
                          <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z" />
                        </svg>
                        Registrati con Google
                      </Button>
                      
                      <div className="mt-4 text-center">
                        <p className="text-sm text-neutral-500">
                          Hai già un account?{" "}
                          <button 
                            onClick={() => setActiveTab("login")}
                            className="text-primary hover:underline font-medium"
                          >
                            Accedi qui
                          </button>
                        </p>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </div>
            
            {/* Colonna di destra - Informazioni */}
            <div className="w-full md:w-1/2 text-center md:text-left">
              <h1 className="text-3xl md:text-4xl font-bold mb-4 text-neutral-900">
                Benvenuto su In<span className="text-red-500">&</span>Out
              </h1>
              <p className="text-lg text-neutral-600 mb-6">
                La piattaforma che ti aiuta a trovare la tua prossima casa in Europa, 
                aggregando le migliori offerte dai principali portali immobiliari.
              </p>
              
              <div className="space-y-4 mb-8">
                <div className="flex items-start md:items-center">
                  <div className="bg-primary/10 p-2 rounded-full mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-neutral-900">Ricerca avanzata</h3>
                    <p className="text-sm text-neutral-600">Trova la tua stanza ideale con i nostri potenti filtri di ricerca.</p>
                  </div>
                </div>
                
                <div className="flex items-start md:items-center">
                  <div className="bg-primary/10 p-2 rounded-full mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-neutral-900">Mappa interattiva</h3>
                    <p className="text-sm text-neutral-600">Visualizza gli alloggi su una mappa per trovare la posizione perfetta.</p>
                  </div>
                </div>
                
                <div className="flex items-start md:items-center">
                  <div className="bg-primary/10 p-2 rounded-full mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-neutral-900">Notifiche in tempo reale</h3>
                    <p className="text-sm text-neutral-600">Ricevi avvisi quando vengono pubblicati nuovi annunci che ti interessano.</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-primary/5 p-4 rounded-lg border border-primary/10">
                <p className="text-sm text-neutral-700">
                  Registrandoti su In&Out, avrai accesso a tutte le funzionalità della piattaforma e potrai 
                  pubblicare i tuoi annunci o salvare le tue ricerche preferite.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
