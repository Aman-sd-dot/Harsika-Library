import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  Armchair,
  CreditCard,
  CalendarCheck,
  Settings,
  ShieldCheck,
  ChevronRight,
  ClipboardList,
} from 'lucide-react';

const AdminLayout = ({ children }) => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const sidebarLinks = [
    { label: 'Admin Panel', path: '/admin', icon: LayoutDashboard },
    { label: 'Manage Students', path: '/admin/students', icon: Users },
    { label: 'Library Layout', path: '/admin/seats', icon: Armchair },
    { label: 'Pricing Plans', path: '/admin/plans', icon: ClipboardList },
    { label: 'Payments Board', path: '/admin/payments', icon: CreditCard },
    { label: 'Attendance Logs', path: '/admin/attendance', icon: CalendarCheck },
    { label: 'System Settings', path: '/admin/settings', icon: Settings },
  ];

  const isActive = (path) => location.pathname === path;

  // Protect admin route
  if (!user) {
    navigate('/login');
    return null;
  }

  if (user.role !== 'admin') {
    navigate('/dashboard');
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row">
      {/* Sidebar navigation */}
      <aside className="w-full md:w-64 shrink-0 bg-slate-900/60 border-r border-slate-900 p-6 flex flex-col justify-between">
        <div>
          {/* User profile card */}
          <div className="flex items-center space-x-3 mb-8 pb-6 border-b border-slate-800">
            <div className="h-10 w-10 rounded-xl bg-indigo-600 flex items-center justify-center font-bold text-white uppercase shadow-md shadow-indigo-900/25">
              A
            </div>
            <div className="min-w-0">
              <h4 className="font-bold text-sm text-white truncate">{user.name}</h4>
              <p className="text-[10px] text-brand-400 font-mono mt-0.5">Admin Account</p>
            </div>
          </div>

          {/* Links list */}
          <nav className="space-y-1.5">
            {sidebarLinks.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.path);
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    active
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-900/10'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className="h-4 w-4" />
                    <span>{link.label}</span>
                  </div>
                  {active && <ChevronRight className="h-4 w-4" />}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Security Stamp */}
        <div className="mt-8 pt-4 border-t border-slate-800 flex items-center space-x-2 text-[10px] text-slate-500 font-mono">
          <ShieldCheck className="h-4.5 w-4.5 text-indigo-500" />
          <span>Root Authorization Secure</span>
        </div>
      </aside>

      {/* Main Workspace */}
      <main className="flex-1 p-6 md:p-8 overflow-y-auto max-w-7xl mx-auto w-full">
        {children}
      </main>
    </div>
  );
};

export default AdminLayout;
