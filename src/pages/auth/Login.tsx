import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, Mail, ArrowRight, Shield, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { UserRole } from '../../types';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { success, error } = useToast();

  const [email, setEmail] = useState('admin@alquraniyyah.sch.id');
  const [password, setPassword] = useState('password123');
  const [selectedRole, setSelectedRole] = useState<UserRole>('super_admin');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      error('Email wajib diisi');
      return;
    }

    setIsLoading(true);
    try {
      await login(email.trim(), password, selectedRole);
      success('Selamat Datang di SIMKA', 'Login berhasil diverifikasi.');
      navigate('/');
    } catch (err: any) {
      error('Login Gagal', err.message || 'Periksa kembali email dan kata sandi Anda.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickDemo = async (demoEmail: string, demoRole: UserRole) => {
    setEmail(demoEmail);
    setSelectedRole(demoRole);
    setIsLoading(true);
    try {
      await login(demoEmail, 'password123', demoRole);
      success('Login Demo Berhasil', `Masuk sebagai ${demoRole.replace('_', ' ').toUpperCase()}`);
      navigate('/');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-950 via-emerald-900 to-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl p-8 shadow-2xl border border-emerald-800/40 relative overflow-hidden">
        {/* Top Header Logo */}
        <div className="text-center space-y-2 mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-300 flex items-center justify-center text-3xl mx-auto shadow-lg shadow-amber-500/20 border-2 border-amber-300 ring-4 ring-emerald-900/20">
            <span>🕌</span>
          </div>
          <h1 className="text-2xl font-black text-emerald-950 tracking-tight">
            SIMKA Al-Qur'aniyyah
          </h1>
          <p className="text-xs text-slate-500 leading-relaxed">
            Sistem Informasi Manajemen Karyawan<br />
            Yayasan Pendidikan Islam Pondok Pesantren Al-Qur'aniyyah
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email Akun"
            type="email"
            isRequired
            leftIcon={<Mail className="w-4 h-4" />}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@alquraniyyah.sch.id"
          />

          <Input
            label="Kata Sandi (Password)"
            type="password"
            isRequired
            leftIcon={<Lock className="w-4 h-4" />}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-700 uppercase">
              Pilih Role Akun (RBAC)
            </label>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value as UserRole)}
              className="w-full py-2.5 px-3.5 text-xs rounded-xl border border-slate-200 bg-white font-medium focus:ring-emerald-600 focus:border-emerald-600"
            >
              <option value="super_admin">Super Admin (Akses Penuh)</option>
              <option value="admin_yayasan">Admin Yayasan (Semua Unit)</option>
              <option value="hr_kepegawaian">HR / Kepegawaian (Karyawan & Penugasan)</option>
              <option value="admin_unit">Admin Unit (SMP IT / SMA IT)</option>
              <option value="viewer">Viewer (Hanya Melihat Data)</option>
            </select>
          </div>

          <div className="flex items-center justify-between text-xs pt-1">
            <label className="flex items-center gap-2 text-slate-600 cursor-pointer">
              <input type="checkbox" defaultChecked className="rounded text-emerald-800 focus:ring-emerald-600 border-slate-300" />
              <span>Ingat Sesi Saya</span>
            </label>
            <Link to="/forgot-password" className="text-emerald-800 font-semibold hover:underline">
              Lupa Kata Sandi?
            </Link>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full mt-2"
            isLoading={isLoading}
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            Masuk ke Aplikasi SIMKA
          </Button>
        </form>

        {/* Quick Demo Logins Bar */}
        <div className="mt-8 pt-6 border-t border-slate-100 text-center">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2.5">
            Akses Cepat Uji Coba Demo:
          </p>
          <div className="flex flex-wrap items-center justify-center gap-1.5">
            <button
              onClick={() => handleQuickDemo('admin@alquraniyyah.sch.id', 'super_admin')}
              className="text-[10px] font-bold px-2 py-1 rounded-lg bg-emerald-50 text-emerald-900 border border-emerald-200 hover:bg-emerald-100"
            >
              Super Admin
            </button>
            <button
              onClick={() => handleQuickDemo('nasrullah@alquraniyyah.sch.id', 'admin_yayasan')}
              className="text-[10px] font-bold px-2 py-1 rounded-lg bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100"
            >
              Admin Yayasan
            </button>
            <button
              onClick={() => handleQuickDemo('hr@alquraniyyah.sch.id', 'hr_kepegawaian')}
              className="text-[10px] font-bold px-2 py-1 rounded-lg bg-blue-50 text-blue-900 border border-blue-200 hover:bg-blue-100"
            >
              HR Kepegawaian
            </button>
            <button
              onClick={() => handleQuickDemo('viewer@alquraniyyah.sch.id', 'viewer')}
              className="text-[10px] font-bold px-2 py-1 rounded-lg bg-slate-100 text-slate-800 border border-slate-200 hover:bg-slate-200"
            >
              Viewer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
