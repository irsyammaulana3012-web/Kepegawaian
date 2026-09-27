import React, { useState, useEffect } from 'react';
import { CalendarOff, Plus, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { EmployeeLeave, LeaveStatus } from '../../types';
import { leaveService } from '../../services/leaveService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Badge } from '../../components/ui/Badge';

interface EmployeeLeaveTabProps {
  employeeId: string;
}

export const EmployeeLeaveTab: React.FC<EmployeeLeaveTabProps> = ({ employeeId }) => {
  const { canEdit, isSuperAdmin, isAdminYayasan } = useAuth();
  const { success, error } = useToast();

  const [leaveList, setLeaveList] = useState<EmployeeLeave[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [leaveType, setLeaveType] = useState('Cuti Tahunan');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [totalDays, setTotalDays] = useState(1);
  const [reason, setReason] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const loadLeave = async () => {
    setIsLoading(true);
    try {
      const data = await leaveService.getLeaveRequests(employeeId);
      setLeaveList(data);
    } catch (err: any) {
      error('Gagal memuat permohonan cuti', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadLeave();
  }, [employeeId]);

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      error('Alasan permohonan cuti wajib diisi');
      return;
    }

    setIsSaving(true);
    try {
      await leaveService.applyLeave({
        employee_id: employeeId,
        leave_type: leaveType,
        start_date: startDate,
        end_date: endDate,
        total_days: totalDays,
        reason: reason.trim()
      });
      success('Permohonan Cuti Diajukan', 'Pengajuan cuti sedang menunggu persetujuan.');
      setIsApplyModalOpen(false);
      setReason('');
      loadLeave();
    } catch (err: any) {
      error('Gagal Mengajukan Cuti', err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateStatus = async (id: string, status: LeaveStatus) => {
    try {
      await leaveService.updateLeaveStatus(id, status);
      success('Status Cuti Diperbarui', `Permohonan cuti telah ${status.toLowerCase()}.`);
      loadLeave();
    } catch (err: any) {
      error('Gagal Memperbarui Status', err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between p-4 rounded-2xl bg-white border border-slate-200">
        <div>
          <h3 className="text-sm font-bold text-slate-900">Pengajuan Cuti & Izin Kerja</h3>
          <p className="text-xs text-slate-500">Cuti tahunan, cuti melahirkan, izin khusus, dan persetujuan yayasan</p>
        </div>
        {canEdit && (
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => setIsApplyModalOpen(true)}
          >
            Ajukan Cuti / Izin
          </Button>
        )}
      </div>

      {leaveList.length === 0 ? (
        <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-500 text-xs">
          Belum ada riwayat permohonan cuti atau izin.
        </div>
      ) : (
        <div className="space-y-3">
          {leaveList.map((item) => (
            <div key={item.id} className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h5 className="font-bold text-slate-900 text-sm">{item.leave_type}</h5>
                    <Badge
                      variant={
                        item.status === 'Disetujui'
                          ? 'emerald'
                          : item.status === 'Pending'
                          ? 'amber'
                          : 'rose'
                      }
                      size="sm"
                    >
                      {item.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Periode: <strong>{new Date(item.start_date).toLocaleDateString('id-ID')}</strong> s/d{' '}
                    <strong>{new Date(item.end_date).toLocaleDateString('id-ID')}</strong> ({item.total_days} Hari)
                  </p>
                </div>

                {/* Approval buttons for Admin */}
                {(isSuperAdmin || isAdminYayasan) && item.status === 'Pending' && (
                  <div className="flex items-center gap-2">
                    <Button
                      variant="primary"
                      size="sm"
                      leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
                      onClick={() => handleUpdateStatus(item.id, 'Disetujui')}
                    >
                      Setujui
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      leftIcon={<XCircle className="w-3.5 h-3.5" />}
                      onClick={() => handleUpdateStatus(item.id, 'Ditolak')}
                    >
                      Tolak
                    </Button>
                  </div>
                )}
              </div>

              <div className="text-xs text-slate-700 bg-slate-50 p-3 rounded-xl">
                <span className="font-bold text-slate-500">Alasan: </span>
                {item.reason}
              </div>

              {item.approver_name && (
                <p className="text-[11px] text-slate-400">
                  Diverifikasi oleh: <strong className="text-slate-600">{item.approver_name}</strong> pada{' '}
                  {new Date(item.approved_at || '').toLocaleDateString('id-ID')}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Apply Modal */}
      <Modal isOpen={isApplyModalOpen} onClose={() => setIsApplyModalOpen(false)} title="Formulir Pengajuan Cuti / Izin">
        <form onSubmit={handleApply} className="space-y-4">
          <Select
            label="Jenis Cuti / Izin"
            value={leaveType}
            onChange={(e) => setLeaveType(e.target.value)}
            options={[
              { value: 'Cuti Tahunan', label: 'Cuti Tahunan' },
              { value: 'Cuti Sakit', label: 'Cuti Sakit' },
              { value: 'Cuti Melahirkan', label: 'Cuti Melahirkan' },
              { value: 'Izin Khusus / Haji / Umroh', label: 'Izin Khusus / Ibadah' },
              { value: 'Dinas Luar Kota', label: 'Dinas Luar Kota' }
            ]}
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Tanggal Mulai"
              isRequired
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
            <Input
              label="Tanggal Selesai"
              isRequired
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>

          <Input
            label="Jumlah Hari Cuti"
            type="number"
            value={totalDays}
            onChange={(e) => setTotalDays(Number(e.target.value))}
            min={1}
          />

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-700 uppercase">Alasan Cuti / Izin *</label>
            <textarea
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 outline-none"
              placeholder="Jelaskan alasan pengajuan dan rencana delegasi tugas..."
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => setIsApplyModalOpen(false)}>Batal</Button>
            <Button type="submit" variant="primary" isLoading={isSaving}>Ajukan Sekarang</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
