import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Mail, Send, CheckCircle2 } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

export const ForgotPassword: React.FC = () => {
  const { success, error } = useToast();
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      error('Email wajib diisi');
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setIsSubmitted(true);
      success('Tautan Terkirim', 'Instruksi reset password telah dikirim ke email Anda.');
    }, 600);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-950 via-emerald-900 to-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl p-8 shadow-2xl border border-emerald-800/40">
        <Link to="/login" className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-emerald-800 mb-6 font-semibold">
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Halaman Login</span>
        </Link>

        {isSubmitted ? (
          <div className="text-center py-6 space-y-3">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-black text-slate-900">Periksa Email Anda</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Kami telah mengirimkan tautan untuk mengatur ulang kata sandi ke <strong>{email}</strong>.
            </p>
            <div className="pt-4">
              <Link to="/login">
                <Button variant="primary" size="md">Kembali ke Login</Button>
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <h2 className="text-xl font-black text-slate-900">Lupa Kata Sandi?</h2>
              <p className="text-xs text-slate-500">
                Masukkan alamat email yang terdaftar untuk menerima tautan pemulihan akun.
              </p>
            </div>

            <Input
              label="Email Terdaftar"
              type="email"
              isRequired
              leftIcon={<Mail className="w-4 h-4" />}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nama@alquraniyyah.sch.id"
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              isLoading={isLoading}
              rightIcon={<Send className="w-4 h-4" />}
            >
              Kirim Tautan Pemulihan
            </Button>
          </form>
        )}
      </div>
    </div>
  );
};
