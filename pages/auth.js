import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
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
import { Loader2, Mail, AlertCircle } from 'lucide-react';
import { signInWithGoogle, handleGoogleRedirect } from '@/lib/firebase';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import SEO from './components/SEO';
import { generateWebPageSchema } from '../client/src/components/seo/SchemaGenerator';

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
  const [activeTab, setActiveTab] = useState("login");
  const { user, loginMutation, registerMutation } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  
  // Controlla i parametri nella URL per verificare status dell'email o altre notifiche
  const { verified, email_sent } = router.query;

  // Form di login
  const loginForm = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  // Form di registrazione
  const registerForm = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
    },
  });

  // Ottieni il parametro di redirect dall'URL, se presente
  const redirectTo = router.query.redirect || '/';
  
  // Gestisci il redirect di Google e autenticazione all'inizializzazione
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Gestione redirect Google
      handleGoogleRedirect()
        .then((result) => {
          if (result) {
            toast({
              title: "Login effettuato!",
              description: "Hai effettuato l'accesso con Google.",
              variant: "default",
            });
            router.push(redirectTo);
          }
        })
        .catch((error) => {
          console.error("Errore durante la gestione del redirect Google:", error);
        });
      
      // Redirigi se l'utente è già autenticato
      if (user) {
        console.log('Utente autenticato, reindirizzamento a:', redirectTo);
        router.push(redirectTo);
      }
    }
  }, [user, router, redirectTo, toast]);

  // Funzione per gestire il login
  const onLoginSubmit = (data) => {
    loginMutation.mutate(data, {
      onSuccess: () => {
        console.log('Login effettuato, reindirizzamento a:', redirectTo);
        router.push(redirectTo);
      }
    });
  };

  // Funzione per gestire la registrazione
  const onRegisterSubmit = (data) => {
    registerMutation.mutate(data, {
      onSuccess: (result) => {
        console.log('Registrazione effettuata:', result);
        
        // Se è stata inviata un'email di verifica, mostra un messaggio all'utente
        if (result.emailSent) {
          // Mostra un toast di conferma
          toast({
            title: "Registrazione completata!",
            description: "Ti abbiamo inviato un'email di verifica. Controlla la tua casella di posta per attivare il tuo account.",
            variant: "default",
          });
          
          // Reindirizza alla pagina di login con flag email_sent
          setTimeout(() => router.push('/auth?email_sent=true'), 1500);
        } else {
          // Comportamento normale se non è richiesta la verifica email
          toast({
            title: "Registrazione completata!",
            description: "Il tuo account è stato creato con successo.",
            variant: "default",
          });
          // Breve ritardo prima del redirect per mostrare il toast
          setTimeout(() => router.push(redirectTo), 1500);
        }
      }
    });
  };

  // Se l'utente è già autenticato, non mostrare la pagina di autenticazione
  if (typeof window !== 'undefined' && user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <SEO
        title="Accedi o Registrati - In&Out Room"
        description="Accedi al tuo account o registrati per trovare stanze e alloggi in tutta Europa con In&Out Room. Registrazione gratuita, prima inserzione senza costi."
        keywords="login, registrazione, accesso, affitto, alloggi, stanze, account utente, cercare casa in Europa"
        ogType="website"
        canonical="/auth"
        schemaData={generateWebPageSchema({
          title: "Accedi o Registrati - In&Out Room",
          description: "Accedi al tuo account o registrati per trovare stanze e alloggi in tutta Europa con In&Out Room.",
          url: "https://ineoutroom.eu/auth",
          lastUpdated: "2025-04-18"
        })}
      />
      
      <div className="min-h-screen flex flex-col">
        <Navbar />
        
        <main className="flex-grow py-10 bg-neutral-50">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row gap-8 items-center">
              {/* Colonna di sinistra - Form di autenticazione */}
              <div className="w-full md:w-1/2 max-w-md mx-auto md:mx-0">
                {verified === "true" && (
                  <Alert className="mb-4 bg-green-50 text-green-800 border-green-200">
                    <Mail className="h-4 w-4 text-green-800" />
                    <AlertTitle>Email verificata con successo!</AlertTitle>
                    <AlertDescription>
                      Il tuo indirizzo email è stato verificato. Ora puoi accedere al tuo account.
                    </AlertDescription>
                  </Alert>
                )}
                
                {email_sent === "true" && (
                  <Alert className="mb-4 bg-blue-50 text-blue-800 border-blue-200">
                    <Mail className="h-4 w-4 text-blue-800" />
                    <AlertTitle>Email inviata!</AlertTitle>
                    <AlertDescription>
                      Abbiamo inviato un'email di verifica al tuo indirizzo. Controlla la tua casella di posta.
                    </AlertDescription>
                  </Alert>
                )}
                
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
                                  <div className="text-sm text-right mt-1">
                                    <Link href="/auth/forgot-password" className="text-primary hover:underline">
                                      Password dimenticata?
                                    </Link>
                                  </div>
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
                            toast({
                              title: "Accesso con Google in corso...",
                              description: "Stai per essere reindirizzato a Google.",
                              variant: "default",
                            });
                            
                            try {
                              signInWithGoogle()
                                .then((result) => {
                                  if (result?.redirecting) {
                                    return;
                                  }
                                  
                                  toast({
                                    title: "Login effettuato!",
                                    description: "Hai effettuato l'accesso con Google.",
                                    variant: "default",
                                  });
                                  router.push(redirectTo);
                                })
                                .catch((error) => {
                                  console.error('Errore durante il login con Google:', error);
                                  toast({
                                    title: "Errore di login",
                                    description: error.message || "Si è verificato un errore durante l'accesso con Google",
                                    variant: "destructive",
                                  });
                                });
                            } catch (error) {
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
                            toast({
                              title: "Registrazione con Google in corso...",
                              description: "Stai per essere reindirizzato a Google.",
                              variant: "default",
                            });
                            
                            try {
                              signInWithGoogle()
                                .then((result) => {
                                  if (result?.redirecting) {
                                    return;
                                  }
                                  
                                  toast({
                                    title: "Registrazione completata!",
                                    description: "Hai effettuato l'accesso con Google.",
                                    variant: "default",
                                  });
                                  router.push(redirectTo);
                                })
                                .catch((error) => {
                                  console.error('Errore durante la registrazione con Google:', error);
                                  toast({
                                    title: "Errore di registrazione",
                                    description: error.message || "Si è verificato un errore durante la registrazione con Google",
                                    variant: "destructive",
                                  });
                                });
                            } catch (error) {
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
              
              {/* Colonna di destra - Hero section */}
              <div className="w-full md:w-1/2">
                <div className="text-center md:text-left">
                  <h1 className="text-3xl md:text-4xl font-bold mb-4">
                    <span className="text-primary">Trova</span> la tua prossima casa in Europa
                  </h1>
                  <p className="text-lg text-neutral-600 mb-6">
                    Unisciti a In&Out per accedere a migliaia di annunci di stanze e alloggi in tutta Europa.
                    Risparmia tempo e trova la soluzione perfetta per le tue esigenze.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className="flex items-start p-3 bg-neutral-100 rounded-lg">
                      <div className="mr-3 bg-primary/10 p-2 rounded-full">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-semibold">Verifica degli alloggi</h3>
                        <p className="text-sm text-neutral-500">Tutti gli annunci sono verificati dai nostri esperti</p>
                      </div>
                    </div>
                    <div className="flex items-start p-3 bg-neutral-100 rounded-lg">
                      <div className="mr-3 bg-primary/10 p-2 rounded-full">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-semibold">Risparmia tempo</h3>
                        <p className="text-sm text-neutral-500">Trova rapidamente l'alloggio perfetto per te</p>
                      </div>
                    </div>
                    <div className="flex items-start p-3 bg-neutral-100 rounded-lg">
                      <div className="mr-3 bg-primary/10 p-2 rounded-full">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-semibold">Assistenza 24/7</h3>
                        <p className="text-sm text-neutral-500">Supporto clienti sempre disponibile per te</p>
                      </div>
                    </div>
                    <div className="flex items-start p-3 bg-neutral-100 rounded-lg">
                      <div className="mr-3 bg-primary/10 p-2 rounded-full">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-semibold">Pagamenti sicuri</h3>
                        <p className="text-sm text-neutral-500">Transazioni protette e senza preoccupazioni</p>
                      </div>
                    </div>
                  </div>
                  <div className="relative">
                    <div className="absolute -top-6 -left-6 w-12 h-12 bg-[#ffcb05] rounded-full opacity-30"></div>
                    <div className="absolute -bottom-10 -right-10 w-20 h-20 bg-primary/20 rounded-full blur-xl"></div>
                    <blockquote className="p-4 border-l-4 border-primary bg-white rounded-lg shadow-md relative z-10">
                      <p className="italic text-neutral-600 mb-2">
                        "Grazie a In&Out ho trovato il mio appartamento a Barcellona in pochi giorni.
                        Processo semplice e assistenza fantastica!"
                      </p>
                      <footer className="text-sm font-medium">— Marco, studente italiano a Barcellona</footer>
                    </blockquote>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
        
        <Footer />
      </div>
    </>
  );
}

// Questa funzione viene eseguita solo lato server all'avvio
export async function getStaticProps() {
  return {
    props: {},
    // Rigenera la pagina ogni 24 ore
    revalidate: 86400
  };
}