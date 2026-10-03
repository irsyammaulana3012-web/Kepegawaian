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
  Building2,
  User,
  Calendar,
  Layers,
  Eye,
  RefreshCw,
  Upload,
  Image as ImageIcon,
  CheckSquare,
  Square,
  Users
} from 'lucide-react';
import { OfficialLetter, LetterTemplate, LetterKopSettings, Employee, LetterType } from '../../types';
import { letterService } from '../../services/letterService';
import { employeeService } from '../../services/employeeService';
import { masterDataService } from '../../services/masterDataService';
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
  const [activeTab, setActiveTab] = useState<'arsip' | 'buat' | 'buat_massal' | 'templates' | 'kop'>('arsip');

  // Data States
  const [letters, setLetters] = useState<OfficialLetter[]>([]);
  const [templates, setTemplates] = useState<LetterTemplate[]>([]);
  const [kopSettings, setKopSettings] = useState<LetterKopSettings | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [units, setUnits] = useState<{ id: string; name: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Archive Filter & Multi-Select States
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [selectedLetterIds, setSelectedLetterIds] = useState<string[]>([]);
  const [bulkDeleteConfirmOpen, setBulkDeleteConfirmOpen] = useState(false);

  // Print/Preview Modal
  const [singleLetterPreview, setSingleLetterPreview] = useState<OfficialLetter | null>(null);
  const [bulkPrintLetters, setBulkPrintLetters] = useState<OfficialLetter[]>([]);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<OfficialLetter | null>(null);
  const [modalPrintMode, setModalPrintMode] = useState<'physical' | 'digital'>('physical');

  // Single Form Generator States
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

  // Mass Letter Generator States (Buat Surat Massal / Sekaligus)
  const [massSelectedEmployeeIds, setMassSelectedEmployeeIds] = useState<string[]>([]);
  const [massFilterUnit, setMassFilterUnit] = useState<string>('all');
  const [massTemplateId, setMassTemplateId] = useState<string>('');
  const [massLetterType, setMassLetterType] = useState<LetterType>('sp_peringatan');
  const [massSubjectTemplate, setMassSubjectTemplate] = useState('SURAT PERINGATAN PERTAMA (SP-1) UNTUK SDR. {NAMA}');
  const [massHeaderTitle, setMassHeaderTitle] = useState("SURAT PERINGATAN YAYASAN PENDIDIKAN ISLAM PONDOK PESANTREN AL-QUR'ANIYYAH");
  const [massConsidering, setMassConsidering] = useState<string[]>([
    'Bahwa kedisiplinan dan tata tertib kepegawaian wajib dipatuhi oleh seluruh Guru dan Karyawan.',
    'Bahwa Sdr. {NAMA} perlu mendapatkan pembinaan dan teguran tertulis resmi.'
  ]);
  const [massInView, setMassInView] = useState<string[]>([
    'Peraturan Kepegawaian YASPIQ Nomor 3 Tahun 2008.',
    'Peraturan Tata Tertib Kedisiplinan Kerja YASPIQ Nomor 4 Tahun 2008.'
  ]);
  const [massDecidingEntries, setMassDecidingEntries] = useState<[string, string][]>([
    ['Pertama', 'Memberikan Surat Peringatan Pertama (SP-1) kepada Sdr. {NAMA} ({JABATAN}, Unit: {UNIT});'],
    ['Kedua', 'Meminta yang bersangkutan untuk meningkatkan kedisiplinan dan integritas kerja secara sungguh-sungguh;'],
    ['Ketiga', 'Surat Peringatan ini berlaku selama 3 (tiga) bulan sejak tanggal diterbitkan.']
  ]);
  const [massEffectiveDate, setMassEffectiveDate] = useState(new Date().toISOString().split('T')[0]);
  const [massIssuedDate, setMassIssuedDate] = useState(new Date().toISOString().split('T')[0]);
  const [massIssuedCity, setMassIssuedCity] = useState('Tangerang Selatan');
  const [massSignerName, setMassSignerName] = useState('Dr. KH. M. Sobron Zayyan, SQ., MA');
  const [massSignerTitle, setMassSignerTitle] = useState('Ketua Umum');

  // Kop Settings Form State
  const [kopHeader1, setKopHeader1] = useState('');
  const [kopHeader2, setKopHeader2] = useState('');
  const [kopAddress, setKopAddress] = useState('');
  const [kopContact, setKopContact] = useState('');
  const [kopImageUrl, setKopImageUrl] = useState('');
  const [hideKopOnPrint, setHideKopOnPrint] = useState(true);
  const [printTopMarginCm, setPrintTopMarginCm] = useState(3.5);
  const [kopCity, setKopCity] = useState('');
  const [kopSignerName, setKopSignerName] = useState('');
  const [kopSignerTitle, setKopSignerTitle] = useState('');

  // Load All Data
  const loadData = async () => {
    try {
      setIsLoading(true);
      const [l, t, k, emp, uList] = await Promise.all([
        letterService.getLetters({ search, type: filterType as any }),
        letterService.getTemplates(),
        letterService.getKopSettings(),
        employeeService.getEmployees(),
        masterDataService.getUnits()
      ]);
      setLetters(l);
      setTemplates(t);
      setKopSettings(k);
      setEmployees(emp.data);
      setUnits(uList);

      // Initialize Kop state
      setKopHeader1(k.header_line1);
      setKopHeader2(k.header_line2);
      setKopAddress(k.address);
      setKopContact(k.contact);
      setKopImageUrl(k.kop_image_url || '');
      setHideKopOnPrint(k.hide_kop_on_print ?? true);
      setPrintTopMarginCm(k.print_top_margin_cm ?? 3.5);
      setKopCity(k.default_city);
      setKopSignerName(k.default_signer_name);
      setKopSignerTitle(k.default_signer_title);

      if (t.length > 0 && !selectedTemplateId) {
        setSelectedTemplateId(t[0].id);
        setMassTemplateId(t[0].id);
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

  // Handle Single Employee Auto-Fill
  const handleSelectEmployee = (empId: string) => {
    setSelectedEmployeeId(empId);
    const emp = employees.find(e => e.id === empId);
    if (!emp) return;

    const empName = emp.full_name;
    const empNirgNirk = emp.nirg ? `NRIG : ${emp.nirg}` : emp.nirk ? `NIRK : ${emp.nirk}` : `NIK : ${emp.nik}`;
    const empUnit = emp.primary_assignment?.unit_name || emp.units_list?.[0] || 'Yayasan Al-Qur\'aniyyah';
    const empPosition = emp.primary_assignment?.position_name || emp.positions_list?.[0] || 'Guru / Karyawan';
    const empBirth = `${emp.birth_place || 'Tangerang'}, ${emp.birth_date || '-'}`;

    if (letterType === 'sk_pengangkatan') {
      setLetterTitle(`SK Pengangkatan Guru/Karyawan Sdr. ${empName}`);
      setLetterSubject(`PENGANGKATAN SDR. ${empName.toUpperCase()} ${empNirgNirk} MENJADI GURU TETAP (GT) YAYASAN PENDIDIKAN ISLAM PONDOK PESANTREN AL-QUR'ANIYYAH`);
    } else if (letterType === 'sp_peringatan') {
      setLetterTitle(`Surat Peringatan Sdr. ${empName}`);
      setLetterSubject(`SURAT PERINGATAN PERTAMA (SP-1) UNTUK SDR. ${empName.toUpperCase()}`);
    }

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

  // Apply Template to Single Generator
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

  // Apply Template to Mass Generator
  const handleApplyMassTemplate = (tplId: string) => {
    setMassTemplateId(tplId);
    const tpl = templates.find(t => t.id === tplId);
    if (!tpl) return;

    setMassLetterType(tpl.type);
    setMassHeaderTitle(tpl.header_title);
    setMassSubjectTemplate(tpl.subject_template || `SURAT KEPUTUSAN YAYASAN UNTUK SDR. {NAMA}`);
    setMassConsidering(tpl.considering_text.length > 0 ? tpl.considering_text : ['']);
    setMassInView(tpl.in_view_text.length > 0 ? tpl.in_view_text : ['']);

    const entries = Object.entries(tpl.deciding_text);
    setMassDecidingEntries(entries.length > 0 ? entries : [['Pertama', 'Memutuskan untuk Sdr. {NAMA}']]);
    setMassIssuedCity(tpl.footer_city || 'Tangerang Selatan');
    setMassSignerName(tpl.signer_name || 'Dr. KH. M. Sobron Zayyan, SQ., MA');
    setMassSignerTitle(tpl.signer_title || 'Ketua Umum');
  };

  // Auto-generate Letter Number
  const handleGenerateNumber = async () => {
    const num = await letterService.generateNextLetterNumber(letterType);
    setLetterNumber(num);
  };

  // Save Single Letter
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

  // Generate Mass / Bulk Letters for Selected Employees
  const handleGenerateMassLetters = async () => {
    if (massSelectedEmployeeIds.length === 0) {
      error('Pilih minimal satu karyawan untuk menerbitkan surat massal');
      return;
    }

    try {
      setIsLoading(true);
      const selectedEmps = employees.filter(e => massSelectedEmployeeIds.includes(e.id));
      const startLetterNumber = await letterService.generateNextLetterNumber(massLetterType);
      
      // Parse starting sequential number
      let startSeq = 1;
      const match = startLetterNumber.match(/^(\d+)/);
      if (match) {
        startSeq = parseInt(match[1], 10);
      }

      const romanMonths = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];
      const currentMonth = romanMonths[new Date().getMonth()];
      const currentYear = new Date().getFullYear();
      const codeMap: Record<LetterType, string> = {
        sk_pengangkatan: 'SK',
        sp_peringatan: 'SP-1',
        sk_penugasan: 'SKP',
        surat_keterangan: 'SKET',
        custom: 'SURAT'
      };
      const code = codeMap[massLetterType] || 'SK';

      const replaceTags = (text: string, emp: Employee): string => {
        const empName = emp.full_name;
        const empNirgNirk = emp.nirg ? `NRIG : ${emp.nirg}` : emp.nirk ? `NIRK : ${emp.nirk}` : `NIK : ${emp.nik}`;
        const empUnit = emp.primary_assignment?.unit_name || emp.units_list?.[0] || 'Yayasan Al-Qur\'aniyyah';
        const empPosition = emp.primary_assignment?.position_name || emp.positions_list?.[0] || 'Guru / Karyawan';
        const empBirth = `${emp.birth_place || 'Tangerang'}, ${emp.birth_date || '-'}`;

        return text
          .replace(/\{NAMA\}/gi, empName)
          .replace(/\{NIK\}/gi, emp.nik)
          .replace(/\{NIRG_NIRK\}/gi, empNirgNirk)
          .replace(/\{UNIT\}/gi, empUnit)
          .replace(/\{JABATAN\}/gi, empPosition)
          .replace(/\{TEMPAT_TGL_LAHIR\}/gi, empBirth)
          .replace(/\{PENDIDIKAN\}/gi, emp.last_education || 'S1');
      };

      const itemsToCreate: Partial<OfficialLetter>[] = selectedEmps.map((emp, idx) => {
        const seqNum = String(startSeq + idx).padStart(3, '0');
        const numStr = `${seqNum} /${code}/YASPIQ/${currentMonth}/${currentYear}`;

        const sub = replaceTags(massSubjectTemplate, emp);
        const considering = massConsidering.map(c => replaceTags(c, emp)).filter(Boolean);
        const inView = massInView.map(v => replaceTags(v, emp)).filter(Boolean);

        const decidingObj: Record<string, string> = {};
        massDecidingEntries.forEach(([k, v]) => {
          if (k.trim()) decidingObj[k.trim()] = replaceTags(v, emp);
        });

        return {
          letter_number: numStr,
          template_id: massTemplateId,
          type: massLetterType,
          title: `${massLetterType === 'sp_peringatan' ? 'Surat Peringatan' : 'Surat Keputusan'} - ${emp.full_name}`,
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
          subject: sub,
          header_title: massHeaderTitle,
          considering,
          in_view: inView,
          observing: [],
          deciding: decidingObj,
          effective_date: massEffectiveDate,
          issued_date: massIssuedDate,
          issued_city: massIssuedCity,
          signer_name: massSignerName,
          signer_title: massSignerTitle,
          status: 'diterbitkan'
        };
      });

      const created = await letterService.saveMultipleLetters(itemsToCreate);
      success(`Berhasil menerbitkan ${created.length} Surat secara bersamaan!`);
      await loadData();

      // Ask to print all immediately
      setBulkPrintLetters(created);
      setIsPreviewOpen(true);
      setActiveTab('arsip');
    } catch (err: any) {
      error('Gagal menerbitkan surat massal: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Image Upload for Kop Surat
  const handleKopImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 3 * 1024 * 1024) {
      error('Ukuran gambar Kop terlalu besar (maksimal 3MB)');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setKopImageUrl(reader.result as string);
      success('Gambar Kop Surat berhasil diunggah');
    };
    reader.readAsDataURL(file);
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
        kop_image_url: kopImageUrl,
        hide_kop_on_print: hideKopOnPrint,
        print_top_margin_cm: printTopMarginCm,
        default_city: kopCity,
        default_signer_name: kopSignerName,
        default_signer_title: kopSignerTitle
      });
      success('Berhasil menyimpan Pengaturan Kop Surat & Cetak');
      await loadData();
    } catch (err: any) {
      error('Gagal menyimpan Kop: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Single Print Trigger
  const handlePrintSingle = (letter: OfficialLetter) => {
    setSingleLetterPreview(letter);
    setBulkPrintLetters([letter]);
    setIsPreviewOpen(true);
  };

  // Bulk Print Trigger
  const handlePrintSelectedLetters = () => {
    const selected = letters.filter(l => selectedLetterIds.includes(l.id));
    if (selected.length === 0) return;
    setSingleLetterPreview(null);
    setBulkPrintLetters(selected);
    setIsPreviewOpen(true);
  };

  // Filtered employees for Mass Mode
  const massFilteredEmployees = employees.filter(emp => {
    if (massFilterUnit === 'all') return true;
    return (
      emp.primary_assignment?.unit_id === massFilterUnit ||
      emp.units_list?.includes(units.find(u => u.id === massFilterUnit)?.name || '')
    );
  });

  // Archive Multi-Select Helpers
  const toggleSelectLetter = (id: string) => {
    setSelectedLetterIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const toggleSelectAllLetters = () => {
    if (selectedLetterIds.length === letters.length) {
      setSelectedLetterIds([]);
    } else {
      setSelectedLetterIds(letters.map(l => l.id));
    }
  };

  const handleBulkDelete = async () => {
    try {
      setIsLoading(true);
      await letterService.deleteMultipleLetters(selectedLetterIds);
      success(`Berhasil menghapus ${selectedLetterIds.length} arsip surat`);
      setSelectedLetterIds([]);
      setBulkDeleteConfirmOpen(false);
      await loadData();
    } catch (err: any) {
      error('Gagal menghapus surat: ' + err.message);
    } finally {
      setIsLoading(false);
    }
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
    <div className="space-y-6 max-w-7xl mx-auto pb-24 animate-in fade-in duration-300">
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
            Buat, cetak PDF (dengan Kop / tanpa Kop), kirim via Gmail, dan terbitkan Surat Keputusan (SK) & Surat Peringatan (SP) tunggal maupun massal untuk banyak karyawan sekaligus.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <Button
            variant="outline"
            size="md"
            className="w-full sm:w-auto justify-center"
            leftIcon={<Users className="w-4 h-4 text-emerald-700" />}
            onClick={() => {
              handleApplyMassTemplate(templates[0]?.id || '');
              setActiveTab('buat_massal');
            }}
          >
            Surat Massal (Banyak Karyawan)
          </Button>
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
            Buat Surat Tunggal
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
          <span>Buat Surat Tunggal ({editingLetterId ? 'Edit' : 'Baru'})</span>
        </button>

        <button
          onClick={() => {
            if (templates.length > 0 && !massTemplateId) {
              handleApplyMassTemplate(templates[0].id);
            }
            setActiveTab('buat_massal');
          }}
          className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition flex items-center gap-2 shrink-0 ${
            activeTab === 'buat_massal'
              ? 'bg-emerald-800 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <Users className="w-4 h-4 text-emerald-300" />
          <span>⚡ Buat Surat Massal (Sekaligus)</span>
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
          {/* Filters & Bulk Select Bar */}
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

            <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
              {letters.length > 0 && (
                <button
                  onClick={toggleSelectAllLetters}
                  className="px-3 py-2 text-xs font-bold rounded-xl border border-slate-300 hover:bg-slate-50 transition flex items-center gap-1.5 text-slate-700"
                >
                  {selectedLetterIds.length === letters.length ? (
                    <CheckSquare className="w-4 h-4 text-emerald-700" />
                  ) : (
                    <Square className="w-4 h-4 text-slate-400" />
                  )}
                  <span>
                    {selectedLetterIds.length === letters.length ? 'Batal Pilih Semua' : 'Pilih Semua'}
                  </span>
                </button>
              )}

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
                Silakan buat Surat Keputusan (SK) atau Surat Peringatan baru secara tunggal atau massal.
              </p>
              <div className="flex justify-center gap-3 mt-4">
                <Button
                  variant="gold"
                  size="sm"
                  leftIcon={<Plus className="w-4 h-4" />}
                  onClick={() => setActiveTab('buat')}
                >
                  Buat Surat Tunggal
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  leftIcon={<Users className="w-4 h-4" />}
                  onClick={() => setActiveTab('buat_massal')}
                >
                  Buat Surat Massal
                </Button>
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {letters.map(ltr => {
                const isChecked = selectedLetterIds.includes(ltr.id);
                return (
                  <Card
                    key={ltr.id}
                    className={`transition shadow-sm flex flex-col justify-between border-2 ${
                      isChecked ? 'border-emerald-600 bg-emerald-50/20' : 'border-slate-200/80 hover:border-emerald-200'
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => toggleSelectLetter(ltr.id)}
                            className="text-slate-600 hover:text-emerald-700 transition"
                          >
                            {isChecked ? (
                              <CheckSquare className="w-5 h-5 text-emerald-700" />
                            ) : (
                              <Square className="w-5 h-5 text-slate-300" />
                            )}
                          </button>
                          <Badge variant={ltr.type === 'sp_peringatan' ? 'amber' : 'emerald'} size="sm">
                            {ltr.type === 'sp_peringatan' ? 'Surat Peringatan (SP)' : 'SK Pengangkatan'}
                          </Badge>
                        </div>
                        <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                          {ltr.letter_number}
                        </span>
                      </div>

                      <h4 className="text-sm font-bold text-slate-900 leading-snug line-clamp-2 mt-1">
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
                          onClick={() => handlePrintSingle(ltr)}
                        >
                          Lihat
                        </Button>
                        <Button
                          variant="gold"
                          size="sm"
                          className="text-xs"
                          leftIcon={<Printer className="w-3.5 h-3.5" />}
                          onClick={() => handlePrintSingle(ltr)}
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
                );
              })}
            </div>
          )}

          {/* Floating Bulk Action Bar */}
          {selectedLetterIds.length > 0 && (
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-6 py-3 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-4 z-40 animate-in slide-in-from-bottom duration-300">
              <span className="text-xs font-bold text-amber-400">
                {selectedLetterIds.length} Surat Terpilih
              </span>
              <div className="h-4 w-px bg-slate-700" />

              <Button
                variant="gold"
                size="sm"
                leftIcon={<Printer className="w-4 h-4" />}
                onClick={handlePrintSelectedLetters}
              >
                Cetak Sekaligus ({selectedLetterIds.length})
              </Button>

              <Button
                variant="outline"
                size="sm"
                className="bg-slate-800 text-white border-slate-700 hover:bg-slate-700"
                leftIcon={<Mail className="w-4 h-4 text-emerald-400" />}
                onClick={() => {
                  const selected = letters.filter(l => selectedLetterIds.includes(l.id));
                  letterService.sendBulkViaGmail(selected);
                }}
              >
                Kirim Gmail Massal
              </Button>

              <button
                onClick={() => setBulkDeleteConfirmOpen(true)}
                className="p-2 text-rose-400 hover:text-rose-300 transition"
                title="Hapus Terpilih"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: BUAT SURAT TUNGGAL */}
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

            {/* Menimbang & Mengingat */}
            <Card title="Isi Konsideran (Menimbang & Mengingat)">
              <div className="space-y-4 text-xs">
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
                  onClick={() => handlePrintSingle(previewDraftLetter)}
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

      {/* TAB 3: BUAT SURAT MASSAL (SEKALIGUS UNTUK BANYAK KARYAWAN) */}
      {activeTab === 'buat_massal' && (
        <div className="space-y-6">
          <Card title="⚡ Buat Surat Massal (SP / SK / Penugasan untuk Banyak Karyawan)">
            <div className="space-y-6 text-xs">
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl">
                <p className="font-bold text-emerald-900 text-xs">
                  Panduan Terbit Surat Massal:
                </p>
                <p className="text-emerald-800 text-[11px] mt-1 leading-relaxed">
                  Pilih beberapa karyawan sekaligus via checkbox di bawah. Sistem akan secara otomatis membuat nomor surat berurutan (misal: 048, 049, 050) dan mengganti variabel dinamik seperti <code className="bg-emerald-100 px-1 rounded font-bold">{'{NAMA}'}</code>, <code className="bg-emerald-100 px-1 rounded font-bold">{'{JABATAN}'}</code>, <code className="bg-emerald-100 px-1 rounded font-bold">{'{UNIT}'}</code> secara otomatis untuk setiap karyawan.
                </p>
              </div>

              {/* Template & Filter Selection */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Gunakan Template Surat *</label>
                  <Select
                    value={massTemplateId}
                    onChange={e => handleApplyMassTemplate(e.target.value)}
                    className="w-full text-xs"
                    options={templates.map(tpl => ({
                      value: tpl.id,
                      label: `${tpl.title} (${tpl.type})`
                    }))}
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">Filter Unit Karyawan</label>
                  <Select
                    value={massFilterUnit}
                    onChange={e => setMassFilterUnit(e.target.value)}
                    className="w-full text-xs"
                    options={[
                      { value: 'all', label: 'Semua Unit / Lembaga' },
                      ...units.map(u => ({ value: u.id, label: u.name }))
                    ]}
                  />
                </div>

                <div>
                  <Input
                    label="Tanggal Penetapan (Issued Date)"
                    type="date"
                    value={massIssuedDate}
                    onChange={e => setMassIssuedDate(e.target.value)}
                  />
                </div>
              </div>

              {/* Format Subject & Diktum */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <Input
                  label="Format Perihal / Tentang (Gunakan {NAMA}, {UNIT}, {JABATAN})"
                  value={massSubjectTemplate}
                  onChange={e => setMassSubjectTemplate(e.target.value)}
                />

                <div>
                  <label className="block font-bold text-slate-800 mb-1">Pasal / Diktum Keputusan Massal</label>
                  {massDecidingEntries.map(([k, v], idx) => (
                    <div key={idx} className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={k}
                        onChange={e => {
                          const copy = [...massDecidingEntries];
                          copy[idx][0] = e.target.value;
                          setMassDecidingEntries(copy);
                        }}
                        className="font-bold text-xs p-1.5 rounded border border-slate-300 w-1/4"
                      />
                      <input
                        type="text"
                        value={v}
                        onChange={e => {
                          const copy = [...massDecidingEntries];
                          copy[idx][1] = e.target.value;
                          setMassDecidingEntries(copy);
                        }}
                        className="w-full text-xs p-1.5 rounded border border-slate-300"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Multi-Select Employee Table */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-bold text-slate-900 text-sm">
                    Pilih Karyawan Penerima Surat ({massSelectedEmployeeIds.length} Terpilih dari {massFilteredEmployees.length})
                  </h4>
                  <button
                    type="button"
                    onClick={() => {
                      if (massSelectedEmployeeIds.length === massFilteredEmployees.length) {
                        setMassSelectedEmployeeIds([]);
                      } else {
                        setMassSelectedEmployeeIds(massFilteredEmployees.map(e => e.id));
                      }
                    }}
                    className="text-xs font-bold text-emerald-800 hover:underline flex items-center gap-1"
                  >
                    {massSelectedEmployeeIds.length === massFilteredEmployees.length ? 'Batal Pilih Semua' : 'Pilih Semua Karyawan Filtered'}
                  </button>
                </div>

                <div className="max-h-72 overflow-y-auto border border-slate-200 rounded-2xl bg-white divide-y divide-slate-100">
                  {massFilteredEmployees.map(emp => {
                    const isChecked = massSelectedEmployeeIds.includes(emp.id);
                    return (
                      <label
                        key={emp.id}
                        className={`flex items-center justify-between p-3 cursor-pointer transition ${
                          isChecked ? 'bg-emerald-50/60' : 'hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {
                              setMassSelectedEmployeeIds(prev =>
                                prev.includes(emp.id) ? prev.filter(i => i !== emp.id) : [...prev, emp.id]
                              );
                            }}
                            className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
                          />
                          <div>
                            <p className="font-bold text-slate-900 text-xs">{emp.full_name}</p>
                            <p className="text-[11px] text-slate-500">
                              {emp.nirg ? `NRIG: ${emp.nirg}` : `NIK: ${emp.nik}`} • {emp.primary_assignment?.unit_name || 'Yayasan'} • {emp.primary_assignment?.position_name || 'Guru'}
                            </p>
                          </div>
                        </div>
                        <Badge variant="slate" size="sm">
                          {emp.employment_status}
                        </Badge>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 flex justify-end">
                <Button
                  variant="primary"
                  size="md"
                  isLoading={isLoading}
                  disabled={massSelectedEmployeeIds.length === 0}
                  leftIcon={<Sparkles className="w-4 h-4 text-amber-300" />}
                  onClick={handleGenerateMassLetters}
                >
                  Terbitkan Surat Massal ({massSelectedEmployeeIds.length} Karyawan)
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* TAB 4: TEMPLATE SURAT */}
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
                    Gunakan di Surat Tunggal
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => {
                      handleApplyMassTemplate(tpl.id);
                      setActiveTab('buat_massal');
                    }}
                  >
                    Gunakan di Surat Massal
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: PENGATURAN KOP SURAT YAYASAN */}
      {activeTab === 'kop' && (
        <Card title="Pengaturan Kop Surat (Gambar/Teks) & Cetak Kertas Fisik">
          <form onSubmit={handleSaveKop} className="space-y-6 text-xs max-w-3xl">
            {/* 1. UPLOAD GAMBAR KOP SURAT */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-emerald-700" />
                    <span>Upload Gambar Kop Surat Resmi</span>
                  </h4>
                  <p className="text-slate-500 text-[11px] mt-0.5">
                    Unggah berkas gambar Kop Surat Yayasan/Sekolah (PNG/JPG). Gambar ini akan otomatis muncul pada preview & export PDF/Gmail.
                  </p>
                </div>
              </div>

              {kopImageUrl ? (
                <div className="space-y-3 pt-2">
                  <div className="p-3 bg-white border border-slate-300 rounded-xl flex items-center justify-center relative group">
                    <img src={kopImageUrl} alt="Preview Kop Surat" className="max-h-32 object-contain" />
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="cursor-pointer inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-100 text-emerald-800 font-bold hover:bg-emerald-200 transition text-xs">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Ganti Gambar Kop</span>
                      <input type="file" accept="image/*" className="hidden" onChange={handleKopImageUpload} />
                    </label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setKopImageUrl('');
                        success('Gambar Kop Surat telah dihapus. Menggunakan format teks.');
                      }}
                    >
                      Hapus Gambar (Gunakan Teks)
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center bg-white hover:bg-slate-50 transition">
                  <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <p className="font-bold text-slate-700">Klik untuk Pilih & Upload Gambar Kop Surat</p>
                  <p className="text-[11px] text-slate-500 mt-1">Format PNG / JPG (Maksimal 3MB)</p>
                  <label className="mt-3 inline-block">
                    <span className="px-4 py-2 rounded-xl bg-emerald-800 text-white font-bold cursor-pointer hover:bg-emerald-900 transition text-xs">
                      Pilih Berkas Gambar Kop
                    </span>
                    <input type="file" accept="image/*" className="hidden" onChange={handleKopImageUpload} />
                  </label>
                </div>
              )}
            </div>

            {/* 2. PENGATURAN CETAK KERTAS FISIK */}
            <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-2xl space-y-3">
              <h4 className="font-bold text-sm text-amber-900 flex items-center gap-2">
                <Printer className="w-4 h-4 text-amber-700" />
                <span>Pengaturan Cetak ke Kertas Berkop Fisik</span>
              </h4>
              <p className="text-amber-800 text-[11px]">
                Jika yayasan Anda sudah memiliki Kertas Fisik Berkop dari percetakan, aktifkan opsi ini agar gambar Kop disembunyikan dan memberikan ruang margin atas saat mencetak.
              </p>

              <div className="space-y-3 pt-2">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hideKopOnPrint}
                    onChange={e => setHideKopOnPrint(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 rounded border-amber-300 focus:ring-emerald-500"
                  />
                  <span className="font-bold text-slate-800 text-xs">
                    Sembunyikan Kop saat di-Print ke Kertas Fisik
                  </span>
                </label>

                {hideKopOnPrint && (
                  <div className="max-w-xs pl-7">
                    <Input
                      label="Margin Atas Kertas Fisik (cm)"
                      type="number"
                      step="0.5"
                      min="0"
                      max="10"
                      value={printTopMarginCm}
                      onChange={e => setPrintTopMarginCm(parseFloat(e.target.value) || 0)}
                      placeholder="3.5"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* 3. FORMAT TEKS KOP ALTERNATIF */}
            <div className="space-y-3">
              <h4 className="font-bold text-sm text-slate-900 border-b border-slate-200 pb-2">
                Format Kop Teks (Alternatif Jika Tanpa Gambar)
              </h4>
              <Input
                label="Baris 1 Kop (Nama Instansi)"
                value={kopHeader1}
                onChange={e => setKopHeader1(e.target.value)}
              />
              <Input
                label="Baris 2 Kop (Nama Pondok Pesantren)"
                value={kopHeader2}
                onChange={e => setKopHeader2(e.target.value)}
              />
              <Input
                label="Alamat Lengkap Yayasan"
                value={kopAddress}
                onChange={e => setKopAddress(e.target.value)}
              />
              <Input
                label="Kontak Telepon & Email"
                value={kopContact}
                onChange={e => setKopContact(e.target.value)}
              />
            </div>

            {/* 4. PENANDATANGAN DEFAULT */}
            <div className="space-y-3 pt-2">
              <h4 className="font-bold text-sm text-slate-900 border-b border-slate-200 pb-2">
                Penandatangan Surat Default
              </h4>
              <Input
                label="Kota Default Penetapan Surat"
                value={kopCity}
                onChange={e => setKopCity(e.target.value)}
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  label="Nama Penandatangan (Ketua Umum)"
                  value={kopSignerName}
                  onChange={e => setKopSignerName(e.target.value)}
                />
                <Input
                  label="Jabatan Penandatangan"
                  value={kopSignerTitle}
                  onChange={e => setKopSignerTitle(e.target.value)}
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200">
              <Button type="submit" variant="primary" isLoading={isLoading} leftIcon={<CheckCircle2 className="w-4 h-4" />}>
                Simpan Pengaturan Kop Surat & Cetak
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* PRINT & PREVIEW MODAL (SUPPORTS SINGLE & BULK PRINTING) */}
      <Modal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        title={`Preview & Cetak Dokumen SK (${bulkPrintLetters.length} Surat)`}
        maxWidth="5xl"
      >
        {bulkPrintLetters.length > 0 && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-slate-100 rounded-2xl border border-slate-200">
              <div>
                <p className="text-xs font-bold text-slate-900">
                  {bulkPrintLetters.length === 1
                    ? bulkPrintLetters[0].title
                    : `Cetak Sekaligus (${bulkPrintLetters.length} Surat)`}
                </p>
                <p className="text-[11px] text-slate-500">
                  {bulkPrintLetters.length === 1
                    ? `Nomor: ${bulkPrintLetters[0].letter_number}`
                    : `Daftar: ${bulkPrintLetters.map(l => l.employee_name).join(', ')}`}
                </p>
              </div>

              {/* Mode Selection & Action Buttons */}
              <div className="flex items-center gap-2 flex-wrap">
                <div className="flex bg-white p-1 rounded-xl border border-slate-300 text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => setModalPrintMode('physical')}
                    className={`px-3 py-1.5 rounded-lg transition ${
                      modalPrintMode === 'physical'
                        ? 'bg-amber-800 text-white shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    📄 Kertas Fisik (Tanpa Kop)
                  </button>
                  <button
                    type="button"
                    onClick={() => setModalPrintMode('digital')}
                    className={`px-3 py-1.5 rounded-lg transition ${
                      modalPrintMode === 'digital'
                        ? 'bg-emerald-800 text-white shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    🖼️ Berkop (Digital/PDF)
                  </button>
                </div>

                <Button
                  variant="gold"
                  size="sm"
                  leftIcon={<Printer className="w-4 h-4" />}
                  onClick={() => window.print()}
                >
                  Print ({bulkPrintLetters.length} Surat)
                </Button>

                {bulkPrintLetters.length === 1 ? (
                  <Button
                    variant="primary"
                    size="sm"
                    leftIcon={<Send className="w-4 h-4" />}
                    onClick={() => letterService.sendViaGmail(bulkPrintLetters[0])}
                  >
                    Kirim Gmail
                  </Button>
                ) : (
                  <Button
                    variant="primary"
                    size="sm"
                    leftIcon={<Send className="w-4 h-4" />}
                    onClick={() => letterService.sendBulkViaGmail(bulkPrintLetters)}
                  >
                    Kirim Gmail Massal
                  </Button>
                )}
              </div>
            </div>

            {/* Printable Letters Preview Container */}
            <div className="border border-slate-300 rounded-xl overflow-hidden bg-slate-200 p-4 max-h-[75vh] overflow-y-auto space-y-6">
              {bulkPrintLetters.map((ltr, index) => (
                <LetterPrintPreview
                  key={ltr.id || index}
                  letter={ltr}
                  kopSettings={kopSettings || undefined}
                  hideKopOnPrintOverride={modalPrintMode === 'physical'}
                  isBulkPrint={bulkPrintLetters.length > 1}
                />
              ))}
            </div>
          </div>
        )}
      </Modal>

      {/* SINGLE DELETE CONFIRMATION DIALOG */}
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

      {/* BULK DELETE CONFIRMATION DIALOG */}
      <ConfirmationDialog
        isOpen={bulkDeleteConfirmOpen}
        onClose={() => setBulkDeleteConfirmOpen(false)}
        onConfirm={handleBulkDelete}
        title={`Hapus ${selectedLetterIds.length} Surat Terpilih?`}
        message={`Apakah Anda yakin ingin menghapus ${selectedLetterIds.length} arsip surat yang dipilih secara permanen? Data yang dihapus tidak dapat dikembalikan.`}
        confirmText={`Hapus ${selectedLetterIds.length} Surat`}
        type="danger"
      />
    </div>
  );
};
