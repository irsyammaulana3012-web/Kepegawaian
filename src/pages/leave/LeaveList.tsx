import React, { useState, useEffect } from 'react';
import { CalendarOff, CheckCircle2, XCircle } from 'lucide-react';
import { EmployeeLeave, LeaveStatus } from '../../types';
import { leaveService } from '../../services/leaveService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Card } from '../../components/ui/Card';

export const LeaveList: React.FC = () => {
  const { isSuperAdmin, isAdminYayasan } = useAuth();
  const { success, error } = useToast();

  const [leaveList, setLeaveList] = useState<EmployeeLeave[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await leaveService.getLeaveRequests();
      setLeaveList(data);
    } catch (err: any) {
      error('Gagal memuat permohonan cuti', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleUpdateStatus = async (id: string, status: LeaveStatus) => {
    try {
      await leaveService.updateLeaveStatus(id, status);
      success('Status Diperbarui', `Permohonan cuti telah ${status.toLowerCase()}.`);
      loadData();
    } catch (err: any) {
      error('Gagal Memperbarui', err.message);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div>
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          <CalendarOff className="w-6 h-6 text-emerald-800" />
          <span>Pengelolaan Cuti & Izin Karyawan</span>
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">Daftar permohonan cuti dan persetujuan yayasan</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <table className="w-full text-left text-xs text-slate-700 whitespace-nowrap">
          <thead className="bg-slate-50 border-b border-slate-100 font-bold text-slate-600 uppercase text-[11px]">
            <tr>
              <th className="py-3 px-4">Karyawan</th>
              <th className="py-3 px-4">Jenis Cuti</th>
              <th className="py-3 px-4">Periode</th>
              <th className="py-3 px-4">Durasi</th>
              <th className="py-3 px-4">Alasan</th>
              <th className="py-3 px-4 text-center">Status</th>
              <th className="py-3 px-4 text-right">Verifikasi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {leaveList.map((l) => (
              <tr key={l.id} className="hover:bg-slate-50/80">
                <td className="py-3.5 px-4 font-bold text-slate-900">{l.employee_name}</td>
                <td className="py-3.5 px-4 font-semibold text-emerald-800">{l.leave_type}</td>
                <td className="py-3.5 px-4">
                  {new Date(l.start_date).toLocaleDateString('id-ID')} s/d {new Date(l.end_date).toLocaleDateString('id-ID')}
                </td>
                <td className="py-3.5 px-4 font-bold">{l.total_days} Hari</td>
                <td className="py-3.5 px-4 text-slate-500 max-w-xs truncate">{l.reason}</td>
                <td className="py-3.5 px-4 text-center">
                  <Badge variant={l.status === 'Disetujui' ? 'emerald' : l.status === 'Pending' ? 'amber' : 'rose'} size="sm">
                    {l.status}
                  </Badge>
                </td>
                <td className="py-3.5 px-4 text-right">
                  {(isSuperAdmin || isAdminYayasan) && l.status === 'Pending' ? (
                    <div className="flex items-center justify-end gap-1.5">
                      <Button variant="primary" size="sm" onClick={() => handleUpdateStatus(l.id, 'Disetujui')}>
                        Setujui
                      </Button>
                      <Button variant="danger" size="sm" onClick={() => handleUpdateStatus(l.id, 'Ditolak')}>
                        Tolak
                      </Button>
                    </div>
                  ) : (
                    <span className="text-[11px] text-slate-400">{l.approver_name || '-'}</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
