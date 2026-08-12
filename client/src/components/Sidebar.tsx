import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, FileText, Banknote, Store, BookOpen,
  Users, BarChart3, Settings, LogOut, MessageCircle, CheckCircle, X, Menu
} from 'lucide-react';
import { useAuthStore } from '../stores/authStore';

interface NavItem {
  label: string;
  path: string;
  icon: React.ElementType;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const adminNav: NavSection[] = [
  {
    title: 'Main',
    items: [
      { label: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
      { label: 'Daily Parchi', path: '/admin/parchis', icon: FileText },
      { label: 'Collections', path: '/admin/collections', icon: Banknote },
      { label: 'Shopkeepers', path: '/admin/shopkeepers', icon: Store },
      { label: 'Khata', path: '/admin/khata', icon: BookOpen },
    ],
  },
  {
    title: 'Manage',
    items: [
      { label: 'Employees', path: '/admin/employees', icon: Users },
      { label: 'Verify Payments', path: '/admin/verify', icon: CheckCircle },
      { label: 'Reports', path: '/admin/reports', icon: BarChart3 },
      { label: 'WhatsApp', path: '/admin/whatsapp', icon: MessageCircle },
      { label: 'Settings', path: '/admin/settings', icon: Settings },
    ],
  },
];

const employeeNav: NavSection[] = [
  {
    title: 'Main',
    items: [
      { label: 'Dashboard', path: '/employee/dashboard', icon: LayoutDashboard },
      { label: 'My Parchis', path: '/employee/parchis', icon: FileText },
      { label: 'Collections', path: '/employee/collections', icon: Banknote },
      { label: 'History', path: '/employee/history', icon: BarChart3 },
    ],
  },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const isAdmin = user?.role === 'ADMIN';
  const navSections = isAdmin ? adminNav : employeeNav;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-ink/30 z-40 lg:hidden" onClick={onClose} />
      )}

      <aside
        className={`
          fixed top-0 left-0 h-full bg-paper border-r border-cream-deep
          flex flex-col z-50 transition-transform duration-200
          ${isAdmin ? 'w-[260px]' : 'w-[220px]'}
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Logo */}
        <div className="px-5 py-6 border-b border-cream-deep">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-serif text-xl tracking-tight">Parchi</h1>
              <p className="text-[11px] text-ink-muted tracking-wide">Management System</p>
            </div>
            <button onClick={onClose} className="lg:hidden p-1 hover:bg-cream rounded cursor-pointer">
              <X size={18} className="text-ink-muted" />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3">
          {navSections.map((section) => (
            <div key={section.title} className="mb-5">
              <p className="px-3 mb-2 text-[10px] font-medium uppercase tracking-widest text-ink-muted">
                {section.title}
              </p>
              <div className="space-y-0.5">
                {section.items.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={() => onClose()}
                    className={({ isActive }) => `
                      flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-all duration-150
                      ${isActive
                        ? 'bg-cream-warm text-ink font-medium border-l-2 border-ink -ml-[2px] pl-[14px]'
                        : 'text-ink-light hover:bg-cream hover:text-ink'
                      }
                    `}
                  >
                    <item.icon size={18} />
                    <span>{item.label}</span>
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* User info */}
        <div className="px-4 py-4 border-t border-cream-deep">
          <div className="flex items-center justify-between">
            <div className="min-w-0">
              <p className="text-sm font-medium truncate">{user?.name}</p>
              <p className="text-xs text-ink-muted truncate">{user?.role === 'ADMIN' ? 'Administrator' : 'Employee'}</p>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 hover:bg-cream rounded-md transition-colors cursor-pointer"
              title="Logout"
            >
              <LogOut size={16} className="text-ink-muted" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}

export function MobileMenuButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="lg:hidden fixed top-4 left-4 z-30 p-2 bg-paper border border-cream-deep rounded-md shadow-sm cursor-pointer"
    >
      <Menu size={20} className="text-ink" />
    </button>
  );
}
