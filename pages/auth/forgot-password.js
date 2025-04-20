import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2, Check, Mail, ArrowLeft } from 'lucide-react';

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
const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, { message: "L'email è obbligatoria" })
    .email({ message: "Formato email non valido" }),
});

export default function ForgotPasswordPage() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  
  const form = useForm({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });
  
  const onSubmit = async (data) => {
    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      const result = await response.json();
      
      if (response.ok) {
        setEmailSent(true);
        toast({
          title: "Email inviata",
          description: "Controlla la tua casella di posta per le istruzioni sul ripristino della password.",
          variant: "default",
        });
      } else {
        toast({
          title: "Errore",
          description: result.message || "Si è verificato un errore durante l'invio dell'email di ripristino.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Errore durante la richiesta di ripristino password:', error);
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante l'invio dell'email di ripristino.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <>
      <Head>
        <title>Password Dimenticata - In&Out</title>
        <meta name="description" content="Recupera la tua password di In&Out in modo semplice e veloce." />
        <meta property="og:title" content="Password Dimenticata - In&Out" />
        <meta property="og:description" content="Recupera la tua password di In&Out in modo semplice e veloce." />
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
            
            <h2 className="text-3xl font-bold text-primary mb-2">Password Dimenticata</h2>
            <p className="text-gray-600 mb-6">Inserisci la tua email per reimpostare la password</p>
            
            {!emailSent ? (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input placeholder="La tua email" type="email" {...field} />
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
                    Invia Link di Ripristino
                  </Button>
                </form>
              </Form>
            ) : (
              <div className="text-center py-4">
                <div className="flex justify-center mb-4">
                  <div className="bg-green-100 p-3 rounded-full">
                    <Mail className="h-10 w-10 text-green-600" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-green-600 mb-2">Email Inviata!</h3>
                <p className="text-gray-600 mb-4">
                  Abbiamo inviato le istruzioni per il ripristino della password all'indirizzo email fornito.
                  Controlla la tua casella di posta e segui le istruzioni contenute nell'email.
                </p>
                <p className="text-sm text-gray-500 mb-4">
                  Non hai ricevuto l'email? Controlla la cartella spam o{" "}
                  <button
                    onClick={() => setEmailSent(false)}
                    className="text-primary hover:underline"
                  >
                    riprova
                  </button>.
                </p>
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