import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Briefcase,
  GraduationCap,
  FolderLock,
  CalendarCheck,
  CalendarOff,
  FileSignature,
  BarChart3,
  FileSpreadsheet,
  Building2,
  Network,
  UserCheck,
  ListTodo,
  ShieldAlert,
  Settings,
  History,
  X,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { canManageMaster, isSuperAdmin, role } = useAuth();

  const navGroups = [
    {
      title: 'UTAMA',
      items: [
        { label: 'Dashboard', path: '/', icon: <LayoutDashboard className="w-4 h-4" /> }
      ]
    },
    {
      title: 'DATA KARYAWAN',
      items: [
        { label: 'Semua Karyawan', path: '/employees', icon: <Users className="w-4 h-4" /> },
        { label: 'Penugasan (Multi-Unit)', path: '/assignments', icon: <Briefcase className="w-4 h-4" />, highlight: true },
        { label: 'Pendidikan', path: '/education', icon: <GraduationCap className="w-4 h-4" /> },
        { label: 'Dokumen Karyawan', path: '/documents', icon: <FolderLock className="w-4 h-4" /> }
      ]
    },
    {
      title: 'KEPEGAWAIAN',
      items: [
        { label: 'Presensi Harian', path: '/attendance', icon: <CalendarCheck className="w-4 h-4" /> },
        { label: 'Absensi Otomatis & Event', path: '/attendance/generator', icon: <FileSpreadsheet className="w-4 h-4" />, highlight: true },
        { label: 'Cuti & Izin', path: '/leave', icon: <CalendarOff className="w-4 h-4" /> },
        { label: 'Kontrak Berakhir', path: '/contracts', icon: <FileSignature className="w-4 h-4" /> }
      ]
    },
    {
      title: 'LAPORAN & EXPORT',
      items: [
        { label: 'Laporan Rekapitulasi', path: '/reports', icon: <BarChart3 className="w-4 h-4" /> },
        { label: 'Import / Export Excel', path: '/import-export', icon: <FileSpreadsheet className="w-4 h-4" /> }
      ]
    },
    {
      title: 'MASTER DATA',
      restricted: !canManageMaster,
      items: [
        { label: 'Unit Yayasan & Lembaga', path: '/master/units', icon: <Building2 className="w-4 h-4" /> },
        { label: 'Divisi / Bagian', path: '/master/departments', icon: <Network className="w-4 h-4" /> },
        { label: 'Jabatan', path: '/master/positions', icon: <UserCheck className="w-4 h-4" /> },
        { label: 'Tugas Pokok & Fungsi', path: '/master/tasks', icon: <ListTodo className="w-4 h-4" /> }
      ]
    },
    {
      title: 'SISTEM & AUDIT',
      items: [
        { label: 'Audit Log Aktivitas', path: '/audit-logs', icon: <History className="w-4 h-4" /> },
        ...(isSuperAdmin ? [{ label: 'User & Permission', path: '/users', icon: <ShieldAlert className="w-4 h-4" /> }] : []),
        { label: 'Pengaturan', path: '/settings', icon: <Settings className="w-4 h-4" /> }
      ]
    }
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 lg:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-emerald-950 text-slate-100 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } border-r border-emerald-900/50 shadow-2xl lg:shadow-none`}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-emerald-900/60 bg-emerald-900/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-300 flex items-center justify-center text-emerald-950 font-black text-xl shadow-lg shadow-amber-500/20 ring-2 ring-amber-400/30">
              <span>🕌</span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-white tracking-wider text-base font-sans">SIMKA</span>
                <span className="text-[10px] bg-amber-500/20 text-amber-300 font-bold px-1.5 py-0.5 rounded border border-amber-500/30">v1.0</span>
              </div>
              <p className="text-[11px] text-emerald-300/80 font-medium truncate max-w-[160px]">
                Al-Qur'aniyyah
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg text-emerald-300 hover:bg-emerald-900 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Multi-Assignment Highlight Banner */}
        <div className="mx-4 mt-3 p-2.5 rounded-xl bg-gradient-to-r from-emerald-900 to-emerald-800/80 border border-emerald-700/40 text-[11px] flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
          <span className="text-emerald-100 font-medium">
            1 Karyawan = Multi-Penugasan
          </span>
        </div>

        {/* Navigation Links (Scrollable) */}
        <nav className="flex-1 overflow-y-auto px-4 py-4 space-y-6 scrollbar-thin scrollbar-thumb-emerald-800">
          {navGroups.map((group, groupIdx) => {
            if (group.restricted) return null;

            return (
              <div key={groupIdx}>
                <p className="px-3 text-[10px] font-bold tracking-widest text-emerald-400/70 uppercase mb-2">
                  {group.title}
                </p>
                <div className="space-y-1">
                  {group.items.map((item, itemIdx) => (
                    <NavLink
                      key={itemIdx}
                      to={item.path}
                      onClick={() => {
                        if (window.innerWidth < 1024) onClose();
                      }}
                      className={({ isActive }) =>
                        `flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all duration-150 ${
                          isActive
                            ? 'bg-emerald-800 text-white font-bold shadow-md shadow-emerald-950/40 border-l-4 border-amber-400'
                            : 'text-emerald-100/80 hover:bg-emerald-900/60 hover:text-white'
                        }`
                      }
                    >
                      <div className="flex items-center gap-3">
                        <span className="shrink-0">{item.icon}</span>
                        <span>{item.label}</span>
                      </div>
                      {item.highlight && (
                        <span className="text-[9px] bg-amber-400 text-emerald-950 font-bold px-1.5 py-0.2 rounded-full shadow-sm">
                          Core
                        </span>
                      )}
                    </NavLink>
                  ))}
                </div>
              </div>
            );
          })}
        </nav>

        {/* User Session Info Footer */}
        <div className="p-4 border-t border-emerald-900/60 bg-emerald-900/30">
          <div className="text-[11px] text-emerald-300/80">
            <p className="text-white font-semibold truncate">Pesantren Al-Qur'aniyyah</p>
            <p className="text-[10px] text-emerald-400/70 capitalize mt-0.5">Role: {role.replace('_', ' ')}</p>
          </div>
        </div>
      </aside>
    </>
  );
};
