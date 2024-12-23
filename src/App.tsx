import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import Layout from "@/components/Layout";
import Sales from "@/pages/Sales";
import Settings from "@/pages/Settings";
import Index from "@/pages/Index";
import Login from "@/pages/Login";
import { useEffect, useState } from "react";
import { supabase } from "./integrations/supabase/client";
import { toast } from "sonner";

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: 1000 * 60 * 60 * 24, // 24 hours
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
      networkMode: "always",
    },
  },
});

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Auth error:", error);
          setIsAuthenticated(false);
          return;
        }

        if (!session) {
          setIsAuthenticated(false);
          return;
        }

        setIsAuthenticated(true);
      } catch (error) {
        console.error("Session check error:", error);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, !!session);
      
      if (event === 'SIGNED_OUT') {
        setIsAuthenticated(false);
        queryClient.clear();
        localStorage.clear(); // Clear all local storage
      } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        setIsAuthenticated(true);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Router>
          <Routes>
            <Route 
              path="/login" 
              element={!isAuthenticated ? <Login /> : <Navigate to="/sales" />} 
            />
            <Route 
              path="/" 
              element={isAuthenticated ? <Layout /> : <Navigate to="/login" />}
            >
              <Route index element={<Index />} />
              <Route path="/sales" element={<Sales />} />
              <Route path="/settings" element={<Settings />} />
            </Route>
          </Routes>
        </Router>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;