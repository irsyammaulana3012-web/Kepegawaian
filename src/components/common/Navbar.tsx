import React, { useState } from 'react';
import { Menu, LogOut, Shield, ChevronDown, Database, Check } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';
import { isConfigured } from '../../lib/supabase';

interface NavbarProps {
  onOpenSidebar: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenSidebar }) => {
  const { user, role, switchUserRole, logout } = useAuth();
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);

  const rolesList: { role: UserRole; label: string; desc: string }[] = [
    { role: 'super_admin', label: 'Super Admin', desc: 'Akses penuh seluruh modul sistem' },
    { role: 'admin_yayasan', label: 'Admin Yayasan', desc: 'Pengelola data seluruh yayasan & unit' },
    { role: 'hr_kepegawaian', label: 'HR / Kepegawaian', desc: 'Pengelola karyawan & penugasan' },
    { role: 'admin_unit', label: 'Admin Unit (SMP IT)', desc: 'Pengelola unit tertentu' },
    { role: 'viewer', label: 'Viewer / Tamu', desc: 'Hanya melihat data terotorisasi' }
  ];

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200/80 bg-white/95 px-3 sm:px-6 backdrop-blur-md">
      {/* Left: Mobile Menu & Title */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1 mr-2">
        <button
          onClick={onOpenSidebar}
          className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition shrink-0"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="min-w-0 flex-1">
          <h1 className="text-xs sm:text-base font-extrabold text-emerald-950 flex items-center gap-1.5 leading-tight">
            <span className="sm:hidden font-black text-emerald-900 truncate">SIMKA Al-Qur'aniyyah</span>
            <span className="hidden sm:inline truncate">Yayasan Pendidikan Islam Pondok Pesantren Al-Qur'aniyyah</span>
          </h1>
          <p className="text-[11px] text-slate-500 hidden md:block truncate mt-0.5">
            Sistem Informasi Manajemen Database Pusat Karyawan & Multi-Penugasan
          </p>
        </div>
      </div>

      {/* Right: Role Switcher, Database Status, User Profile & Logout */}
      <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
        {/* Database Mode Status */}
        <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-[11px] font-medium text-slate-700">
          <Database className="w-3.5 h-3.5 text-emerald-600" />
          <span>{isConfigured ? 'Supabase Live' : 'Local DB'}</span>
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        </div>

        {/* Role Switcher Dropdown (Interactive Role Testing) */}
        <div className="relative">
          <button
            onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
            className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 rounded-xl border border-amber-200 bg-amber-50/70 text-amber-900 text-xs font-semibold hover:bg-amber-100 transition shadow-sm"
          >
            <Shield className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span className="capitalize text-[11px] sm:text-xs max-w-[70px] sm:max-w-none truncate">{role.replace('_', ' ')}</span>
            <ChevronDown className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-700 shrink-0" />
          </button>

          {isRoleDropdownOpen && (
            <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white p-2 shadow-2xl border border-slate-100 text-xs z-50 animate-in fade-in zoom-in-95">
              <div className="px-3 py-2 border-b border-slate-100 mb-1">
                <p className="font-bold text-slate-900">Uji Coba Hak Akses (Role)</p>
                <p className="text-[10px] text-slate-500">Pilih role untuk menguji perizinan tampilan & fitur:</p>
              </div>
              {rolesList.map((item) => (
                <button
                  key={item.role}
                  onClick={() => {
                    switchUserRole(item.role);
                    setIsRoleDropdownOpen(false);
                  }}
                  className={`w-full flex items-start gap-2.5 px-3 py-2 rounded-xl text-left transition ${
                    role === item.role ? 'bg-emerald-50 text-emerald-950 font-bold' : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="pt-0.5">
                    {role === item.role ? (
                      <Check className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border border-slate-300" />
                    )}
                  </div>
                  <div>
                    <p className="font-semibold">{item.label}</p>
                    <p className="text-[10px] text-slate-500 font-normal">{item.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* User Avatar & Logout */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
          <div className="w-8 h-8 rounded-xl bg-emerald-800 text-white font-bold flex items-center justify-center text-xs shadow-sm">
            {user?.full_name ? user.full_name.charAt(0).toUpperCase() : 'A'}
          </div>
          <div className="hidden xl:block text-left">
            <p className="text-xs font-bold text-slate-800 leading-tight truncate max-w-[130px]">
              {user?.full_name || 'Admin SIMKA'}
            </p>
            <p className="text-[10px] text-slate-500 truncate">{user?.email || 'admin@alquraniyyah.sch.id'}</p>
          </div>
          <button
            onClick={() => logout()}
            title="Keluar"
            className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition ml-1"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
