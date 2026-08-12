import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './stores/authStore';

// Layouts
import { AdminLayout, EmployeeLayout } from './layouts/AppLayout';

// Pages
import LoginPage from './pages/LoginPage';
import AdminDashboard from './pages/AdminDashboard';
import ParchisPage from './pages/ParchisPage';
import CollectionsPage from './pages/CollectionsPage';
import CollectionEntryPage from './pages/CollectionEntryPage';
import ShopkeepersPage from './pages/ShopkeepersPage';
import ShopkeeperDetailPage from './pages/ShopkeeperDetailPage';
import EmployeesPage from './pages/EmployeesPage';
import KhataPage from './pages/KhataPage';
import KhataDetailPage from './pages/KhataDetailPage';
import VerifyPaymentsPage from './pages/VerifyPaymentsPage';
import ReportsPage from './pages/ReportsPage';
import WhatsAppPage from './pages/WhatsAppPage';
import SettingsPage from './pages/SettingsPage';

// Employee Pages
import EmployeeDashboard from './pages/EmployeeDashboard';
import EmployeeParchisPage from './pages/EmployeeParchisPage';
import EmployeeCollectionsPage from './pages/EmployeeCollectionsPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

export default function App() {
  const { checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
      <BrowserRouter>
        <Routes>
          {/* Public Route */}
          <Route path="/login" element={<LoginPage />} />

          {/* Admin Routes */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="parchis" element={<ParchisPage />} />
            <Route path="collections" element={<CollectionsPage />} />
            <Route path="collections/new" element={<CollectionEntryPage />} />
            <Route path="shopkeepers" element={<ShopkeepersPage />} />
            <Route path="shopkeepers/:id" element={<ShopkeeperDetailPage />} />
            <Route path="employees" element={<EmployeesPage />} />
            <Route path="khata" element={<KhataPage />} />
            <Route path="khata/:shopkeeperId" element={<KhataDetailPage />} />
            <Route path="verify" element={<VerifyPaymentsPage />} />
            <Route path="reports" element={<ReportsPage />} />
            <Route path="whatsapp" element={<WhatsAppPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route index element={<Navigate to="dashboard" replace />} />
          </Route>

          {/* Employee Routes */}
          <Route path="/employee" element={<EmployeeLayout />}>
            <Route path="dashboard" element={<EmployeeDashboard />} />
            <Route path="parchis" element={<EmployeeParchisPage />} />
            <Route path="collections" element={<EmployeeCollectionsPage />} />
            <Route path="collections/new" element={<CollectionEntryPage />} />
            <Route path="history" element={<EmployeeCollectionsPage />} />
            <Route index element={<Navigate to="dashboard" replace />} />
          </Route>

          {/* Root Redirect — Auth commented out, default directly to Admin Dashboard */}
          <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
