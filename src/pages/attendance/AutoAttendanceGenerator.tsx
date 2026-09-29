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
  Settings2,
  ArrowDownUp,
  FolderTree,
  Check
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

// Helper: Hierarchical rank for pesantren units
export const getUnitHierarchyRank = (unitName: string): number => {
  const u = (unitName || '').toLowerCase();
  if (u.includes('yayasan') || u.includes('pengurus') || u.includes('pusat')) return 1;
  if (u.includes('sma') || u.includes('ma ') || u.includes('aliyah') || u.includes('smk') || u.includes('senior')) return 2;
  if (u.includes('smp') || u.includes('mts') || u.includes('tsanawiyah') || u.includes('junior')) return 3;
  if (u.includes('sd') || u.includes('mi ') || u.includes('ibtidaiyah') || u.includes('dasar')) return 4;
  if (u.includes('tk') || u.includes('ra ') || u.includes('paud') || u.includes('raudhatul') || u.includes('kanak')) return 5;
  if (u.includes('tpq') || u.includes('tpa') || u.includes('halq') || u.includes('tahfidz') || u.includes('pesantren') || u.includes('pondok') || u.includes('asrama')) return 6;
  return 7;
};

// Helper: Position rank (Pimpinan -> Guru -> Staf -> Operasional)
export const getPositionHierarchyRank = (posName: string): number => {
  const p = (posName || '').toLowerCase();
  if (p.includes('ketua') || p.includes('mudir') || p.includes('kepala') || p.includes('direktur') || p.includes('pimpinan')) return 1;
  if (p.includes('wakil') || p.includes('koordinator') || p.includes('sekretaris') || p.includes('bendahara')) return 2;
  if (p.includes('guru') || p.includes('ustadz') || p.includes('pembina') || p.includes('pengajar') || p.includes('wali kelas') || p.includes('musyrif')) return 3;
  if (p.includes('staff') || p.includes('staf') || p.includes('admin') || p.includes('tata usaha') || p.includes('tu') || p.includes('laboran') || p.includes('pustakawan')) return 4;
  if (p.includes('satpam') || p.includes('security') || p.includes('kebersihan') || p.includes('driver') || p.includes('operator')) return 5;
  return 6;
};

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

  // Sorting & Grouping Parameters
  const [sortBy, setSortBy] = useState<'unit_hierarchy' | 'unit_alphabet' | 'name_asc'>('unit_hierarchy');
  const [groupByUnit, setGroupByUnit] = useState(true);

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

  // Sorted list of units according to hierarchy
  const hierarchySortedUnits = useMemo(() => {
    return [...units].sort((a, b) => {
      const rankA = getUnitHierarchyRank(a.name);
      const rankB = getUnitHierarchyRank(b.name);
      if (rankA !== rankB) return rankA - rankB;
      return a.name.localeCompare(b.name);
    });
  }, [units]);

  // Unit employee counts for quick chips
  const unitCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    employees.forEach(emp => {
      const uList = emp.units_list && emp.units_list.length > 0 ? emp.units_list : [emp.primary_assignment?.unit_name || 'Yayasan'];
      uList.forEach(u => {
        counts[u] = (counts[u] || 0) + 1;
      });
    });
    return counts;
  }, [employees]);

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
          const unitObj = units.find(unit => unit.id === selectedUnit || unit.name === selectedUnit);
          return (unitObj && u.toLowerCase() === unitObj.name.toLowerCase()) || u.toLowerCase() === selectedUnit.toLowerCase();
        }));

      const matchStatus =
        selectedStatus === 'all' || emp.employment_status === selectedStatus;

      return matchSearch && matchUnit && matchStatus;
    });
  }, [employees, search, selectedUnit, selectedStatus, units]);

  // Selected attendees list with HIERARCHICAL ORDERING: Yayasan -> SMA -> SMP -> SD -> TK -> TPQ -> dst
  const selectedAttendees = useMemo(() => {
    const selectedList = employees
      .filter(emp => selectedIds.has(emp.id))
      .map(emp => {
        const unitName = emp.primary_assignment?.unit_name || emp.units_list?.[0] || 'Yayasan';
        const taskName = emp.primary_assignment?.task_name || emp.primary_assignment?.position_name || emp.positions_list?.[0] || 'Staff';
        const posName = emp.primary_assignment?.position_name || emp.positions_list?.[0] || '';

        return {
          id: emp.id,
          name: emp.full_name,
          employee_number: emp.employee_number,
          nik: emp.nik,
          unit: unitName,
          task: taskName,
          position: posName,
          gender: emp.gender,
          employment_status: emp.employment_status,
          unitRank: getUnitHierarchyRank(unitName),
          posRank: getPositionHierarchyRank(posName || taskName)
        };
      });

    // Apply Sorting based on parameter
    selectedList.sort((a, b) => {
      if (sortBy === 'unit_hierarchy') {
        // 1. Primary: Unit Hierarchy (Yayasan -> SMA -> SMP -> SD -> TK -> TPQ)
        if (a.unitRank !== b.unitRank) {
          return a.unitRank - b.unitRank;
        }
        // 2. Secondary: Unit Name Alphabet
        if (a.unit !== b.unit) {
          return a.unit.localeCompare(b.unit);
        }
        // 3. Tertiary: Position Hierarchy (Pimpinan -> Guru -> Staf)
        if (a.posRank !== b.posRank) {
          return a.posRank - b.posRank;
        }
        // 4. Quaternary: Name Alphabet (A - Z)
        return a.name.localeCompare(b.name);
      } else if (sortBy === 'unit_alphabet') {
        if (a.unit !== b.unit) {
          return a.unit.localeCompare(b.unit);
        }
        return a.name.localeCompare(b.name);
      } else {
        // Name A-Z
        return a.name.localeCompare(b.name);
      }
    });

    // Assign sequential numbering 1, 2, 3...
    return selectedList.map((item, index) => ({
      ...item,
      no: index + 1
    }));
  }, [employees, selectedIds, sortBy]);

  // Group attendees by Unit for section display
  const attendeesByUnit = useMemo(() => {
    const groups: { unitName: string; attendees: typeof selectedAttendees }[] = [];
    const unitMap = new Map<string, typeof selectedAttendees>();

    selectedAttendees.forEach(item => {
      if (!unitMap.has(item.unit)) {
        unitMap.set(item.unit, []);
      }
      unitMap.get(item.unit)!.push(item);
    });

    unitMap.forEach((items, unitName) => {
      groups.push({ unitName, attendees: items });
    });

    return groups;
  }, [selectedAttendees]);

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

  // Quick Select ONLY a specific unit
  const handleSelectOnlyUnit = (unitNameOrId: string) => {
    const targetUnit = units.find(u => u.id === unitNameOrId || u.name === unitNameOrId)?.name || unitNameOrId;
    const matching = employees.filter(emp =>
      emp.units_list?.some(u => u.toLowerCase() === targetUnit.toLowerCase()) ||
      emp.primary_assignment?.unit_name?.toLowerCase() === targetUnit.toLowerCase()
    );

    const updated = new Set<string>();
    matching.forEach(emp => updated.add(emp.id));
    setSelectedIds(updated);
    setSelectedUnit(unitNameOrId);
    success('Unit Terpilih', `Menandai ${matching.length} karyawan dari unit ${targetUnit}.`);
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
            padding: 12mm 15mm;
            background: white !important;
            color: black !important;
            font-family: 'Times New Roman', Times, serif;
          }
          .no-print {
            display: none !important;
          }
          @page {
            size: A4 portrait;
            margin: 8mm;
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
              Hierarki Unit Terurut
            </Badge>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Daftar hadir kegiatan terstruktur: Yayasan → SMA → SMP → SD → TK → TPQ/HALQ dengan kolom No, Nama, Unit, Tugas, dan Paraf
          </p>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl border border-slate-200 shadow-inner">
          <button
            onClick={() => setViewMode('builder')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
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
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
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
          {/* Card 1: Event Details & Hierarchy Parameters */}
          <Card
            title="1. Masukan Rincian Acara & Parameter Susunan Absensi"
            subtitle="Tentukan nama acara, jadwal, lokasi, serta parameter pengurutan hierarki unit"
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

              {/* PARAMETER SUSUNAN UNIT & GROUPING */}
              <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FolderTree className="w-4 h-4 text-emerald-800" />
                    <span className="text-xs font-black text-emerald-950 uppercase tracking-wide">
                      Parameter Susunan Urutan Lembar Absensi
                    </span>
                  </div>
                  <Badge variant="gold" size="sm">
                    Hierarki Pesantren
                  </Badge>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Urutan Baris Karyawan:
                    </label>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as any)}
                      className="w-full py-2 px-3 text-xs rounded-xl border border-emerald-300 bg-white font-medium text-emerald-950 focus:ring-emerald-600"
                    >
                      <option value="unit_hierarchy">
                        ★ Susunan Hierarki Unit (Yayasan → SMA → SMP → SD → TK → TPQ/HALQ)
                      </option>
                      <option value="unit_alphabet">
                        Urut Berdasarkan Nama Unit (A - Z)
                      </option>
                      <option value="name_asc">
                        Urut Berdasarkan Abjad Nama Karyawan (A - Z)
                      </option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-emerald-200 mt-auto">
                    <div>
                      <span className="text-xs font-bold text-slate-800">Tampilkan Sub-Header Unit</span>
                      <p className="text-[10px] text-slate-500">Memberi pemisah judul unit (I. Yayasan, II. SMA, dst.)</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={groupByUnit}
                        onChange={(e) => setGroupByUnit(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-800" />
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Card 2: Interactive Quick Unit Filters & Employee Checkboxes */}
          <Card
            title="2. Filter By Unit & Validasi Ceklis Karyawan"
            subtitle="Gunakan filter unit di bawah ini untuk memilih atau melewati karyawan dalam absensi kegiatan"
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
              {/* QUICK UNIT FILTER CHIPS */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
                    <Filter className="w-3.5 h-3.5 text-emerald-700" />
                    Filter Cepat Berdasarkan Unit:
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Klik chip untuk memfilter, klik tombol unit untuk memilih seluruh anggota unit
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedUnit('all')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                      selectedUnit === 'all'
                        ? 'bg-emerald-950 text-white shadow-sm ring-2 ring-emerald-800'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    <span>Semua Unit</span>
                    <span className="text-[10px] bg-emerald-800 text-emerald-100 px-1.5 py-0.2 rounded-full">
                      {employees.length}
                    </span>
                  </button>

                  {hierarchySortedUnits.map((u) => {
                    const count = unitCounts[u.name] || 0;
                    const isSelected = selectedUnit === u.id || selectedUnit === u.name;

                    return (
                      <div
                        key={u.id}
                        className={`inline-flex items-center rounded-xl border transition ${
                          isSelected
                            ? 'bg-emerald-900 text-white border-emerald-950 shadow-sm'
                            : 'bg-white text-slate-700 border-slate-200 hover:border-emerald-400'
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => setSelectedUnit(u.id)}
                          className="px-2.5 py-1.5 text-xs font-semibold flex items-center gap-1.5"
                        >
                          <span>{u.name}</span>
                          <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                            isSelected ? 'bg-emerald-800 text-emerald-100' : 'bg-slate-100 text-slate-600'
                          }`}>
                            {count}
                          </span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleSelectOnlyUnit(u.name)}
                          title={`Pilih hanya karyawan ${u.name}`}
                          className={`px-2 py-1.5 border-l text-[10px] font-bold transition ${
                            isSelected
                              ? 'border-emerald-800 text-amber-300 hover:bg-emerald-800'
                              : 'border-slate-100 text-emerald-700 hover:bg-emerald-50'
                          }`}
                        >
                          Pilih Unit Ini
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Search & Status Filter Row */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div className="w-full sm:w-80 relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Cari nama karyawan, NIK, tugas, jabatan..."
                    className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white focus:ring-emerald-600 focus:border-emerald-600"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="py-1.5 px-2.5 text-xs rounded-lg border border-slate-200 bg-white focus:ring-emerald-600 font-medium"
                  >
                    <option value="all">Semua Status Kepegawaian</option>
                    <option value="Tetap">Tetap</option>
                    <option value="Kontrak">Kontrak</option>
                    <option value="Honorer">Honorer</option>
                  </select>

                  <Badge variant="gold" size="sm">
                    Terpilih: {selectedIds.size} / {employees.length} Karyawan
                  </Badge>
                </div>
              </div>

              {/* Table with Checkboxes */}
              <div className="overflow-x-auto max-h-96 overflow-y-auto border border-slate-200 rounded-xl">
                <table className="w-full text-left text-xs text-slate-700 whitespace-nowrap">
                  <thead className="bg-slate-100/90 sticky top-0 z-10 border-b border-slate-200 font-bold text-slate-700 uppercase text-[11px]">
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
                      <th className="py-2.5 px-3">Tugas Pokok / Jabatan</th>
                      <th className="py-2.5 px-3 text-center">Keikutsertaan</th>
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
                <div className="text-xs text-slate-600">
                  Susunan terurut: <strong className="text-emerald-900">Yayasan → SMA → SMP → SD → TK → TPQ</strong> ({selectedAttendees.length} Karyawan Terpilih).
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
                Lembar Hadir Terstruktur ({selectedAttendees.length} Peserta)
              </p>
              <p className="text-[11px] text-emerald-200/80">
                {eventName} • Urutan Hierarki: Yayasan → SMA → SMP → SD → TK → TPQ
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
              Ubah Pengaturan / Ceklis
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
              ) : groupByUnit && sortBy === 'unit_hierarchy' ? (
                // RENDER GROUPED BY UNIT SECTION
                attendeesByUnit.map((group, gIdx) => (
                  <React.Fragment key={gIdx}>
                    {/* Unit Subheader */}
                    <tr className="bg-slate-100/80 font-bold print:bg-slate-100">
                      <td colSpan={5} className="border border-black py-1.5 px-3 text-emerald-950 tracking-wider text-[11px] uppercase">
                        UNIT: {group.unitName} ({group.attendees.length} Orang)
                      </td>
                    </tr>
                    {/* Attendees in this unit */}
                    {group.attendees.map((item) => {
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
                    })}
                  </React.Fragment>
                ))
              ) : (
                // RENDER FLAT CONTINUOUS TABLE
                selectedAttendees.map((item) => {
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
