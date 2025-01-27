import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Layout } from "./components/Layout";
import Sales from "./pages/Sales";
import Settings from "./pages/Settings";
import Login from "./pages/Login";
import DailyOrders from "./pages/DailyOrders";
import SalesPlans from "./pages/SalesPlans";
import { Toaster } from "./components/ui/sonner";

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Navigate to="/sales" replace />} />
          <Route path="/sales" element={<Sales />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/login" element={<Login />} />
          <Route path="/daily-orders" element={<DailyOrders />} />
          <Route path="/sales-plans" element={<SalesPlans />} />
        </Routes>
      </Layout>
      <Toaster />
    </Router>
  );
}

export default App;