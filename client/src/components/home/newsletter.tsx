import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

export function Newsletter() {
  const [email, setEmail] = useState('');
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !email.includes('@')) {
      toast({
        title: "Errore",
        description: "Inserisci un indirizzo email valido",
        variant: "destructive",
      });
      return;
    }
    
    // In produzione, qui si invierebbe l'email al backend
    toast({
      title: "Iscrizione completata",
      description: "Grazie per esserti iscritto alla nostra newsletter!",
    });
    
    setEmail('');
  };

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="font-montserrat font-bold text-2xl md:text-3xl mb-4">Resta aggiornato</h2>
          <p className="text-neutral-600 mb-8">Iscriviti alla nostra newsletter per ricevere consigli sulla ricerca di alloggi e le ultime offerte.</p>
          
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
            <Input
              type="email"
              placeholder="Il tuo indirizzo email"
              className="flex-1 px-5 py-3 rounded-lg border border-neutral-300 focus:outline-none focus:border-primary"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Button 
              type="submit"
              className="bg-primary hover:bg-primary/90 text-white font-medium px-6 py-3 whitespace-nowrap"
            >
              Iscriviti ora
            </Button>
          </form>
          
          <p className="text-xs text-neutral-500 mt-4">
            Iscrivendoti accetti la nostra <a href="#" className="underline">Privacy Policy</a>. Puoi cancellarti in qualsiasi momento.
          </p>
        </div>
      </div>
    </section>
  );
}
