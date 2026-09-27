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
  Sparkles
} from 'lucide-react';
import { Employee, Unit, Position, Task, EmploymentStatus } from '../../types';
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

  // Form States
  const [employeeNumber, setEmployeeNumber] = useState('');
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
  const [maritalStatus, setMaritalStatus] = useState('Belum Menikah');

  // Address
  const [address, setAddress] = useState('');
  const [rt, setRt] = useState('');
  const [rw, setRw] = useState('');
  const [kelurahan, setKelurahan] = useState('');
  const [kecamatan, setKecamatan] = useState('');
  const [city, setCity] = useState('');
  const [province, setProvince] = useState('');
  const [postalCode, setPostalCode] = useState('');

  // Contact
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [email, setEmail] = useState('');

  // Employment
  const [employmentStatus, setEmploymentStatus] = useState<EmploymentStatus>('Tetap');
  const [joinDate, setJoinDate] = useState(new Date().toISOString().split('T')[0]);
  const [appointmentDate, setAppointmentDate] = useState('');
  const [appointmentSkNumber, setAppointmentSkNumber] = useState('');
  const [appointmentSkDate, setAppointmentSkDate] = useState('');
  const [contractEndDate, setContractEndDate] = useState('');

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
          setMaritalStatus(emp.marital_status || 'Belum Menikah');

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
          setJoinDate(emp.join_date);
          setAppointmentDate(emp.appointment_date || '');
          setAppointmentSkNumber(emp.appointment_sk_number || '');
          setAppointmentSkDate(emp.appointment_sk_date || '');
          setContractEndDate(emp.contract_end_date || '');
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
    if (!validate()) return;

    setIsLoading(true);
    try {
      const employeePayload: Partial<Employee> = {
        id: isEdit ? id : undefined,
        employee_number: employeeNumber,
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
        join_date: joinDate,
        appointment_date: appointmentDate || undefined,
        appointment_sk_number: appointmentSkNumber.trim() || undefined,
        appointment_sk_date: appointmentSkDate || undefined,
        contract_end_date: contractEndDate || undefined,
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
    <form onSubmit={handleSubmit} className="space-y-6 max-w-5xl mx-auto pb-12 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {isEdit ? `Edit Data: ${fullName || 'Karyawan'}` : 'Tambah Karyawan Baru'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              ID Karyawan Otomatis: <strong className="font-mono text-emerald-800">{employeeNumber}</strong>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => navigate('/employees')}
          >
            Batal
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            leftIcon={<Save className="w-4 h-4" />}
            isLoading={isLoading}
          >
            Simpan Data
          </Button>
        </div>
      </div>

      {/* SECTION 1: DATA PRIBADI */}
      <Card
        title={
          <div className="flex items-center gap-2 text-base font-bold text-slate-900">
            <User className="w-5 h-5 text-emerald-700" />
            <span>1. Data Pribadi & Identitas</span>
          </div>
        }
        subtitle="Identitas kependudukan, nama lengkap, dan tempat tanggal lahir"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <Input
            label="ID Karyawan"
            value={employeeNumber}
            readOnly
            className="bg-slate-50 font-mono font-bold text-emerald-900"
            helperText="Nomor ID digenerate otomatis oleh sistem (YPA-xxxx)"
          />

          <Input
            label="NIK KTP (16 Digit)"
            isRequired
            value={nik}
            onChange={(e) => setNik(e.target.value.replace(/\D/g, '').slice(0, 16))}
            placeholder="3201012345670001"
            maxLength={16}
            error={errors.nik}
            helperText="NIK harus 16 digit angka dan unik"
          />

          <Input
            label="NIP (Jika Ada)"
            value={nip}
            onChange={(e) => setNip(e.target.value)}
            placeholder="198809152015011003"
          />

          <div className="sm:col-span-2">
            <Input
              label="Nama Lengkap Beserta Gelar"
              isRequired
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Contoh: Ahmad Fauzi, S.Pd., M.Pd."
              error={errors.fullName}
            />
          </div>

          <Input
            label="Nama Panggilan / Alias"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="Pak Fauzi / Ustadz Fauzi"
          />

          <Select
            label="Jenis Kelamin"
            isRequired
            value={gender}
            onChange={(e) => setGender(e.target.value as any)}
            options={[
              { value: 'Laki-laki', label: 'Laki-laki' },
              { value: 'Perempuan', label: 'Perempuan' }
            ]}
          />

          <Input
            label="Tempat Lahir"
            value={birthPlace}
            onChange={(e) => setBirthPlace(e.target.value)}
            placeholder="Bogor / Jakarta / Sukabumi"
          />

          <Input
            label="Tanggal Lahir"
            type="date"
            value={birthDate}
            onChange={(e) => setBirthDate(e.target.value)}
            error={errors.birthDate}
          />

          <Select
            label="Agama"
            value={religion}
            onChange={(e) => setReligion(e.target.value)}
            options={[
              { value: 'Islam', label: 'Islam' },
              { value: 'Kristen', label: 'Kristen' },
              { value: 'Katolik', label: 'Katolik' },
              { value: 'Hindu', label: 'Hindu' },
              { value: 'Buddha', label: 'Buddha' },
              { value: 'Konghucu', label: 'Konghucu' }
            ]}
          />

          <Select
            label="Status Pernikahan"
            value={maritalStatus}
            onChange={(e) => setMaritalStatus(e.target.value)}
            options={[
              { value: 'Belum Menikah', label: 'Belum Menikah' },
              { value: 'Menikah', label: 'Menikah' },
              { value: 'Cerai Hidup', label: 'Cerai Hidup' },
              { value: 'Cerai Mati', label: 'Cerai Mati' }
            ]}
          />

          <Input
            label="Nomor Kartu Keluarga (KK)"
            value={noKk}
            onChange={(e) => setNoKk(e.target.value.replace(/\D/g, '').slice(0, 16))}
            placeholder="3201019876540001"
            maxLength={16}
          />

          <div className="sm:col-span-3">
            <Input
              label="URL Foto Profil (Opsional)"
              value={photoUrl}
              onChange={(e) => setPhotoUrl(e.target.value)}
              placeholder="https://..."
              helperText="Dapat diunggah juga melalui tab dokumen setelah profil disimpan"
            />
          </div>
        </div>
      </Card>

      {/* SECTION 2: ALAMAT & KONTAK */}
      <Card
        title={
          <div className="flex items-center gap-2 text-base font-bold text-slate-900">
            <MapPin className="w-5 h-5 text-emerald-700" />
            <span>2. Alamat Domisili & Kontak</span>
          </div>
        }
        subtitle="Alamat tinggal dan nomor kontak yang dapat dihubungi"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <div className="sm:col-span-3">
            <Input
              label="Alamat Lengkap (Jalan / Gang / Blok / No. Rumah)"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Jl. Raya Puncak KM 78, Gang Al-Ikhlas No. 12"
            />
          </div>

          <Input
            label="RT"
            value={rt}
            onChange={(e) => setRt(e.target.value)}
            placeholder="01"
          />

          <Input
            label="RW"
            value={rw}
            onChange={(e) => setRw(e.target.value)}
            placeholder="03"
          />

          <Input
            label="Kelurahan / Desa"
            value={kelurahan}
            onChange={(e) => setKelurahan(e.target.value)}
            placeholder="Cipayung"
          />

          <Input
            label="Kecamatan"
            value={kecamatan}
            onChange={(e) => setKecamatan(e.target.value)}
            placeholder="Megamendung"
          />

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
            placeholder="16770"
          />

          <Input
            label="No. Handphone (Telepon)"
            leftIcon={<Phone className="w-4 h-4" />}
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="08123456789"
          />

          <Input
            label="WhatsApp Aktif"
            leftIcon={<Phone className="w-4 h-4 text-emerald-600" />}
            value={whatsapp}
            onChange={(e) => setWhatsapp(e.target.value)}
            placeholder="08123456789"
          />

          <div className="sm:col-span-2">
            <Input
              label="Alamat Email"
              leftIcon={<Mail className="w-4 h-4" />}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nama@alquraniyyah.sch.id"
              error={errors.email}
            />
          </div>
        </div>
      </Card>

      {/* SECTION 3: DATA KEPEGAWAIAN */}
      <Card
        title={
          <div className="flex items-center gap-2 text-base font-bold text-slate-900">
            <FileText className="w-5 h-5 text-emerald-700" />
            <span>3. Status Kepegawaian Yayasan</span>
          </div>
        }
        subtitle="Status ikatan kerja, tanggal masuk, SK pengangkatan, dan kontrak"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <Select
            label="Status Kepegawaian"
            isRequired
            value={employmentStatus}
            onChange={(e) => setEmploymentStatus(e.target.value as any)}
            options={[
              { value: 'Tetap', label: 'Pegawai Tetap Yayasan' },
              { value: 'Kontrak', label: 'Pegawai Kontrak' },
              { value: 'Honorer', label: 'Pegawai Honorer' },
              { value: 'Magang', label: 'Magang' },
              { value: 'Freelance', label: 'Freelance' },
              { value: 'Lainnya', label: 'Lainnya' }
            ]}
          />

          <Input
            label="Tanggal Mulai Bekerja"
            isRequired
            type="date"
            value={joinDate}
            onChange={(e) => setJoinDate(e.target.value)}
            error={errors.joinDate}
          />

          {employmentStatus === 'Kontrak' && (
            <Input
              label="Tanggal Akhir Kontrak"
              type="date"
              value={contractEndDate}
              onChange={(e) => setContractEndDate(e.target.value)}
              helperText="Sistem akan memberikan peringatan 30/60/90 hari sebelum berakhir"
            />
          )}

          <Input
            label="Nomor SK Pengangkatan"
            value={appointmentSkNumber}
            onChange={(e) => setAppointmentSkNumber(e.target.value)}
            placeholder="SK-YPA/2021/045"
          />

          <Input
            label="Tanggal SK Pengangkatan"
            type="date"
            value={appointmentSkDate}
            onChange={(e) => setAppointmentSkDate(e.target.value)}
          />

          <Input
            label="Tanggal Pengangkatan Resmi"
            type="date"
            value={appointmentDate}
            onChange={(e) => setAppointmentDate(e.target.value)}
          />
        </div>
      </Card>

      {/* SECTION 4: INITIAL ASSIGNMENT (Only shown when creating new employee) */}
      {!isEdit && (
        <Card
          title={
            <div className="flex items-center gap-2 text-base font-bold text-slate-900">
              <Briefcase className="w-5 h-5 text-amber-600" />
              <span>4. Penugasan Awal (Penugasan Utama)</span>
            </div>
          }
          subtitle="Penugasan pertama karyawan. Penugasan tambahan lainnya dapat ditambahkan sewaktu-waktu di Tab Penugasan."
          className="border-amber-200/80 bg-amber-50/20"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <Select
              label="Unit Lembaga"
              isRequired
              value={initialUnitId}
              onChange={(e) => setInitialUnitId(e.target.value)}
              error={errors.initialUnitId}
              options={units.map(u => ({ value: u.id, label: u.name }))}
            />

            <Select
              label="Jabatan"
              isRequired
              value={initialPositionId}
              onChange={(e) => setInitialPositionId(e.target.value)}
              error={errors.initialPositionId}
              options={positions.map(p => ({ value: p.id, label: `${p.name} (${p.category})` }))}
            />

            <Select
              label="Tugas Pokok (Master)"
              value={initialTaskId}
              onChange={(e) => setInitialTaskId(e.target.value)}
              options={[
                { value: '', label: '-- Pilih Tugas Terdaftar (Atau isi manual) --' },
                ...filteredTasks.map(t => ({ value: t.id, label: t.name }))
              ]}
            />

            <div className="sm:col-span-3">
              <Input
                label="Nama Tugas / Deskripsi Khusus (Jika tidak ada di daftar)"
                value={customTaskName}
                onChange={(e) => setCustomTaskName(e.target.value)}
                placeholder="Contoh: Guru IPS Terpadu Kelas VII & Koordinator OSIS"
              />
            </div>
          </div>
        </Card>
      )}

      {/* Submit Buttons */}
      <div className="flex items-center justify-end gap-3 pt-4">
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
          size="lg"
          leftIcon={<Save className="w-5 h-5" />}
          isLoading={isLoading}
        >
          {isEdit ? 'Simpan Perubahan Karyawan' : 'Daftarkan Karyawan & Penugasan'}
        </Button>
      </div>
    </form>
  );
};
