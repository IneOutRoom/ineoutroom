import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2, Check, ArrowLeft, AlertTriangle } from 'lucide-react';

// Componenti UI
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

// Schema di validazione
const resetPasswordSchema = z.object({
  password: z
    .string()
    .min(8, { message: "La password deve contenere almeno 8 caratteri" })
    .max(100)
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
      message: "La password deve contenere almeno una lettera maiuscola, una minuscola e un numero",
    }),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Le password non corrispondono",
  path: ["confirmPassword"],
});

export default function ResetPasswordPage() {
  const { toast } = useToast();
  const router = useRouter();
  const { token } = router.query;
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resetCompleted, setResetCompleted] = useState(false);
  const [tokenValid, setTokenValid] = useState(true);
  const [tokenChecked, setTokenChecked] = useState(false);
  
  const form = useForm({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });
  
  // Verifica il token quando carica la pagina
  useEffect(() => {
    if (!token) return;
    
    const checkToken = async () => {
      try {
        const response = await fetch(`/api/auth/reset-password?token=${token}&check=true`);
        const data = await response.json();
        
        if (!response.ok || !data.success) {
          setTokenValid(false);
        }
        
        setTokenChecked(true);
      } catch (error) {
        console.error('Errore durante la verifica del token:', error);
        setTokenValid(false);
        setTokenChecked(true);
      }
    };
    
    checkToken();
  }, [token]);
  
  const onSubmit = async (data) => {
    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          password: data.password,
        }),
      });
      
      const result = await response.json();
      
      if (response.ok) {
        setResetCompleted(true);
        toast({
          title: "Password reimpostata",
          description: "La tua password è stata aggiornata con successo.",
          variant: "default",
        });
      } else {
        toast({
          title: "Errore",
          description: result.message || "Si è verificato un errore durante il ripristino della password.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Errore durante il ripristino della password:', error);
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante il ripristino della password.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <>
      <Head>
        <title>Ripristino Password - In&Out</title>
        <meta name="description" content="Reimposta la tua password di In&Out in modo sicuro." />
        <meta property="og:title" content="Ripristino Password - In&Out" />
        <meta property="og:description" content="Reimposta la tua password di In&Out in modo sicuro." />
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
            
            <h2 className="text-3xl font-bold text-primary mb-2">Ripristino Password</h2>
            
            {!tokenChecked ? (
              <div className="flex flex-col items-center justify-center py-8">
                <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
                <p className="text-gray-600">Verifica del link in corso...</p>
              </div>
            ) : !tokenValid ? (
              <div className="text-center py-8">
                <div className="flex justify-center mb-4">
                  <div className="bg-red-100 p-3 rounded-full">
                    <AlertTriangle className="h-10 w-10 text-red-600" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-red-600 mb-2">Link Non Valido</h3>
                <p className="text-gray-600 mb-6">
                  Il link per il ripristino della password non è valido o è scaduto.
                  Richiedi un nuovo link di ripristino.
                </p>
                <Link 
                  href="/auth/forgot-password"
                  className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90 transition-colors"
                >
                  Richiedi Nuovo Link
                </Link>
              </div>
            ) : !resetCompleted ? (
              <>
                <p className="text-gray-600 mb-6">Crea una nuova password sicura per il tuo account</p>
                
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nuova Password</FormLabel>
                          <FormControl>
                            <Input placeholder="La tua nuova password" type="password" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Conferma Password</FormLabel>
                          <FormControl>
                            <Input placeholder="Conferma la tua password" type="password" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <Button
                      type="submit"
                      className="w-full bg-primary hover:bg-primary/90"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : null}
                      Reimposta Password
                    </Button>
                  </form>
                </Form>
              </>
            ) : (
              <div className="text-center py-8">
                <div className="flex justify-center mb-4">
                  <div className="bg-green-100 p-3 rounded-full">
                    <Check className="h-10 w-10 text-green-600" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-green-600 mb-2">Password Aggiornata!</h3>
                <p className="text-gray-600 mb-6">
                  La tua password è stata reimpostata con successo.
                  Ora puoi accedere al tuo account con la nuova password.
                </p>
                <Link 
                  href="/auth"
                  className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90 transition-colors"
                >
                  Vai al Login
                </Link>
              </div>
            )}
            
            <div className="mt-6">
              <Link 
                href="/auth" 
                className="flex items-center justify-center text-sm text-primary hover:underline"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Torna al Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}