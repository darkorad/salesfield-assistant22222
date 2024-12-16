import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";

// Lazy load components
const Layout = lazy(() => import("@/components/Layout"));
const Sales = lazy(() => import("@/pages/Sales"));
const Reports = lazy(() => import("@/pages/Reports"));
const Settings = lazy(() => import("@/pages/Settings"));
const Login = lazy(() => import("@/pages/Login"));
const Index = lazy(() => import("@/pages/Index"));

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

// Preload critical components
const preloadComponents = () => {
  const importPromises = [
    () => import("@/components/Layout"),
    () => import("@/pages/Sales")
  ];

  importPromises.forEach(importFn => {
    const preloadFn = () => {
      importFn()
        .then(() => {
          console.log('Component preloaded successfully');
        })
        .catch(error => {
          console.error('Error preloading component:', error);
        });
    };

    if (typeof requestIdleCallback !== 'undefined') {
      requestIdleCallback(preloadFn);
    } else {
      setTimeout(preloadFn, 1000);
    }
  });
};

// Start preloading
preloadComponents();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <BrowserRouter>
          <Suspense fallback={<div>Loading...</div>}>
            <Routes>
              <Route path="/" element={<Layout />}>
                <Route index element={<Index />} />
                <Route path="sales" element={<Sales />} />
                <Route path="reports" element={<Reports />} />
                <Route path="settings" element={<Settings />} />
              </Route>
              <Route path="/login" element={<Login />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;