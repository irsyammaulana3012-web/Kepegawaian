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
  Users,
  Copy,
  AlertTriangle,
  History,
  Phone,
  Filter,
  ArrowRight,
  ChevronRight,
  Download
} from 'lucide-react';
import {
  OfficialLetter,
  LetterTemplate,
  LetterKopSettings,
  LetterKopTemplate,
  LetterDeliveryLog,
  Employee,
  LetterType,
  EmployeeAssignment
} from '../../types';
import { letterService } from '../../services/letterService';
import { employeeService } from '../../services/employeeService';
import { masterDataService } from '../../services/masterDataService';
import { store } from '../../services/storageStore';
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
  const { success, error, info } = useToast();
  const [activeTab, setActiveTab] = useState<'arsip' | 'buat' | 'templates' | 'kop' | 'riwayat'>('arsip');

  // Master & Core Data States
  const [letters, setLetters] = useState<OfficialLetter[]>([]);
  const [templates, setTemplates] = useState<LetterTemplate[]>([]);
  const [kopSettings, setKopSettings] = useState<LetterKopSettings | null>(null);
  const [kopTemplates, setKopTemplates] = useState<LetterKopTemplate[]>([]);
  const [deliveryLogs, setDeliveryLogs] = useState<LetterDeliveryLog[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [units, setUnits] = useState<{ id: string; name: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Archive Filters & Multi-Select
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [selectedLetterIds, setSelectedLetterIds] = useState<string[]>([]);
  const [bulkDeleteConfirmOpen, setBulkDeleteConfirmOpen] = useState(false);

  // Preview & Modal States
  const [previewLetter, setPreviewLetter] = useState<OfficialLetter | null>(null);
  const [bulkPrintLetters, setBulkPrintLetters] = useState<OfficialLetter[]>([]);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<OfficialLetter | null>(null);
  const [modalPrintMode, setModalPrintMode] = useState<'physical' | 'digital'>('digital');

  // =========================================================================
  // SINGLE INTEGRATED FLOW STATES FOR "BUAT SURAT"
  // Flow: 1. Template -> 2. Penerima -> 3. Isi Data -> 4. Preview -> 5. Kirim
  // =========================================================================
  const [createStep, setCreateStep] = useState<1 | 2 | 3 | 4>(1);

  // Step 1: Template Selection
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');

  // Step 2: Recipient Selection (Unit Filter & Employee Checkbox)
  const [selectedUnitIds, setSelectedUnitIds] = useState<string[]>([]); // Empty array = Semua Unit
  const [recipientSearch, setRecipientSearch] = useState('');
  const [selectedEmployeeIds, setSelectedEmployeeIds] = useState<string[]>([]);
  const [employeeSelectedAssignments, setEmployeeSelectedAssignments] = useState<Record<string, string>>({}); // empId -> assignmentId

  // Step 3: Letter Fields & Content
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

  // Step 5: Delivery Channel Checkboxes & Confirmation
  const [sendViaWA, setSendViaWA] = useState(true);
  const [sendViaEmail, setSendViaEmail] = useState(true);
  const [isSendConfirmOpen, setIsSendConfirmOpen] = useState(false);

  // =========================================================================
  // TAB KOP TEMPLATES STATES
  // =========================================================================
  const [editingKopTplId, setEditingKopTplId] = useState<string | null>(null);
  const [kopTplName, setKopTplName] = useState('');
  const [kopTplUnitId, setKopTplUnitId] = useState('');
  const [kopTplHeader1, setKopTplHeader1] = useState('');
  const [kopTplHeader2, setKopTplHeader2] = useState('');
  const [kopTplAddress, setKopTplAddress] = useState('');
  const [kopTplContact, setKopTplContact] = useState('');
  const [kopTplImageUrl, setKopTplImageUrl] = useState('');
  const [kopTplImageMode, setKopTplImageMode] = useState<'full_page' | 'header_only'>('full_page');
  const [kopTplTopPaddingCm, setKopTplTopPaddingCm] = useState(4.2);
  const [kopTplPrintTopMarginCm, setKopTplPrintTopMarginCm] = useState(3.5);

  // =========================================================================
  // TAB TEMPLATE SURAT STATES & MODAL
  // =========================================================================
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [editingTemplateId, setEditingTemplateId] = useState<string | null>(null);
  const [modalTplCode, setModalTplCode] = useState('');
  const [modalTplTitle, setModalTplTitle] = useState('');
  const [modalTplType, setModalTplType] = useState<LetterType>('sk_pengangkatan');
  const [modalTplHeaderTitle, setModalTplHeaderTitle] = useState("KEPUTUSAN KETUA UMUM YAYASAN PENDIDIKAN ISLAM PONDOK PESANTREN AL-QUR'ANIYYAH");
  const [modalTplSubjectTemplate, setModalTplSubjectTemplate] = useState('');
  const [modalTplConsidering, setModalTplConsidering] = useState<string[]>(['']);
  const [modalTplInView, setModalTplInView] = useState<string[]>(['']);
  const [modalTplDeciding, setModalTplDeciding] = useState<[string, string][]>([['Pertama', '']]);
  const [modalTplCity, setModalTplCity] = useState('Tangerang Selatan');
  const [modalTplSignerName, setModalTplSignerName] = useState('Dr. KH. M. Sobron Zayyan, SQ., MA');
  const [modalTplSignerTitle, setModalTplSignerTitle] = useState('Ketua Umum');
  const loadData = async () => {
    try {
      setIsLoading(true);
      const [l, t, k, kList, dLogs, emp, uList] = await Promise.all([
        letterService.getLetters({ search, type: filterType as any }),
        letterService.getTemplates(),
        letterService.getKopSettings(),
        letterService.getKopTemplates(),
        letterService.getDeliveryLogs(),
        employeeService.getEmployees(),
        masterDataService.getUnits()
      ]);
      setLetters(l);
      setTemplates(t);
      setKopSettings(k);
      setKopTemplates(kList);
      setDeliveryLogs(dLogs);
      setEmployees(emp.data);
      setUnits(uList);

      if (t.length > 0 && !selectedTemplateId) {
        handleApplyTemplate(t[0]);
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

  // Generate Next Letter Number
  const handleGenerateNumber = async (type: LetterType = letterType) => {
    const num = await letterService.generateNextLetterNumber(type);
    setLetterNumber(num);
  };

  // Apply Selected Template to Creator
  const handleApplyTemplate = (tpl: LetterTemplate) => {
    setSelectedTemplateId(tpl.id);
    setLetterType(tpl.type);
    setHeaderTitle(tpl.header_title);
    setLetterSubject(tpl.subject_template || '');
    setConsideringList(tpl.considering_text.length > 0 ? [...tpl.considering_text] : ['']);
    setInViewList(tpl.in_view_text.length > 0 ? [...tpl.in_view_text] : ['']);
    setObservingList(tpl.observing_text.length > 0 ? [...tpl.observing_text] : ['']);

    const entries = Object.entries(tpl.deciding_text);
    setDecidingEntries(entries.length > 0 ? entries.map(([k, v]) => [k, v]) : [['Pertama', '']]);
    setIssuedCity(tpl.footer_city || 'Tangerang Selatan');
    setSignerName(tpl.signer_name || 'Dr. KH. M. Sobron Zayyan, SQ., MA');
    setSignerTitle(tpl.signer_title || 'Ketua Umum');
    handleGenerateNumber(tpl.type);
  };

  // Filter Employees based on Selected Unit(s) and Recipient Search
  const filteredEmployeesForRecipient = employees.filter(emp => {
    // Search match
    if (recipientSearch) {
      const q = recipientSearch.toLowerCase();
      const matchName = emp.full_name.toLowerCase().includes(q);
      const matchNik = emp.nik.includes(q);
      const matchNirg = emp.nirg?.toLowerCase().includes(q) || emp.nirk?.toLowerCase().includes(q);
      if (!matchName && !matchNik && !matchNirg) return false;
    }

    // Unit filter (Multiple Unit selection)
    if (selectedUnitIds.length > 0) {
      const empUnitIds: string[] = [];
      if (emp.primary_assignment?.unit_id) empUnitIds.push(emp.primary_assignment.unit_id);
      if (emp.assignments && emp.assignments.length > 0) {
        emp.assignments.forEach(a => {
          if (a.unit_id && a.status === 'Aktif') empUnitIds.push(a.unit_id);
        });
      }
      const hasMatchingUnit = selectedUnitIds.some(uId => empUnitIds.includes(uId));
      if (!hasMatchingUnit) return false;
    }

    return true;
  });

  // Toggle Unit Selection
  const toggleUnitFilter = (unitId: string) => {
    setSelectedUnitIds(prev =>
      prev.includes(unitId) ? prev.filter(id => id !== unitId) : [...prev, unitId]
    );
  };

  // Toggle Employee Selection
  const toggleEmployeeSelection = (empId: string) => {
    setSelectedEmployeeIds(prev =>
      prev.includes(empId) ? prev.filter(id => id !== empId) : [...prev, empId]
    );
  };

  // Select All Filtered Employees
  const selectAllFilteredEmployees = () => {
    const allIds = filteredEmployeesForRecipient.map(e => e.id);
    setSelectedEmployeeIds(Array.from(new Set([...selectedEmployeeIds, ...allIds])));
  };

  // Unselect All Employees
  const unselectAllEmployees = () => {
    setSelectedEmployeeIds([]);
  };

  // Select All Employees in a Specific Unit
  const selectAllInUnit = (unitId: string) => {
    const empInUnit = employees.filter(emp => {
      const empUnitIds: string[] = [];
      if (emp.primary_assignment?.unit_id) empUnitIds.push(emp.primary_assignment.unit_id);
      if (emp.assignments) {
        emp.assignments.forEach(a => {
          if (a.unit_id && a.status === 'Aktif') empUnitIds.push(a.unit_id);
        });
      }
      return empUnitIds.includes(unitId);
    }).map(e => e.id);

    setSelectedEmployeeIds(Array.from(new Set([...selectedEmployeeIds, ...empInUnit])));
    const unitObj = units.find(u => u.id === unitId);
    success(`Memilih seluruh karyawan pada unit ${unitObj?.name || ''}`);
  };

  // Replace placeholders in text for a given employee and selected assignment
  const replacePlaceholders = (text: string, emp: Employee, seqNumberStr: string): string => {
    const selectedAssignmentId = employeeSelectedAssignments[emp.id];
    let activeAssignment: EmployeeAssignment | undefined;

    if (selectedAssignmentId && emp.assignments) {
      activeAssignment = emp.assignments.find(a => a.id === selectedAssignmentId);
    }
    if (!activeAssignment) {
      activeAssignment = emp.primary_assignment || emp.assignments?.[0];
    }

    const empName = emp.full_name;
    const empNik = emp.nik;
    const empNip = emp.nip || '-';
    const empUnit = activeAssignment?.unit_name || emp.units_list?.[0] || 'Yayasan Al-Qur\'aniyyah';
    const empPosition = activeAssignment?.position_name || emp.positions_list?.[0] || 'Guru / Karyawan';
    const empTask = activeAssignment?.task_name || activeAssignment?.custom_task_name || '-';
    const empBirth = `${emp.birth_place || 'Tangerang'}, ${emp.birth_date || '-'}`;

    return text
      .replace(/\{nama\}/gi, empName)
      .replace(/\{nik\}/gi, empNik)
      .replace(/\{nip\}/gi, empNip)
      .replace(/\{unit\}/gi, empUnit)
      .replace(/\{jabatan\}/gi, empPosition)
      .replace(/\{tugas\}/gi, empTask)
      .replace(/\{unit_penugasan\}/gi, empUnit)
      .replace(/\{jabatan_penugasan\}/gi, empPosition)
      .replace(/\{tugas_penugasan\}/gi, empTask)
      .replace(/\{nomor_surat\}/gi, seqNumberStr)
      .replace(/\{tanggal_surat\}/gi, new Date(issuedDate).toLocaleDateString('id-ID', { dateStyle: 'long' }))
      .replace(/\{perihal\}/gi, letterSubject);
  };

  // Execute Creation & Issue Letters for All Checked Recipients
  const handlePublishLetters = async () => {
    if (selectedEmployeeIds.length === 0) {
      error('Pilih minimal satu karyawan penerima surat');
      return;
    }

    try {
      setIsLoading(true);
      const selectedEmps = employees.filter(e => selectedEmployeeIds.includes(e.id));
      const startLetterNumber = letterNumber || (await letterService.generateNextLetterNumber(letterType));

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
      const code = codeMap[letterType] || 'SK';

      const itemsToCreate: Partial<OfficialLetter>[] = selectedEmps.map((emp, idx) => {
        const seqNum = String(startSeq + idx).padStart(3, '0');
        const numStr = `${seqNum} /${code}/YASPIQ/${currentMonth}/${currentYear}`;

        const sub = replacePlaceholders(letterSubject, emp, numStr);
        const considering = consideringList.map(c => replacePlaceholders(c, emp, numStr)).filter(Boolean);
        const inView = inViewList.map(v => replacePlaceholders(v, emp, numStr)).filter(Boolean);
        const observing = observingList.map(o => replacePlaceholders(o, emp, numStr)).filter(Boolean);

        const decidingObj: Record<string, string> = {};
        decidingEntries.forEach(([k, v]) => {
          if (k.trim()) decidingObj[k.trim()] = replacePlaceholders(v, emp, numStr);
        });

        const selectedAssignmentId = employeeSelectedAssignments[emp.id];
        let activeAsg = emp.assignments?.find(a => a.id === selectedAssignmentId) || emp.primary_assignment;

        return {
          letter_number: numStr,
          template_id: selectedTemplateId,
          type: letterType,
          title: letterTitle ? replacePlaceholders(letterTitle, emp, numStr) : `Surat Resmi ${emp.full_name}`,
          employee_id: emp.id,
          employee_name: emp.full_name,
          employee_email: emp.email,
          employee_nik: emp.nik,
          employee_nirg_nirk: emp.nirg ? `NRIG : ${emp.nirg}` : emp.nirk ? `NIRK : ${emp.nirk}` : `NIK : ${emp.nik}`,
          employee_position: activeAsg?.position_name || emp.positions_list?.[0] || 'Guru',
          employee_unit: activeAsg?.unit_name || emp.units_list?.[0] || 'Yayasan Al-Qur\'aniyyah',
          employee_gender: emp.gender,
          employee_birth_info: `${emp.birth_place || 'Jakarta'}, ${emp.birth_date || '-'}`,
          employee_education_level: emp.last_education || 'S1',
          subject: sub,
          header_title: headerTitle,
          considering,
          in_view: inView,
          observing,
          deciding: decidingObj,
          effective_date: effectiveDate,
          end_date: endDate || undefined,
          issued_date: issuedDate,
          issued_city: issuedCity,
          signer_name: signerName,
          signer_title: signerTitle,
          status: 'diterbitkan'
        };
      });

      const createdLetters = await letterService.saveMultipleLetters(itemsToCreate);
      setBulkPrintLetters(createdLetters);
      success(`Berhasil menerbitkan ${createdLetters.length} Surat Keputusan / Resmi!`);
      await loadData();

      // Trigger Dispatch to WhatsApp & Email channels if selected
      if (sendViaWA || sendViaEmail) {
        setIsSendConfirmOpen(true);
      } else {
        setIsPreviewOpen(true);
        setActiveTab('arsip');
      }
    } catch (err: any) {
      error('Gagal menerbitkan surat: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Execute Dispatch of Letters to WhatsApp / Email & Record Delivery Logs
  const handleConfirmSendDelivery = async () => {
    try {
      setIsLoading(true);
      const newLogs: Partial<LetterDeliveryLog>[] = [];
      const selectedEmps = employees.filter(e => selectedEmployeeIds.includes(e.id));

      bulkPrintLetters.forEach(ltr => {
        const emp = selectedEmps.find(e => e.id === ltr.employee_id);
        const waPhone = emp?.whatsapp || emp?.phone || '';
        const emailAddr = emp?.email || ltr.employee_email || '';

        if (sendViaWA) {
          if (waPhone) {
            newLogs.push({
              letter_id: ltr.id,
              letter_number: ltr.letter_number,
              letter_title: ltr.title,
              employee_id: ltr.employee_id,
              employee_name: ltr.employee_name,
              channel: 'whatsapp',
              recipient_address: waPhone,
              status: 'sent',
              sent_at: new Date().toISOString()
            });
            letterService.sendViaWhatsApp(waPhone, ltr);
          } else {
            newLogs.push({
              letter_id: ltr.id,
              letter_number: ltr.letter_number,
              letter_title: ltr.title,
              employee_id: ltr.employee_id,
              employee_name: ltr.employee_name,
              channel: 'whatsapp',
              recipient_address: '-',
              status: 'skipped',
              sent_at: new Date().toISOString(),
              error_message: 'Nomor WhatsApp tidak tersedia'
            });
          }
        }

        if (sendViaEmail) {
          if (emailAddr) {
            newLogs.push({
              letter_id: ltr.id,
              letter_number: ltr.letter_number,
              letter_title: ltr.title,
              employee_id: ltr.employee_id,
              employee_name: ltr.employee_name,
              channel: 'email',
              recipient_address: emailAddr,
              status: 'sent',
              sent_at: new Date().toISOString()
            });
          } else {
            newLogs.push({
              letter_id: ltr.id,
              letter_number: ltr.letter_number,
              letter_title: ltr.title,
              employee_id: ltr.employee_id,
              employee_name: ltr.employee_name,
              channel: 'email',
              recipient_address: '-',
              status: 'skipped',
              sent_at: new Date().toISOString(),
              error_message: 'Alamat Email tidak tersedia'
            });
          }
        }
      });

      if (sendViaEmail && bulkPrintLetters.length > 0) {
        letterService.sendBulkViaGmail(bulkPrintLetters);
      }

      await letterService.addDeliveryLogs(newLogs);
      success('Pengiriman & pencatatan Riwayat Pengiriman berhasil');
      setIsSendConfirmOpen(false);
      setIsPreviewOpen(true);
      setActiveTab('arsip');
    } catch (err: any) {
      error('Gagal mengirim surat: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Kop Image Upload from File Input
  const handleKopImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 8 * 1024 * 1024) {
        error('Ukuran file gambar KOP maksimal 8MB');
        return;
      }
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        const result = uploadEvent.target?.result as string;
        setKopTplImageUrl(result);
        success('Gambar KOP A4 berhasil diunggah');
      };
      reader.readAsDataURL(file);
    }
  };

  // Save Kop Template in Tab 4
  const handleSaveKopTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!kopTplName) {
      error('Nama Template KOP wajib diisi');
      return;
    }
    try {
      setIsLoading(true);
      const saved = await letterService.saveKopTemplate({
        id: editingKopTplId || undefined,
        name: kopTplName,
        header_line1: 'YAYASAN PENDIDIKAN ISLAM',
        header_line2: 'PONDOK PESANTREN AL-QUR\'ANIYYAH',
        address: 'Jl. Panti Asuhan Ceger No.6 Jurangmangu Timur Pondok Aren Tangerang Selatan 15222',
        contact: 'Telp. (021) 7319421 / 73440835',
        kop_image_url: kopTplImageUrl || '/kop_yayasan.jpg',
        kop_image_mode: 'full_page',
        kop_top_padding_cm: kopTplTopPaddingCm || 5.8,
        print_top_margin_cm: 3.5
      });

      // If editing default Kop or single Kop, update active Kop Settings too
      if (saved.is_default || kopTemplates.length <= 1) {
        await letterService.saveKopSettings({
          header_line1: saved.header_line1,
          header_line2: saved.header_line2,
          address: saved.address,
          contact: saved.contact,
          kop_image_url: saved.kop_image_url || '/kop_yayasan.jpg',
          kop_image_mode: 'full_page',
          kop_top_padding_cm: saved.kop_top_padding_cm || 5.8,
          hide_kop_on_print: true,
          print_top_margin_cm: 3.5,
          default_city: 'Tangerang Selatan',
          default_signer_name: 'Dr. KH. M. Sobron Zayyan, SQ., MA',
          default_signer_title: 'Ketua Umum'
        });
      }

      success('Berhasil menyimpan Template KOP Gambar A4');
      setEditingKopTplId(null);
      setKopTplName('');
      setKopTplImageUrl('');
      await loadData();
    } catch (err: any) {
      error('Gagal menyimpan Template KOP: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Set active default Kop template
  const handleSetDefaultKop = async (kt: LetterKopTemplate) => {
    try {
      setIsLoading(true);
      const updated = kopTemplates.map(item => ({
        ...item,
        is_default: item.id === kt.id
      }));
      await store.setKopTemplates(updated);
      await letterService.saveKopSettings({
        header_line1: kt.header_line1,
        header_line2: kt.header_line2,
        address: kt.address,
        contact: kt.contact,
        kop_image_url: kt.kop_image_url || '/kop_yayasan.jpg',
        kop_image_mode: 'full_page',
        kop_top_padding_cm: kt.kop_top_padding_cm || 5.8,
        hide_kop_on_print: true,
        print_top_margin_cm: 3.5,
        default_city: 'Tangerang Selatan',
        default_signer_name: 'Dr. KH. M. Sobron Zayyan, SQ., MA',
        default_signer_title: 'Ketua Umum'
      });
      success(`Berhasil menjadikan ${kt.name} sebagai KOP Default`);
      await loadData();
    } catch (err: any) {
      error('Gagal mengubah KOP default: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Delete Kop template
  const handleDeleteKopTemplate = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus Template KOP ini?')) return;
    try {
      setIsLoading(true);
      const filtered = kopTemplates.filter(k => k.id !== id);
      await store.setKopTemplates(filtered);
      success('Berhasil menghapus Template KOP');
      await loadData();
    } catch (err: any) {
      error('Gagal menghapus KOP: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // =========================================================================
  // TEMPLATE SURAT CRUD HANDLERS
  // =========================================================================
  const handleOpenNewTemplateModal = () => {
    setEditingTemplateId(null);
    setModalTplCode(`TPL-${Date.now().toString().slice(-4)}`);
    setModalTplTitle('');
    setModalTplType('sk_pengangkatan');
    setModalTplHeaderTitle("KEPUTUSAN KETUA UMUM YAYASAN PENDIDIKAN ISLAM PONDOK PESANTREN AL-QUR'ANIYYAH");
    setModalTplSubjectTemplate('');
    setModalTplConsidering(['']);
    setModalTplInView(['']);
    setModalTplDeciding([['Pertama', '']]);
    setModalTplCity('Tangerang Selatan');
    setModalTplSignerName('Dr. KH. M. Sobron Zayyan, SQ., MA');
    setModalTplSignerTitle('Ketua Umum');
    setIsTemplateModalOpen(true);
  };

  const handleOpenEditTemplateModal = (tpl: LetterTemplate) => {
    setEditingTemplateId(tpl.id);
    setModalTplCode(tpl.code);
    setModalTplTitle(tpl.title);
    setModalTplType(tpl.type);
    setModalTplHeaderTitle(tpl.header_title);
    setModalTplSubjectTemplate(tpl.subject_template || '');
    setModalTplConsidering(tpl.considering_text.length > 0 ? [...tpl.considering_text] : ['']);
    setModalTplInView(tpl.in_view_text.length > 0 ? [...tpl.in_view_text] : ['']);
    setModalTplDeciding(Object.entries(tpl.deciding_text || {}));
    setModalTplCity(tpl.footer_city || 'Tangerang Selatan');
    setModalTplSignerName(tpl.signer_name || 'Dr. KH. M. Sobron Zayyan, SQ., MA');
    setModalTplSignerTitle(tpl.signer_title || 'Ketua Umum');
    setIsTemplateModalOpen(true);
  };

  const handleDuplicateTemplate = async (tpl: LetterTemplate) => {
    try {
      setIsLoading(true);
      await letterService.saveTemplate({
        code: `${tpl.code}-COPY`,
        title: `${tpl.title} (Salinan)`,
        type: tpl.type,
        header_title: tpl.header_title,
        subject_template: tpl.subject_template,
        considering_text: [...tpl.considering_text],
        in_view_text: [...tpl.in_view_text],
        observing_text: [...tpl.observing_text],
        deciding_text: { ...tpl.deciding_text },
        footer_city: tpl.footer_city,
        signer_name: tpl.signer_name,
        signer_title: tpl.signer_title
      });
      success('Berhasil menduplikasi Template Surat');
      await loadData();
    } catch (err: any) {
      error('Gagal menduplikasi template: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteTemplate = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus template surat ini?')) return;
    try {
      setIsLoading(true);
      await letterService.deleteTemplate(id);
      success('Berhasil menghapus Template Surat');
      await loadData();
    } catch (err: any) {
      error('Gagal menghapus template: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveTemplateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalTplTitle || !modalTplCode) {
      error('Kode dan Judul Template Surat wajib diisi');
      return;
    }
    try {
      setIsLoading(true);
      const decidingObj: Record<string, string> = {};
      modalTplDeciding.forEach(([k, v]) => {
        if (k.trim()) decidingObj[k.trim()] = v;
      });

      await letterService.saveTemplate({
        id: editingTemplateId || undefined,
        code: modalTplCode,
        title: modalTplTitle,
        type: modalTplType,
        header_title: modalTplHeaderTitle,
        subject_template: modalTplSubjectTemplate,
        considering_text: modalTplConsidering.filter(Boolean),
        in_view_text: modalTplInView.filter(Boolean),
        observing_text: [],
        deciding_text: decidingObj,
        footer_city: modalTplCity,
        signer_name: modalTplSignerName,
        signer_title: modalTplSignerTitle
      });

      success('Berhasil menyimpan Template Surat');
      setIsTemplateModalOpen(false);
      await loadData();
    } catch (err: any) {
      error('Gagal menyimpan template: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Single Print Helper
  const handlePrintSingle = (letter: OfficialLetter) => {
    setPreviewLetter(letter);
    setBulkPrintLetters([letter]);
    setModalPrintMode('digital');
    setIsPreviewOpen(true);
  };

  // Bulk Print Helper
  const handlePrintSelectedLetters = () => {
    const selected = letters.filter(l => selectedLetterIds.includes(l.id));
    if (selected.length === 0) return;
    setPreviewLetter(null);
    setBulkPrintLetters(selected);
    setModalPrintMode('digital');
    setIsPreviewOpen(true);
  };

  // Archive Multi-Select Helpers
  const toggleSelectArchiveLetter = (id: string) => {
    setSelectedLetterIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const toggleSelectAllArchiveLetters = () => {
    if (selectedLetterIds.length === letters.length) {
      setSelectedLetterIds([]);
    } else {
      setSelectedLetterIds(letters.map(l => l.id));
    }
  };

  const handleBulkDeleteArchive = async () => {
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

  // Recipient validation summary for delivery
  const selectedEmpsForDelivery = employees.filter(e => selectedEmployeeIds.includes(e.id));
  const waAvailableCount = selectedEmpsForDelivery.filter(e => e.whatsapp || e.phone).length;
  const emailAvailableCount = selectedEmpsForDelivery.filter(e => e.email).length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-28 animate-in fade-in duration-300">
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
            Buat, cetak PDF / Print, dan kirimkan Surat Keputusan (SK) & Surat Resmi untuk satu atau banyak karyawan sekaligus secara terpadu.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <Button
            variant="primary"
            size="md"
            className="w-full sm:w-auto justify-center"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => {
              setCreateStep(1);
              if (templates.length > 0) handleApplyTemplate(templates[0]);
              setActiveTab('buat');
            }}
          >
            Buat Surat
          </Button>
        </div>
      </div>

      {/* STRICT MENU STRUCTURE (5 TABS ONLY) */}
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
            if (templates.length > 0 && !selectedTemplateId) {
              handleApplyTemplate(templates[0]);
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
          <span>Buat Surat</span>
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
          <span>Template KOP ({kopTemplates.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('riwayat')}
          className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition flex items-center gap-2 shrink-0 ${
            activeTab === 'riwayat'
              ? 'bg-emerald-800 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <History className="w-4 h-4" />
          <span>Riwayat Pengiriman ({deliveryLogs.length})</span>
        </button>
      </div>

      {/* TAB 1: DAFTAR & ARSIP SURAT */}
      {activeTab === 'arsip' && (
        <div className="space-y-4">
          {/* Search & Filter Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Cari Nomor Surat, Perihal, atau Nama Karyawan..."
                className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700"
              />
            </div>

            <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
              {letters.length > 0 && (
                <button
                  onClick={toggleSelectAllArchiveLetters}
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

          {/* Letter Table / Grid */}
          {letters.length === 0 ? (
            <Card className="text-center py-12">
              <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-800">Belum Ada Surat Terbit</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Silakan buat Surat Keputusan (SK) atau Surat Resmi baru menggunakan tombol "Buat Surat".
              </p>
              <Button
                variant="gold"
                size="sm"
                className="mt-4"
                leftIcon={<Plus className="w-4 h-4" />}
                onClick={() => {
                  setCreateStep(1);
                  setActiveTab('buat');
                }}
              >
                Buat Surat Pertama
              </Button>
            </Card>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left text-slate-700">
                  <thead className="bg-slate-50 text-slate-900 font-bold uppercase tracking-wider border-b border-slate-200 text-[11px]">
                    <tr>
                      <th className="py-3 px-4 w-10 text-center">✓</th>
                      <th className="py-3 px-4">Nomor Surat</th>
                      <th className="py-3 px-4">Tanggal</th>
                      <th className="py-3 px-4">Penerima & Jabatan</th>
                      <th className="py-3 px-4">Perihal / Tentang</th>
                      <th className="py-3 px-4 text-center">Status</th>
                      <th className="py-3 px-4 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-sans">
                    {letters.map(ltr => {
                      const isChecked = selectedLetterIds.includes(ltr.id);
                      return (
                        <tr
                          key={ltr.id}
                          className={`hover:bg-slate-50 transition ${isChecked ? 'bg-emerald-50/40' : ''}`}
                        >
                          <td className="py-3 px-4 text-center">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => toggleSelectArchiveLetter(ltr.id)}
                              className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 cursor-pointer"
                            />
                          </td>
                          <td className="py-3 px-4 font-mono font-bold text-slate-900 whitespace-nowrap">
                            {ltr.letter_number}
                          </td>
                          <td className="py-3 px-4 whitespace-nowrap text-slate-500">
                            {new Date(ltr.issued_date).toLocaleDateString('id-ID', { dateStyle: 'medium' })}
                          </td>
                          <td className="py-3 px-4">
                            <p className="font-bold text-slate-900">{ltr.employee_name}</p>
                            <p className="text-[11px] text-slate-500">
                              {ltr.employee_unit || 'Yayasan'} • {ltr.employee_position || 'Guru'}
                            </p>
                          </td>
                          <td className="py-3 px-4 max-w-xs truncate font-medium text-slate-800" title={ltr.subject}>
                            {ltr.subject}
                          </td>
                          <td className="py-3 px-4 text-center whitespace-nowrap">
                            <Badge variant={ltr.status === 'diterbitkan' ? 'emerald' : 'slate'} size="sm">
                              {ltr.status}
                            </Badge>
                          </td>
                          <td className="py-3 px-4 text-right whitespace-nowrap space-x-1">
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-[11px] py-1"
                              leftIcon={<Eye className="w-3 h-3" />}
                              onClick={() => handlePrintSingle(ltr)}
                            >
                              Lihat
                            </Button>
                            <Button
                              variant="gold"
                              size="sm"
                              className="text-[11px] py-1"
                              leftIcon={<Printer className="w-3 h-3" />}
                              onClick={() => handlePrintSingle(ltr)}
                            >
                              Cetak
                            </Button>
                            <button
                              title="Kirim via Gmail"
                              onClick={() => letterService.sendViaGmail(ltr)}
                              className="p-1.5 rounded-lg text-emerald-700 hover:bg-emerald-50 transition inline-flex items-center"
                            >
                              <Mail className="w-4 h-4" />
                            </button>
                            <button
                              title="Hapus Surat"
                              onClick={() => setDeleteTarget(ltr)}
                              className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 transition inline-flex items-center"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
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

      {/* TAB 2: BUAT SURAT (UNIFIED WIZARD FLOW) */}
      {activeTab === 'buat' && (
        <div className="space-y-6">
          {/* Step Progress Tracker Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between text-xs font-bold">
            <button
              onClick={() => setCreateStep(1)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl transition ${
                createStep === 1 ? 'bg-emerald-800 text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <span className="w-5 h-5 rounded-full bg-amber-400 text-slate-900 flex items-center justify-center text-[10px]">1</span>
              <span>Pilih Template</span>
            </button>
            <ChevronRight className="w-4 h-4 text-slate-300" />

            <button
              onClick={() => setCreateStep(2)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl transition ${
                createStep === 2 ? 'bg-emerald-800 text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <span className="w-5 h-5 rounded-full bg-amber-400 text-slate-900 flex items-center justify-center text-[10px]">2</span>
              <span>Pilih Penerima ({selectedEmployeeIds.length})</span>
            </button>
            <ChevronRight className="w-4 h-4 text-slate-300" />

            <button
              onClick={() => setCreateStep(3)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl transition ${
                createStep === 3 ? 'bg-emerald-800 text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <span className="w-5 h-5 rounded-full bg-amber-400 text-slate-900 flex items-center justify-center text-[10px]">3</span>
              <span>Isi Data Surat</span>
            </button>
            <ChevronRight className="w-4 h-4 text-slate-300" />

            <button
              onClick={() => setCreateStep(4)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl transition ${
                createStep === 4 ? 'bg-emerald-800 text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <span className="w-5 h-5 rounded-full bg-amber-400 text-slate-900 flex items-center justify-center text-[10px]">4</span>
              <span>Preview & Terbitkan</span>
            </button>
          </div>

          {/* STEP 1: PILIH TEMPLATE SURAT */}
          {createStep === 1 && (
            <Card title="Langkah 1: Pilih Format Template Surat">
              <div className="space-y-4 text-xs">
                <p className="text-slate-500">
                  Pilih salah satu format template surat resmi di bawah sebagai dasar penulisan Surat Keputusan (SK) / Surat Peringatan (SP).
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {templates.map(tpl => {
                    const isSelected = selectedTemplateId === tpl.id;
                    return (
                      <div
                        key={tpl.id}
                        onClick={() => handleApplyTemplate(tpl)}
                        className={`p-4 rounded-2xl border-2 cursor-pointer transition flex flex-col justify-between ${
                          isSelected
                            ? 'border-emerald-600 bg-emerald-50/30 shadow-md'
                            : 'border-slate-200 bg-white hover:border-emerald-300'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <Badge variant={isSelected ? 'emerald' : 'slate'} size="sm">
                              {tpl.type}
                            </Badge>
                            {isSelected && <CheckCircle2 className="w-5 h-5 text-emerald-700" />}
                          </div>
                          <h4 className="font-bold text-slate-900 text-sm">{tpl.title}</h4>
                          <p className="text-slate-500 text-[11px] mt-1 line-clamp-2">
                            {tpl.subject_template || tpl.header_title}
                          </p>
                        </div>

                        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                          <span>Penandatangan: {tpl.signer_name}</span>
                          <span className="font-bold text-emerald-800">Pilih Template →</span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="pt-4 border-t border-slate-200 flex justify-end">
                  <Button
                    variant="primary"
                    size="md"
                    rightIcon={<ArrowRight className="w-4 h-4" />}
                    onClick={() => setCreateStep(2)}
                  >
                    Lanjut: Pilih Penerima Surat
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {/* STEP 2: PEMILIHAN PENERIMA (MULTI-UNIT & CHECKBOXES) */}
          {createStep === 2 && (
            <Card title="Langkah 2: Pilih Penerima Surat (Satu, Beberapa, atau Berdasarkan Unit Kerja)">
              <div className="space-y-6 text-xs">
                {/* 4. FILTER UNIT KERJA (MULTI-SELECTION) */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-slate-800 flex items-center gap-2 text-sm">
                      <Filter className="w-4 h-4 text-emerald-700" />
                      <span>Filter Unit Kerja (Dukungan Pilihan Banyak Unit)</span>
                    </label>
                    {selectedUnitIds.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setSelectedUnitIds([])}
                        className="text-[11px] font-bold text-rose-600 hover:underline"
                      >
                        Reset Filter Unit
                      </button>
                    )}
                  </div>
                  <p className="text-slate-500 text-[11px]">
                    Centang unit di bawah untuk menampilkan seluruh karyawan yang memiliki Penugasan Aktif di unit-unit tersebut.
                  </p>

                  <div className="flex flex-wrap gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setSelectedUnitIds([])}
                      className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition ${
                        selectedUnitIds.length === 0
                          ? 'bg-emerald-800 text-white border-emerald-800'
                          : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                      }`}
                    >
                      Semua Unit
                    </button>
                    {units.map(u => {
                      const isChecked = selectedUnitIds.includes(u.id);
                      return (
                        <button
                          key={u.id}
                          type="button"
                          onClick={() => toggleUnitFilter(u.id)}
                          className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition flex items-center gap-1.5 ${
                            isChecked
                              ? 'bg-emerald-800 text-white border-emerald-800 shadow-sm'
                              : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                          }`}
                        >
                          {isChecked ? <CheckSquare className="w-3.5 h-3.5 text-amber-300" /> : <Square className="w-3.5 h-3.5 text-slate-400" />}
                          <span>{u.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Search & Selection Control Buttons */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={recipientSearch}
                      onChange={e => setRecipientSearch(e.target.value)}
                      placeholder="Cari nama karyawan, NIK, atau NRIG..."
                      className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-700/20"
                    />
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      leftIcon={<CheckSquare className="w-3.5 h-3.5 text-emerald-700" />}
                      onClick={selectAllFilteredEmployees}
                    >
                      Pilih Semua yang Ditampilkan
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={unselectAllEmployees}
                    >
                      Batalkan Semua
                    </Button>
                  </div>
                </div>

                {/* Per Unit Quick Select Buttons */}
                {selectedUnitIds.length > 0 && (
                  <div className="flex items-center gap-2 flex-wrap p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl">
                    <span className="font-bold text-emerald-900 text-xs">Pilih Sekaligus Per Unit:</span>
                    {selectedUnitIds.map(uId => {
                      const unitObj = units.find(u => u.id === uId);
                      return (
                        <Button
                          key={uId}
                          type="button"
                          variant="gold"
                          size="sm"
                          className="text-[11px] py-1"
                          onClick={() => selectAllInUnit(uId)}
                        >
                          Pilih Semua Unit {unitObj?.name}
                        </Button>
                      );
                    })}
                  </div>
                )}

                {/* 5. CEKLIS KARYAWAN TABEL */}
                <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-sm">
                  <div className="max-h-80 overflow-y-auto">
                    <table className="w-full text-xs text-left text-slate-700">
                      <thead className="bg-slate-50 text-slate-900 font-bold uppercase tracking-wider border-b border-slate-200 text-[11px] sticky top-0 z-10">
                        <tr>
                          <th className="py-3 px-4 w-10 text-center">✓</th>
                          <th className="py-3 px-4">Nama Karyawan</th>
                          <th className="py-3 px-4">Unit Kerja & Penugasan</th>
                          <th className="py-3 px-4">Jabatan</th>
                          <th className="py-3 px-4">Tugas</th>
                          <th className="py-3 px-4">WhatsApp</th>
                          <th className="py-3 px-4">Email</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-sans">
                        {filteredEmployeesForRecipient.map(emp => {
                          const isChecked = selectedEmployeeIds.includes(emp.id);
                          const wa = emp.whatsapp || emp.phone || '';
                          const emailAddr = emp.email || '';
                          const hasMultiAssignments = emp.assignments && emp.assignments.length > 1;

                          return (
                            <tr
                              key={emp.id}
                              className={`hover:bg-slate-50 transition cursor-pointer ${
                                isChecked ? 'bg-emerald-50/50' : ''
                              }`}
                            >
                              <td className="py-3 px-4 text-center" onClick={e => e.stopPropagation()}>
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() => toggleEmployeeSelection(emp.id)}
                                  className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 cursor-pointer"
                                />
                              </td>
                              <td className="py-3 px-4" onClick={() => toggleEmployeeSelection(emp.id)}>
                                <p className="font-bold text-slate-900">{emp.full_name}</p>
                                <p className="text-[11px] text-slate-500 font-mono">
                                  {emp.nirg ? `NRIG: ${emp.nirg}` : `NIK: ${emp.nik}`}
                                </p>
                              </td>
                              <td className="py-3 px-4">
                                {hasMultiAssignments ? (
                                  <div className="space-y-1">
                                    <span className="inline-block px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 text-[10px] font-bold">
                                      Multi-Penugasan ({emp.assignments?.length})
                                    </span>
                                    <Select
                                      value={employeeSelectedAssignments[emp.id] || emp.primary_assignment?.id || ''}
                                      onChange={e => {
                                        setEmployeeSelectedAssignments({
                                          ...employeeSelectedAssignments,
                                          [emp.id]: e.target.value
                                        });
                                      }}
                                      className="text-[11px] py-1"
                                      options={emp.assignments?.map(a => ({
                                        value: a.id,
                                        label: `${a.unit_name} - ${a.position_name} (${a.task_name || 'Utama'})`
                                      }))}
                                    />
                                  </div>
                                ) : (
                                  <span className="font-medium text-slate-800">
                                    {emp.primary_assignment?.unit_name || emp.units_list?.[0] || 'Yayasan'}
                                  </span>
                                )}
                              </td>
                              <td className="py-3 px-4 text-slate-800">
                                {emp.primary_assignment?.position_name || emp.positions_list?.[0] || 'Guru'}
                              </td>
                              <td className="py-3 px-4 text-slate-600">
                                {emp.primary_assignment?.task_name || emp.primary_assignment?.custom_task_name || '-'}
                              </td>
                              <td className="py-3 px-4">
                                {wa ? (
                                  <span className="text-emerald-700 font-medium font-mono">{wa}</span>
                                ) : (
                                  <span className="text-rose-500 font-bold text-[10px]">Tidak tersedia</span>
                                )}
                              </td>
                              <td className="py-3 px-4">
                                {emailAddr ? (
                                  <span className="text-slate-700 font-medium">{emailAddr}</span>
                                ) : (
                                  <span className="text-rose-500 font-bold text-[10px]">Tidak tersedia</span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
                  <span className="font-bold text-emerald-900 text-xs">
                    Penerima Terpilih: {selectedEmployeeIds.length} Karyawan
                  </span>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="md"
                      onClick={() => setCreateStep(1)}
                    >
                      Kembali
                    </Button>
                    <Button
                      variant="primary"
                      size="md"
                      disabled={selectedEmployeeIds.length === 0}
                      rightIcon={<ArrowRight className="w-4 h-4" />}
                      onClick={() => setCreateStep(3)}
                    >
                      Lanjut: Isi Data Surat
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* STEP 3: ISI & PERIKSA DATA SURAT */}
          {createStep === 3 && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-6 space-y-6">
                <Card title="Isi Data & Parameter Surat">
                  <div className="space-y-4 text-xs">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block font-bold text-slate-800 mb-1 flex items-center justify-between">
                          <span>Nomor Surat Awal *</span>
                          <button
                            type="button"
                            onClick={() => handleGenerateNumber()}
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
                          label="Tanggal Penetapan Surat"
                          type="date"
                          value={issuedDate}
                          onChange={e => setIssuedDate(e.target.value)}
                        />
                      </div>
                    </div>

                    <Input
                      label="Judul Surat"
                      value={letterTitle}
                      onChange={e => setLetterTitle(e.target.value)}
                      placeholder="SK Pengangkatan Guru Tetap YASPIQ"
                    />

                    <Input
                      label="Perihal / Tentang (Gunakan tag {nama}, {unit_penugasan}, {jabatan_penugasan})"
                      value={letterSubject}
                      onChange={e => setLetterSubject(e.target.value)}
                      placeholder="PENGANGKATAN SDR. {nama} MENJADI GURU TETAP..."
                    />

                    <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-[11px] space-y-1">
                      <p className="font-bold text-amber-900">Tag Placeholder yang Didukung:</p>
                      <p className="text-amber-800 font-mono">
                        {'{nama}'}, {'{nik}'}, {'{nip}'}, {'{unit_penugasan}'}, {'{jabatan_penugasan}'}, {'{tugas_penugasan}'}, {'{nomor_surat}'}, {'{tanggal_surat}'}
                      </p>
                    </div>
                  </div>
                </Card>

                {/* Menimbang & Mengingat */}
                <Card title="Konsideran (Menimbang & Mengingat)">
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
                <Card title="Diktum Keputusan (Memutuskan)">
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
                            Hapus
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

                    <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setCreateStep(2)}
                      >
                        Kembali
                      </Button>
                      <Button
                        type="button"
                        variant="primary"
                        rightIcon={<ArrowRight className="w-4 h-4" />}
                        onClick={() => setCreateStep(4)}
                      >
                        Lanjut: Preview & Terbitkan
                      </Button>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Right Column: Dynamic Preview */}
              <div className="lg:col-span-6 space-y-4">
                <div className="sticky top-20">
                  <div className="bg-slate-800 text-white p-3 rounded-t-2xl text-xs font-bold flex items-center justify-between">
                    <span>Preview Contoh Dokumen SK ({selectedEmployeeIds.length} Penerima Terpilih)</span>
                  </div>
                  <div className="bg-slate-200 p-4 rounded-b-2xl max-h-[85vh] overflow-y-auto">
                    {selectedEmployeeIds.length > 0 ? (
                      <LetterPrintPreview
                        letter={{
                          id: 'preview-sample',
                          letter_number: letterNumber || '047 /SK/YASPIQ/X/2026',
                          type: letterType,
                          title: letterTitle || 'SK Keputusan',
                          employee_id: selectedEmployeeIds[0],
                          employee_name: employees.find(e => e.id === selectedEmployeeIds[0])?.full_name || 'Karyawan Sampel',
                          subject: replacePlaceholders(letterSubject, employees.find(e => e.id === selectedEmployeeIds[0]) || employees[0], letterNumber),
                          header_title: headerTitle,
                          considering: consideringList.map(c => replacePlaceholders(c, employees.find(e => e.id === selectedEmployeeIds[0]) || employees[0], letterNumber)).filter(Boolean),
                          in_view: inViewList.map(v => replacePlaceholders(v, employees.find(e => e.id === selectedEmployeeIds[0]) || employees[0], letterNumber)).filter(Boolean),
                          observing: observingList.map(o => replacePlaceholders(o, employees.find(e => e.id === selectedEmployeeIds[0]) || employees[0], letterNumber)).filter(Boolean),
                          deciding: Object.fromEntries(decidingEntries.map(([k, v]) => [k, replacePlaceholders(v, employees.find(e => e.id === selectedEmployeeIds[0]) || employees[0], letterNumber)])),
                          effective_date: effectiveDate,
                          issued_date: issuedDate,
                          issued_city: issuedCity,
                          signer_name: signerName,
                          signer_title: signerTitle,
                          status: 'draft',
                          created_at: new Date().toISOString()
                        }}
                        kopSettings={kopSettings || undefined}
                      />
                    ) : (
                      <div className="text-center py-12 text-slate-500 text-xs">
                        Pilih penerima terlebih dahulu pada Langkah 2.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: PREVIEW, PUBLISH & DELIVERY CHANNEL CHECKBOXES */}
          {createStep === 4 && (
            <Card title="Langkah 4: Konfirmasi Penerbitan & Saluran Pengiriman">
              <div className="space-y-6 text-xs">
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-2">
                  <p className="font-bold text-emerald-900 text-sm">
                    Ringkasan Penerbitan Surat:
                  </p>
                  <p className="text-emerald-800 text-xs">
                    Sistem akan membuat <strong>{selectedEmployeeIds.length} Surat Personal secara individual</strong> untuk masing-masing karyawan yang dicentang.
                  </p>
                </div>

                {/* Delivery Channel Selection */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                  <h4 className="font-bold text-slate-900 text-sm">Saluran Pengiriman Langsung:</h4>
                  
                  <div className="flex items-center gap-6">
                    <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-800">
                      <input
                        type="checkbox"
                        checked={sendViaWA}
                        onChange={e => setSendViaWA(e.target.checked)}
                        className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
                      />
                      <Phone className="w-4 h-4 text-emerald-600" />
                      <span>Kirim via WhatsApp ({waAvailableCount} penerima tersedia)</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-800">
                      <input
                        type="checkbox"
                        checked={sendViaEmail}
                        onChange={e => setSendViaEmail(e.target.checked)}
                        className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
                      />
                      <Mail className="w-4 h-4 text-emerald-600" />
                      <span>Kirim via Email ({emailAvailableCount} penerima tersedia)</span>
                    </label>
                  </div>

                  {/* Validation warnings if any recipient missing info */}
                  {selectedEmpsForDelivery.length > waAvailableCount && (
                    <p className="text-amber-800 text-[11px] flex items-center gap-1 font-medium">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                      <span>
                        {selectedEmpsForDelivery.length - waAvailableCount} karyawan tidak memiliki nomor WhatsApp dan akan dilewati untuk pengiriman WhatsApp.
                      </span>
                    </p>
                  )}
                  {selectedEmpsForDelivery.length > emailAvailableCount && (
                    <p className="text-amber-800 text-[11px] flex items-center gap-1 font-medium">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                      <span>
                        {selectedEmpsForDelivery.length - emailAvailableCount} karyawan tidak memiliki email dan akan dilewati untuk pengiriman Email.
                      </span>
                    </p>
                  )}
                </div>

                <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
                  <Button
                    variant="outline"
                    size="md"
                    onClick={() => setCreateStep(3)}
                  >
                    Kembali Edit Data
                  </Button>

                  <Button
                    variant="primary"
                    size="md"
                    isLoading={isLoading}
                    leftIcon={<Sparkles className="w-4 h-4 text-amber-300" />}
                    onClick={handlePublishLetters}
                  >
                    Terbitkan & Kirim {selectedEmployeeIds.length} Surat
                  </Button>
                </div>
              </div>
            </Card>
          )}
        </div>
      )}

      {/* TAB 3: TEMPLATE SURAT */}
      {activeTab === 'templates' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-sm">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900">Format Template Surat Resmi YASPIQ</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Kelola format standar SK, Surat Tugas, Surat Peringatan, dan Surat Keterangan (Tersimpan di Supabase).
              </p>
            </div>
            <Button
              variant="primary"
              size="md"
              leftIcon={<Plus className="w-4 h-4" />}
              onClick={handleOpenNewTemplateModal}
            >
              Buat Template Surat
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {templates.map(tpl => (
              <Card key={tpl.id} title={tpl.title} subtitle={`Kode: ${tpl.code} • Type: ${tpl.type}`}>
                <div className="space-y-2 text-xs text-slate-600">
                  <p><strong>Judul Kop:</strong> {tpl.header_title}</p>
                  <p><strong>Total Poin Menimbang:</strong> {tpl.considering_text?.length || 0} Poin</p>
                  <p><strong>Total Poin Mengingat:</strong> {tpl.in_view_text?.length || 0} Poin</p>
                  <p><strong>Penandatangan:</strong> {tpl.signer_name} ({tpl.signer_title})</p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleOpenEditTemplateModal(tpl)}
                      className="px-2.5 py-1 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center gap-1"
                    >
                      <Edit3 className="w-3.5 h-3.5" /> Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDuplicateTemplate(tpl)}
                      className="px-2.5 py-1 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center gap-1"
                    >
                      <Copy className="w-3.5 h-3.5" /> Duplikat
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteTemplate(tpl.id)}
                      className="px-2.5 py-1 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Hapus
                    </button>
                  </div>

                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => {
                      handleApplyTemplate(tpl);
                      setCreateStep(2);
                      setActiveTab('buat');
                    }}
                  >
                    Gunakan di "Buat Surat"
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: TEMPLATE KOP (FORMAT GAMBAR A4) */}
      {activeTab === 'kop' && (
        <div className="space-y-6">
          <Card title="Manajemen Template KOP Gambar A4">
            <div className="space-y-6 text-xs">
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl">
                <p className="font-bold text-emerald-900 text-sm">
                  Kelola File Gambar KOP Format A4
                </p>
                <p className="text-emerald-800 text-xs mt-1">
                  KOP berupa file gambar 1 halaman A4 penuh (JPG/PNG). Gambar KOP ini akan otomatis dijadikan background seluruh lembar surat saat di-convert ke PDF.
                </p>
              </div>

              {/* Grid Template KOP Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {kopTemplates.map(kt => (
                  <div
                    key={kt.id}
                    className={`p-4 rounded-2xl border-2 bg-white transition flex flex-col justify-between ${
                      kt.is_default ? 'border-emerald-600 shadow-md ring-2 ring-emerald-500/20' : 'border-slate-200'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-bold text-slate-900 text-sm">{kt.name}</span>
                        {kt.is_default && <Badge variant="emerald" size="sm">Default</Badge>}
                      </div>

                      {/* Image Thumbnail Preview */}
                      <div className="w-full aspect-[1/1.41] bg-slate-100 rounded-xl overflow-hidden border border-slate-300 relative mb-3 group">
                        <img
                          src={kt.kop_image_url || '/kop_yayasan.jpg'}
                          alt={kt.name}
                          className="w-full h-full object-fill"
                        />
                        <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center p-2 text-center text-white text-[10px] font-bold">
                          KOP A4 Background ({kt.kop_top_padding_cm || 5.8}cm Top Margin)
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                      {!kt.is_default ? (
                        <button
                          type="button"
                          onClick={() => handleSetDefaultKop(kt)}
                          className="text-[11px] font-bold text-emerald-700 hover:underline"
                        >
                          ✓ Jadikan Default
                        </button>
                      ) : (
                        <span className="text-[11px] font-bold text-emerald-800">KOP Aktif Utama</span>
                      )}

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingKopTplId(kt.id);
                            setKopTplName(kt.name);
                            setKopTplImageUrl(kt.kop_image_url || '/kop_yayasan.jpg');
                            setKopTplTopPaddingCm(kt.kop_top_padding_cm || 5.8);
                          }}
                          className="px-2.5 py-1 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center gap-1"
                        >
                          <Edit3 className="w-3.5 h-3.5" /> Edit
                        </button>

                        {!kt.is_default && kopTemplates.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleDeleteKopTemplate(kt.id)}
                            className="px-2.5 py-1 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg flex items-center gap-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Hapus
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Upload/Edit KOP Form */}
              <form onSubmit={handleSaveKopTemplate} className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-4 max-w-2xl">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <h4 className="font-bold text-slate-900 text-sm">
                    {editingKopTplId ? `Edit Gambar KOP: ${kopTplName}` : '+ Upload Template KOP Gambar A4 Baru'}
                  </h4>
                  {editingKopTplId && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingKopTplId(null);
                        setKopTplName('');
                        setKopTplImageUrl('');
                      }}
                      className="text-xs font-bold text-slate-500 hover:underline"
                    >
                      Batal Edit
                    </button>
                  )}
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">Nama Template KOP *</label>
                  <Input
                    value={kopTplName}
                    onChange={e => setKopTplName(e.target.value)}
                    placeholder="Contoh: KOP SD IT / KOP SMP IT / KOP Yayasan"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">Upload File Gambar KOP Format A4 (PNG / JPG)</label>
                  <div className="flex items-center gap-3">
                    <label className="cursor-pointer px-4 py-2 bg-emerald-800 text-white rounded-xl font-bold text-xs hover:bg-emerald-900 transition flex items-center gap-2">
                      <Upload className="w-4 h-4" />
                      <span>Pilih File Gambar KOP A4</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleKopImageUpload}
                        className="hidden"
                      />
                    </label>

                    {kopTplImageUrl && (
                      <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" /> Gambar KOP Terpilih
                      </span>
                    )}
                  </div>

                  {kopTplImageUrl && (
                    <div className="mt-3 p-2 border border-slate-300 rounded-xl bg-white max-w-xs">
                      <p className="text-[10px] font-bold text-slate-500 mb-1">Preview Gambar KOP A4:</p>
                      <img src={kopTplImageUrl} alt="KOP Preview" className="w-full h-40 object-contain rounded border border-slate-200" />
                    </div>
                  )}
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">Jarak Margin Atas Teks Isi Surat (cm)</label>
                  <Input
                    type="number"
                    step="0.1"
                    value={kopTplTopPaddingCm}
                    onChange={e => setKopTplTopPaddingCm(parseFloat(e.target.value) || 5.8)}
                    placeholder="5.8"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">
                    Jarak posisi teks dari atas halaman A4 agar posisi judul & isi surat pas berada di bawah garis KOP (Default: 5.8 cm).
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-200 flex gap-2">
                  <Button type="submit" variant="primary" isLoading={isLoading}>
                    Simpan Template KOP Gambar A4
                  </Button>
                </div>
              </form>
            </div>
          </Card>
        </div>
      )}

      {/* TAB 5: RIWAYAT PENGIRIMAN (LOGS PERSISTED IN SUPABASE) */}
      {activeTab === 'riwayat' && (
        <div className="space-y-4">
          <Card title="Riwayat Pengiriman Surat (WhatsApp & Email Logs)">
            <div className="space-y-4 text-xs">
              {deliveryLogs.length === 0 ? (
                <div className="text-center py-12 text-slate-500">
                  Belum ada riwayat pengiriman surat yang tercatat.
                </div>
              ) : (
                <div className="overflow-x-auto border border-slate-200 rounded-2xl bg-white">
                  <table className="w-full text-xs text-left text-slate-700">
                    <thead className="bg-slate-50 text-slate-900 font-bold uppercase border-b border-slate-200 text-[11px]">
                      <tr>
                        <th className="py-3 px-4">Nama Penerima</th>
                        <th className="py-3 px-4">Nomor & Judul Surat</th>
                        <th className="py-3 px-4">Channel</th>
                        <th className="py-3 px-4">Alamat / Nomor</th>
                        <th className="py-3 px-4">Tanggal Kirim</th>
                        <th className="py-3 px-4 text-center">Status</th>
                        <th className="py-3 px-4 text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {deliveryLogs.map(log => (
                        <tr key={log.id} className="hover:bg-slate-50 transition">
                          <td className="py-3 px-4 font-bold text-slate-900">{log.employee_name}</td>
                          <td className="py-3 px-4">
                            <p className="font-mono text-slate-800 font-bold">{log.letter_number}</p>
                            <p className="text-[11px] text-slate-500 truncate max-w-xs">{log.letter_title}</p>
                          </td>
                          <td className="py-3 px-4 uppercase font-bold text-[11px]">
                            {log.channel === 'whatsapp' ? (
                              <span className="text-emerald-700 flex items-center gap-1">
                                <Phone className="w-3.5 h-3.5" /> WhatsApp
                              </span>
                            ) : (
                              <span className="text-blue-700 flex items-center gap-1">
                                <Mail className="w-3.5 h-3.5" /> Email
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4 font-mono text-slate-700">{log.recipient_address}</td>
                          <td className="py-3 px-4 text-slate-500">
                            {new Date(log.sent_at).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' })}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <Badge
                              variant={
                                log.status === 'sent'
                                  ? 'emerald'
                                  : log.status === 'failed'
                                  ? 'rose'
                                  : 'slate'
                              }
                              size="sm"
                            >
                              {log.status}
                            </Badge>
                          </td>
                          <td className="py-3 px-4 text-right">
                            {log.status === 'failed' || log.status === 'skipped' ? (
                              <Button
                                variant="gold"
                                size="sm"
                                className="text-[10px] py-1"
                                onClick={() => {
                                  info(`Mengirim ulang surat ${log.letter_number} ke ${log.employee_name}...`);
                                }}
                              >
                                Kirim Ulang
                              </Button>
                            ) : (
                              <span className="text-slate-400 text-[10px]">-</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </Card>
        </div>
      )}

      {/* PRINT & PREVIEW MODAL (PDF VS PRINT KOP HANDLING) */}
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
                    : `Dokumen Terbit (${bulkPrintLetters.length} Surat Personal)`}
                </p>
                <p className="text-[11px] text-slate-500">
                  {bulkPrintLetters.length === 1
                    ? `Nomor: ${bulkPrintLetters[0].letter_number}`
                    : `Penerima: ${bulkPrintLetters.map(l => l.employee_name).join(', ')}`}
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
                    📄 PRINT (Isi Surat Saja - Tanpa Kop)
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
                    🖼️ DOWNLOAD PDF (Lengkap Berkop)
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

      {/* CONFIRMATION DIALOG BEFORE SENDING DISPATCH */}
      <ConfirmationDialog
        isOpen={isSendConfirmOpen}
        onClose={() => setIsSendConfirmOpen(false)}
        onConfirm={handleConfirmSendDelivery}
        title={`Konfirmasi Pengiriman ${bulkPrintLetters.length} Surat`}
        message={`Anda memilih ${selectedEmployeeIds.length} penerima. Channel aktif: ${sendViaWA ? `WhatsApp (${waAvailableCount} penerima)` : ''} ${sendViaEmail ? `Email (${emailAvailableCount} penerima)` : ''}. Apakah Anda yakin ingin mengirim surat sekarang?`}
        confirmText="Kirim Surat"
        cancelText="Batal"
        type="info"
      />

      {/* DELETE SINGLE ARCHIVE CONFIRMATION */}
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
        message={`Apakah Anda yakin ingin menghapus arsip surat ${deleteTarget?.title}?`}
        confirmText="Hapus Surat"
        type="danger"
      />

      {/* DELETE BULK ARCHIVE CONFIRMATION */}
      <ConfirmationDialog
        isOpen={bulkDeleteConfirmOpen}
        onClose={() => setBulkDeleteConfirmOpen(false)}
        onConfirm={handleBulkDeleteArchive}
        title={`Hapus ${selectedLetterIds.length} Surat Terpilih?`}
        message={`Apakah Anda yakin ingin menghapus ${selectedLetterIds.length} arsip surat yang dipilih secara permanen?`}
        confirmText={`Hapus ${selectedLetterIds.length} Surat`}
        type="danger"
      />

      {/* MODAL BUAT / EDIT TEMPLATE SURAT */}
      <Modal
        isOpen={isTemplateModalOpen}
        onClose={() => setIsTemplateModalOpen(false)}
        title={editingTemplateId ? "Edit Template Surat" : "Buat Template Surat Baru"}
        maxWidth="lg"
      >
        <form onSubmit={handleSaveTemplateSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-slate-800 mb-1">Kode Template *</label>
              <Input
                value={modalTplCode}
                onChange={e => setModalTplCode(e.target.value)}
                placeholder="SK-GT-2026"
                required
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block font-bold text-slate-800 mb-1">Judul Template *</label>
              <Input
                value={modalTplTitle}
                onChange={e => setModalTplTitle(e.target.value)}
                placeholder="SK Pengangkatan Guru Tetap"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-800 mb-1">Jenis Surat</label>
              <Select
                value={modalTplType}
                onChange={e => setModalTplType(e.target.value as LetterType)}
                options={[
                  { value: 'sk_pengangkatan', label: 'SK Pengangkatan' },
                  { value: 'sk_penugasan', label: 'SK Penugasan' },
                  { value: 'surat_tugas', label: 'Surat Tugas' },
                  { value: 'sp_peringatan', label: 'Surat Peringatan (SP)' },
                  { value: 'surat_keterangan', label: 'Surat Keterangan' }
                ]}
              />
            </div>
            <div>
              <label className="block font-bold text-slate-800 mb-1">Kota Penetapan</label>
              <Input
                value={modalTplCity}
                onChange={e => setModalTplCity(e.target.value)}
                placeholder="Tangerang Selatan"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-800 mb-1">Header Title Kop</label>
            <Input
              value={modalTplHeaderTitle}
              onChange={e => setModalTplHeaderTitle(e.target.value)}
              placeholder="KEPUTUSAN KETUA UMUM YAYASAN..."
            />
          </div>

          <div>
            <label className="block font-bold text-slate-800 mb-1">Template Perihal (Format Tag {'{nama}'}, {'{unit_penugasan}'})</label>
            <Input
              value={modalTplSubjectTemplate}
              onChange={e => setModalTplSubjectTemplate(e.target.value)}
              placeholder="PENGANGKATAN SDR. {nama} MENJADI GURU TETAP..."
            />
          </div>

          {/* Menimbang */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-800">Menimbang (Dasar Alasan)</label>
              <button
                type="button"
                onClick={() => setModalTplConsidering(prev => [...prev, ''])}
                className="text-[11px] font-bold text-emerald-800 hover:underline"
              >
                + Tambah Poin
              </button>
            </div>
            {modalTplConsidering.map((item, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span className="font-bold text-slate-400 text-xs w-4">{idx + 1}.</span>
                <input
                  type="text"
                  value={item}
                  onChange={e => {
                    const copy = [...modalTplConsidering];
                    copy[idx] = e.target.value;
                    setModalTplConsidering(copy);
                  }}
                  className="w-full text-xs p-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-700"
                  placeholder="Isi poin menimbang..."
                />
                <button
                  type="button"
                  onClick={() => setModalTplConsidering(prev => prev.filter((_, i) => i !== idx))}
                  className="p-1.5 text-rose-600 hover:bg-rose-50 rounded"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          {/* Mengingat */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-800">Mengingat (Landasan Hukum)</label>
              <button
                type="button"
                onClick={() => setModalTplInView(prev => [...prev, ''])}
                className="text-[11px] font-bold text-emerald-800 hover:underline"
              >
                + Tambah Poin
              </button>
            </div>
            {modalTplInView.map((item, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span className="font-bold text-slate-400 text-xs w-4">{idx + 1}.</span>
                <input
                  type="text"
                  value={item}
                  onChange={e => {
                    const copy = [...modalTplInView];
                    copy[idx] = e.target.value;
                    setModalTplInView(copy);
                  }}
                  className="w-full text-xs p-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-700"
                  placeholder="Isi poin mengingat..."
                />
                <button
                  type="button"
                  onClick={() => setModalTplInView(prev => prev.filter((_, i) => i !== idx))}
                  className="p-1.5 text-rose-600 hover:bg-rose-50 rounded"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          {/* Penandatangan */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-200">
            <div>
              <label className="block font-bold text-slate-800 mb-1">Nama Penandatangan</label>
              <Input
                value={modalTplSignerName}
                onChange={e => setModalTplSignerName(e.target.value)}
                placeholder="Dr. KH. M. Sobron Zayyan, SQ., MA"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-800 mb-1">Jabatan Penandatangan</label>
              <Input
                value={modalTplSignerTitle}
                onChange={e => setModalTplSignerTitle(e.target.value)}
                placeholder="Ketua Umum"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsTemplateModalOpen(false)}
            >
              Batal
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={isLoading}
            >
              Simpan Template
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
