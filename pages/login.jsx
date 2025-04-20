import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { auth, db } from '../firebase';
import { GoogleAuthProvider, signInWithPopup, createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FcGoogle } from 'react-icons/fc';
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Funzione per creare il documento profilo utente se non esiste
  const creaProfiloUtente = async (user) => {
    try {
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);
      
      if (!userSnap.exists()) {
        // Crea un documento profilo con info di base
        await setDoc(userRef, {
          name: user.displayName || name || "",
          email: user.email,
          photoURL: user.photoURL || "",
          bio: "",
          createdAt: serverTimestamp()
        });
        
        toast({
          title: "Profilo creato",
          description: "Il tuo profilo è stato creato con successo!",
        });
      }
    } catch (error) {
      console.error("Errore nella creazione del profilo:", error);
      toast({
        title: "Errore",
        description: "Impossibile creare il profilo utente. Riprova più tardi.",
        variant: "destructive",
      });
    }
  };

  // Login/Registrazione con email e password
  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      let userCred;
      
      if (isRegister) {
        // Registrazione nuovo utente
        userCred = await createUserWithEmailAndPassword(auth, email, password);
        // Aggiorna il profilo Auth con il nome
        if (name) {
          await updateProfile(userCred.user, { displayName: name });
        }
        
        toast({
          title: "Registrazione completata",
          description: "Il tuo account è stato creato con successo!",
        });
      } else {
        // Login utente esistente
        userCred = await signInWithEmailAndPassword(auth, email, password);
        
        toast({
          title: "Accesso effettuato",
          description: "Benvenuto su In&Out!",
        });
      }
      
      const user = userCred.user;
      await creaProfiloUtente(user);
      
      // Redirect alla pagina del profilo
      router.push("/profilo");
    } catch (err) {
      console.error("Errore autenticazione:", err);
      
      let errorMessage = "Si è verificato un errore durante l'autenticazione";
      if (err.code === 'auth/email-already-in-use') {
        errorMessage = "Email già in uso. Prova ad accedere.";
      } else if (err.code === 'auth/invalid-email') {
        errorMessage = "Email non valida. Controlla e riprova.";
      } else if (err.code === 'auth/weak-password') {
        errorMessage = "Password troppo debole. Usa almeno 6 caratteri.";
      } else if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        errorMessage = "Email o password errati. Controlla e riprova.";
      }
      
      toast({
        title: "Errore di autenticazione",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Login con Google
  const handleGoogleLogin = async () => {
    setIsLoading(true);
    
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      await creaProfiloUtente(user);
      
      toast({
        title: "Accesso con Google effettuato",
        description: "Benvenuto su In&Out!",
      });
      
      router.push("/profilo");
    } catch (err) {
      console.error("Errore login Google:", err);
      
      toast({
        title: "Errore di accesso",
        description: "Accesso con Google non riuscito. Riprova più tardi.",
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
            {isRegister ? "Registrati" : "Accedi"}
          </CardTitle>
          <CardDescription className="text-center">
            {isRegister
              ? "Crea un nuovo account per iniziare a usare In&Out"
              : "Inserisci le tue credenziali per accedere"}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <form onSubmit={handleEmailSubmit} className="space-y-4">
            {isRegister && (
              <div className="space-y-2">
                <Label htmlFor="name">Nome</Label>
                <Input
                  id="name"
                  placeholder="Il tuo nome"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required={isRegister}
                  disabled={isLoading}
                />
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                {!isRegister && (
                  <Link
                    href="/password-reset"
                    className="text-sm text-primary underline-offset-4 hover:underline"
                  >
                    Password dimenticata?
                  </Link>
                )}
              </div>
              <Input
                id="password"
                type="password"
                placeholder={isRegister ? "Almeno 6 caratteri" : "••••••••"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Attendere...
                </>
              ) : isRegister ? (
                "Registrati"
              ) : (
                "Accedi"
              )}
            </Button>
          </form>
          
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Oppure continua con
              </span>
            </div>
          </div>
          
          <Button
            variant="outline"
            className="w-full"
            onClick={handleGoogleLogin}
            disabled={isLoading}
          >
            <FcGoogle className="mr-2 h-5 w-5" />
            Google
          </Button>
        </CardContent>
        
        <CardFooter className="flex flex-col space-y-4">
          <div className="text-center text-sm">
            {isRegister ? (
              <p>
                Hai già un account?{" "}
                <Button
                  variant="link"
                  className="p-0 h-auto"
                  onClick={() => setIsRegister(false)}
                  disabled={isLoading}
                >
                  Accedi
                </Button>
              </p>
            ) : (
              <p>
                Non hai un account?{" "}
                <Button
                  variant="link"
                  className="p-0 h-auto"
                  onClick={() => setIsRegister(true)}
                  disabled={isLoading}
                >
                  Registrati
                </Button>
              </p>
            )}
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}