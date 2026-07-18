import { Outlet, NavLink, Navigate } from 'react-router-dom'
import { useAdminAuth } from '../context/AdminAuthContext.jsx'

export default function AdminLayout() {
  const { admin, logout } = useAdminAuth()

  if (!admin) return <Navigate to="/admin/login" replace />

  const navClass = ({ isActive }) =>
    `px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
      isActive ? 'bg-wc-gold text-wc-dark' : 'text-white/60 hover:text-white hover:bg-wc-border'
    }`

  return (
    <div className="min-h-screen bg-wc-dark flex flex-col">
      {/* Top bar */}
      <header className="border-b border-wc-border px-6 py-3 flex items-center justify-between">
        <span className="font-display text-xl text-gradient-gold tracking-widest">WC2026 ADMIN</span>

        <div className="flex items-center gap-3">
          <span className="text-white/40 text-xs hidden sm:block">
            {admin.username}{' '}
            <span className="text-wc-gold">({admin.role.replace('_', ' ')})</span>
          </span>
          <button
            onClick={logout}
            className="text-sm text-white/40 hover:text-red-400 transition-colors"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Sidebar + content */}
      <div className="flex flex-1">
        <aside className="w-48 border-r border-wc-border p-4 flex flex-col gap-1 hidden sm:flex">
          <NavLink to="/admin/dashboard" className={navClass}>Dashboard</NavLink>
          <NavLink to="/admin/tickets" className={navClass}>Tickets</NavLink>
          {admin.role === 'super_admin' && (
            <NavLink to="/admin/manage-admins" className={navClass}>Manage Admins</NavLink>
          )}
        </aside>

        {/* Mobile nav */}
        <div className="sm:hidden flex gap-2 p-3 border-b border-wc-border w-full">
          <NavLink to="/admin/dashboard" className={navClass}>Dashboard</NavLink>
          <NavLink to="/admin/tickets" className={navClass}>Tickets</NavLink>
          {admin.role === 'super_admin' && (
            <NavLink to="/admin/manage-admins" className={navClass}>Admins</NavLink>
          )}
        </div>

        <main className="flex-1 p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
