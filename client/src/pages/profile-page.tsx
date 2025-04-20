import React, { useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useLocation } from 'wouter';
import { Container } from '@/components/ui/container';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Loader2, Home } from 'lucide-react';
import ProfileHeader from '@/components/profile/ProfileHeader';
import ProfileTabs from '@/components/profile/ProfileTabs';

export default function ProfilePage() {
  const { user, isLoading } = useAuth();
  const [location, navigate] = useLocation();
  
  // Estrai il parametro tab dall'URL
  const urlSearchParams = new URLSearchParams(window.location.search);
  const tab = urlSearchParams.get('tab') || 'settings';
  
  // Reindirizza alla pagina di login se l'utente non è autenticato
  useEffect(() => {
    if (!isLoading && !user) {
      navigate('/auth');
    }
  }, [isLoading, user, navigate]);
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }
  
  if (!user) {
    return null; // Verrà reindirizzato dal hook useEffect
  }
  
  return (
    <Container>
      <div className="py-6 md:py-10">
        <div className="flex justify-between items-center mb-6">
          <Button
            variant="outline"
            onClick={() => navigate('/')}
            className="flex items-center gap-1"
          >
            <Home className="h-4 w-4" />
            Torna alla Home
          </Button>
        </div>
        
        <ProfileHeader />
        
        <Separator className="my-6" />
        
        <ProfileTabs defaultTab={tab} />
      </div>
    </Container>
  );
}