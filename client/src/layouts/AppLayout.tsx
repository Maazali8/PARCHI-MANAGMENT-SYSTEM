import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar, MobileMenuButton } from '../components/Sidebar';

export function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Authentication commented out for now — direct access allowed
  return (
    <div className="min-h-screen bg-cream">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <MobileMenuButton onClick={() => setSidebarOpen(true)} />
      <main className="lg:ml-[260px] min-h-screen">
        <div className="max-w-[1200px] mx-auto px-6 md:px-8 py-6 md:py-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export function EmployeeLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Authentication commented out for now — direct access allowed
  return (
    <div className="min-h-screen bg-cream">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <MobileMenuButton onClick={() => setSidebarOpen(true)} />
      <main className="lg:ml-[220px] min-h-screen">
        <div className="max-w-[1200px] mx-auto px-6 md:px-8 py-6 md:py-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
