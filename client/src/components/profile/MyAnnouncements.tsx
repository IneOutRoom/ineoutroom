import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Property } from '@shared/schema';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Plus, Pencil, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Link, useLocation } from 'wouter';
import { Badge } from '@/components/ui/badge';
import { formatPrice } from '@/lib/utils';

export default function MyAnnouncements() {
  const { toast } = useToast();
  const [_, navigate] = useLocation();
  
  // Carica gli annunci dell'utente
  const { data: announcements, isLoading, isError } = useQuery<Property[]>({
    queryKey: ['/api/announcements', { userId: 'me' }],
  });

  // Funzione per eliminare un annuncio
  const handleDelete = async (id: number) => {
    if (!confirm('Sei sicuro di voler eliminare questo annuncio?')) return;
    
    try {
      const res = await fetch(`/api/properties/${id}`, {
        method: 'DELETE',
      });
      
      if (!res.ok) throw new Error('Errore durante l\'eliminazione dell\'annuncio');
      
      toast({
        title: 'Annuncio eliminato',
        description: 'L\'annuncio è stato eliminato con successo',
      });
      
      // Ricarica la pagina per aggiornare la lista
      window.location.reload();
    } catch (error) {
      console.error('Errore nell\'eliminazione:', error);
      toast({
        title: 'Errore',
        description: 'Non è stato possibile eliminare l\'annuncio',
        variant: 'destructive',
      });
    }
  };

  // Formatta la data di scadenza
  const formatExpiryDate = (date: Date) => {
    const d = new Date(date);
    return d.toLocaleDateString('it-IT', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center py-10">
        <p className="text-destructive mb-4">Si è verificato un errore nel caricamento degli annunci</p>
        <Button onClick={() => window.location.reload()}>Riprova</Button>
      </div>
    );
  }

  if (!announcements || announcements.length === 0) {
    return (
      <div className="text-center py-10 space-y-4">
        <p className="text-muted-foreground mb-4">Non hai ancora pubblicato annunci</p>
        <Button onClick={() => navigate('/properties/new')}>
          <Plus className="mr-2 h-4 w-4" />
          Pubblica il tuo primo annuncio
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">I tuoi annunci ({announcements.length})</h3>
        <Button onClick={() => navigate('/properties/new')}>
          <Plus className="mr-2 h-4 w-4" />
          Pubblica nuovo
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {announcements.map((announcement) => (
          <Card key={announcement.id} className="overflow-hidden">
            <CardHeader className="pb-2">
              <div className="flex justify-between">
                <CardTitle className="line-clamp-1">{announcement.title}</CardTitle>
                <Badge variant={announcement.isActive ? 'default' : 'outline'}>
                  {announcement.isActive ? 'Attivo' : 'Inattivo'}
                </Badge>
              </div>
              <CardDescription>
                {announcement.city}, {announcement.address}
              </CardDescription>
            </CardHeader>
            <CardContent className="pb-2">
              <div className="flex justify-between">
                <div>
                  <p className="text-lg font-bold">
                    {formatPrice(announcement.price)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Scade il: {formatExpiryDate(announcement.expiresAt)}
                  </p>
                </div>
                <div>
                  <Badge variant="outline" className="ml-2">
                    {announcement.propertyType.replace('_', ' ')}
                  </Badge>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-2 pt-2">
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => navigate(`/properties/edit/${announcement.id}`)}
              >
                <Pencil className="h-4 w-4 mr-1" />
                Modifica
              </Button>
              <Button 
                size="sm" 
                variant="destructive"
                onClick={() => handleDelete(announcement.id)}
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Elimina
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}