import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';
import { auth, db, storage } from '../firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { PencilIcon, UserIcon, LogOutIcon, ImageIcon, Loader2, CheckCircle2Icon, AlertCircleIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function ProfiloPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [bio, setBio] = useState("");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [completionPercent, setCompletionPercent] = useState(0);

  useEffect(() => {
    // Controlla se l'utente è autenticato
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        await loadUserProfile(currentUser.uid);
      } else {
        // Reindirizza alla pagina di login se l'utente non è autenticato
        router.push('/login');
      }
    });

    return () => unsubscribe();
  }, [router]);

  // Carica il profilo utente da Firestore
  const loadUserProfile = async (userId) => {
    try {
      const userRef = doc(db, "users", userId);
      const snap = await getDoc(userRef);
      
      if (snap.exists()) {
        const data = snap.data();
        setProfile(data);
        setBio(data.bio || "");
        
        // Calcola completamento profilo
        calculateProfileCompletion(data);
      } else {
        toast({
          title: "Profilo non trovato",
          description: "Non è stato possibile trovare il tuo profilo.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Errore caricamento profilo:", error);
      toast({
        title: "Errore",
        description: "Impossibile caricare il profilo utente.",
        variant: "destructive",
      });
    }
  };

  // Calcola percentuale di completamento del profilo
  const calculateProfileCompletion = (profileData) => {
    let completedSteps = 0;
    const totalSteps = 2; // Foto e bio
    
    if (profileData.photoURL && profileData.photoURL.trim() !== "") completedSteps++;
    if (profileData.bio && profileData.bio.trim() !== "") completedSteps++;
    
    const percent = Math.round((completedSteps / totalSteps) * 100);
    setCompletionPercent(percent);
  };

  // Gestisce il caricamento dell'immagine del profilo
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !user) return;
    
    setUploading(true);
    
    try {
      // Carica l'immagine su Firebase Storage
      const storageRef = ref(storage, `profiles/${user.uid}`);
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);
      
      // Aggiorna il documento utente in Firestore
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, { photoURL: downloadURL });
      
      // Aggiorna anche l'oggetto auth
      await user.updateProfile({ photoURL: downloadURL });
      
      // Aggiorna lo stato locale
      setProfile(prev => prev ? { ...prev, photoURL: downloadURL } : prev);
      
      // Ricalcola completamento profilo
      calculateProfileCompletion({ ...profile, photoURL: downloadURL });
      
      toast({
        title: "Foto aggiornata",
        description: "La tua foto profilo è stata aggiornata con successo!",
      });
    } catch (error) {
      console.error("Errore upload immagine:", error);
      toast({
        title: "Errore",
        description: "Impossibile caricare l'immagine. Riprova più tardi.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  // Salva la biografia
  const handleSaveBio = async () => {
    if (!user) return;
    
    setSaving(true);
    
    try {
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, { bio: bio });
      
      // Aggiorna lo stato locale
      setProfile(prev => prev ? { ...prev, bio: bio } : prev);
      
      // Ricalcola completamento profilo
      calculateProfileCompletion({ ...profile, bio: bio });
      
      toast({
        title: "Biografia salvata",
        description: "La tua biografia è stata aggiornata con successo!",
      });
    } catch (error) {
      console.error("Errore salvataggio bio:", error);
      toast({
        title: "Errore",
        description: "Impossibile salvare la biografia. Riprova più tardi.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  // Gestisce il logout
  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/login');
      
      toast({
        title: "Logout effettuato",
        description: "Hai effettuato il logout con successo.",
      });
    } catch (error) {
      console.error("Errore logout:", error);
      toast({
        title: "Errore",
        description: "Impossibile effettuare il logout. Riprova più tardi.",
        variant: "destructive",
      });
    }
  };

  // Mostra il loader durante il caricamento del profilo
  if (!user || !profile) {
    return (
      <div className="container flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
          <p className="mt-2 text-muted-foreground">Caricamento profilo...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-12">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Il tuo profilo</h1>
          <Button variant="outline" onClick={handleLogout}>
            <LogOutIcon className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>

        {/* Barra di completamento profilo */}
        <Card className="border-2 border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center">
              {completionPercent === 100 ? (
                <CheckCircle2Icon className="mr-2 h-5 w-5 text-green-500" />
              ) : (
                <AlertCircleIcon className="mr-2 h-5 w-5 text-amber-500" />
              )}
              Completamento profilo: {completionPercent}%
            </CardTitle>
            <CardDescription>
              Completa il tuo profilo per migliorare la tua visibilità
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Progress value={completionPercent} className="h-2" />
            
            {completionPercent < 100 && (
              <div className="text-sm text-muted-foreground">
                <p>Completa il tuo profilo aggiungendo:</p>
                <ul className="list-disc list-inside mt-1">
                  {!profile.photoURL && <li>Una foto profilo</li>}
                  {!profile.bio && <li>Una biografia personale</li>}
                </ul>
              </div>
            )}
            
            {completionPercent === 100 && (
              <p className="text-sm text-green-600 font-medium">
                Complimenti! Il tuo profilo è completo. 🎉
              </p>
            )}
          </CardContent>
        </Card>

        {/* Informazioni profilo */}
        <div className="grid gap-8 md:grid-cols-3">
          {/* Colonna 1: Foto profilo */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Foto profilo</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center space-y-4">
              <div className="w-32 h-32 relative">
                <Avatar className="w-32 h-32">
                  <AvatarImage src={profile.photoURL || ""} alt={profile.name || "Utente"} />
                  <AvatarFallback className="text-4xl">
                    <UserIcon className="h-12 w-12" />
                  </AvatarFallback>
                </Avatar>
                
                {uploading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-full">
                    <Loader2 className="h-8 w-8 animate-spin text-white" />
                  </div>
                )}
              </div>
              
              <div>
                <input
                  type="file"
                  accept="image/*"
                  id="profileImage"
                  className="hidden"
                  onChange={handleImageUpload}
                  disabled={uploading}
                />
                <Label
                  htmlFor="profileImage"
                  className="cursor-pointer inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Caricamento...
                    </>
                  ) : (
                    <>
                      <ImageIcon className="mr-2 h-4 w-4" />
                      {profile.photoURL ? "Cambia foto" : "Aggiungi foto"}
                    </>
                  )}
                </Label>
              </div>
            </CardContent>
          </Card>

          {/* Colonna 2-3: Info personali */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="text-xl">Informazioni personali</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name" className="text-muted-foreground">Nome</Label>
                <div className="mt-1 font-medium text-xl">
                  {profile.name || user.displayName || "Utente"}
                </div>
              </div>
              
              <div>
                <Label htmlFor="email" className="text-muted-foreground">Email</Label>
                <div className="mt-1">
                  {user.email}
                </div>
              </div>
              
              <div>
                <Label htmlFor="bio" className="text-muted-foreground">Biografia</Label>
                <Textarea
                  id="bio"
                  placeholder="Raccontaci qualcosa di te..."
                  className="mt-1 resize-none"
                  rows={5}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSaveBio} disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvataggio...
                  </>
                ) : (
                  <>
                    <PencilIcon className="mr-2 h-4 w-4" />
                    Salva biografia
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}