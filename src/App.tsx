import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Lazy load pages with loading boundaries
const Layout = lazy(() => import("./components/Layout"));
const Login = lazy(() => import("./pages/Login"));
const Sales = lazy(() => import("./pages/Sales"));
const Settings = lazy(() => import("./pages/Settings"));
const Reports = lazy(() => import("./pages/Reports"));

// Configure QueryClient for optimal mobile performance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30, // 30 minutes
      retry: 1,
      networkMode: 'online',
      refetchOnWindowFocus: false,
      refetchOnReconnect: 'always',
    },
  },
});

const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
  </div>
);

// Preload critical components
const preloadComponents = () => {
  // Create an array of import promises
  const importPromises = [
    () => import("./components/Layout"),
    () => import("./pages/Sales")
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
    
    // Use requestIdleCallback if available, otherwise setTimeout
    if (typeof requestIdleCallback !== 'undefined') {
      requestIdleCallback(preloadFn);
    } else {
      setTimeout(preloadFn, 1000);
    }
  });
};

const App = () => {
  // Start preloading components when the app mounts
  preloadComponents();

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Suspense fallback={<LoadingSpinner />}>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route element={<Layout />}>
                <Route path="/sales" element={<Sales />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/reports" element={<Reports />} />
              </Route>
              <Route path="/" element={<Navigate to="/login" replace />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;