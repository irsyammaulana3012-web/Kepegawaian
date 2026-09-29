import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarCheck, Search, Filter, Plus, FileSpreadsheet } from 'lucide-react';
import { EmployeeAttendance, AttendanceStatus, Employee } from '../../types';
import { attendanceService } from '../../services/attendanceService';
import { employeeService } from '../../services/employeeService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';

export const AttendanceList: React.FC = () => {
  const navigate = useNavigate();
  const { canEdit } = useAuth();
  const { success, error } = useToast();

  const [records, setRecords] = useState<EmployeeAttendance[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [isLoading, setIsLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [employeeId, setEmployeeId] = useState('');
  const [status, setStatus] = useState<AttendanceStatus>('Hadir');
  const [checkIn, setCheckIn] = useState('07:15');
  const [checkOut, setCheckOut] = useState('16:00');
  const [notes, setNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const loadAttendance = async () => {
    setIsLoading(true);
    try {
      const [attData, empRes] = await Promise.all([
        attendanceService.getAttendance(selectedDate),
        employeeService.getEmployees({ limit: 500 })
      ]);
      setRecords(attData);
      setEmployees(empRes.data);
    } catch (err: any) {
      error('Gagal memuat presensi', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAttendance();
  }, [selectedDate]);

  const handleRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!employeeId) {
      error('Pilih karyawan');
      return;
    }

    setIsSaving(true);
    try {
      await attendanceService.recordAttendance(
        employeeId,
        selectedDate,
        status,
        checkIn || undefined,
        checkOut || undefined,
        notes.trim() || undefined
      );
      success('Presensi Disimpan', 'Data presensi harian berhasil dicatat.');
      setIsModalOpen(false);
      loadAttendance();
    } catch (err: any) {
      error('Gagal Menyimpan', err.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <CalendarCheck className="w-6 h-6 text-emerald-800" />
            <span>Presensi & Absensi Harian Karyawan</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">Catatan kehadiran, dinas, izin, dan rekapitulasi jam kerja</p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            leftIcon={<FileSpreadsheet className="w-4 h-4 text-emerald-800" />}
            onClick={() => navigate('/attendance/generator')}
          >
            Absensi Otomatis & Event
          </Button>

          {canEdit && (
            <Button variant="primary" size="sm" leftIcon={<Plus className="w-4 h-4" />} onClick={() => setIsModalOpen(true)}>
              Catat Kehadiran Baru
            </Button>
          )}
        </div>
      </div>

      <Card noPadding className="p-4 bg-white border border-slate-200">
        <div className="flex items-center gap-4">
          <label className="text-xs font-bold text-slate-700">Pilih Tanggal Presensi:</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="py-1.5 px-3 text-xs rounded-xl border border-slate-200 bg-white"
          />
        </div>
      </Card>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <table className="w-full text-left text-xs text-slate-700 whitespace-nowrap">
          <thead className="bg-slate-50 border-b border-slate-100 font-bold text-slate-600 uppercase text-[11px]">
            <tr>
              <th className="py-3 px-4">Nama Karyawan</th>
              <th className="py-3 px-4">ID</th>
              <th className="py-3 px-4 text-center">Status Kehadiran</th>
              <th className="py-3 px-4">Jam Masuk</th>
              <th className="py-3 px-4">Jam Pulang</th>
              <th className="py-3 px-4">Keterangan</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {records.map((r) => (
              <tr key={r.id} className="hover:bg-slate-50/80">
                <td className="py-3.5 px-4 font-bold text-slate-900">{r.employee_name}</td>
                <td className="py-3.5 px-4 font-mono text-slate-500">{r.employee_number}</td>
                <td className="py-3.5 px-4 text-center">
                  <Badge variant={r.status === 'Hadir' ? 'emerald' : r.status === 'Alpa' ? 'rose' : 'amber'} size="sm">
                    {r.status}
                  </Badge>
                </td>
                <td className="py-3.5 px-4 font-mono">{r.check_in || '-'}</td>
                <td className="py-3.5 px-4 font-mono">{r.check_out || '-'}</td>
                <td className="py-3.5 px-4 text-slate-500">{r.notes || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Catat Presensi Harian">
        <form onSubmit={handleRecord} className="space-y-4">
          <Select
            label="Karyawan"
            isRequired
            value={employeeId}
            onChange={(e) => setEmployeeId(e.target.value)}
            options={[
              { value: '', label: '-- Pilih Karyawan --' },
              ...employees.map(e => ({ value: e.id, label: `${e.full_name} (${e.employee_number})` }))
            ]}
          />
          <Select
            label="Status Kehadiran"
            value={status}
            onChange={(e) => setStatus(e.target.value as any)}
            options={[
              { value: 'Hadir', label: 'Hadir' },
              { value: 'Izin', label: 'Izin' },
              { value: 'Sakit', label: 'Sakit' },
              { value: 'Cuti', label: 'Cuti' },
              { value: 'Dinas', label: 'Dinas Luar' },
              { value: 'Alpa', label: 'Alpa' }
            ]}
          />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Jam Masuk" type="time" value={checkIn} onChange={(e) => setCheckIn(e.target.value)} />
            <Input label="Jam Pulang" type="time" value={checkOut} onChange={(e) => setCheckOut(e.target.value)} />
          </div>
          <Input label="Keterangan" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Alasan izin / dinas" />
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Batal</Button>
            <Button type="submit" variant="primary" isLoading={isSaving}>Simpan</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
