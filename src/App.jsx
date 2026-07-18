import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import HomePage from './pages/client/HomePage.jsx'
import MyTickets from './pages/client/MyTickets.jsx'
import AdminLoginPage from './pages/admin/LoginPage.jsx'
import AdminDashboard from './pages/admin/Dashboard.jsx'
import AdminTicketsList from './pages/admin/TicketsList.jsx'
import AdminManageAdmins from './pages/admin/ManageAdmins.jsx'
import AdminLayout from './components/AdminLayout.jsx'
import { AdminAuthProvider } from './context/AdminAuthContext.jsx'

export default function App() {
  return (
    <BrowserRouter>
      <AdminAuthProvider>
        <Routes>
          {/* Public client routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/my-tickets" element={<MyTickets />} />

          {/* Admin routes */}
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="tickets" element={<AdminTicketsList />} />
            <Route path="manage-admins" element={<AdminManageAdmins />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AdminAuthProvider>
    </BrowserRouter>
  )
}
