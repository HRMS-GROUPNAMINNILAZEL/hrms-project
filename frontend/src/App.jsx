import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import LoginPage from './pages/LoginPage';
import AdminDashboard from './pages/AdminDashboard';
import EmployeeDashboard from './pages/EmployeeDashboard';

function MainRouter() {
  const { user } = useAuth();

  if (!user) {
    return <LoginPage />;
  }

  // Admin or HR view
  if (user.role === 'admin' || user.role === 'hr') {
    return <AdminDashboard />;
  }

  // Regular Employee / Manager view
  return <EmployeeDashboard />;
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <MainRouter />
      </AuthProvider>
    </ThemeProvider>
  );
}