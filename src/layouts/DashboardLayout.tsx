import React, { useState } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { Sidebar } from '../components/common/Sidebar';
import { Navbar } from '../components/common/Navbar';
import { LayoutDashboard, Users, FileSpreadsheet, FolderLock, Menu } from 'lucide-react';

export const DashboardLayout: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();

  const mobileNavItems = [
    { to: '/', label: 'Beranda', icon: <LayoutDashboard className="w-5 h-5" />, exact: true },
    { to: '/employees', label: 'Karyawan', icon: <Users className="w-5 h-5" /> },
    { to: '/attendance/generator', label: 'Absensi', icon: <FileSpreadsheet className="w-5 h-5" /> },
    { to: '/documents', label: 'Dokumen', icon: <FolderLock className="w-5 h-5" /> }
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      {/* Sidebar Drawer */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="lg:pl-72 flex flex-col flex-1 min-h-screen">
        {/* Sticky Top Navbar */}
        <Navbar onOpenSidebar={() => setIsSidebarOpen(true)} />

        {/* Page Content (Normal Vertical Scroll, bottom padding adjusted for Mobile Bottom Nav) */}
        <main className="flex-1 p-3.5 sm:p-6 md:p-8 max-w-7xl w-full mx-auto pb-28 lg:pb-16">
          <Outlet />
        </main>

        {/* Global Footer (hidden on small mobile or shown cleanly) */}
        <footer className="py-4 px-6 border-t border-slate-200/80 bg-white text-center text-xs text-slate-500 mb-16 lg:mb-0">
          <p>
            © {new Date().getFullYear()} SIMKA Al-Qur'aniyyah — Sistem Informasi Manajemen Karyawan Yayasan Pendidikan Islam Pondok Pesantren Al-Qur'aniyyah
          </p>
        </footer>
      </div>

      {/* MOBILE BOTTOM NAVIGATION BAR (FIXED ON SMARTPHONES) */}
      <nav aria-label="Navigasi Bawah Mobile" className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-2xl py-1.5 px-2 flex items-center justify-around safe-bottom">
        {mobileNavItems.map((item) => {
          const isActive = item.exact
            ? location.pathname === item.to
            : location.pathname.startsWith(item.to);

          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-2xl text-[10px] font-bold transition-all ${
                isActive
                  ? 'text-emerald-900 bg-emerald-50'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <div className={`p-1 rounded-xl transition ${isActive ? 'bg-emerald-600 text-white shadow-sm' : ''}`}>
                {item.icon}
              </div>
              <span className="mt-0.5 leading-none">{item.label}</span>
            </NavLink>
          );
        })}

        {/* Drawer Menu Button */}
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="flex flex-col items-center justify-center py-1 px-3 rounded-2xl text-[10px] font-bold text-slate-500 hover:text-slate-800 transition"
        >
          <div className="p-1 rounded-xl text-slate-600">
            <Menu className="w-5 h-5" />
          </div>
          <span className="mt-0.5 leading-none">Menu</span>
        </button>
      </nav>
    </div>
  );
};
