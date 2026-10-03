import React, { useState, useEffect } from 'react';
import {
  FileText,
  Plus,
  Search,
  Printer,
  Mail,
  Send,
  Trash2,
  Edit3,
  CheckCircle2,
  FileCode,
  Settings,
  Sparkles,
  Download,
  Building2,
  User,
  Calendar,
  Layers,
  HelpCircle,
  Eye,
  RefreshCw
} from 'lucide-react';
import { OfficialLetter, LetterTemplate, LetterKopSettings, Employee, LetterType, LetterStatus } from '../../types';
import { letterService } from '../../services/letterService';
import { employeeService } from '../../services/employeeService';
import { useToast } from '../../context/ToastContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { ConfirmationDialog } from '../../components/ui/ConfirmationDialog';
import { LetterPrintPreview } from '../../components/letters/LetterPrintPreview';

export const LettersIndex: React.FC = () => {
  const { success, error } = useToast();
  const [activeTab, setActiveTab] = useState<'arsip' | 'buat' | 'templates' | 'kop'>('arsip');

  // Data States
  const [letters, setLetters] = useState<OfficialLetter[]>([]);
  const [templates, setTemplates] = useState<LetterTemplate[]>([]);
  const [kopSettings, setKopSettings] = useState<LetterKopSettings | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<string>('all');

  // Print/Preview Modal
  const [selectedLetter, setSelectedLetter] = useState<OfficialLetter | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<OfficialLetter | null>(null);

  // Form Generator States
  const [editingLetterId, setEditingLetterId] = useState<string | null>(null);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [letterType, setLetterType] = useState<LetterType>('sk_pengangkatan');
  const [letterNumber, setLetterNumber] = useState('');
  const [letterTitle, setLetterTitle] = useState('');
  const [letterSubject, setLetterSubject] = useState('');
  const [headerTitle, setHeaderTitle] = useState("KEPUTUSAN KETUA UMUM YAYASAN PENDIDIKAN ISLAM PONDOK PESANTREN AL-QUR'ANIYYAH");
  const [consideringList, setConsideringList] = useState<string[]>(['']);
  const [inViewList, setInViewList] = useState<string[]>(['']);
  const [observingList, setObservingList] = useState<string[]>(['']);
  const [decidingEntries, setDecidingEntries] = useState<[string, string][]>([['Pertama', '']]);

  const [effectiveDate, setEffectiveDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState('');
  const [issuedDate, setIssuedDate] = useState(new Date().toISOString().split('T')[0]);
  const [issuedCity, setIssuedCity] = useState('Tangerang Selatan');
  const [signerName, setSignerName] = useState('Dr. KH. M. Sobron Zayyan, SQ., MA');
  const [signerTitle, setSignerTitle] = useState('Ketua Umum');

  // Kop Settings Form State
  const [kopHeader1, setKopHeader1] = useState('');
  const [kopHeader2, setKopHeader2] = useState('');
  const [kopAddress, setKopAddress] = useState('');
  const [kopContact, setKopContact] = useState('');
  const [kopCity, setKopCity] = useState('');
  const [kopSignerName, setKopSignerName] = useState('');
  const [kopSignerTitle, setKopSignerTitle] = useState('');

  // Load All Data
  const loadData = async () => {
    try {
      setIsLoading(true);
      const [l, t, k, emp] = await Promise.all([
        letterService.getLetters({ search, type: filterType as any }),
        letterService.getTemplates(),
        letterService.getKopSettings(),
        employeeService.getEmployees()
      ]);
      setLetters(l);
      setTemplates(t);
      setKopSettings(k);
      setEmployees(emp.data);

      // Initialize Kop state
      setKopHeader1(k.header_line1);
      setKopHeader2(k.header_line2);
      setKopAddress(k.address);
      setKopContact(k.contact);
      setKopCity(k.default_city);
      setKopSignerName(k.default_signer_name);
      setKopSignerTitle(k.default_signer_title);

      if (t.length > 0 && !selectedTemplateId) {
        setSelectedTemplateId(t[0].id);
      }
    } catch (err) {
      console.error('Error loading letters data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [search, filterType]);

  // Handle Employee Auto-Fill in Generator
  const handleSelectEmployee = (empId: string) => {
    setSelectedEmployeeId(empId);
    const emp = employees.find(e => e.id === empId);
    if (!emp) return;

    const empName = emp.full_name;
    const empNirgNirk = emp.nirg ? `NRIG : ${emp.nirg}` : emp.nirk ? `NIRK : ${emp.nirk}` : `NIK : ${emp.nik}`;
    const empUnit = emp.primary_assignment?.unit_name || emp.units_list?.[0] || 'Yayasan Al-Qur\'aniyyah';
    const empPosition = emp.primary_assignment?.position_name || emp.positions_list?.[0] || 'Guru / Karyawan';
    const empBirth = `${emp.birth_place || 'Tangerang'}, ${emp.birth_date || '-'}`;

    // Auto-generate subject
    if (letterType === 'sk_pengangkatan') {
      setLetterTitle(`SK Pengangkatan Guru/Karyawan Sdr. ${empName}`);
      setLetterSubject(`PENGANGKATAN SDR. ${empName.toUpperCase()} ${empNirgNirk} MENJADI GURU TETAP (GT) YAYASAN PENDIDIKAN ISLAM PONDOK PESANTREN AL-QUR'ANIYYAH`);
    } else if (letterType === 'sp_peringatan') {
      setLetterTitle(`Surat Peringatan Sdr. ${empName}`);
      setLetterSubject(`SURAT PERINGATAN PERTAMA (SP-1) UNTUK SDR. ${empName.toUpperCase()}`);
    }

    // Auto fill keputusan pertama
    setDecidingEntries(prev => {
      const copy = [...prev];
      if (copy.length > 0) {
        copy[0] = [
          'Pertama',
          `Mengangkat Sdr. :\n1. Nama : ${empName}\n2. Tempat/Tgl. Lahir : ${empBirth}\n3. Pendidikan : ${emp.last_education || 'S1'}\n4. Ditugaskan dalam jabatan : ${empPosition}\n5. Pada Unit : ${empUnit}`
        ];
      }
      return copy;
    });
  };

  // Handle Template Selection
  const handleApplyTemplate = (tplId: string) => {
    setSelectedTemplateId(tplId);
    const tpl = templates.find(t => t.id === tplId);
    if (!tpl) return;

    setLetterType(tpl.type);
    setHeaderTitle(tpl.header_title);
    setConsideringList(tpl.considering_text.length > 0 ? tpl.considering_text : ['']);
    setInViewList(tpl.in_view_text.length > 0 ? tpl.in_view_text : ['']);
    setObservingList(tpl.observing_text.length > 0 ? tpl.observing_text : ['']);

    const entries = Object.entries(tpl.deciding_text);
    setDecidingEntries(entries.length > 0 ? entries : [['Pertama', '']]);
    setIssuedCity(tpl.footer_city || 'Tangerang Selatan');
    setSignerName(tpl.signer_name || 'Dr. KH. M. Sobron Zayyan, SQ., MA');
    setSignerTitle(tpl.signer_title || 'Ketua Umum');

    if (selectedEmployeeId) {
      handleSelectEmployee(selectedEmployeeId);
    }
  };

  // Generate Next Auto Letter Number
  const handleGenerateNumber = async () => {
    const num = await letterService.generateNextLetterNumber(letterType);
    setLetterNumber(num);
  };

  // Save Letter
  const handleSaveLetter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmployeeId) {
      error('Pilih Guru/Karyawan penerima surat terlebih dahulu');
      return;
    }
    const emp = employees.find(e => e.id === selectedEmployeeId);
    if (!emp) return;

    try {
      setIsLoading(true);
      const decidingObj: Record<string, string> = {};
      decidingEntries.forEach(([k, v]) => {
        if (k.trim()) decidingObj[k.trim()] = v;
      });

      const num = letterNumber || (await letterService.generateNextLetterNumber(letterType));

      const payload: Partial<OfficialLetter> = {
        id: editingLetterId || undefined,
        letter_number: num,
        template_id: selectedTemplateId,
        type: letterType,
        title: letterTitle || `Surat Resmi ${emp.full_name}`,
        employee_id: emp.id,
        employee_name: emp.full_name,
        employee_email: emp.email,
        employee_nik: emp.nik,
        employee_nirg_nirk: emp.nirg ? `NRIG : ${emp.nirg}` : emp.nirk ? `NIRK : ${emp.nirk}` : `NIK : ${emp.nik}`,
        employee_position: emp.primary_assignment?.position_name || emp.positions_list?.[0] || 'Guru',
        employee_unit: emp.primary_assignment?.unit_name || emp.units_list?.[0] || 'Yayasan Al-Qur\'aniyyah',
        employee_gender: emp.gender,
        employee_birth_info: `${emp.birth_place || 'Jakarta'}, ${emp.birth_date || '-'}`,
        employee_education_level: emp.last_education || 'S1',
        subject: letterSubject,
        header_title: headerTitle,
        considering: consideringList.filter(c => c.trim()),
        in_view: inViewList.filter(v => v.trim()),
        observing: observingList.filter(o => o.trim()),
        deciding: decidingObj,
        effective_date: effectiveDate,
        end_date: endDate || undefined,
        issued_date: issuedDate,
        issued_city: issuedCity,
        signer_name: signerName,
        signer_title: signerTitle,
        status: 'diterbitkan'
      };

      await letterService.saveLetter(payload);
      success('Berhasil menyimpan & menerbitkan surat resmi');
      await loadData();
      setActiveTab('arsip');
    } catch (err: any) {
      error('Gagal menyimpan surat: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Save Kop Settings
  const handleSaveKop = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      await letterService.saveKopSettings({
        header_line1: kopHeader1,
        header_line2: kopHeader2,
        address: kopAddress,
        contact: kopContact,
        default_city: kopCity,
        default_signer_name: kopSignerName,
        default_signer_title: kopSignerTitle
      });
      success('Berhasil menyimpan Pengaturan Kop & TTD Yayasan');
      await loadData();
    } catch (err: any) {
      error('Gagal menyimpan Kop: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Print Window Helper
  const handlePrintLetter = (letter: OfficialLetter) => {
    setSelectedLetter(letter);
    setIsPreviewOpen(true);
    setTimeout(() => {
      window.print();
    }, 500);
  };

  // Helper object for live preview inside generator tab
  const previewDraftLetter: OfficialLetter = {
    id: 'draft-preview',
    letter_number: letterNumber || '047 /SK/YASPIQ/VII/2024',
    type: letterType,
    title: letterTitle || 'SK Pengangkatan',
    employee_id: selectedEmployeeId,
    employee_name: employees.find(e => e.id === selectedEmployeeId)?.full_name || 'Irsyam Maulana, SE',
    subject: letterSubject || 'PENGANGKATAN GURU TETAP YAYASAN PENDIDIKAN ISLAM PONDOK PESANTREN AL-QUR\'ANIYYAH',
    header_title: headerTitle,
    considering: consideringList.filter(c => c.trim()),
    in_view: inViewList.filter(v => v.trim()),
    observing: observingList.filter(o => o.trim()),
    deciding: Object.fromEntries(decidingEntries.filter(([k]) => k.trim())),
    effective_date: effectiveDate,
    end_date: endDate,
    issued_date: issuedDate,
    issued_city: issuedCity,
    signer_name: signerName,
    signer_title: signerTitle,
    status: 'draft',
    created_at: new Date().toISOString()
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 animate-in fade-in duration-300">
      {/* Top Banner Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-sm">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200 mb-2">
            <FileText className="w-3.5 h-3.5 text-emerald-600" />
            <span>Modul Penyuratan & SK Resmi Yayasan</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Manajemen Surat Keputusan (SK) & Surat Resmi
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Buat, cetak PDF, dan kirim via Gmail Surat Keputusan (SK Pengangkatan), Surat Peringatan (SP), dan SK Penugasan Guru & Karyawan.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <Button
            variant="primary"
            size="md"
            className="w-full sm:w-auto justify-center"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => {
              setEditingLetterId(null);
              if (employees.length > 0) handleSelectEmployee(employees[0].id);
              if (templates.length > 0) handleApplyTemplate(templates[0].id);
              handleGenerateNumber();
              setActiveTab('buat');
            }}
          >
            Buat Surat Baru
          </Button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto pb-px">
        <button
          onClick={() => setActiveTab('arsip')}
          className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition flex items-center gap-2 shrink-0 ${
            activeTab === 'arsip'
              ? 'bg-emerald-800 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Daftar & Arsip Surat ({letters.length})</span>
        </button>

        <button
          onClick={() => {
            if (!editingLetterId && employees.length > 0 && !selectedEmployeeId) {
              handleSelectEmployee(employees[0].id);
              if (templates.length > 0) handleApplyTemplate(templates[0].id);
              handleGenerateNumber();
            }
            setActiveTab('buat');
          }}
          className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition flex items-center gap-2 shrink-0 ${
            activeTab === 'buat'
              ? 'bg-emerald-800 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span>Buat / Edit Surat ({editingLetterId ? 'Edit' : 'Baru'})</span>
        </button>

        <button
          onClick={() => setActiveTab('templates')}
          className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition flex items-center gap-2 shrink-0 ${
            activeTab === 'templates'
              ? 'bg-emerald-800 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <FileCode className="w-4 h-4" />
          <span>Template Surat ({templates.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('kop')}
          className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition flex items-center gap-2 shrink-0 ${
            activeTab === 'kop'
              ? 'bg-emerald-800 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>Pengaturan Kop & TTD Yayasan</span>
        </button>
      </div>

      {/* TAB 1: DAFTAR & ARSIP SURAT */}
      {activeTab === 'arsip' && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Cari Nomor Surat, Perihal, atau Nama Guru/Karyawan..."
                className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700"
              />
            </div>

            <div className="flex items-center gap-2">
              <Select
                value={filterType}
                onChange={e => setFilterType(e.target.value)}
                className="text-xs"
                options={[
                  { value: 'all', label: 'Semua Jenis Surat' },
                  { value: 'sk_pengangkatan', label: 'SK Pengangkatan' },
                  { value: 'sp_peringatan', label: 'Surat Peringatan (SP)' },
                  { value: 'sk_penugasan', label: 'SK Penugasan Multi-Unit' },
                  { value: 'custom', label: 'Surat Custom' }
                ]}
              />
            </div>
          </div>

          {/* Letter Cards Grid */}
          {letters.length === 0 ? (
            <Card className="text-center py-12">
              <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-800">Belum Ada Surat Terbit</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Silakan buat Surat Keputusan (SK) atau Surat Peringatan baru menggunakan tombol "Buat Surat Baru".
              </p>
              <Button
                variant="gold"
                size="sm"
                className="mt-4"
                leftIcon={<Plus className="w-4 h-4" />}
                onClick={() => setActiveTab('buat')}
              >
                Buat Surat Pertama
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {letters.map(ltr => (
                <Card key={ltr.id} className="hover:border-emerald-200 transition shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <Badge variant={ltr.type === 'sp_peringatan' ? 'amber' : 'emerald'} size="sm">
                        {ltr.type === 'sp_peringatan' ? 'Surat Peringatan (SP)' : 'SK Pengangkatan'}
                      </Badge>
                      <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                        {ltr.letter_number}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-slate-900 leading-snug line-clamp-2">
                      {ltr.title}
                    </h4>

                    <div className="mt-3 p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1.5 text-xs">
                      <div className="flex items-center gap-2 text-slate-800 font-bold">
                        <User className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                        <span className="truncate">{ltr.employee_name}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-500 text-[11px]">
                        <Building2 className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">{ltr.employee_unit || 'Yayasan'} • {ltr.employee_position || 'Guru'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-500 text-[11px]">
                        <Calendar className="w-3.5 h-3.5 shrink-0" />
                        <span>Penetapan: {new Date(ltr.issued_date).toLocaleDateString('id-ID', { dateStyle: 'medium' })}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs"
                        leftIcon={<Eye className="w-3.5 h-3.5" />}
                        onClick={() => {
                          setSelectedLetter(ltr);
                          setIsPreviewOpen(true);
                        }}
                      >
                        Lihat
                      </Button>
                      <Button
                        variant="gold"
                        size="sm"
                        className="text-xs"
                        leftIcon={<Printer className="w-3.5 h-3.5" />}
                        onClick={() => handlePrintLetter(ltr)}
                      >
                        Cetak PDF
                      </Button>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        title="Kirim via Gmail"
                        onClick={() => letterService.sendViaGmail(ltr)}
                        className="p-2 rounded-xl text-emerald-700 hover:bg-emerald-50 transition"
                      >
                        <Mail className="w-4 h-4" />
                      </button>
                      <button
                        title="Hapus Surat"
                        onClick={() => setDeleteTarget(ltr)}
                        className="p-2 rounded-xl text-rose-600 hover:bg-rose-50 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: BUAT / EDIT SURAT (GENERATOR WITH LIVE SIDE-BY-SIDE PREVIEW) */}
      {activeTab === 'buat' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column (6 Cols): Interactive Form */}
          <div className="lg:col-span-6 space-y-6">
            <Card title="Konfigurasi Surat & Penerima">
              <div className="space-y-4 text-xs">
                {/* 1. Target Employee Dropdown */}
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Pilih Guru / Karyawan Penerima *</label>
                  <Select
                    value={selectedEmployeeId}
                    onChange={e => handleSelectEmployee(e.target.value)}
                    className="w-full text-xs"
                    placeholder="-- Pilih Guru atau Karyawan --"
                    options={employees.map(emp => ({
                      value: emp.id,
                      label: `${emp.full_name} (${emp.nirg ? `NRIG: ${emp.nirg}` : emp.nirk ? `NIRK: ${emp.nirk}` : `NIK: ${emp.nik}`})`
                    }))}
                  />
                </div>

                {/* 2. Select Template */}
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Gunakan Format Template</label>
                  <Select
                    value={selectedTemplateId}
                    onChange={e => handleApplyTemplate(e.target.value)}
                    className="w-full text-xs"
                    options={templates.map(tpl => ({
                      value: tpl.id,
                      label: tpl.title
                    }))}
                  />
                </div>

                {/* 3. Nomor Surat Auto & Judul */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-800 mb-1 flex items-center justify-between">
                      <span>Nomor Surat *</span>
                      <button
                        type="button"
                        onClick={handleGenerateNumber}
                        className="text-[10px] text-emerald-800 font-bold hover:underline flex items-center gap-1"
                      >
                        <RefreshCw className="w-3 h-3" /> Auto
                      </button>
                    </label>
                    <Input
                      value={letterNumber}
                      onChange={e => setLetterNumber(e.target.value)}
                      placeholder="047 /SK/YASPIQ/VII/2024"
                    />
                  </div>

                  <div>
                    <Input
                      label="Tanggal Penetapan (Issued Date)"
                      type="date"
                      value={issuedDate}
                      onChange={e => setIssuedDate(e.target.value)}
                    />
                  </div>
                </div>

                <Input
                  label="Judul Ringkas Surat"
                  value={letterTitle}
                  onChange={e => setLetterTitle(e.target.value)}
                  placeholder="SK Pengangkatan Guru Tetap Sdr. Irsyam Maulana, SE"
                />

                <Input
                  label="Perihal / Tentang (Subject)"
                  value={letterSubject}
                  onChange={e => setLetterSubject(e.target.value)}
                  placeholder="PENGANGKATAN SDR. IRSYAM MAULANA MENJADI GURU TETAP..."
                />
              </div>
            </Card>

            {/* Menimbang, Mengingat, Memperhatikan Customizer */}
            <Card title="Isi Konsideran (Menimbang & Mengingat)">
              <div className="space-y-4 text-xs">
                {/* Menimbang */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="font-bold text-slate-800">Menimbang (Poin Alasan / Dasar)</label>
                    <button
                      type="button"
                      onClick={() => setConsideringList(prev => [...prev, ''])}
                      className="text-[11px] font-bold text-emerald-800 hover:underline"
                    >
                      + Tambah Poin
                    </button>
                  </div>
                  {consideringList.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2 mb-2">
                      <span className="font-bold text-slate-400 w-4">{idx + 1}.</span>
                      <textarea
                        value={item}
                        onChange={e => {
                          const copy = [...consideringList];
                          copy[idx] = e.target.value;
                          setConsideringList(copy);
                        }}
                        rows={2}
                        className="w-full text-xs p-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-700"
                      />
                      <button
                        type="button"
                        onClick={() => setConsideringList(prev => prev.filter((_, i) => i !== idx))}
                        className="p-1.5 text-rose-600 hover:bg-rose-50 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Mengingat */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="font-bold text-slate-800">Mengingat (Landasan Hukum & AD/ART)</label>
                    <button
                      type="button"
                      onClick={() => setInViewList(prev => [...prev, ''])}
                      className="text-[11px] font-bold text-emerald-800 hover:underline"
                    >
                      + Tambah Poin
                    </button>
                  </div>
                  {inViewList.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2 mb-2">
                      <span className="font-bold text-slate-400 w-4">{idx + 1}.</span>
                      <input
                        type="text"
                        value={item}
                        onChange={e => {
                          const copy = [...inViewList];
                          copy[idx] = e.target.value;
                          setInViewList(copy);
                        }}
                        className="w-full text-xs p-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-700"
                      />
                      <button
                        type="button"
                        onClick={() => setInViewList(prev => prev.filter((_, i) => i !== idx))}
                        className="p-1.5 text-rose-600 hover:bg-rose-50 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            {/* Diktum Memutuskan */}
            <Card title="Diktum Penetapan (Memutuskan)">
              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-slate-800">Pasal / Diktum Keputusan</label>
                  <button
                    type="button"
                    onClick={() => setDecidingEntries(prev => [...prev, [`Pasal ${prev.length + 1}`, '']])}
                    className="text-[11px] font-bold text-emerald-800 hover:underline"
                  >
                    + Tambah Diktum
                  </button>
                </div>

                {decidingEntries.map(([k, v], idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <input
                        type="text"
                        value={k}
                        onChange={e => {
                          const copy = [...decidingEntries];
                          copy[idx][0] = e.target.value;
                          setDecidingEntries(copy);
                        }}
                        placeholder="Pertama / Kedua / dll"
                        className="font-bold text-xs p-1.5 rounded border border-slate-300 w-1/3"
                      />
                      <button
                        type="button"
                        onClick={() => setDecidingEntries(prev => prev.filter((_, i) => i !== idx))}
                        className="text-xs text-rose-600 hover:underline"
                      >
                        Hapus Diktum
                      </button>
                    </div>
                    <textarea
                      value={v}
                      onChange={e => {
                        const copy = [...decidingEntries];
                        copy[idx][1] = e.target.value;
                        setDecidingEntries(copy);
                      }}
                      rows={3}
                      className="w-full text-xs p-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-700"
                    />
                  </div>
                ))}

                <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setActiveTab('arsip')}
                  >
                    Batal
                  </Button>
                  <Button
                    type="button"
                    variant="primary"
                    leftIcon={<CheckCircle2 className="w-4 h-4" />}
                    onClick={handleSaveLetter}
                    isLoading={isLoading}
                  >
                    Simpan & Terbitkan Surat
                  </Button>
                </div>
              </div>
            </Card>
          </div>

          {/* Right Column (6 Cols): Live Authentic Letter Paper Preview */}
          <div className="lg:col-span-6 space-y-4">
            <div className="sticky top-20">
              <div className="flex items-center justify-between bg-slate-800 text-white p-3 rounded-t-2xl">
                <span className="text-xs font-bold flex items-center gap-2">
                  <Eye className="w-4 h-4 text-amber-400" />
                  <span>Preview Cetak Kertas Resmi SK</span>
                </span>
                <Button
                  variant="gold"
                  size="sm"
                  leftIcon={<Printer className="w-3.5 h-3.5" />}
                  onClick={() => handlePrintLetter(previewDraftLetter)}
                >
                  Cetak Langsung
                </Button>
              </div>
              <div className="bg-slate-200 p-4 rounded-b-2xl max-h-[85vh] overflow-y-auto">
                <LetterPrintPreview letter={previewDraftLetter} kopSettings={kopSettings || undefined} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: TEMPLATE SURAT */}
      {activeTab === 'templates' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800">Daftar Format Template Surat YASPIQ</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {templates.map(tpl => (
              <Card key={tpl.id} title={tpl.title} subtitle={`Kode: ${tpl.code} • Type: ${tpl.type}`}>
                <div className="space-y-2 text-xs text-slate-600">
                  <p><strong>Judul Kop:</strong> {tpl.header_title}</p>
                  <p><strong>Total Poin Menimbang:</strong> {tpl.considering_text.length} Poin</p>
                  <p><strong>Total Poin Mengingat:</strong> {tpl.in_view_text.length} Poin</p>
                  <p><strong>Penandatangan:</strong> {tpl.signer_name} ({tpl.signer_title})</p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      handleApplyTemplate(tpl.id);
                      if (employees.length > 0) handleSelectEmployee(employees[0].id);
                      handleGenerateNumber();
                      setActiveTab('buat');
                    }}
                  >
                    Gunakan Template Ini
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: PENGATURAN KOP SURAT YAYASAN */}
      {activeTab === 'kop' && (
        <Card title="Pengaturan Kop Surat & Penandatangan Resmi Yayasan">
          <form onSubmit={handleSaveKop} className="space-y-4 text-xs max-w-2xl">
            <Input
              label="Baris 1 Kop (Nama Instansi)"
              value={kopHeader1}
              onChange={e => setKopHeader1(e.target.value)}
              placeholder="YAYASAN PENDIDIKAN ISLAM"
            />
            <Input
              label="Baris 2 Kop (Nama Pondok Pesantren)"
              value={kopHeader2}
              onChange={e => setKopHeader2(e.target.value)}
              placeholder="PONDOK PESANTREN AL-QUR'ANIYYAH"
            />
            <Input
              label="Alamat Lengkap Yayasan"
              value={kopAddress}
              onChange={e => setKopAddress(e.target.value)}
              placeholder="Jl. Pesantren Al-Qur'aniyyah No. 12..."
            />
            <Input
              label="Kontak Telepon & Email"
              value={kopContact}
              onChange={e => setKopContact(e.target.value)}
              placeholder="Telp: (021) 7458000 | Email: yayasan@alquraniyyah.sch.id"
            />
            <Input
              label="Kota Default Penetapan Surat"
              value={kopCity}
              onChange={e => setKopCity(e.target.value)}
              placeholder="Tangerang Selatan"
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Nama Penandatangan (Ketua Umum)"
                value={kopSignerName}
                onChange={e => setKopSignerName(e.target.value)}
                placeholder="Dr. KH. M. Sobron Zayyan, SQ., MA"
              />
              <Input
                label="Jabatan Penandatangan"
                value={kopSignerTitle}
                onChange={e => setKopSignerTitle(e.target.value)}
                placeholder="Ketua Umum"
              />
            </div>

            <div className="pt-4 border-t border-slate-200">
              <Button type="submit" variant="primary" isLoading={isLoading} leftIcon={<CheckCircle2 className="w-4 h-4" />}>
                Simpan Pengaturan Kop Surat
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* PRINT & PREVIEW MODAL */}
      <Modal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        title="Preview Cetak SK & Surat Resmi"
        maxWidth="4xl"
      >
        {selectedLetter && (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-slate-100 rounded-xl">
              <div>
                <p className="text-xs font-bold text-slate-800">{selectedLetter.title}</p>
                <p className="text-[11px] text-slate-500">Nomor: {selectedLetter.letter_number}</p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="gold"
                  size="sm"
                  leftIcon={<Printer className="w-4 h-4" />}
                  onClick={() => window.print()}
                >
                  Cetak Ke Kertas / PDF
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  leftIcon={<Send className="w-4 h-4" />}
                  onClick={() => letterService.sendViaGmail(selectedLetter)}
                >
                  Kirim Ke Gmail Karyawan
                </Button>
              </div>
            </div>

            <div className="border border-slate-300 rounded-xl overflow-hidden bg-slate-200 p-4 max-h-[70vh] overflow-y-auto">
              <LetterPrintPreview letter={selectedLetter} kopSettings={kopSettings || undefined} />
            </div>
          </div>
        )}
      </Modal>

      {/* DELETE CONFIRMATION DIALOG */}
      <ConfirmationDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={async () => {
          if (deleteTarget) {
            await letterService.deleteLetter(deleteTarget.id);
            success('Berhasil menghapus arsip surat');
            setDeleteTarget(null);
            await loadData();
          }
        }}
        title="Hapus Arsip Surat?"
        message={`Apakah Anda yakin ingin menghapus arsip surat ${deleteTarget?.title}? Data yang dihapus tidak dapat dikembalikan.`}
        confirmText="Hapus Surat"
        type="danger"
      />
    </div>
  );
};
