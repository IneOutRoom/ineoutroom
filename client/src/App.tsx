import React, { Suspense } from "react";
import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "next-themes";
import { Loader2 } from "lucide-react";

import { AuthProvider, useAuth } from "./hooks/use-auth";
import { ProtectedRoute } from "./lib/protected-route";
import { PageLayout } from "./components/layout/page-layout";
import AppErrorBoundary from "./components/error-handling/AppErrorBoundary";

// Componenti PWA
import { OfflineIndicator } from "./pwa/OfflineIndicator";
import { InstallPWA } from "./pwa/InstallPWA";
import { OnboardingTour } from "./components/OnboardingTour";
import { MapIntegration } from "./components/maps/MapIntegration";

// Componenti per accessibilità
import { SkipLink } from "./components/accessibility";

// Pagina integrazione mappe
const MapIntegrationPage = () => {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-primary mb-2">In&Out Maps</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Esplora immobili, visualizza la loro posizione su mappa e utilizza Street View
        </p>
      </div>
      <MapIntegration />
    </div>
  );
};
// La gestione del consenso cookie è ora affidata a Usercentrics CMP

import HomePage from "@/pages/home-page";
import AuthPage from "@/pages/auth-page";
import PropertySearch from "@/pages/property-search";
import PropertyDetail from "@/pages/property-detail";
import PropertyFormPage from "@/pages/property-form-page";
import Checkout from "@/pages/checkout";
import ChatPage from "@/pages/chat-page";
import AdminDashboard from "@/pages/admin-dashboard";
import AdminMonitoring from "@/pages/admin-monitoring";
import MLDashboard from "@/pages/ml-dashboard";
import DocumentsPage from "@/pages/documents-page";
import PriceSuggestion from "@/pages/price-suggestion";
import AiContentGenerator from "@/pages/ai-content-generator";
import AssistantPage from "@/pages/assistant-page";
import MapTestPage from "@/pages/map-test-page";
import MapDemoPage from "@/pages/map-demo-page";
import PropertyMapPage from "@/pages/property-map-page";
import SubscriptionPlansPage from "@/pages/subscription-plans-page";
import HowItWorks from "@/pages/how-it-works";
import ProfilePage from "@/pages/profile-page";
import NotFound from "@/pages/not-found";
import AutocompleteExamplePage from "@/pages/autocomplete-example-page";
import AutocompleteModernDemoPage from "@/pages/autocomplete-modern-demo";
import MapsExamplePage from "@/pages/maps-example-page";
import AIDemo from "@/pages/ai-demo";

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/auth" component={AuthPage} />
      <Route path="/search" component={PropertySearch} />
      <Route path="/property-search" component={PropertySearch} />
      <Route path="/how-it-works" component={HowItWorks} />
      <Route path="/price-suggestion" component={PriceSuggestion} />
      <Route path="/assistant" component={AssistantPage} />
      <Route path="/maps" component={MapTestPage} />
      <Route path="/map-demo" component={MapDemoPage} />
      <Route path="/map-demo-page" component={MapDemoPage} />
      <Route path="/mappe">
        <Suspense fallback={
          <div className="flex items-center justify-center min-h-screen">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2">Caricamento mappa...</span>
          </div>
        }>
          <MapIntegrationPage />
        </Suspense>
      </Route>
      <Route path="/cartografia">
        <Suspense fallback={
          <div className="flex items-center justify-center min-h-screen">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2">Caricamento mappa...</span>
          </div>
        }>
          {React.createElement(React.lazy(() => import('@/pages/cartography-page')))}
        </Suspense>
      </Route>
      <Route path="/maps-example" component={MapsExamplePage} />
      <Route path="/property-map" component={PropertyMapPage} />
      <Route path="/subscription-plans" component={SubscriptionPlansPage} />
      <Route path="/autocomplete-demo" component={AutocompleteExamplePage} />
      <Route path="/autocomplete-modern" component={AutocompleteModernDemoPage} />
      <Route path="/modern-addresses" component={AutocompleteModernDemoPage} />
      <Route path="/ai-demo" component={AIDemo} />
      <Route path="/sentry-test">
        <Suspense fallback={
          <div className="flex items-center justify-center min-h-screen">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2">Caricamento test Sentry...</span>
          </div>
        }>
          {React.createElement(React.lazy(() => import('@/pages/sentry-test-page')))}
        </Suspense>
      </Route>
      <ProtectedRoute path="/properties/new" component={PropertyFormPage as React.ComponentType<any>} />
      <Route path="/properties/edit/:id">
        {({params}) => {
          // Wrapper che controlla l'autenticazione
          const { user } = useAuth();
          return user ? (
            <PropertyFormPage isEditing={true} id={Number(params.id)} />
          ) : (
            <Redirect to={`/auth?redirect=${encodeURIComponent(window.location.pathname)}`} />
          );
        }}
      </Route>
      <Route path="/properties/:id" component={PropertyDetail as React.ComponentType<any>} />
      <ProtectedRoute path="/ai-content" component={AiContentGenerator as React.ComponentType<any>} />
      <ProtectedRoute path="/ai-generator" component={AiContentGenerator as React.ComponentType<any>} />
      <ProtectedRoute path="/checkout" component={Checkout as React.ComponentType<any>} />
      <ProtectedRoute path="/chat" component={ChatPage as React.ComponentType<any>} />
      <ProtectedRoute path="/documents" component={DocumentsPage as React.ComponentType<any>} />
      <ProtectedRoute path="/admin" component={AdminDashboard as React.ComponentType<any>} />
      <ProtectedRoute path="/admin-dashboard" component={AdminDashboard as React.ComponentType<any>} />
      <ProtectedRoute path="/admin/monitoring" component={AdminMonitoring as React.ComponentType<any>} />
      <ProtectedRoute path="/admin/ml" component={MLDashboard as React.ComponentType<any>} />
      <ProtectedRoute path="/profile" component={ProfilePage as React.ComponentType<any>} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="light">
        <AuthProvider>
          <AppErrorBoundary>
            <TooltipProvider>
              {/* SkipLink per navigazione da tastiera */}
              <SkipLink />
              
              <Toaster />
              
              {/* Utilizziamo il PageLayout che gestisce automaticamente navbar e footer */}
              <PageLayout>
                <div id="main-content" role="main" tabIndex={-1}>
                  <Router />
                </div>
              </PageLayout>
              
              {/* Componenti PWA */}
              <OfflineIndicator />
              <InstallPWA />
              
              {/* Tour guidato */}
              <OnboardingTour startManually={false} />
              
              {/* Consenso Cookie gestito da Usercentrics CMP */}
            </TooltipProvider>
          </AppErrorBoundary>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
