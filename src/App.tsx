
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Layout } from "./components/Layout";
import Settings from "./pages/Settings";
import Login from "./pages/Login";
import DailyOrders from "./pages/DailyOrders";
import VisitPlans from "./pages/VisitPlans";
import { Toaster } from "./components/ui/sonner";
import { ThemeProvider } from "next-themes";

function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="light">
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Navigate to="/visit-plans" replace />} />
            <Route path="/sales" element={<Navigate to="/visit-plans" replace />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/login" element={<Login />} />
            <Route path="/daily-orders" element={<DailyOrders />} />
            <Route path="/visit-plans" element={<VisitPlans />} />
          </Routes>
        </Layout>
        <Toaster />
      </Router>
    </ThemeProvider>
  );
}

export default App;
