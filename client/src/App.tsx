import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import FindLawyers from "@/pages/FindLawyers";
import LawyerProfile from "@/pages/LawyerProfile";
import AIConsultation from "@/pages/AIConsultation";
import LegalResources from "@/pages/LegalResources";
import LegalNews from "@/pages/LegalNews";
import Dashboard from "@/pages/Dashboard";
import AuthPage from "@/pages/auth/AuthPage";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/find-lawyers" component={FindLawyers} />
      <Route path="/lawyer/:id" component={LawyerProfile} />
      <ProtectedRoute path="/ai-consultation" component={AIConsultation} />
      <Route path="/resources" component={LegalResources} />
      <Route path="/news" component={LegalNews} />
      <ProtectedRoute path="/dashboard" component={Dashboard} />
      <Route path="/auth" component={AuthPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <div className="min-h-screen flex flex-col">
          <Header />
          <main className="flex-grow">
            <Router />
          </main>
          <Footer />
        </div>
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
