import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Layout } from "./components/Layout";
import Sales from "./pages/Sales";
import SalesManufacturer from "./pages/SalesManufacturer";
import Settings from "./pages/Settings";
import Login from "./pages/Login";
import { Toaster } from "./components/ui/sonner";

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Navigate to="/sales" replace />} />
          <Route path="/sales" element={<Sales />} />
          <Route path="/sales-manufacturer" element={<SalesManufacturer />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/login" element={<Login />} />
        </Routes>
      </Layout>
      <Toaster />
    </Router>
  );
}

export default App;