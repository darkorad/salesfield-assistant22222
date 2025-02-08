
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Layout } from "./components/Layout";
import Settings from "./pages/Settings";
import Login from "./pages/Login";
import DailyOrders from "./pages/DailyOrders";
import VisitPlans from "./pages/VisitPlans";
import { Toaster } from "./components/ui/sonner";
import { ThemeProvider } from "next-themes";
import { useEffect, useState } from "react";
import { supabase } from "./integrations/supabase/client";

function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <ThemeProvider attribute="class" defaultTheme="light">
      <Router>
        <Layout>
          <Routes>
            <Route
              path="/"
              element={
                session ? (
                  <Navigate to="/visit-plans" replace />
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />
            <Route
              path="/settings"
              element={
                session ? <Settings /> : <Navigate to="/login" replace />
              }
            />
            <Route path="/login" element={<Login />} />
            <Route
              path="/daily-orders"
              element={
                session ? <DailyOrders /> : <Navigate to="/login" replace />
              }
            />
            <Route
              path="/visit-plans"
              element={
                session ? <VisitPlans /> : <Navigate to="/login" replace />
              }
            />
          </Routes>
        </Layout>
        <Toaster />
      </Router>
    </ThemeProvider>
  );
}

export default App;
