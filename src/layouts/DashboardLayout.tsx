import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '../components/common/Sidebar';
import { Navbar } from '../components/common/Navbar';

export const DashboardLayout: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      {/* Sidebar */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="lg:pl-72 flex flex-col flex-1 min-h-screen">
        {/* Sticky Top Navbar */}
        <Navbar onOpenSidebar={() => setIsSidebarOpen(true)} />

        {/* Page Content (Normal Vertical Scroll) */}
        <main className="flex-1 p-4 sm:p-6 md:p-8 max-w-7xl w-full mx-auto pb-16">
          <Outlet />
        </main>

        {/* Global Footer */}
        <footer className="py-4 px-6 border-t border-slate-200/80 bg-white text-center text-xs text-slate-500">
          <p>
            © {new Date().getFullYear()} SIMKA Al-Qur'aniyyah — Sistem Informasi Manajemen Karyawan Yayasan Pendidikan Islam Pondok Pesantren Al-Qur'aniyyah
          </p>
        </footer>
      </div>
    </div>
  );
};
