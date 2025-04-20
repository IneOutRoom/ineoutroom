import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { Redirect, Route } from "wouter";

export function ProtectedRoute({
  path,
  component: Component,
  children,
}: {
  path: string;
  component?: React.ComponentType<any>;
  children?: React.ReactNode;
}) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <Route path={path}>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Route>
    );
  }

  if (!user) {
    // Ottieni il pathname corrente per redirigerci indietro dopo il login
    const currentPath = window.location.pathname;
    return (
      <Route path={path}>
        <Redirect to={`/auth?redirect=${encodeURIComponent(currentPath)}`} />
      </Route>
    );
  }

  if (Component) {
    return <Route path={path} component={Component} />;
  }
  
  return <Route path={path}>{children}</Route>;
}
