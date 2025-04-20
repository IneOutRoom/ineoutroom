import { useState } from 'react';
import Link from 'next/link';
import { auth } from '../firebase';
import { sendPasswordResetEmail } from 'firebase/auth';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, ArrowLeft, Mail, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function PasswordResetPage() {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleResetPassword = async (e) => {
    e.preventDefault();
    
    if (!email.trim()) {
      toast({
        title: "Email richiesta",
        description: "Inserisci la tua email per reimpostare la password.",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      await sendPasswordResetEmail(auth, email);
      setIsSuccess(true);
      
      toast({
        title: "Email inviata",
        description: "Abbiamo inviato un link per reimpostare la password al tuo indirizzo email.",
      });
    } catch (error) {
      console.error("Errore reset password:", error);
      
      let errorMessage = "Impossibile inviare l'email di reset. Riprova più tardi.";
      if (error.code === 'auth/user-not-found') {
        errorMessage = "Non esiste un account associato a questa email.";
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = "L'indirizzo email inserito non è valido.";
      }
      
      toast({
        title: "Errore",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container flex items-center justify-center min-h-screen py-12">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">
            Reimposta password
          </CardTitle>
          <CardDescription className="text-center">
            {isSuccess 
              ? "Ti abbiamo inviato un'email con le istruzioni per reimpostare la password."
              : "Inserisci la tua email per reimpostare la password"}
          </CardDescription>
        </CardHeader>
        
        {isSuccess ? (
          <CardContent className="space-y-4 text-center py-4">
            <div className="mx-auto w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle2 className="h-6 w-6 text-green-600" />
            </div>
            <p className="text-muted-foreground">
              Controlla la tua casella di posta, inclusa la cartella spam, e segui le istruzioni per reimpostare la password.
            </p>
            <p>L'email è stata inviata a: <strong>{email}</strong></p>
          </CardContent>
        ) : (
          <CardContent className="space-y-4">
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>
              
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Invio in corso...
                  </>
                ) : (
                  "Invia link di reset"
                )}
              </Button>
            </form>
          </CardContent>
        )}
        
        <CardFooter className="flex justify-center">
          <Button variant="link" className="flex items-center" asChild>
            <Link href="/login">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Torna al login
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}