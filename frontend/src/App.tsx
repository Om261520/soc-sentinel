import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { DashboardLayout } from './layouts/DashboardLayout';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { AlertsPage } from './pages/AlertsPage';
import { AlertDetailsPage } from './pages/AlertDetailsPage';
import { LogsPage } from './pages/LogsPage';
import { IncidentsPage } from './pages/IncidentsPage';
import { IncidentDetailsPage } from './pages/IncidentDetailsPage';
import { RulesPage } from './pages/RulesPage';
import { ThreatIntelPage } from './pages/ThreatIntelPage';
import { SimulationsPage } from './pages/SimulationsPage';
import { SystemHealthPage } from './pages/SystemHealthPage';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return <DashboardLayout>{children}</DashboardLayout>;
};

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        
        <Route path="/" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
        <Route path="/alerts" element={<ProtectedRoute><AlertsPage /></ProtectedRoute>} />
        <Route path="/alerts/:id" element={<ProtectedRoute><AlertDetailsPage /></ProtectedRoute>} />
        <Route path="/logs" element={<ProtectedRoute><LogsPage /></ProtectedRoute>} />
        <Route path="/incidents" element={<ProtectedRoute><IncidentsPage /></ProtectedRoute>} />
        <Route path="/incidents/:id" element={<ProtectedRoute><IncidentDetailsPage /></ProtectedRoute>} />
        <Route path="/rules" element={<ProtectedRoute><RulesPage /></ProtectedRoute>} />
        <Route path="/threat-intelligence" element={<ProtectedRoute><ThreatIntelPage /></ProtectedRoute>} />
        <Route path="/simulations" element={<ProtectedRoute><SimulationsPage /></ProtectedRoute>} />
        <Route path="/system-health" element={<ProtectedRoute><SystemHealthPage /></ProtectedRoute>} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};
