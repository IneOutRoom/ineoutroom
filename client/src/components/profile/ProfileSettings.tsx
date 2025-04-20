import React from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, Save } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

// Schema di validazione per il form
const profileSchema = z.object({
  name: z.string().min(1, 'Il nome è obbligatorio'),
  surname: z.string().optional(),
  email: z.string().email('Email non valida').optional(),
  phone: z.string().optional(),
  bio: z.string().max(500, 'La biografia non può superare i 500 caratteri').optional(),
  hasVat: z.boolean().default(false),
  vatNumber: z.string().optional()
    .refine(val => {
      // Se hasVat è true, vatNumber deve essere presente
      return !val || val.length >= 8;
    }, { message: 'Numero di P.IVA non valido (minimo 8 caratteri)' }),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function ProfileSettings() {
  const { toast } = useToast();
  const { user } = useAuth();
  
  // Configurazione del form
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || '',
      surname: user?.surname || '',
      email: user?.email || '',
      phone: user?.phone || '',
      bio: user?.bio || '',
      hasVat: user?.hasVat || false,
      vatNumber: user?.vatNumber || '',
    },
  });
  
  // Mutation per aggiornare il profilo
  const updateProfileMutation = useMutation({
    mutationFn: async (data: ProfileFormValues) => {
      const response = await apiRequest('PUT', '/api/users/me', data);
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: 'Profilo aggiornato',
        description: 'Le informazioni del tuo profilo sono state aggiornate con successo',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Errore',
        description: error.message || 'Non è stato possibile aggiornare il profilo',
        variant: 'destructive',
      });
    }
  });
  
  const onSubmit = (data: ProfileFormValues) => {
    // Se l'utente non ha la P.IVA, rimuovi il campo vatNumber
    if (!data.hasVat) {
      data.vatNumber = '';
    }
    
    updateProfileMutation.mutate(data);
  };
  
  // Funzione per generare le iniziali per l'avatar
  const getInitials = (): string => {
    if (!user) return '';
    
    const name = user.name || '';
    const surname = user.surname || '';
    
    if (!name && !surname) return user.username.substring(0, 2).toUpperCase();
    
    return `${name.charAt(0)}${surname.charAt(0)}`.toUpperCase();
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Avatar className="h-20 w-20">
          <AvatarImage src={user?.profileImage || ''} alt={user?.name || user?.username} />
          <AvatarFallback>{getInitials()}</AvatarFallback>
        </Avatar>
        <div>
          <h3 className="text-lg font-medium">Impostazioni profilo</h3>
          <p className="text-sm text-muted-foreground">
            Aggiorna le tue informazioni personali
          </p>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Informazioni personali</CardTitle>
          <CardDescription>
            Modifica i tuoi dati e le informazioni di contatto
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome</FormLabel>
                      <FormControl>
                        <Input placeholder="Il tuo nome" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="surname"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cognome</FormLabel>
                      <FormControl>
                        <Input placeholder="Il tuo cognome" {...field} />
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
                        <Input 
                          placeholder="La tua email" 
                          {...field} 
                          disabled={!!user?.firebaseUid}
                        />
                      </FormControl>
                      {user?.firebaseUid && (
                        <FormDescription>
                          Email gestita tramite il tuo account Google
                        </FormDescription>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Telefono</FormLabel>
                      <FormControl>
                        <Input placeholder="Il tuo numero di telefono" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="bio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Biografia</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Scrivi qualcosa su di te" 
                        className="min-h-32" 
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      Massimo 500 caratteri
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="hasVat"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Sei in possesso di partita IVA?</FormLabel>
                        <FormDescription>
                          Seleziona questa opzione se desideri inserire la tua partita IVA
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
                
                {form.watch('hasVat') && (
                  <FormField
                    control={form.control}
                    name="vatNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Partita IVA</FormLabel>
                        <FormControl>
                          <Input placeholder="Inserisci la tua partita IVA" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>
              
              <Button 
                type="submit" 
                className="w-full sm:w-auto"
                disabled={updateProfileMutation.isPending}
              >
                {updateProfileMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvataggio in corso...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Salva modifiche
                  </>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}