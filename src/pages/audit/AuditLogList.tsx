import React, { useState, useEffect } from 'react';
import { History, Search, Clock, ShieldCheck, Filter } from 'lucide-react';
import { AuditLog } from '../../types';
import { auditService } from '../../services/auditService';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';

export const AuditLogList: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [search, setSearch] = useState('');
  const [selectedModule, setSelectedModule] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadLogs = async () => {
      setIsLoading(true);
      try {
        const data = await auditService.getLogs();
        setLogs(data);
      } finally {
        setIsLoading(false);
      }
    };
    loadLogs();
  }, []);

  const filteredLogs = logs.filter((log) => {
    if (selectedModule && log.module !== selectedModule) return false;
    if (search) {
      const q = search.toLowerCase();
      const matchUser = log.user_name.toLowerCase().includes(q);
      const matchAction = log.action.toLowerCase().includes(q);
      const matchDetails = log.details ? JSON.stringify(log.details).toLowerCase().includes(q) : false;
      if (!matchUser && !matchAction && !matchDetails) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div>
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          <History className="w-6 h-6 text-emerald-800" />
          <span>Audit Log Aktivitas & Keamanan Sistem</span>
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Perekaman otomatis seluruh riwayat aktivitas: Login, Tambah/Edit Karyawan, Penugasan, Dokumen, dan Impor Data
        </p>
      </div>

      <Card noPadding className="p-4 bg-white border border-slate-200">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari berdasarkan user, nama aksi, atau rincian..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none"
            />
          </div>

          <select
            value={selectedModule}
            onChange={(e) => setSelectedModule(e.target.value)}
            className="w-full sm:w-48 py-2 px-3 text-xs rounded-xl border border-slate-200 bg-white"
          >
            <option value="">Semua Modul</option>
            <option value="employees">Karyawan</option>
            <option value="assignments">Penugasan</option>
            <option value="documents">Dokumen</option>
            <option value="master">Master Data</option>
            <option value="auth">Autentikasi (Login/Logout)</option>
          </select>
        </div>
      </Card>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="p-6 space-y-4">
            {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} height={45} />)}
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500">
            Tidak ada log aktivitas yang cocok.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700 whitespace-nowrap">
              <thead className="bg-slate-50 border-b border-slate-100 font-bold text-slate-600 uppercase text-[11px]">
                <tr>
                  <th className="py-3 px-4 w-36">Waktu</th>
                  <th className="py-3 px-4">Pengguna (User)</th>
                  <th className="py-3 px-4">Aksi</th>
                  <th className="py-3 px-4">Modul</th>
                  <th className="py-3 px-4">Rincian Perubahan (Details)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/80">
                    <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px]">
                      {new Date(log.created_at).toLocaleString('id-ID', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit'
                      })}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">{log.user_name}</td>
                    <td className="py-3.5 px-4">
                      <Badge
                        variant={
                          log.action.includes('CREATE') || log.action.includes('UPLOAD')
                            ? 'emerald'
                            : log.action.includes('DELETE')
                            ? 'rose'
                            : log.action.includes('LOGIN')
                            ? 'blue'
                            : 'amber'
                        }
                        size="sm"
                      >
                        {log.action}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-700">{log.module}</td>
                    <td className="py-3.5 px-4 text-slate-600 max-w-md truncate">
                      {log.details ? JSON.stringify(log.details).replace(/["{}]/g, ' ') : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
