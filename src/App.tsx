import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";
import { initializeData } from "./utils/initial-data";
import Login from "./pages/Login";
import Sales from "./pages/Sales";
import Settings from "./pages/Settings";
import Reports from "./pages/Reports";
import Layout from "./components/Layout";

const queryClient = new QueryClient();

const App = () => {
  useEffect(() => {
    initializeData();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route element={<Layout />}>
              <Route path="/sales" element={<Sales />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/reports" element={<Reports />} />
            </Route>
            <Route path="/" element={<Navigate to="/login" replace />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;