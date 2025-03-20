
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from '../../pages/Login';
import Sales from '../../pages/Sales';
import Prodaja2 from '../../pages/Prodaja2';
import { Layout } from '../Layout';
import Settings from '../../pages/Settings';
import DailyOrders from '../../pages/DailyOrders';
import VisitPlans from '../../pages/VisitPlans';
import Documents from '../../pages/Documents';
import Index from '../../pages/Index';

interface AppRoutesProps {
  isAuthenticated: boolean;
}

export const AppRoutes: React.FC<AppRoutesProps> = ({ isAuthenticated }) => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<Index />} />
      {isAuthenticated ? (
        <Route element={<Layout />}>
          <Route path="/sales" element={<Sales />} />
          <Route path="/prodaja2" element={<Prodaja2 />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/documents" element={<Documents />} />
          <Route path="/daily-orders" element={<DailyOrders />} />
          <Route path="/visit-plans" element={<VisitPlans />} />
          <Route path="*" element={<Navigate to="/visit-plans" replace />} />
        </Route>
      ) : (
        <Route path="*" element={<Navigate to="/login" replace />} />
      )}
    </Routes>
  );
};
