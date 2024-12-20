import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import Layout from "@/components/Layout";
import Sales from "@/pages/Sales";
import Reports from "@/pages/Reports";
import Settings from "@/pages/Settings";
import Index from "@/pages/Index";
import Login from "@/pages/Login";
import { useEffect, useState } from "react";
import { supabase } from "./integrations/supabase/client";

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

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  if (isAuthenticated === null) {
    return null; // or a loading spinner
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Router>
          <Routes>
            <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/sales" />} />
            <Route path="/" element={isAuthenticated ? <Layout /> : <Navigate to="/login" />}>
              <Route index element={<Index />} />
              <Route path="/sales" element={<Sales />} />
              <Route path="/reports" element={<Reports />} />
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