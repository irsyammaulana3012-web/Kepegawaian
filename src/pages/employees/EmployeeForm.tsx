import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Save,
  User,
  Building2,
  Briefcase,
  Calendar,
  Mail,
  Phone,
  MapPin,
  FileText,
  Sparkles,
  CreditCard,
  GraduationCap,
  Award,
  Plus,
  Trash2,
  Camera,
  Layers
} from 'lucide-react';
import { Employee, Unit, Position, Task, EmploymentStatus, FormalEducationRecord, NonformalEducationRecord } from '../../types';
import { employeeService } from '../../services/employeeService';
import { masterDataService } from '../../services/masterDataService';
import { useToast } from '../../context/ToastContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Card } from '../../components/ui/Card';

export const EmployeeForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { success, error } = useToast();

  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(isEdit);

  // Masters
  const [units, setUnits] = useState<Unit[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);

  // 1. Identitas Personal & Registrasi
  const [employeeNumber, setEmployeeNumber] = useState('');
  const [nirg, setNirg] = useState('');
  const [nirk, setNirk] = useState('');
  const [nik, setNik] = useState('');
  const [nip, setNip] = useState('');
  const [noKk, setNoKk] = useState('');
  const [fullName, setFullName] = useState('');
  const [nickname, setNickname] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [gender, setGender] = useState<'Laki-laki' | 'Perempuan'>('Laki-laki');
  const [birthPlace, setBirthPlace] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [religion, setReligion] = useState('Islam');
  const [maritalStatus, setMaritalStatus] = useState('Menikah');
  const [lastEducation, setLastEducation] = useState('S1');

  // 2. Alamat & Kontak Domisili
  const [address, setAddress] = useState('');
  const [rt, setRt] = useState('');
  const [rw, setRw] = useState('');
  const [kelurahan, setKelurahan] = useState('');
  const [kecamatan, setKecamatan] = useState('');
  const [city, setCity] = useState('');
  const [province, setProvince] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [email, setEmail] = useState('');

  // 3. Status Kepegawaian & Rekening
  const [employmentStatus, setEmploymentStatus] = useState<EmploymentStatus>('Tetap');
  const [entryYear, setEntryYear] = useState('');
  const [exitYear, setExitYear] = useState('');
  const [joinDate, setJoinDate] = useState(new Date().toISOString().split('T')[0]);
  const [appointmentDate, setAppointmentDate] = useState('');
  const [appointmentSkNumber, setAppointmentSkNumber] = useState('');
  const [appointmentSkDate, setAppointmentSkDate] = useState('');
  const [contractEndDate, setContractEndDate] = useState('');
  const [bankName, setBankName] = useState('Bank Syariah Indonesia (BSI)');
  const [bankAccountNumber, setBankAccountNumber] = useState('');

  // 4. Riwayat Pendidikan Formal (SD, SMP, SMA/SMK, S1, S2, S3)
  const [sdYear, setSdYear] = useState('');
  const [sdInstitution, setSdInstitution] = useState('');
  const [smpYear, setSmpYear] = useState('');
  const [smpInstitution, setSmpInstitution] = useState('');
  const [smaYear, setSmaYear] = useState('');
  const [smaInstitution, setSmaInstitution] = useState('');
  const [s1Year, setS1Year] = useState('');
  const [s1Institution, setS1Institution] = useState('');
  const [s2Year, setS2Year] = useState('');
  const [s2Institution, setS2Institution] = useState('');
  const [s3Year, setS3Year] = useState('');
  const [s3Institution, setS3Institution] = useState('');

  // 5. Riwayat Pendidikan Nonformal (Pendidikan/Pelatihan Nonformal, Instansi, Tahun, Keterangan)
  const [nonformalList, setNonformalList] = useState<NonformalEducationRecord[]>([
    { name: '', institution: '', year: '', notes: '' }
  ]);

  // Initial Assignment (Only for new employee)
  const [initialUnitId, setInitialUnitId] = useState('');
  const [initialPositionId, setInitialPositionId] = useState('');
  const [initialTaskId, setInitialTaskId] = useState('');
  const [customTaskName, setCustomTaskName] = useState('');

  // Validation Errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const initForm = async () => {
      try {
        const [u, p, t] = await Promise.all([
          masterDataService.getUnits(),
          masterDataService.getPositions(),
          masterDataService.getTasks()
        ]);
        setUnits(u);
        setPositions(p);
        setTasks(t);

        if (isEdit && id) {
          const emp = await employeeService.getEmployeeById(id);
          if (!emp) {
            error('Karyawan tidak ditemukan');
            navigate('/employees');
            return;
          }
          setEmployeeNumber(emp.employee_number);
          setNirg(emp.nirg || '');
          setNirk(emp.nirk || '');
          setNik(emp.nik);
          setNip(emp.nip || '');
          setNoKk(emp.no_kk || '');
          setFullName(emp.full_name);
          setNickname(emp.nickname || '');
          setPhotoUrl(emp.photo_url || '');
          setGender(emp.gender);
          setBirthPlace(emp.birth_place || '');
          setBirthDate(emp.birth_date || '');
          setReligion(emp.religion || 'Islam');
          setMaritalStatus(emp.marital_status || 'Menikah');
          setLastEducation(emp.last_education || 'S1');

          setAddress(emp.address || '');
          setRt(emp.rt || '');
          setRw(emp.rw || '');
          setKelurahan(emp.kelurahan || '');
          setKecamatan(emp.kecamatan || '');
          setCity(emp.city || '');
          setProvince(emp.province || '');
          setPostalCode(emp.postal_code || '');

          setPhone(emp.phone || '');
          setWhatsapp(emp.whatsapp || '');
          setEmail(emp.email || '');

          setEmploymentStatus(emp.employment_status);
          setEntryYear(emp.entry_year || (emp.join_date ? emp.join_date.split('-')[0] : ''));
          setExitYear(emp.exit_year || '');
          setJoinDate(emp.join_date || new Date().toISOString().split('T')[0]);
          setAppointmentDate(emp.appointment_date || '');
          setAppointmentSkNumber(emp.appointment_sk_number || '');
          setAppointmentSkDate(emp.appointment_sk_date || '');
          setContractEndDate(emp.contract_end_date || '');

          setBankName(emp.bank_name || 'Bank Syariah Indonesia (BSI)');
          setBankAccountNumber(emp.bank_account_number || '');

          // Map Formal Education if stored
          if (emp.formal_education && Array.isArray(emp.formal_education)) {
            emp.formal_education.forEach(f => {
              if (f.level === 'SD') { setSdYear(f.year || ''); setSdInstitution(f.institution || ''); }
              if (f.level === 'SMP') { setSmpYear(f.year || ''); setSmpInstitution(f.institution || ''); }
              if (f.level === 'SMA/SMK' || f.level === 'SMA') { setSmaYear(f.year || ''); setSmaInstitution(f.institution || ''); }
              if (f.level === 'S1') { setS1Year(f.year || ''); setS1Institution(f.institution || ''); }
              if (f.level === 'S2') { setS2Year(f.year || ''); setS2Institution(f.institution || ''); }
              if (f.level === 'S3') { setS3Year(f.year || ''); setS3Institution(f.institution || ''); }
            });
          }

          // Map Nonformal Education if stored
          if (emp.nonformal_education && Array.isArray(emp.nonformal_education) && emp.nonformal_education.length > 0) {
            setNonformalList(emp.nonformal_education);
          }
        } else {
          // Next auto ID
          const nextId = await employeeService.getNextEmployeeNumber();
          setEmployeeNumber(nextId);
          if (u.length > 0) setInitialUnitId(u[0].id);
          if (p.length > 0) setInitialPositionId(p[0].id);
        }
      } catch (err) {
        console.error('Error init form:', err);
      } finally {
        setIsFetching(false);
      }
    };

    initForm();
  }, [id, isEdit, navigate, error]);

  const handleAddNonformalRow = () => {
    setNonformalList(prev => [...prev, { name: '', institution: '', year: '', notes: '' }]);
  };

  const handleRemoveNonformalRow = (idx: number) => {
    setNonformalList(prev => prev.filter((_, i) => i !== idx));
  };

  const handleNonformalChange = (idx: number, field: keyof NonformalEducationRecord, value: string) => {
    setNonformalList(prev => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], [field]: value };
      return copy;
    });
  };

  const validate = () => {
    const errs: Record<string, string> = {};

    if (!fullName.trim()) errs.fullName = 'Nama lengkap wajib diisi';
    if (!nik.trim()) errs.nik = 'NIK wajib diisi';
    else if (nik.trim().length !== 16 || !/^\d{16}$/.test(nik.trim())) {
      errs.nik = 'NIK harus tepat 16 digit angka';
    }

    if (birthDate) {
      const today = new Date().toISOString().split('T')[0];
      if (birthDate > today) {
        errs.birthDate = 'Tanggal lahir tidak boleh di masa depan';
      }
    }

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errs.email = 'Format email tidak valid';
    }

    if (!joinDate) errs.joinDate = 'Tanggal mulai bekerja wajib diisi';

    if (!isEdit) {
      if (!initialUnitId) errs.initialUnitId = 'Unit penugasan awal wajib dipilih';
      if (!initialPositionId) errs.initialPositionId = 'Jabatan awal wajib dipilih';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setIsLoading(true);
    try {
      // Build formal education array
      const formalEdu: FormalEducationRecord[] = [];
      if (sdInstitution.trim() || sdYear.trim()) {
        formalEdu.push({ level: 'SD', year: sdYear.trim(), institution: sdInstitution.trim() });
      }
      if (smpInstitution.trim() || smpYear.trim()) {
        formalEdu.push({ level: 'SMP', year: smpYear.trim(), institution: smpInstitution.trim() });
      }
      if (smaInstitution.trim() || smaYear.trim()) {
        formalEdu.push({ level: 'SMA/SMK', year: smaYear.trim(), institution: smaInstitution.trim() });
      }
      if (s1Institution.trim() || s1Year.trim()) {
        formalEdu.push({ level: 'S1', year: s1Year.trim(), institution: s1Institution.trim() });
      }
      if (s2Institution.trim() || s2Year.trim()) {
        formalEdu.push({ level: 'S2', year: s2Year.trim(), institution: s2Institution.trim() });
      }
      if (s3Institution.trim() || s3Year.trim()) {
        formalEdu.push({ level: 'S3', year: s3Year.trim(), institution: s3Institution.trim() });
      }

      // Filter non-empty nonformal items
      const validNonformal = nonformalList.filter(
        n => n.name.trim() || n.institution?.trim() || n.year?.trim() || n.notes?.trim()
      );

      const employeePayload: Partial<Employee> = {
        id: isEdit ? id : undefined,
        employee_number: employeeNumber,
        nirg: nirg.trim() || undefined,
        nirk: nirk.trim() || undefined,
        nik: nik.trim(),
        nip: nip.trim() || undefined,
        no_kk: noKk.trim() || undefined,
        full_name: fullName.trim(),
        nickname: nickname.trim() || undefined,
        photo_url: photoUrl.trim() || undefined,
        gender,
        birth_place: birthPlace.trim() || undefined,
        birth_date: birthDate || undefined,
        religion,
        marital_status: maritalStatus,
        last_education: lastEducation,

        address: address.trim() || undefined,
        rt: rt.trim() || undefined,
        rw: rw.trim() || undefined,
        kelurahan: kelurahan.trim() || undefined,
        kecamatan: kecamatan.trim() || undefined,
        city: city.trim() || undefined,
        province: province.trim() || undefined,
        postal_code: postalCode.trim() || undefined,

        phone: phone.trim() || undefined,
        whatsapp: whatsapp.trim() || undefined,
        email: email.trim() || undefined,

        employment_status: employmentStatus,
        entry_year: entryYear.trim() || undefined,
        exit_year: exitYear.trim() || undefined,
        join_date: joinDate,
        appointment_date: appointmentDate || undefined,
        appointment_sk_number: appointmentSkNumber.trim() || undefined,
        appointment_sk_date: appointmentSkDate || undefined,
        contract_end_date: contractEndDate || undefined,

        bank_name: bankName.trim() || undefined,
        bank_account_number: bankAccountNumber.trim() || undefined,

        formal_education: formalEdu,
        nonformal_education: validNonformal,
        is_active: true
      };

      const initialAssignmentPayload = !isEdit ? {
        unit_id: initialUnitId,
        position_id: initialPositionId,
        task_id: initialTaskId || null,
        custom_task_name: customTaskName.trim() || undefined,
        start_date: joinDate,
        is_primary: true
      } : undefined;

      const saved = await employeeService.saveEmployee(employeePayload, initialAssignmentPayload);
      success(
        isEdit ? 'Data Karyawan Diperbarui' : 'Karyawan Baru Berhasil Ditambahkan',
        `Data ${saved.full_name} (${saved.employee_number}) telah disimpan.`
      );
      navigate(`/employees/${saved.id}`);
    } catch (err: any) {
      error('Gagal Menyimpan Data', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredTasks = tasks.filter(t => !initialPositionId || !t.position_id || t.position_id === initialPositionId);

  if (isFetching) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        <Card>
          <div className="space-y-4">
            <div className="h-6 bg-slate-200 rounded w-1/3 animate-pulse" />
            <div className="grid grid-cols-2 gap-4">
              <div className="h-10 bg-slate-200 rounded animate-pulse" />
              <div className="h-10 bg-slate-200 rounded animate-pulse" />
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-5xl mx-auto pb-20 animate-in fade-in duration-200">
      {/* Top Header - Mobile Friendly */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-sm">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 transition active:scale-95"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-lg sm:text-2xl font-black text-slate-900 tracking-tight">
              {isEdit ? `Edit Data: ${fullName || 'Karyawan'}` : 'Tambah Karyawan Baru'}
            </h2>
            <div className="flex flex-wrap items-center gap-2 mt-0.5">
              <span className="text-xs text-slate-500">ID Sistem:</span>
              <strong className="font-mono text-xs text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                {employeeNumber}
              </strong>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => navigate('/employees')}
            className="flex-1 sm:flex-none"
          >
            Batal
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            isLoading={isLoading}
            leftIcon={<Save className="w-4 h-4" />}
            className="flex-1 sm:flex-none"
          >
            {isEdit ? 'Simpan Perubahan' : 'Simpan Karyawan'}
          </Button>
        </div>
      </div>

      {/* SECTION 1: IDENTITAS PERSONAL & NOMOR REGISTRASI */}
      <Card
        title="1. Data Identitas & Nomor Registrasi"
        subtitle="Nomor Registrasi Yayasan (NIRG / NIRK), NIK, dan identitas resmi"
      >
        <div className="space-y-4">
          {/* NIRG & NIRK Highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-amber-50/60 border border-amber-200/80">
            <Input
              label="NIRG (Nomor Induk Registrasi Guru)"
              value={nirg}
              onChange={(e) => setNirg(e.target.value)}
              placeholder="Contoh: G-SMP-2019-001"
              helperText="Isi jika berstatus sebagai Guru di salah satu Unit"
            />
            <Input
              label="NIRK (Nomor Induk Registrasi Karyawan)"
              value={nirk}
              onChange={(e) => setNirk(e.target.value)}
              placeholder="Contoh: K-YAS-2021-008"
              helperText="Isi jika berstatus sebagai Tenaga Kependidikan / Staff Yayasan"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <Input
                label="Nama Lengkap & Gelar"
                isRequired
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Contoh: Ahmad Fauzi, S.Pd.I., M.Pd."
                error={errors.fullName}
              />
            </div>
            <Input
              label="Nama Panggilan / Sapaan"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="Contoh: Ustadz Fauzi"
            />

            <Input
              label="NIK (Nomor Induk Kependudukan KTP)"
              isRequired
              value={nik}
              onChange={(e) => setNik(e.target.value)}
              placeholder="16 Digit NIK KTP"
              maxLength={16}
              error={errors.nik}
            />

            <Input
              label="NIP (Jika Ada)"
              value={nip}
              onChange={(e) => setNip(e.target.value)}
              placeholder="Nomor Induk Pegawai"
            />

            <Input
              label="Nomor Kartu Keluarga (KK)"
              value={noKk}
              onChange={(e) => setNoKk(e.target.value)}
              placeholder="16 Digit No KK"
              maxLength={16}
            />

            <Select
              label="Jenis Kelamin (L/P)"
              isRequired
              value={gender}
              onChange={(e) => setGender(e.target.value as any)}
              options={[
                { value: 'Laki-laki', label: 'Laki-laki (L)' },
                { value: 'Perempuan', label: 'Perempuan (P)' }
              ]}
            />

            <Input
              label="Tempat Lahir"
              value={birthPlace}
              onChange={(e) => setBirthPlace(e.target.value)}
              placeholder="Kota / Kabupaten Kelahiran"
            />

            <Input
              label="Tanggal Lahir"
              type="date"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              error={errors.birthDate}
            />

            <Select
              label="Pendidikan Terakhir"
              value={lastEducation}
              onChange={(e) => setLastEducation(e.target.value)}
              options={[
                { value: 'SD', label: 'SD / MI' },
                { value: 'SMP', label: 'SMP / MTs' },
                { value: 'SMA/SMK', label: 'SMA / SMK / MA' },
                { value: 'Pondok Pesantren', label: 'Pondok Pesantren / KMI' },
                { value: 'D3', label: 'Diploma 3 (D3)' },
                { value: 'S1', label: 'Sarjana (S1)' },
                { value: 'S2', label: 'Magister (S2)' },
                { value: 'S3', label: 'Doktor (S3)' }
              ]}
            />

            <Select
              label="Agama"
              value={religion}
              onChange={(e) => setReligion(e.target.value)}
              options={[
                { value: 'Islam', label: 'Islam' },
                { value: 'Lainnya', label: 'Lainnya' }
              ]}
            />

            <Select
              label="Status Pernikahan"
              value={maritalStatus}
              onChange={(e) => setMaritalStatus(e.target.value)}
              options={[
                { value: 'Menikah', label: 'Menikah' },
                { value: 'Belum Menikah', label: 'Belum Menikah' },
                { value: 'Duda/Janda', label: 'Duda / Janda' }
              ]}
            />
          </div>
        </div>
      </Card>

      {/* SECTION 2: ALAMAT & KONTAK */}
      <Card
        title="2. Alamat Domisili & Kontak"
        subtitle="Alamat tempat tinggal, nomor telepon / WhatsApp, dan email aktif"
      >
        <div className="space-y-4">
          <Input
            label="Alamat Lengkap"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Jl. Nama Jalan No. XX, Gang/Blok"
          />

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Input
              label="RT"
              value={rt}
              onChange={(e) => setRt(e.target.value)}
              placeholder="001"
            />
            <Input
              label="RW"
              value={rw}
              onChange={(e) => setRw(e.target.value)}
              placeholder="002"
            />
            <Input
              label="Kelurahan / Desa"
              value={kelurahan}
              onChange={(e) => setKelurahan(e.target.value)}
              placeholder="Ciriung"
            />
            <Input
              label="Kecamatan"
              value={kecamatan}
              onChange={(e) => setKecamatan(e.target.value)}
              placeholder="Cibinong"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Input
              label="Kota / Kabupaten"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Kabupaten Bogor"
            />
            <Input
              label="Provinsi"
              value={province}
              onChange={(e) => setProvince(e.target.value)}
              placeholder="Jawa Barat"
            />
            <Input
              label="Kode Pos"
              value={postalCode}
              onChange={(e) => setPostalCode(e.target.value)}
              placeholder="16918"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-100">
            <Input
              label="Nomor Telepon / HP"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="08123456789"
            />
            <Input
              label="WhatsApp"
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              placeholder="08123456789"
            />
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nama@alquraniyyah.sch.id"
              error={errors.email}
            />
          </div>
        </div>
      </Card>

      {/* SECTION 3: STATUS KEPEGAWAIAN, TAHUN KERJA & REKENING BANK */}
      <Card
        title="3. Status Kepegawaian & Nomor Rekening"
        subtitle="Status kontrak kerja, tahun masuk/keluar, dan nomor rekening perbankan"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Select
              label="Status Karyawan"
              isRequired
              value={employmentStatus}
              onChange={(e) => setEmploymentStatus(e.target.value as any)}
              options={[
                { value: 'Tetap', label: 'Karyawan Tetap (GTY/PTY)' },
                { value: 'Kontrak', label: 'Karyawan Kontrak (PKWT)' },
                { value: 'Honorer', label: 'Guru / Staff Honorer' },
                { value: 'Magang', label: 'Magang / Praktik Khidmat' },
                { value: 'Freelance', label: 'Freelance / Mitra Kerja' }
              ]}
            />

            <Input
              label="Tahun Masuk"
              value={entryYear}
              onChange={(e) => {
                setEntryYear(e.target.value);
                if (e.target.value && !joinDate) {
                  setJoinDate(`${e.target.value}-01-01`);
                }
              }}
              placeholder="Contoh: 2019"
              helperText="Tahun pertama kali bergabung di Al-Qur'aniyyah"
            />

            <Input
              label="Tahun Keluar (Jika Selesai)"
              value={exitYear}
              onChange={(e) => setExitYear(e.target.value)}
              placeholder="Contoh: 2024"
              helperText="Kosongkan jika masih aktif mengabdi"
            />

            <Input
              label="Tanggal Mulai Bekerja (TMT)"
              type="date"
              isRequired
              value={joinDate}
              onChange={(e) => setJoinDate(e.target.value)}
              error={errors.joinDate}
            />

            <Input
              label="Tanggal Berakhir Kontrak"
              type="date"
              value={contractEndDate}
              onChange={(e) => setContractEndDate(e.target.value)}
              helperText="Khusus karyawan kontrak / PKWT"
            />

            <Input
              label="Nomor SK Pengangkatan Yayasan"
              value={appointmentSkNumber}
              onChange={(e) => setAppointmentSkNumber(e.target.value)}
              placeholder="SK-YPA/2020/001"
            />
          </div>

          {/* Bank & Rekening */}
          <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-200/80 mt-4">
            <div className="flex items-center gap-2 mb-3 text-emerald-950 font-bold text-sm">
              <CreditCard className="w-4 h-4 text-emerald-700" />
              <span>Informasi Rekening Bank (Penggajian & Honor)</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Nama Bank"
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                placeholder="Bank Syariah Indonesia (BSI) / BCA / Mandiri / BRI"
              />
              <Input
                label="Nomor Rekening"
                value={bankAccountNumber}
                onChange={(e) => setBankAccountNumber(e.target.value)}
                placeholder="Contoh: 7123456789 a.n Ahmad Fauzi"
              />
            </div>
          </div>
        </div>
      </Card>

      {/* SECTION 4: RIWAYAT PENDIDIKAN FORMAL (SD, SMP, SMA, S1, S2, S3) */}
      <Card
        title="4. Riwayat Pendidikan Formal"
        subtitle="Catatan jenjang pendidikan formal dari tingkat dasar hingga pendidikan tinggi"
      >
        <div className="space-y-3">
          {/* SD */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
            <div className="sm:col-span-3 font-bold text-xs text-slate-800 flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-800 text-[10px] flex items-center justify-center font-extrabold">SD</span>
              <span>Pendidikan SD / MI</span>
            </div>
            <div className="sm:col-span-3">
              <Input
                placeholder="Tahun Lulus (2000)"
                value={sdYear}
                onChange={(e) => setSdYear(e.target.value)}
              />
            </div>
            <div className="sm:col-span-6">
              <Input
                placeholder="Nama Instansi / Sekolah (SDN 01 Cibinong)"
                value={sdInstitution}
                onChange={(e) => setSdInstitution(e.target.value)}
              />
            </div>
          </div>

          {/* SMP */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
            <div className="sm:col-span-3 font-bold text-xs text-slate-800 flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-800 text-[10px] flex items-center justify-center font-extrabold">SMP</span>
              <span>Pendidikan SMP / MTs</span>
            </div>
            <div className="sm:col-span-3">
              <Input
                placeholder="Tahun Lulus (2003)"
                value={smpYear}
                onChange={(e) => setSmpYear(e.target.value)}
              />
            </div>
            <div className="sm:col-span-6">
              <Input
                placeholder="Nama Instansi / Sekolah (SMPN 01 Cibinong)"
                value={smpInstitution}
                onChange={(e) => setSmpInstitution(e.target.value)}
              />
            </div>
          </div>

          {/* SMA */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
            <div className="sm:col-span-3 font-bold text-xs text-slate-800 flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-800 text-[10px] flex items-center justify-center font-extrabold">SMA</span>
              <span>Pendidikan SMA / SMK / MA</span>
            </div>
            <div className="sm:col-span-3">
              <Input
                placeholder="Tahun Lulus (2006)"
                value={smaYear}
                onChange={(e) => setSmaYear(e.target.value)}
              />
            </div>
            <div className="sm:col-span-6">
              <Input
                placeholder="Nama Instansi / Sekolah (SMAN 01 Cibinong)"
                value={smaInstitution}
                onChange={(e) => setSmaInstitution(e.target.value)}
              />
            </div>
          </div>

          {/* S1 */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
            <div className="sm:col-span-3 font-bold text-xs text-slate-800 flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-emerald-600 text-white text-[10px] flex items-center justify-center font-extrabold">S1</span>
              <span>Pendidikan Sarjana (S1)</span>
            </div>
            <div className="sm:col-span-3">
              <Input
                placeholder="Tahun Lulus (2011)"
                value={s1Year}
                onChange={(e) => setS1Year(e.target.value)}
              />
            </div>
            <div className="sm:col-span-6">
              <Input
                placeholder="Nama Universitas / Kampus (UNJ / UIN)"
                value={s1Institution}
                onChange={(e) => setS1Institution(e.target.value)}
              />
            </div>
          </div>

          {/* S2 */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
            <div className="sm:col-span-3 font-bold text-xs text-slate-800 flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-emerald-700 text-white text-[10px] flex items-center justify-center font-extrabold">S2</span>
              <span>Pendidikan Magister (S2)</span>
            </div>
            <div className="sm:col-span-3">
              <Input
                placeholder="Tahun Lulus (Opsional)"
                value={s2Year}
                onChange={(e) => setS2Year(e.target.value)}
              />
            </div>
            <div className="sm:col-span-6">
              <Input
                placeholder="Nama Universitas (Opsional)"
                value={s2Institution}
                onChange={(e) => setS2Institution(e.target.value)}
              />
            </div>
          </div>

          {/* S3 */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
            <div className="sm:col-span-3 font-bold text-xs text-slate-800 flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-emerald-900 text-white text-[10px] flex items-center justify-center font-extrabold">S3</span>
              <span>Pendidikan Doktor (S3)</span>
            </div>
            <div className="sm:col-span-3">
              <Input
                placeholder="Tahun Lulus (Opsional)"
                value={s3Year}
                onChange={(e) => setS3Year(e.target.value)}
              />
            </div>
            <div className="sm:col-span-6">
              <Input
                placeholder="Nama Universitas (Opsional)"
                value={s3Institution}
                onChange={(e) => setS3Institution(e.target.value)}
              />
            </div>
          </div>
        </div>
      </Card>

      {/* SECTION 5: RIWAYAT PENDIDIKAN NONFORMAL / PESANTREN / PELATIHAN */}
      <Card
        title="5. Riwayat Pendidikan & Pelatihan Nonformal"
        subtitle="Pondok pesantren, kursus tahfidz/tahsin, pelatihan metodologi guru, diklat, dsb."
        action={
          <Button
            type="button"
            variant="outline"
            size="sm"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={handleAddNonformalRow}
          >
            Tambah Baris
          </Button>
        }
      >
        <div className="space-y-3">
          {nonformalList.map((item, idx) => (
            <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 relative space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
                <span className="text-xs font-bold text-emerald-900">
                  Pelatihan / Nonformal #{idx + 1}
                </span>
                {nonformalList.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveNonformalRow(idx)}
                    className="p-1 text-slate-400 hover:text-rose-600 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <Input
                  label="Pendidikan / Pelatihan Nonformal"
                  placeholder="Pesantren / Kursus Tahsin"
                  value={item.name}
                  onChange={(e) => handleNonformalChange(idx, 'name', e.target.value)}
                />
                <Input
                  label="Instansi Penyelenggara"
                  placeholder="Ponpes Al-Falah / LPPOM"
                  value={item.institution || ''}
                  onChange={(e) => handleNonformalChange(idx, 'institution', e.target.value)}
                />
                <Input
                  label="Tahun"
                  placeholder="2018"
                  value={item.year || ''}
                  onChange={(e) => handleNonformalChange(idx, 'year', e.target.value)}
                />
                <Input
                  label="Keterangan"
                  placeholder="Khatam 30 Juz / Bersertifikat"
                  value={item.notes || ''}
                  onChange={(e) => handleNonformalChange(idx, 'notes', e.target.value)}
                />
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* SECTION 6: PENUGASAN UNIT KERJA (KHUSUS KARYAWAN BARU) */}
      {!isEdit && (
        <Card
          title="6. Penugasan Unit Kerja & Jabatan Utama"
          subtitle="Penugasan pertama karyawan baru (dapat ditambahkan penugasan multi-unit lainnya setelah disimpan)"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Select
              label="Unit Kerja Penugasan"
              isRequired
              value={initialUnitId}
              onChange={(e) => setInitialUnitId(e.target.value)}
              options={units.map(u => ({ value: u.id, label: `${u.name} (${u.code})` }))}
              error={errors.initialUnitId}
            />

            <Select
              label="Jabatan"
              isRequired
              value={initialPositionId}
              onChange={(e) => {
                setInitialPositionId(e.target.value);
                setInitialTaskId('');
              }}
              options={positions.map(p => ({ value: p.id, label: `${p.name} - ${p.category}` }))}
              error={errors.initialPositionId}
            />

            <Select
              label="Tugas Pokok (Opsional)"
              value={initialTaskId}
              onChange={(e) => setInitialTaskId(e.target.value)}
              options={[
                { value: '', label: '-- Pilih Tugas / Tulis Kustom --' },
                ...filteredTasks.map(t => ({ value: t.id, label: t.name }))
              ]}
            />

            {!initialTaskId && (
              <div className="sm:col-span-2 lg:col-span-3">
                <Input
                  label="Deskripsi / Nama Tugas Kustom (Jika tidak ada di daftar)"
                  value={customTaskName}
                  onChange={(e) => setCustomTaskName(e.target.value)}
                  placeholder="Contoh: Guru IPS Terpadu & Pembina Tahsin"
                />
              </div>
            )}
          </div>
        </Card>
      )}

      {/* SECTION 7: FOTO KARYAWAN & DATA TAMBAHAN */}
      <Card
        title="7. Foto Profil & Berkas"
        subtitle="Tautan foto profil atau identitas visual karyawan"
      >
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="w-24 h-24 rounded-2xl bg-emerald-50 border-2 border-dashed border-emerald-300 flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
            {photoUrl ? (
              <img src={photoUrl} alt="Preview" className="w-full h-full object-cover" />
            ) : (
              <Camera className="w-8 h-8 text-emerald-600" />
            )}
          </div>

          <div className="flex-1 w-full">
            <Input
              label="URL Foto Profil (Opsional)"
              value={photoUrl}
              onChange={(e) => setPhotoUrl(e.target.value)}
              placeholder="https://... atau data foto URL"
              helperText="Anda juga dapat mengunggah berkas lengkap (KTP, KK, Ijazah, SK) melalui tab Dokumen Karyawan setelah data disimpan."
            />
          </div>
        </div>
      </Card>

      {/* Bottom Sticky Action Buttons on Mobile */}
      <div className="fixed bottom-14 lg:bottom-0 left-0 right-0 p-3 sm:p-4 bg-white/95 backdrop-blur-md border-t border-slate-200/80 z-20 flex items-center justify-end gap-3 max-w-7xl mx-auto px-4 sm:px-8">
        <Button
          type="button"
          variant="outline"
          onClick={() => navigate('/employees')}
        >
          Batal
        </Button>
        <Button
          type="submit"
          variant="primary"
          isLoading={isLoading}
          leftIcon={<Save className="w-4 h-4" />}
        >
          {isEdit ? 'Simpan Perubahan' : 'Simpan Karyawan'}
        </Button>
      </div>
    </form>
  );
};
