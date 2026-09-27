import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileSignature, AlertTriangle, Clock, Eye, Calendar } from 'lucide-react';
import { employeeService } from '../../services/employeeService';
import { DashboardStats } from '../../types';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';

export const ExpiringContracts: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      setIsLoading(true);
      try {
        const data = await employeeService.getDashboardStats();
        setStats(data);
      } finally {
        setIsLoading(false);
      }
    };
    loadStats();
  }, []);

  const expiringList = stats?.expiring_contracts || [];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div>
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          <FileSignature className="w-6 h-6 text-amber-700" />
          <span>Monitoring Kontrak Kerja Karyawan</span>
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Deteksi dini kontrak kerja yang akan berakhir dalam kurun waktu ≤30 hari, ≤60 hari, dan ≤90 hari
        </p>
      </div>

      {expiringList.length === 0 ? (
        <Card className="text-center py-12">
          <div className="p-4 rounded-full bg-emerald-100 text-emerald-800 w-16 h-16 flex items-center justify-center mx-auto mb-3">
            <Clock className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-slate-900">Semua Kontrak Aman</h3>
          <p className="text-xs text-slate-500 mt-1">Tidak ada karyawan kontrak yang masa berlakunya berakhir dalam 90 hari ke depan.</p>
        </Card>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <table className="w-full text-left text-xs text-slate-700 whitespace-nowrap">
            <thead className="bg-slate-50 border-b border-slate-100 font-bold text-slate-600 uppercase text-[11px]">
              <tr>
                <th className="py-3 px-4 w-12 text-center">No</th>
                <th className="py-3 px-4">Nama Karyawan</th>
                <th className="py-3 px-4">ID Karyawan</th>
                <th className="py-3 px-4">Tanggal Akhir Kontrak</th>
                <th className="py-3 px-4 text-center">Sisa Waktu</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {expiringList.map((c, idx) => (
                <tr key={c.id} className="hover:bg-slate-50/80">
                  <td className="py-3.5 px-4 text-center font-bold text-slate-400">{idx + 1}</td>
                  <td className="py-3.5 px-4 font-bold text-slate-900">{c.name}</td>
                  <td className="py-3.5 px-4 font-mono text-slate-500">{c.number}</td>
                  <td className="py-3.5 px-4 font-bold text-slate-800">
                    {new Date(c.end_date).toLocaleDateString('id-ID', { dateStyle: 'full' })}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <Badge variant={c.days_left <= 30 ? 'rose' : c.days_left <= 60 ? 'amber' : 'gold'} size="sm">
                      {c.days_left <= 0 ? 'Kontrak Telah Berakhir' : `Tersisa ${c.days_left} Hari`}
                    </Badge>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      leftIcon={<Eye className="w-3.5 h-3.5" />}
                      onClick={() => navigate(`/employees/${c.employee_id}`)}
                    >
                      Buka Profil
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
