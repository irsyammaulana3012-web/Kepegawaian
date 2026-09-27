import React, { useState, useEffect } from 'react';
import { CalendarCheck, Plus, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { EmployeeAttendance, AttendanceStatus } from '../../types';
import { attendanceService } from '../../services/attendanceService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Badge } from '../../components/ui/Badge';

interface EmployeeAttendanceTabProps {
  employeeId: string;
}

export const EmployeeAttendanceTab: React.FC<EmployeeAttendanceTabProps> = ({ employeeId }) => {
  const { canEdit } = useAuth();
  const { success, error } = useToast();

  const [records, setRecords] = useState<EmployeeAttendance[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [status, setStatus] = useState<AttendanceStatus>('Hadir');
  const [checkIn, setCheckIn] = useState('07:15');
  const [checkOut, setCheckOut] = useState('16:00');
  const [notes, setNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const loadAttendance = async () => {
    setIsLoading(true);
    try {
      const data = await attendanceService.getAttendance(undefined, employeeId);
      setRecords(data);
    } catch (err: any) {
      error('Gagal memuat absensi', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAttendance();
  }, [employeeId]);

  const handleRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await attendanceService.recordAttendance(
        employeeId,
        date,
        status,
        checkIn || undefined,
        checkOut || undefined,
        notes.trim() || undefined
      );
      success('Absensi Disimpan', `Presensi tanggal ${date} berhasil dicatat.`);
      setIsModalOpen(false);
      loadAttendance();
    } catch (err: any) {
      error('Gagal Menyimpan Absensi', err.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between p-4 rounded-2xl bg-white border border-slate-200">
        <div>
          <h3 className="text-sm font-bold text-slate-900">Rekap Presensi & Kehadiran</h3>
          <p className="text-xs text-slate-500">Catatan jam masuk, jam pulang, dan status kehadiran kerja</p>
        </div>
        {canEdit && (
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => setIsModalOpen(true)}
          >
            Catat Presensi
          </Button>
        )}
      </div>

      {records.length === 0 ? (
        <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-500 text-xs">
          Belum ada catatan presensi untuk karyawan ini.
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 border-b border-slate-100 font-bold text-slate-600 text-[11px] uppercase">
              <tr>
                <th className="py-3 px-4">Tanggal</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Jam Masuk</th>
                <th className="py-3 px-4">Jam Pulang</th>
                <th className="py-3 px-4">Keterangan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {records.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50/50">
                  <td className="py-3 px-4 font-medium text-slate-900">
                    {new Date(r.date).toLocaleDateString('id-ID', { dateStyle: 'full' })}
                  </td>
                  <td className="py-3 px-4">
                    <Badge
                      variant={
                        r.status === 'Hadir'
                          ? 'emerald'
                          : r.status === 'Izin' || r.status === 'Sakit' || r.status === 'Cuti'
                          ? 'amber'
                          : r.status === 'Dinas'
                          ? 'blue'
                          : 'rose'
                      }
                      size="sm"
                    >
                      {r.status}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 font-mono">{r.check_in || '-'}</td>
                  <td className="py-3 px-4 font-mono">{r.check_out || '-'}</td>
                  <td className="py-3 px-4 text-slate-500">{r.notes || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Record Attendance Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Catat Presensi Karyawan">
        <form onSubmit={handleRecord} className="space-y-4">
          <Input
            label="Tanggal"
            isRequired
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />

          <Select
            label="Status Kehadiran"
            value={status}
            onChange={(e) => setStatus(e.target.value as AttendanceStatus)}
            options={[
              { value: 'Hadir', label: 'Hadir' },
              { value: 'Izin', label: 'Izin' },
              { value: 'Sakit', label: 'Sakit' },
              { value: 'Cuti', label: 'Cuti' },
              { value: 'Dinas', label: 'Dinas Luar' },
              { value: 'Alpa', label: 'Alpa (Tanpa Keterangan)' }
            ]}
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Jam Masuk"
              type="time"
              value={checkIn}
              onChange={(e) => setCheckIn(e.target.value)}
            />
            <Input
              label="Jam Pulang"
              type="time"
              value={checkOut}
              onChange={(e) => setCheckOut(e.target.value)}
            />
          </div>

          <Input
            label="Keterangan (Opsional)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Keterangan tugas luar / alasan izin"
          />

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Batal</Button>
            <Button type="submit" variant="primary" isLoading={isSaving}>Simpan Presensi</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
