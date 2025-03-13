
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import './App.css'
import { Toaster } from './components/ui/toaster'
import { Toaster as SonnerToaster } from 'sonner'
import Login from './pages/Login'
import Sales from './pages/Sales'
import Prodaja2 from './pages/Prodaja2'
import { Layout } from './components/Layout'
import Settings from './pages/Settings'
import DailyOrders from './pages/DailyOrders'
import VisitPlans from './pages/VisitPlans'
import Documents from './pages/Documents'

function App() {
  return (
    <BrowserRouter>
      <SonnerToaster richColors />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route element={<Layout />}>
          <Route path="/" element={<Navigate to="/sales" replace />} />
          <Route path="/sales" element={<Sales />} />
          <Route path="/prodaja2" element={<Prodaja2 />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/documents" element={<Documents />} />
          <Route path="/daily-orders" element={<DailyOrders />} />
          <Route path="/visit-plans" element={<VisitPlans />} />
          <Route path="*" element={<Navigate to="/sales" replace />} />
        </Route>
      </Routes>
      <Toaster />
      <ReactQueryDevtools initialIsOpen={false} />
    </BrowserRouter>
  )
}

export default App
