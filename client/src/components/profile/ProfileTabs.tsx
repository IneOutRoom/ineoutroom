import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ProfileSettings from './ProfileSettings';
import MyAnnouncements from './MyAnnouncements';
import MyFavorites from './MyFavorites';
import MySubscriptions from './MySubscriptions';
import { useLocation } from 'wouter';

interface ProfileTabsProps {
  defaultTab?: string;
}

export default function ProfileTabs({ defaultTab = 'settings' }: ProfileTabsProps) {
  const [_, setLocation] = useLocation();
  
  // Cambio di tab senza modificare l'URL
  const handleTabChange = (value: string) => {
    // Non modifichiamo più l'URL perché causa problemi di routing
    // Gestiremo il cambio di tab solo localmente nel componente
  };
  
  return (
    <Tabs defaultValue={defaultTab} className="w-full" onValueChange={handleTabChange}>
      <TabsList className="w-full mb-6">
        <TabsTrigger value="settings" className="flex-1">
          Impostazioni
        </TabsTrigger>
        <TabsTrigger value="announcements" className="flex-1">
          I Miei Annunci
        </TabsTrigger>
        <TabsTrigger value="favorites" className="flex-1">
          Preferiti
        </TabsTrigger>
        <TabsTrigger value="subscriptions" className="flex-1">
          Abbonamenti
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="settings" className="pt-2">
        <ProfileSettings />
      </TabsContent>
      
      <TabsContent value="announcements" className="pt-2">
        <MyAnnouncements />
      </TabsContent>
      
      <TabsContent value="favorites" className="pt-2">
        <MyFavorites />
      </TabsContent>
      
      <TabsContent value="subscriptions" className="pt-2">
        <MySubscriptions />
      </TabsContent>
    </Tabs>
  );
}