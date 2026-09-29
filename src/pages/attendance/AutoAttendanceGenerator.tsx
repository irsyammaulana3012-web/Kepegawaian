import React, { useState, useEffect, useMemo } from 'react';
import {
  FileSpreadsheet,
  Printer,
  Download,
  CheckSquare,
  Square,
  Users,
  Calendar,
  Clock,
  MapPin,
  Building2,
  Search,
  Filter,
  CheckCircle2,
  Sparkles,
  Save,
  Layers,
  ArrowRight,
  Eye,
  Settings2
} from 'lucide-react';
import { Employee, Unit } from '../../types';
import { employeeService } from '../../services/employeeService';
import { masterDataService } from '../../services/masterDataService';
import { attendanceService } from '../../services/attendanceService';
import { exportService } from '../../services/exportService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';

export const AutoAttendanceGenerator: React.FC = () => {
  const { canEdit } = useAuth();
  const { success, error, info } = useToast();

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Active View Mode: 'builder' | 'preview'
  const [viewMode, setViewMode] = useState<'builder' | 'preview'>('builder');

  // Event Configuration
  const [eventName, setEventName] = useState('Rapat Koordinasi & Pembinaan Karyawan Yayasan');
  const [eventDate, setEventDate] = useState(new Date().toISOString().split('T')[0]);
  const [eventTime, setEventTime] = useState('08.00 WIB s/d Selesai');
  const [eventLocation, setEventLocation] = useState('Aula Utama Pondok Pesantren Al-Qur\'aniyyah');
  const [leadPerson, setLeadPerson] = useState('Pimpinan Yayasan / Mudir Pesantren');

  // Filter States for Selection Table
  const [search, setSearch] = useState('');
  const [selectedUnit, setSelectedUnit] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  // Selected Employee IDs (Checked for Attendance Sheet)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isRecording, setIsRecording] = useState(false);

  // Load employees and units
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [empRes, unitRes] = await Promise.all([
          employeeService.getEmployees({ limit: 1000 }),
          masterDataService.getUnits()
        ]);
        setEmployees(empRes.data);
        setUnits(unitRes);

        // Default: select all active employees
        const initialSelected = new Set(empRes.data.filter(e => e.is_active).map(e => e.id));
        setSelectedIds(initialSelected);
      } catch (err: any) {
        error('Gagal memuat data karyawan', err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // Filtered employees for selection list
  const filteredEmployees = useMemo(() => {
    return employees.filter(emp => {
      const matchSearch =
        !search ||
        emp.full_name.toLowerCase().includes(search.toLowerCase()) ||
        emp.nik.includes(search) ||
        (emp.employee_number && emp.employee_number.toLowerCase().includes(search.toLowerCase())) ||
        (emp.units_list && emp.units_list.some(u => u.toLowerCase().includes(search.toLowerCase())));

      const matchUnit =
        selectedUnit === 'all' ||
        (emp.units_list && emp.units_list.some(u => {
          const unitObj = units.find(unit => unit.id === selectedUnit);
          return unitObj && u.toLowerCase() === unitObj.name.toLowerCase();
        }));

      const matchStatus =
        selectedStatus === 'all' || emp.employment_status === selectedStatus;

      return matchSearch && matchUnit && matchStatus;
    });
  }, [employees, search, selectedUnit, selectedStatus, units]);

  // Selected attendees list for preview and print
  const selectedAttendees = useMemo(() => {
    return employees
      .filter(emp => selectedIds.has(emp.id))
      .map((emp, index) => {
        // Resolve primary assignment task or position
        const unitName = emp.primary_assignment?.unit_name || emp.units_list?.[0] || 'Yayasan';
        const taskName = emp.primary_assignment?.task_name || emp.primary_assignment?.position_name || emp.positions_list?.[0] || 'Staff';

        return {
          no: index + 1,
          id: emp.id,
          name: emp.full_name,
          employee_number: emp.employee_number,
          nik: emp.nik,
          unit: unitName,
          task: taskName,
          gender: emp.gender,
          employment_status: emp.employment_status
        };
      });
  }, [employees, selectedIds]);

  // Checkbox handlers
  const handleToggleSelect = (id: string) => {
    const updated = new Set(selectedIds);
    if (updated.has(id)) {
      updated.delete(id);
    } else {
      updated.add(id);
    }
    setSelectedIds(updated);
  };

  const handleSelectAllFiltered = () => {
    const updated = new Set(selectedIds);
    filteredEmployees.forEach(emp => updated.add(emp.id));
    setSelectedIds(updated);
    info('Karyawan Dipilih', `${filteredEmployees.length} karyawan terfilter telah ditandai.`);
  };

  const handleDeselectAllFiltered = () => {
    const updated = new Set(selectedIds);
    filteredEmployees.forEach(emp => updated.delete(emp.id));
    setSelectedIds(updated);
  };

  const handleQuickPreset = (name: string, location: string, time: string) => {
    setEventName(name);
    setEventLocation(location);
    setEventTime(time);
  };

  // Export to Excel
  const handleExportExcel = () => {
    if (selectedAttendees.length === 0) {
      error('Tidak ada peserta', 'Pilih minimal 1 karyawan untuk diikutsertakan dalam absensi.');
      return;
    }

    const formattedDate = new Date(eventDate).toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });

    exportService.exportEventAttendanceToExcel(
      {
        name: eventName,
        date: formattedDate,
        time: eventTime,
        location: eventLocation,
        leadName: leadPerson
      },
      selectedAttendees.map(a => ({
        no: a.no,
        name: a.name,
        unit: a.unit,
        task: a.task
      }))
    );

    success('Excel Berhasil Dibuat', 'Lembar daftar hadir kegiatan telah diunduh.');
  };

  // Record Attendance to DB
  const handleRecordToDatabase = async () => {
    if (selectedAttendees.length === 0) {
      error('Tidak ada karyawan terpilih');
      return;
    }

    setIsRecording(true);
    try {
      const count = await attendanceService.recordBulkAttendance(
        Array.from(selectedIds),
        eventDate,
        'Hadir',
        eventName
      );

      success(
        'Presensi Berhasil Dicatat!',
        `Kehadiran ${count} karyawan untuk kegiatan "${eventName}" pada tanggal ${eventDate} berhasil disimpan ke database presensi.`
      );
    } catch (err: any) {
      error('Gagal Mencatat Presensi', err.message);
    } finally {
      setIsRecording(false);
    }
  };

  // Trigger Native Print
  const handlePrint = () => {
    window.print();
  };

  const formattedEventDate = new Date(eventDate).toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-in fade-in duration-200">
      {/* Print Stylesheet Overrides */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-attendance-sheet, #printable-attendance-sheet * {
            visibility: visible;
          }
          #printable-attendance-sheet {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0;
            padding: 15mm;
            background: white !important;
            color: black !important;
            font-family: 'Times New Roman', Times, serif;
          }
          .no-print {
            display: none !important;
          }
          @page {
            size: A4 portrait;
            margin: 10mm;
          }
        }
      `}</style>

      {/* Page Header (Hidden on Print) */}
      <div className="no-print flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <FileSpreadsheet className="w-6 h-6 text-emerald-800" />
              <span>Absensi Otomatis & Generator Lembar Hadir Kegiatan</span>
            </h2>
            <Badge variant="emerald" size="sm">
              Event Attendance
            </Badge>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Buat formulir daftar hadir kegiatan resmi dengan kolom No, Nama, Unit, Tugas, dan Paraf berselang-seling
          </p>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl border border-slate-200 shadow-inner">
          <button
            onClick={() => setViewMode('builder')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              viewMode === 'builder'
                ? 'bg-white text-emerald-950 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Settings2 className="w-3.5 h-3.5" />
            <span>Pengaturan & Ceklis</span>
          </button>
          <button
            onClick={() => setViewMode('preview')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              viewMode === 'preview'
                ? 'bg-emerald-800 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Pratinjau Lembar Hadir ({selectedAttendees.length})</span>
          </button>
        </div>
      </div>

      {/* VIEW MODE 1: BUILDER & SELECTION */}
      {viewMode === 'builder' && (
        <div className="no-print space-y-6">
          {/* Card 1: Event Details */}
          <Card
            title="1. Masukan Rincian Acara / Kegiatan"
            subtitle="Tentukan nama acara, jadwal pelaksanaan, lokasi, dan penanggung jawab kegiatan"
          >
            <div className="space-y-4">
              {/* Presets */}
              <div className="flex flex-wrap items-center gap-2 pb-2 border-b border-slate-100">
                <span className="text-xs font-bold text-slate-600 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  Template Acara Cepat:
                </span>
                <button
                  type="button"
                  onClick={() => handleQuickPreset('Rapat Kerja Dewan Guru & Karyawan Yayasan', 'Aula Utama Pesantren', '08.00 - 12.00 WIB')}
                  className="px-2.5 py-1 text-[11px] font-semibold bg-emerald-50 text-emerald-800 rounded-lg hover:bg-emerald-100 transition border border-emerald-200"
                >
                  Rapat Kerja Guru & Staf
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickPreset('Halaqah & Pembinaan Bulanan Asatidz', 'Masjid Jami\' Pesantren', '13.30 - 15.30 WIB')}
                  className="px-2.5 py-1 text-[11px] font-semibold bg-amber-50 text-amber-800 rounded-lg hover:bg-amber-100 transition border border-amber-200"
                >
                  Halaqah & Pembinaan
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickPreset('Upacara & Apel Peringatan Hari Santri', 'Lapangan Utama Pesantren', '07.00 - 08.30 WIB')}
                  className="px-2.5 py-1 text-[11px] font-semibold bg-purple-50 text-purple-800 rounded-lg hover:bg-purple-100 transition border border-purple-200"
                >
                  Upacara & Apel Akbar
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Nama Acara / Kegiatan"
                  value={eventName}
                  onChange={(e) => setEventName(e.target.value)}
                  placeholder="Contoh: Rapat Evaluasi Program Semester Ganjil"
                  required
                />

                <Input
                  label="Tanggal Pelaksanaan"
                  type="date"
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Input
                  label="Waktu / Jam"
                  value={eventTime}
                  onChange={(e) => setEventTime(e.target.value)}
                  placeholder="Contoh: 08.00 WIB s/d Selesai"
                />

                <Input
                  label="Tempat / Lokasi"
                  value={eventLocation}
                  onChange={(e) => setEventLocation(e.target.value)}
                  placeholder="Contoh: Aula Serbaguna Pesantren"
                />

                <Input
                  label="Penanggung Jawab / Pimpinan"
                  value={leadPerson}
                  onChange={(e) => setLeadPerson(e.target.value)}
                  placeholder="Contoh: Mudir Pesantren / Ketua Panitia"
                />
              </div>
            </div>
          </Card>

          {/* Card 2: Filter & Employee Selection Checkbox Table */}
          <Card
            title="2. Validasi & Seleksi Karyawan (Ceklis Keikutsertaan)"
            subtitle="Centang atau hilangkan centang pada karyawan yang ingin diikutsertakan dalam lembar absensi ini"
            action={
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSelectAllFiltered}
                  leftIcon={<CheckSquare className="w-3.5 h-3.5 text-emerald-700" />}
                >
                  Pilih Semua Terfilter
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDeselectAllFiltered}
                  leftIcon={<Square className="w-3.5 h-3.5 text-slate-400" />}
                >
                  Batal Pilih
                </Button>
              </div>
            }
          >
            <div className="space-y-4">
              {/* Filter Row */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div className="w-full sm:w-72 relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Cari nama, NIK, tugas..."
                    className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white focus:ring-emerald-600 focus:border-emerald-600"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                  <select
                    value={selectedUnit}
                    onChange={(e) => setSelectedUnit(e.target.value)}
                    className="py-1.5 px-2.5 text-xs rounded-lg border border-slate-200 bg-white focus:ring-emerald-600 font-medium"
                  >
                    <option value="all">Semua Unit Penugasan</option>
                    {units.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name}
                      </option>
                    ))}
                  </select>

                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="py-1.5 px-2.5 text-xs rounded-lg border border-slate-200 bg-white focus:ring-emerald-600 font-medium"
                  >
                    <option value="all">Semua Status</option>
                    <option value="Tetap">Tetap</option>
                    <option value="Kontrak">Kontrak</option>
                    <option value="Honorer">Honorer</option>
                  </select>

                  <Badge variant="gold" size="sm">
                    Terpilih: {selectedIds.size} / {employees.length}
                  </Badge>
                </div>
              </div>

              {/* Table with Checkboxes */}
              <div className="overflow-x-auto max-h-96 overflow-y-auto border border-slate-200 rounded-xl">
                <table className="w-full text-left text-xs text-slate-700 whitespace-nowrap">
                  <thead className="bg-slate-100/80 sticky top-0 z-10 border-b border-slate-200 font-bold text-slate-700 uppercase text-[11px]">
                    <tr>
                      <th className="py-2.5 px-3 w-10 text-center">
                        <input
                          type="checkbox"
                          checked={filteredEmployees.length > 0 && filteredEmployees.every(e => selectedIds.has(e.id))}
                          onChange={(e) => {
                            if (e.target.checked) handleSelectAllFiltered();
                            else handleDeselectAllFiltered();
                          }}
                          className="rounded border-slate-300 text-emerald-700 focus:ring-emerald-600 cursor-pointer"
                        />
                      </th>
                      <th className="py-2.5 px-3 w-12">No</th>
                      <th className="py-2.5 px-3">Nama Karyawan</th>
                      <th className="py-2.5 px-3">Unit Penugasan</th>
                      <th className="py-2.5 px-3">Tugas / Jabatan Utama</th>
                      <th className="py-2.5 px-3 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredEmployees.map((emp, idx) => {
                      const isChecked = selectedIds.has(emp.id);
                      const unitName = emp.primary_assignment?.unit_name || emp.units_list?.[0] || 'Yayasan';
                      const taskName = emp.primary_assignment?.task_name || emp.primary_assignment?.position_name || emp.positions_list?.[0] || 'Staff';

                      return (
                        <tr
                          key={emp.id}
                          onClick={() => handleToggleSelect(emp.id)}
                          className={`cursor-pointer transition ${
                            isChecked ? 'bg-emerald-50/40 hover:bg-emerald-50/70' : 'hover:bg-slate-50'
                          }`}
                        >
                          <td className="py-2.5 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => handleToggleSelect(emp.id)}
                              className="rounded border-slate-300 text-emerald-700 focus:ring-emerald-600 cursor-pointer"
                            />
                          </td>
                          <td className="py-2.5 px-3 text-slate-400 font-mono font-bold">{idx + 1}</td>
                          <td className="py-2.5 px-3">
                            <div className="font-bold text-slate-900">{emp.full_name}</div>
                            <div className="text-[10px] text-slate-400 font-mono">
                              {emp.employee_number} | NIK: {emp.nik}
                            </div>
                          </td>
                          <td className="py-2.5 px-3">
                            <span className="font-semibold text-emerald-900 bg-emerald-100/60 px-2 py-0.5 rounded text-[11px]">
                              {unitName}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-slate-700 font-medium">
                            {taskName}
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <Badge
                              variant={isChecked ? 'emerald' : 'slate'}
                              size="sm"
                            >
                              {isChecked ? 'Diikutsertakan' : 'Dilewati'}
                            </Badge>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Bottom Action to Proceed */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 border-t border-slate-100">
                <div className="text-xs text-slate-500">
                  Total <strong className="text-emerald-900 font-bold">{selectedAttendees.length}</strong> karyawan siap dibuatkan lembar absensi otomatis.
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="primary"
                    onClick={() => setViewMode('preview')}
                    rightIcon={<ArrowRight className="w-4 h-4" />}
                    className="shadow-sm"
                  >
                    Buka Pratinjau Lembar Hadir ({selectedAttendees.length})
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* VIEW MODE 2: PRINTABLE ATTENDANCE SHEET (PREVIEW & PRINT/EXPORT) */}
      <div className={viewMode === 'builder' ? 'hidden' : 'space-y-6'}>
        {/* Floating Controls Banner (Hidden on Print) */}
        <div className="no-print p-4 rounded-2xl bg-emerald-950 text-white shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 sticky top-4 z-20">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-800 text-emerald-100">
              <CheckCircle2 className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <p className="text-sm font-black text-white">
                Lembar Hadir Siap Cetak & Ekspor ({selectedAttendees.length} Peserta)
              </p>
              <p className="text-[11px] text-emerald-200/80">
                {eventName} • {formattedEventDate}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setViewMode('builder')}
              className="bg-emerald-900 border-emerald-700 text-emerald-100 hover:bg-emerald-800 text-xs"
            >
              Ubah Pengaturan / Peserta
            </Button>
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Download className="w-3.5 h-3.5 text-amber-300" />}
              onClick={handleExportExcel}
              className="bg-emerald-900 border-emerald-700 text-emerald-100 hover:bg-emerald-800 text-xs"
            >
              Unduh Excel (.xlsx)
            </Button>
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Save className="w-3.5 h-3.5 text-emerald-300" />}
              onClick={handleRecordToDatabase}
              isLoading={isRecording}
              className="bg-emerald-900 border-emerald-700 text-emerald-100 hover:bg-emerald-800 text-xs"
            >
              Rekam ke Database
            </Button>
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Printer className="w-4 h-4" />}
              onClick={handlePrint}
              className="bg-amber-500 hover:bg-amber-600 text-emerald-950 font-black text-xs shadow-md"
            >
              Cetak Lembar Hadir (PDF)
            </Button>
          </div>
        </div>

        {/* PRINTABLE DOCUMENT SHEET CONTAINER */}
        <div className="bg-white p-8 sm:p-12 rounded-2xl border border-slate-200 shadow-sm max-w-4xl mx-auto font-serif text-black" id="printable-attendance-sheet">
          {/* Formal Letterhead (Kop Surat) */}
          <div className="text-center border-b-2 border-black pb-4 mb-6">
            <h1 className="text-base sm:text-lg font-bold tracking-wide uppercase">
              YAYASAN PENDIDIKAN ISLAM PONDOK PESANTREN AL-QUR'ANIYYAH
            </h1>
            <p className="text-xs sm:text-sm font-semibold tracking-wider uppercase text-slate-800 mt-0.5">
              SISTEM INFORMASI MANAJEMEN KEPEGAWAIAN (SIMKA)
            </p>
            <p className="text-[11px] text-slate-600 font-sans mt-1">
              Jl. Pesantren Al-Qur'aniyyah, Ciriung, Cibinong, Kab. Bogor, Jawa Barat • Telp: (021) 87654321
            </p>
          </div>

          {/* Document Title */}
          <div className="text-center mb-6">
            <h2 className="text-sm sm:text-base font-bold underline tracking-wider uppercase">
              DAFTAR HADIR / LEMBAR ABSENSI KEGIATAN
            </h2>
          </div>

          {/* Event Metadata */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-1.5 gap-x-4 text-xs font-sans mb-6 bg-slate-50/80 p-3.5 rounded-lg border border-slate-200 print:bg-transparent print:border-none print:p-0">
            <div className="flex">
              <span className="w-32 font-semibold text-slate-700">Acara / Kegiatan</span>
              <span className="font-bold text-slate-900">: {eventName}</span>
            </div>
            <div className="flex">
              <span className="w-32 font-semibold text-slate-700">Hari / Tanggal</span>
              <span className="font-medium text-slate-900">: {formattedEventDate}</span>
            </div>
            <div className="flex">
              <span className="w-32 font-semibold text-slate-700">Waktu Pelaksanaan</span>
              <span className="font-medium text-slate-900">: {eventTime || '-'}</span>
            </div>
            <div className="flex">
              <span className="w-32 font-semibold text-slate-700">Tempat / Ruang</span>
              <span className="font-medium text-slate-900">: {eventLocation || '-'}</span>
            </div>
          </div>

          {/* Precision Attendance Table (No, Nama, Unit, Tugas, Paraf) */}
          <table className="w-full text-left text-xs border-collapse border border-black font-sans">
            <thead>
              <tr className="bg-slate-100 print:bg-slate-100/50">
                <th className="border border-black py-2.5 px-2 text-center w-10 font-bold">NO</th>
                <th className="border border-black py-2.5 px-3 font-bold">NAMA LENGKAP</th>
                <th className="border border-black py-2.5 px-3 w-40 font-bold">UNIT PENUGASAN</th>
                <th className="border border-black py-2.5 px-3 w-44 font-bold">TUGAS / JABATAN</th>
                <th className="border border-black py-2.5 px-3 w-48 text-center font-bold">TANDA TANGAN / PARAF</th>
              </tr>
            </thead>
            <tbody>
              {selectedAttendees.length === 0 ? (
                <tr>
                  <td colSpan={5} className="border border-black py-8 text-center text-slate-400 italic font-sans">
                    Tidak ada karyawan yang dipilih. Silakan kembali ke tab pengaturan untuk memilih peserta.
                  </td>
                </tr>
              ) : (
                selectedAttendees.map((item, idx) => {
                  const isOdd = item.no % 2 !== 0;

                  return (
                    <tr key={item.id} className="border border-black h-11">
                      <td className="border border-black py-1 px-2 text-center font-bold font-mono">
                        {item.no}
                      </td>
                      <td className="border border-black py-1 px-3">
                        <div className="font-bold text-slate-900">{item.name}</div>
                        <div className="text-[10px] text-slate-500 font-mono print:text-black">
                          {item.employee_number || item.nik}
                        </div>
                      </td>
                      <td className="border border-black py-1 px-3 text-slate-800 font-medium">
                        {item.unit}
                      </td>
                      <td className="border border-black py-1 px-3 text-slate-800">
                        {item.task}
                      </td>
                      {/* Alternating Signature Box 1.... and 2.... */}
                      <td className="border border-black py-1 px-2 relative text-slate-600">
                        {isOdd ? (
                          <div className="flex items-center text-[11px] font-mono text-black">
                            <span>{item.no}.</span>
                            <span className="border-b border-dotted border-black flex-1 ml-1 h-3" />
                          </div>
                        ) : (
                          <div className="flex items-center text-[11px] font-mono text-black justify-end">
                            <span className="w-16" />
                            <span>{item.no}.</span>
                            <span className="border-b border-dotted border-black flex-1 ml-1 h-3" />
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>

          {/* Footer Signature Section */}
          <div className="mt-8 flex justify-between items-start text-xs font-sans break-inside-avoid">
            <div className="text-slate-500 italic text-[11px] print:text-black">
              * SIMKA Al-Qur'aniyyah - Lembar Absensi Otomatis
            </div>

            <div className="text-right w-64 space-y-1">
              <p>Bogor, {formattedEventDate}</p>
              <p className="font-semibold">Mengetahui,</p>
              <p className="text-slate-700">{leadPerson}</p>
              <div className="h-16" />
              <p className="font-bold underline text-slate-900">
                ( ................................................... )
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
