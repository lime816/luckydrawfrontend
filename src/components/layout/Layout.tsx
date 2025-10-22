import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
// Toaster is mounted at the application root (App.tsx). Avoid mounting it here to prevent duplicate toasts.

export const Layout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        <main className="flex-1 overflow-y-auto">
          <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-8">
            <Outlet />
          </div>
        </main>
      </div>
  {/* Toaster intentionally not mounted here; App.tsx mounts a single global Toaster */}
    </div>
  );
};
