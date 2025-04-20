import React from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Clock, Star, FileCheck, Mail, Phone } from 'lucide-react';
import { formatDate } from '@/lib/utils';

export default function ProfileHeader() {
  const { user } = useAuth();
  
  if (!user) return null;
  
  // Funzione per generare le iniziali dall'username o nome
  const getInitials = (): string => {
    const name = user.name || '';
    const username = user.username || '';
    
    if (name) {
      const parts = name.split(' ');
      if (parts.length > 1) {
        return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase();
      }
      return name.substring(0, 2).toUpperCase();
    }
    
    return username.substring(0, 2).toUpperCase();
  };
  
  // Calcola la percentuale del completamento del profilo
  const calculateProfileCompletion = (): number => {
    let fieldsToCheck = ['name', 'email', 'bio', 'phone', 'profileImage'];
    let completedFields = 0;
    
    fieldsToCheck.forEach(field => {
      if (user[field as keyof typeof user]) completedFields++;
    });
    
    return Math.round((completedFields / fieldsToCheck.length) * 100);
  };
  
  const profileCompletion = calculateProfileCompletion();

  return (
    <div className="flex flex-col md:flex-row md:items-center gap-6">
      <Avatar className="h-24 w-24 border-2 border-primary">
        <AvatarImage src={user.profileImage || ''} alt={user.name || user.username} />
        <AvatarFallback className="text-xl">{getInitials()}</AvatarFallback>
      </Avatar>
      
      <div className="flex-1 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h1 className="text-2xl font-bold">{user.name || user.username}</h1>
            <p className="text-muted-foreground">
              Membro dal {formatDate(user.createdAt)}
            </p>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {user.emailVerified && (
              <Badge variant="outline" className="flex items-center gap-1 border-green-500 text-green-600">
                <FileCheck className="h-3.5 w-3.5" />
                Email verificata
              </Badge>
            )}
            {user.role === 'admin' && (
              <Badge className="bg-primary hover:bg-primary">Amministratore</Badge>
            )}
            {user.role === 'agente' && (
              <Badge className="bg-blue-600 hover:bg-blue-700">Agente Immobiliare</Badge>
            )}
          </div>
        </div>
        
        <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
          {user.email && (
            <div className="flex items-center gap-1.5">
              <Mail className="h-4 w-4" />
              <span>{user.email}</span>
            </div>
          )}
          {user.phone && (
            <div className="flex items-center gap-1.5">
              <Phone className="h-4 w-4" />
              <span>{user.phone}</span>
            </div>
          )}
          {user.subscriptionPlan && (
            <div className="flex items-center gap-1.5">
              <Star className="h-4 w-4 text-amber-500" />
              <span>
                {user.subscriptionPlan === 'standard' ? 'Piano Standard' : 'Piano Premium'}
                {user.subscriptionExpiresAt && 
                  ` (scade il ${formatDate(user.subscriptionExpiresAt)})`
                }
              </span>
            </div>
          )}
          {user.remainingListings !== null && user.remainingListings !== undefined && (
            <div className="flex items-center gap-1.5">
              <Clock className="h-4 w-4" />
              <span>{user.remainingListings} inserzioni rimanenti</span>
            </div>
          )}
        </div>
        
        <div className="pt-2">
          <div className="flex justify-between items-center text-sm mb-1.5">
            <span>Completamento profilo</span>
            <span>{profileCompletion}%</span>
          </div>
          <Progress value={profileCompletion} className="h-2" />
        </div>
      </div>
    </div>
  );
}