import {
  Unit,
  Department,
  Position,
  Task,
  Employee,
  EmployeeAssignment,
  EmployeeEducation,
  EmployeePositionHistory,
  EmployeeDocument,
  DocumentTypeDefinition,
  EmployeeTraining,
  EmployeeAttendance,
  EmployeeLeave,
  EmployeeNote,
  AuditLog,
  UserProfile
} from '../types';

export const initialDocumentTypes: DocumentTypeDefinition[] = [
  { id: 'dt-1', name: 'KTP', code: 'KTP', description: 'Kartu Tanda Penduduk Wajib', is_mandatory: true, is_active: true, sort_order: 1 },
  { id: 'dt-2', name: 'KK', code: 'KK', description: 'Kartu Keluarga', is_mandatory: true, is_active: true, sort_order: 2 },
  { id: 'dt-3', name: 'Ijazah', code: 'IJZ', description: 'Ijazah Pendidikan Terakhir', is_mandatory: true, is_active: true, sort_order: 3 },
  { id: 'dt-4', name: 'SK Pengangkatan', code: 'SKA', description: 'Surat Keputusan Pengangkatan Pegawai', is_mandatory: true, is_active: true, sort_order: 4 },
  { id: 'dt-5', name: 'SK Penugasan', code: 'SKP', description: 'Surat Keputusan Penugasan / Amanah', is_mandatory: true, is_active: true, sort_order: 5 },
  { id: 'dt-6', name: 'NPWP', code: 'NPWP', description: 'Nomor Pokok Wajib Pajak', is_mandatory: false, is_active: true, sort_order: 6 },
  { id: 'dt-7', name: 'BPJS', code: 'BPJS', description: 'Kartu BPJS Kesehatan / Ketenagakerjaan', is_mandatory: false, is_active: true, sort_order: 7 },
  { id: 'dt-8', name: 'Sertifikat Pendidik', code: 'SERGUR', description: 'Sertifikat Pendidik / Pelatihan', is_mandatory: false, is_active: true, sort_order: 8 }
];

export const initialUnits: Unit[] = [
  { id: 'u-1', code: 'YAS', name: 'Yayasan', description: 'Pengurus Yayasan Pendidikan Islam Pondok Pesantren Al-Qur\'aniyyah', is_active: true, sort_order: 1 },
  { id: 'u-2', code: 'TKIT', name: 'TK IT Al-Qur\'aniyyah', description: 'Taman Kanak-kanak Islam Terpadu', is_active: true, sort_order: 2 },
  { id: 'u-3', code: 'SDIT', name: 'SD IT Al-Qur\'aniyyah', description: 'Sekolah Dasar Islam Terpadu', is_active: true, sort_order: 3 },
  { id: 'u-4', code: 'SMPIT', name: 'SMP IT Al-Qur\'aniyyah', description: 'Sekolah Menengah Pertama Islam Terpadu', is_active: true, sort_order: 4 },
  { id: 'u-5', code: 'SMAIT', name: 'SMA IT Al-Qur\'aniyyah', description: 'Sekolah Menengah Atas Islam Terpadu', is_active: true, sort_order: 5 },
  { id: 'u-6', code: 'TPA', name: 'TPA/TPQ Al-Qur\'aniyyah', description: 'Taman Pendidikan Al-Qur\'an', is_active: true, sort_order: 6 },
  { id: 'u-7', code: 'LPBQ', name: 'LPBQ', description: 'Lembaga Pengembangan Baca Al-Qur\'an', is_active: true, sort_order: 7 },
  { id: 'u-8', code: 'HALQ', name: 'HALQ', description: 'Halaqah Al-Qur\'an Pesantren', is_active: true, sort_order: 8 },
  { id: 'u-9', code: 'SARPRAS', name: 'Unit Sarana & Logistik', description: 'Pengelolaan aset fisik dan fasilitas', is_active: true, sort_order: 9 }
];

export const initialDepartments: Department[] = [
  { id: 'd-1', unit_id: 'u-1', code: 'YAS-KEU', name: 'Divisi Keuangan & Akuntansi', is_active: true },
  { id: 'd-2', unit_id: 'u-1', code: 'YAS-SDM', name: 'Divisi HR & Kepegawaian', is_active: true },
  { id: 'd-3', unit_id: 'u-4', code: 'SMP-KUR', name: 'Bidang Kurikulum SMP', is_active: true },
  { id: 'd-4', unit_id: 'u-4', code: 'SMP-KES', name: 'Bidang Kesiswaan SMP', is_active: true },
  { id: 'd-5', unit_id: 'u-5', code: 'SMA-KUR', name: 'Bidang Kurikulum SMA', is_active: true },
  { id: 'd-6', unit_id: 'u-5', code: 'SMA-KES', name: 'Bidang Kesiswaan SMA', is_active: true }
];

export const initialPositions: Position[] = [
  { id: 'p-1', code: 'PIN', name: 'Pimpinan', category: 'Pimpinan', is_active: true, sort_order: 1 },
  { id: 'p-2', code: 'KS', name: 'Kepala Sekolah', category: 'Pimpinan', is_active: true, sort_order: 2 },
  { id: 'p-3', code: 'WKS', name: 'Wakil Kepala Sekolah', category: 'Pimpinan', is_active: true, sort_order: 3 },
  { id: 'p-4', code: 'GUR', name: 'Guru', category: 'Pendidik', is_active: true, sort_order: 4 },
  { id: 'p-5', code: 'WLK', name: 'Wali Kelas', category: 'Pendidik', is_active: true, sort_order: 5 },
  { id: 'p-6', code: 'BDH', name: 'Bendahara', category: 'Tenaga Kependidikan', is_active: true, sort_order: 6 },
  { id: 'p-7', code: 'TU', name: 'Tata Usaha', category: 'Tenaga Kependidikan', is_active: true, sort_order: 7 },
  { id: 'p-8', code: 'OPR', name: 'Operator', category: 'Tenaga Kependidikan', is_active: true, sort_order: 8 },
  { id: 'p-9', code: 'KOR', name: 'Koordinator', category: 'Pimpinan', is_active: true, sort_order: 9 },
  { id: 'p-10', code: 'PBN', name: 'Pembina', category: 'Pendidik', is_active: true, sort_order: 10 },
  { id: 'p-11', code: 'PSG', name: 'Pengasuh', category: 'Pendidik', is_active: true, sort_order: 11 },
  { id: 'p-12', code: 'STF', name: 'Staff', category: 'Staff', is_active: true, sort_order: 12 },
  { id: 'p-13', code: 'SEC', name: 'Security', category: 'Operasional', is_active: true, sort_order: 13 },
  { id: 'p-14', code: 'OB', name: 'Office Boy / Kebersihan', category: 'Operasional', is_active: true, sort_order: 14 }
];

export const initialTasks: Task[] = [
  { id: 't-1', position_id: 'p-4', code: 'G-IPS', name: 'Guru IPS', description: 'Pengajar IPS di tingkat SMP / SMA', is_active: true },
  { id: 't-2', position_id: 'p-4', code: 'G-PAI', name: 'Guru PAI & Tahfidz', description: 'Pengajar Al-Qur\'an & PAI', is_active: true },
  { id: 't-3', position_id: 'p-4', code: 'G-MTK', name: 'Guru Matematika', description: 'Pengajar Matematika', is_active: true },
  { id: 't-4', position_id: 'p-4', code: 'G-IND', name: 'Guru Bahasa Indonesia', description: 'Pengajar Bahasa Indonesia', is_active: true },
  { id: 't-5', position_id: 'p-4', code: 'G-ING', name: 'Guru Bahasa Inggris', description: 'Pengajar Bahasa Inggris', is_active: true },
  { id: 't-6', position_id: 'p-5', code: 'WL-7A', name: 'Wali Kelas VII-A', description: 'Wali Kelas santri putra VII-A', is_active: true },
  { id: 't-7', position_id: 'p-5', code: 'WL-8A', name: 'Wali Kelas VIII-A', description: 'Wali Kelas santri putri VIII-A', is_active: true },
  { id: 't-8', position_id: 'p-5', code: 'WL-10', name: 'Wali Kelas X', description: 'Wali Kelas X SMA IT', is_active: true },
  { id: 't-9', position_id: 'p-9', code: 'KOR-RAPIM', name: 'Koordinator Rapim', description: 'Koordinator Rapat Pimpinan Yayasan', is_active: true },
  { id: 't-10', position_id: 'p-10', code: 'PEM-OSIS', name: 'Pembina OSIS', description: 'Pembina Organisasi Santri', is_active: true },
  { id: 't-11', position_id: 'p-10', code: 'PEM-TAHFIDZ', name: 'Pembina Halaqah Tahfidz', description: 'Pembimbing setoran tahfidz', is_active: true },
  { id: 't-12', position_id: 'p-6', code: 'BDH-UM', name: 'Bendahara Umum', description: 'Pengelola kas utama yayasan', is_active: true },
  { id: 't-13', position_id: 'p-7', code: 'ADM-KUR', name: 'Administrasi Kurikulum', description: 'Pengelola arsip kurikulum', is_active: true },
  { id: 't-14', position_id: 'p-8', code: 'OPR-DAPODIK', name: 'Operator Dapodik / EMIS', description: 'Operator sinkronisasi data kementerian', is_active: true }
];

export const initialEmployees: Employee[] = [
  {
    id: 'emp-1',
    employee_number: 'YPA-0001',
    nik: '3201011234560001',
    nip: '198205102010011002',
    no_kk: '3201019876540001',
    full_name: 'H. Nasrullah, S.Pd.I, M.M.',
    nickname: 'Ustadz Nasrullah',
    gender: 'Laki-laki',
    birth_place: 'Bogor',
    birth_date: '1982-05-10',
    religion: 'Islam',
    marital_status: 'Menikah',
    address: 'Jl. Pesantren Al-Qur\'aniyyah No. 12',
    rt: '02',
    rw: '05',
    kelurahan: 'Cipayung',
    kecamatan: 'Megamendung',
    city: 'Kabupaten Bogor',
    province: 'Jawa Barat',
    postal_code: '16770',
    phone: '081234567890',
    whatsapp: '081234567890',
    email: 'nasrullah@alquraniyyah.sch.id',
    employment_status: 'Tetap',
    join_date: '2015-07-01',
    appointment_date: '2017-01-01',
    appointment_sk_number: 'SK-YPA/2017/001',
    appointment_sk_date: '2017-01-01',
    is_active: true,
    created_at: '2023-01-10T08:00:00Z'
  },
  {
    id: 'emp-2',
    employee_number: 'YPA-0025',
    nik: '3201012345670001',
    nip: '198809152015011003',
    no_kk: '3201018876540002',
    full_name: 'Ahmad Fauzi, S.Pd.',
    nickname: 'Pak Fauzi',
    gender: 'Laki-laki',
    birth_place: 'Sukabumi',
    birth_date: '1988-09-15',
    religion: 'Islam',
    marital_status: 'Menikah',
    address: 'Jl. Raya Puncak KM 78, Gang Al-Ikhlas',
    rt: '01',
    rw: '03',
    kelurahan: 'Cisarua',
    kecamatan: 'Cisarua',
    city: 'Kabupaten Bogor',
    province: 'Jawa Barat',
    postal_code: '16750',
    phone: '085712345678',
    whatsapp: '085712345678',
    email: 'ahmad.fauzi@alquraniyyah.sch.id',
    employment_status: 'Tetap',
    join_date: '2019-08-01',
    appointment_date: '2021-08-01',
    appointment_sk_number: 'SK-YPA/2021/045',
    appointment_sk_date: '2021-08-01',
    is_active: true,
    created_at: '2023-02-15T09:00:00Z'
  },
  {
    id: 'emp-3',
    employee_number: 'YPA-0003',
    nik: '3201013456780001',
    nip: '199003202018012004',
    no_kk: '3201017776540003',
    full_name: 'Ustadzah Fatimah Zahra, S.Ag., M.Pd.',
    nickname: 'Ustadzah Zahra',
    gender: 'Perempuan',
    birth_place: 'Bandung',
    birth_date: '1990-03-20',
    religion: 'Islam',
    marital_status: 'Menikah',
    address: 'Kompleks Pesantren Putri Blok C2',
    rt: '03',
    rw: '02',
    kelurahan: 'Cipayung Datar',
    kecamatan: 'Megamendung',
    city: 'Kabupaten Bogor',
    province: 'Jawa Barat',
    postal_code: '16770',
    phone: '081398765432',
    whatsapp: '081398765432',
    email: 'fatimah.zahra@alquraniyyah.sch.id',
    employment_status: 'Tetap',
    join_date: '2018-01-15',
    appointment_date: '2020-01-15',
    appointment_sk_number: 'SK-YPA/2020/012',
    appointment_sk_date: '2020-01-15',
    is_active: true,
    created_at: '2023-01-20T10:00:00Z'
  },
  {
    id: 'emp-4',
    employee_number: 'YPA-0004',
    nik: '3201014567890001',
    no_kk: '3201016676540004',
    full_name: 'Siti Rahmawati, S.Kom.',
    nickname: 'Mbak Rahma',
    gender: 'Perempuan',
    birth_place: 'Jakarta',
    birth_date: '1995-11-28',
    religion: 'Islam',
    marital_status: 'Belum Menikah',
    address: 'Jl. Surya Kencana No. 45',
    rt: '04',
    rw: '01',
    kelurahan: 'Gadog',
    kecamatan: 'Megamendung',
    city: 'Kabupaten Bogor',
    province: 'Jawa Barat',
    postal_code: '16770',
    phone: '087811223344',
    whatsapp: '087811223344',
    email: 'rahma.tu@alquraniyyah.sch.id',
    employment_status: 'Kontrak',
    join_date: '2024-07-01',
    contract_end_date: '2026-10-25', // Expiring in < 30 days for warning test
    is_active: true,
    created_at: '2024-07-01T08:30:00Z'
  },
  {
    id: 'emp-5',
    employee_number: 'YPA-0005',
    nik: '3201015678900001',
    full_name: 'M. Rizky Pratama, S.Si.',
    nickname: 'Pak Rizky',
    gender: 'Laki-laki',
    birth_place: 'Depok',
    birth_date: '1993-06-12',
    religion: 'Islam',
    marital_status: 'Menikah',
    address: 'Perumahan Griya Indah Blok A4',
    rt: '02',
    rw: '07',
    kelurahan: 'Ciawi',
    kecamatan: 'Ciawi',
    city: 'Kabupaten Bogor',
    province: 'Jawa Barat',
    postal_code: '16720',
    phone: '085299887766',
    whatsapp: '085299887766',
    email: 'rizky.pratama@alquraniyyah.sch.id',
    employment_status: 'Kontrak',
    join_date: '2023-08-01',
    contract_end_date: '2026-11-15', // Expiring in < 60 days
    is_active: true,
    created_at: '2023-08-01T09:15:00Z'
  },
  {
    id: 'emp-6',
    employee_number: 'YPA-0006',
    nik: '3201016789010001',
    full_name: 'Hendra Gunawan',
    nickname: 'Pak Hendra',
    gender: 'Laki-laki',
    birth_place: 'Bogor',
    birth_date: '1985-04-03',
    religion: 'Islam',
    marital_status: 'Menikah',
    address: 'Kampung Pasir Angin RT 03/RW 01',
    rt: '03',
    rw: '01',
    kelurahan: 'Pasir Angin',
    kecamatan: 'Megamendung',
    city: 'Kabupaten Bogor',
    province: 'Jawa Barat',
    postal_code: '16770',
    phone: '081544332211',
    whatsapp: '081544332211',
    email: 'hendra.sec@alquraniyyah.sch.id',
    employment_status: 'Honorer',
    join_date: '2020-01-01',
    is_active: true,
    created_at: '2023-01-10T08:00:00Z'
  },
  {
    id: 'emp-7',
    employee_number: 'YPA-0007',
    nik: '3201017890120001',
    full_name: 'Drs. KH. Abdul Muin',
    nickname: 'Kyai Muin',
    gender: 'Laki-laki',
    birth_place: 'Cianjur',
    birth_date: '1965-12-05',
    religion: 'Islam',
    marital_status: 'Menikah',
    address: 'Ndresmo Pondok Pesantren Al-Qur\'aniyyah',
    rt: '01',
    rw: '01',
    kelurahan: 'Cipayung',
    kecamatan: 'Megamendung',
    city: 'Kabupaten Bogor',
    province: 'Jawa Barat',
    postal_code: '16770',
    phone: '081122334455',
    whatsapp: '081122334455',
    email: 'abdul.muin@alquraniyyah.sch.id',
    employment_status: 'Tetap',
    join_date: '2010-01-01',
    is_active: true,
    created_at: '2023-01-01T07:00:00Z'
  }
];

export const initialAssignments: EmployeeAssignment[] = [
  // Nasrullah (emp-1): 4 Assignments across Yayasan, SMP IT, SMA IT
  {
    id: 'asg-1',
    employee_id: 'emp-1',
    unit_id: 'u-1', // Yayasan
    department_id: 'd-1',
    position_id: 'p-6', // Bendahara
    task_id: 't-12', // Bendahara Umum
    sk_number: 'SK-YAS/2024/001',
    sk_date: '2024-01-02',
    start_date: '2024-01-02',
    is_primary: true,
    status: 'Aktif',
    notes: 'Pengelolaan anggaran tahunan yayasan dan pondok'
  },
  {
    id: 'asg-2',
    employee_id: 'emp-1',
    unit_id: 'u-4', // SMP IT
    position_id: 'p-4', // Guru
    task_id: 't-1', // Guru IPS
    custom_task_name: 'Guru IPS Terpadu Kelas IX',
    start_date: '2023-07-15',
    is_primary: false,
    status: 'Aktif',
    notes: 'Mengajar 12 jam pelajaran per minggu'
  },
  {
    id: 'asg-3',
    employee_id: 'emp-1',
    unit_id: 'u-5', // SMA IT
    position_id: 'p-4', // Guru
    task_id: 't-1', // Guru IPS
    custom_task_name: 'Guru Sosiologi Kelas XI',
    start_date: '2023-07-15',
    is_primary: false,
    status: 'Aktif',
    notes: 'Mengajar 8 jam pelajaran per minggu'
  },
  {
    id: 'asg-4',
    employee_id: 'emp-1',
    unit_id: 'u-1', // Yayasan
    position_id: 'p-9', // Koordinator
    task_id: 't-9', // Koordinator Rapim
    start_date: '2024-06-01',
    is_primary: false,
    status: 'Aktif',
    notes: 'Memimpin notulensi dan koordinasi rapat pimpinan bulanan'
  },

  // Ahmad Fauzi (emp-2): 4 Assignments (SMP IT Guru, SMP IT Wali Kelas, SMA IT Guru, Yayasan Koordinator)
  {
    id: 'asg-5',
    employee_id: 'emp-2',
    unit_id: 'u-4', // SMP IT
    position_id: 'p-4', // Guru
    task_id: 't-1', // Guru IPS Kelas VII
    custom_task_name: 'Guru IPS Kelas VII',
    sk_number: 'SK-SMP/2024/015',
    sk_date: '2024-07-01',
    start_date: '2024-07-01',
    is_primary: true,
    status: 'Aktif',
    notes: 'Tugas utama mendidik santri kelas VII SMP IT'
  },
  {
    id: 'asg-6',
    employee_id: 'emp-2',
    unit_id: 'u-4', // SMP IT
    position_id: 'p-5', // Wali Kelas
    task_id: 't-6', // Wali Kelas VII-A
    sk_number: 'SK-SMP/2024/016',
    sk_date: '2024-07-01',
    start_date: '2024-07-01',
    is_primary: false,
    status: 'Aktif',
    notes: 'Wali Kelas santri putra kelas VII-A'
  },
  {
    id: 'asg-7',
    employee_id: 'emp-2',
    unit_id: 'u-5', // SMA IT
    position_id: 'p-4', // Guru
    task_id: 't-1', // Guru IPS Kelas X
    custom_task_name: 'Guru IPS Kelas X',
    sk_number: 'SK-SMA/2024/008',
    sk_date: '2024-07-15',
    start_date: '2024-07-15',
    is_primary: false,
    status: 'Aktif',
    notes: 'Pengajar IPS Sejarah kelas X'
  },
  {
    id: 'asg-8',
    employee_id: 'emp-2',
    unit_id: 'u-1', // Yayasan
    position_id: 'p-9', // Koordinator
    task_id: 't-9', // Koordinator Rapim
    start_date: '2025-01-05',
    is_primary: false,
    status: 'Aktif',
    notes: 'Koordinator Rapat Pimpinan Terpadu'
  },

  // Ustadzah Fatimah Zahra (emp-3)
  {
    id: 'asg-9',
    employee_id: 'emp-3',
    unit_id: 'u-8', // HALQ
    position_id: 'p-10', // Pembina
    task_id: 't-11', // Pembina Halaqah Tahfidz
    sk_number: 'SK-HALQ/2023/004',
    start_date: '2023-01-01',
    is_primary: true,
    status: 'Aktif',
    notes: 'Pengasuh santri tahfidz 30 juz putri'
  },
  {
    id: 'asg-10',
    employee_id: 'emp-3',
    unit_id: 'u-4', // SMP IT
    position_id: 'p-4', // Guru
    task_id: 't-2', // Guru PAI & Tahfidz
    start_date: '2023-07-15',
    is_primary: false,
    status: 'Aktif'
  },

  // Siti Rahmawati (emp-4)
  {
    id: 'asg-11',
    employee_id: 'emp-4',
    unit_id: 'u-4', // SMP IT
    position_id: 'p-7', // Tata Usaha
    task_id: 't-13', // Administrasi Kurikulum
    start_date: '2024-07-01',
    is_primary: true,
    status: 'Aktif'
  },

  // M. Rizky Pratama (emp-5)
  {
    id: 'asg-12',
    employee_id: 'emp-5',
    unit_id: 'u-5', // SMA IT
    position_id: 'p-4', // Guru
    task_id: 't-3', // Guru Matematika
    start_date: '2023-08-01',
    is_primary: true,
    status: 'Aktif'
  },
  {
    id: 'asg-13',
    employee_id: 'emp-5',
    unit_id: 'u-5', // SMA IT
    position_id: 'p-10', // Pembina
    task_id: 't-10', // Pembina OSIS
    start_date: '2024-01-10',
    is_primary: false,
    status: 'Aktif'
  },

  // Hendra Gunawan (emp-6)
  {
    id: 'asg-14',
    employee_id: 'emp-6',
    unit_id: 'u-9', // Sarpras
    position_id: 'p-13', // Security
    custom_task_name: 'Komandan Regu Keamanan Malam',
    start_date: '2020-01-01',
    is_primary: true,
    status: 'Aktif'
  },

  // KH. Abdul Muin (emp-7)
  {
    id: 'asg-15',
    employee_id: 'emp-7',
    unit_id: 'u-1', // Yayasan
    position_id: 'p-1', // Pimpinan
    custom_task_name: 'Ketua Dewan Pembina Yayasan',
    start_date: '2010-01-01',
    is_primary: true,
    status: 'Aktif'
  },
  {
    id: 'asg-16',
    employee_id: 'emp-7',
    unit_id: 'u-7', // LPBQ
    position_id: 'p-1', // Pimpinan
    custom_task_name: 'Direktur Utama LPBQ',
    start_date: '2015-06-01',
    is_primary: false,
    status: 'Aktif'
  }
];

export const initialEducation: EmployeeEducation[] = [
  {
    id: 'edu-1',
    employee_id: 'emp-1',
    level: 'S2',
    institution_name: 'Universitas Ibn Khaldun Bogor',
    major: 'Magister Manajemen Pendidikan Islam',
    start_year: 2016,
    end_year: 2018,
    certificate_number: 'UIK-S2-2018-8871',
    notes: 'Lulus dengan predikat Cum Laude'
  },
  {
    id: 'edu-2',
    employee_id: 'emp-1',
    level: 'S1',
    institution_name: 'UIN Syarif Hidayatullah Jakarta',
    major: 'Pendidikan Agama Islam',
    start_year: 2000,
    end_year: 2005,
    certificate_number: 'UIN-S1-2005-1234'
  },
  {
    id: 'edu-3',
    employee_id: 'emp-2',
    level: 'S1',
    institution_name: 'Universitas Negeri Jakarta',
    major: 'Pendidikan IPS & Sejarah',
    start_year: 2006,
    end_year: 2011,
    certificate_number: 'UNJ-S1-2011-4456'
  },
  {
    id: 'edu-4',
    employee_id: 'emp-2',
    level: 'Pondok Pesantren',
    institution_name: 'Pondok Pesantren Gontor',
    major: 'KMI (Kulliyatul Muallimin Al-Islamiyyah)',
    start_year: 2000,
    end_year: 2006,
    certificate_number: 'GTR-2006-992'
  }
];

export const initialPositionHistory: EmployeePositionHistory[] = [
  {
    id: 'his-1',
    employee_id: 'emp-2',
    period_label: '2022–2024',
    unit_name: 'SMP IT Al-Qur\'aniyyah',
    position_name: 'Guru',
    task_name: 'Guru IPS Kelas VII & VIII',
    start_date: '2022-07-01',
    end_date: '2024-06-30',
    notes: 'SK Penugasan Pertama SMP IT'
  },
  {
    id: 'his-2',
    employee_id: 'emp-2',
    period_label: '2024–2025',
    unit_name: 'SMP IT Al-Qur\'aniyyah',
    position_name: 'Wali Kelas',
    task_name: 'Wali Kelas VII-A',
    start_date: '2024-07-01',
    end_date: '2025-06-30',
    notes: 'Ditunjuk sebagai wali kelas VII-A'
  },
  {
    id: 'his-3',
    employee_id: 'emp-2',
    period_label: '2025–Sekarang',
    unit_name: 'SMP IT + SMA IT Al-Qur\'aniyyah',
    position_name: 'Guru + Wali Kelas',
    task_name: 'Guru IPS SMP, Guru IPS SMA, Wali Kelas',
    start_date: '2025-07-01',
    notes: 'Penugasan mengajar ganda di SMP & SMA IT'
  },
  {
    id: 'his-4',
    employee_id: 'emp-2',
    period_label: '2026–Sekarang',
    unit_name: 'Yayasan Al-Qur\'aniyyah',
    position_name: 'Koordinator',
    task_name: 'Koordinator Rapim',
    start_date: '2026-01-05',
    notes: 'Penugasan lintas unit di Sekretariat Yayasan'
  }
];

export const initialDocuments: EmployeeDocument[] = [
  {
    id: 'doc-1',
    employee_id: 'emp-2',
    document_type: 'KTP',
    title: 'KTP Ahmad Fauzi',
    file_url: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=600&auto=format&fit=crop&q=60',
    file_name: 'KTP_Ahmad_Fauzi.pdf',
    file_size: 450200,
    mime_type: 'application/pdf',
    created_at: '2024-01-10T10:00:00Z'
  },
  {
    id: 'doc-2',
    employee_id: 'emp-2',
    document_type: 'Ijazah',
    title: 'Ijazah S1 Pendidikan IPS UNJ',
    file_url: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=600&auto=format&fit=crop&q=60',
    file_name: 'Ijazah_S1_AhmadFauzi.pdf',
    file_size: 1205400,
    mime_type: 'application/pdf',
    created_at: '2024-01-10T10:05:00Z'
  },
  {
    id: 'doc-3',
    employee_id: 'emp-2',
    document_type: 'SK Pengangkatan',
    title: 'SK Pengangkatan Pegawai Tetap YPA',
    file_url: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=600&auto=format&fit=crop&q=60',
    file_name: 'SK_Tetap_YPA_2021_045.pdf',
    file_size: 890000,
    mime_type: 'application/pdf',
    created_at: '2024-01-10T10:10:00Z'
  }
];

export const initialTraining: EmployeeTraining[] = [
  {
    id: 'trn-1',
    employee_id: 'emp-2',
    name: 'Pelatihan Kurikulum Merdeka & Pembelajaran Berdiferensiasi',
    organizer: 'Balai Guru Penggerak Jawa Barat & JSIT Indonesia',
    date: '2024-03-12',
    location: 'Hotel Salak Heritage Bogor',
    duration_hours: 32,
    certificate_number: 'BGP-JBR/KM/2024/0991',
    expiry_date: '2027-03-12'
  },
  {
    id: 'trn-2',
    employee_id: 'emp-2',
    name: 'Workshop Manajemen Wali Kelas & Konseling Santri',
    organizer: 'Direktorat Pendidikan Pondok Pesantren Kemenag RI',
    date: '2024-09-05',
    location: 'Auditorium Utama Pesantren',
    duration_hours: 16,
    certificate_number: 'KEMENAG-WK/2024/4421'
  }
];

export const initialAttendance: EmployeeAttendance[] = [
  { id: 'att-1', employee_id: 'emp-1', date: '2026-09-26', check_in: '07:15', check_out: '16:00', status: 'Hadir' },
  { id: 'att-2', employee_id: 'emp-2', date: '2026-09-26', check_in: '07:05', check_out: '15:45', status: 'Hadir', notes: 'Hadir tepat waktu, apel pagi' },
  { id: 'att-3', employee_id: 'emp-3', date: '2026-09-26', check_in: '07:20', check_out: '16:10', status: 'Hadir' },
  { id: 'att-4', employee_id: 'emp-4', date: '2026-09-26', check_in: '07:30', check_out: '16:30', status: 'Hadir' },
  { id: 'att-5', employee_id: 'emp-5', date: '2026-09-26', check_in: '07:25', check_out: '15:30', status: 'Hadir' },
  { id: 'att-6', employee_id: 'emp-6', date: '2026-09-26', check_in: '06:45', check_out: '15:00', status: 'Hadir' },
  { id: 'att-7', employee_id: 'emp-7', date: '2026-09-26', check_in: '08:00', check_out: '17:00', status: 'Hadir' }
];

export const initialLeave: EmployeeLeave[] = [
  {
    id: 'lev-1',
    employee_id: 'emp-2',
    leave_type: 'Cuti Tahunan',
    start_date: '2026-10-10',
    end_date: '2026-10-12',
    total_days: 3,
    reason: 'Keperluan keluarga di Sukabumi',
    status: 'Disetujui',
    approver_name: 'H. Nasrullah, M.M.',
    approved_at: '2026-09-25T14:00:00Z',
    approval_notes: 'Disetujui. Tugas mengajar didelegasikan.'
  },
  {
    id: 'lev-2',
    employee_id: 'emp-4',
    leave_type: 'Izin Khusus',
    start_date: '2026-09-30',
    end_date: '2026-09-30',
    total_days: 1,
    reason: 'Urusan administrasi perpanjangan paspor',
    status: 'Pending'
  }
];

export const initialNotes: EmployeeNote[] = [
  {
    id: 'not-1',
    employee_id: 'emp-2',
    note_date: '2026-08-15',
    content: 'Guru yang sangat berdedikasi dan aktif mengkoordinir kegiatan santri lintas unit SMP IT dan SMA IT. Diusulkan sebagai Koordinator Rapim Yayasan.',
    created_by_name: 'Admin Yayasan',
    is_confidential: false,
    created_at: '2026-08-15T11:00:00Z'
  }
];

export const initialAuditLogs: AuditLog[] = [
  {
    id: 'log-1',
    user_name: 'Nasrullah',
    action: 'CREATE_ASSIGNMENT',
    module: 'assignments',
    record_id: 'asg-8',
    details: { employee: 'Ahmad Fauzi', unit: 'Yayasan', position: 'Koordinator', task: 'Koordinator Rapim' },
    created_at: '2026-09-26T14:25:00Z'
  },
  {
    id: 'log-2',
    user_name: 'Admin Yayasan',
    action: 'UPDATE_EMPLOYEE',
    module: 'employees',
    record_id: 'emp-2',
    details: { employee: 'Ahmad Fauzi', field: 'email', value: 'ahmad.fauzi@alquraniyyah.sch.id' },
    created_at: '2026-09-26T11:10:00Z'
  },
  {
    id: 'log-3',
    user_name: 'Super Admin',
    action: 'LOGIN',
    module: 'auth',
    details: { method: 'Email & Password', ip: '192.168.1.105' },
    created_at: '2026-09-26T08:00:00Z'
  }
];

export const initialUsers: UserProfile[] = [
  {
    id: 'usr-1',
    email: 'admin@alquraniyyah.sch.id',
    full_name: 'Super Admin SIMKA',
    role: 'super_admin',
    is_active: true,
    created_at: '2023-01-01T00:00:00Z'
  },
  {
    id: 'usr-2',
    email: 'nasrullah@alquraniyyah.sch.id',
    full_name: 'H. Nasrullah, S.Pd.I, M.M.',
    role: 'admin_yayasan',
    unit_id: 'u-1',
    is_active: true,
    created_at: '2023-01-01T00:00:00Z'
  },
  {
    id: 'usr-3',
    email: 'hr@alquraniyyah.sch.id',
    full_name: 'Staff HR Kepegawaian',
    role: 'hr_kepegawaian',
    is_active: true,
    created_at: '2023-01-01T00:00:00Z'
  },
  {
    id: 'usr-4',
    email: 'admin.smp@alquraniyyah.sch.id',
    full_name: 'Admin SMP IT',
    role: 'admin_unit',
    unit_id: 'u-4',
    is_active: true,
    created_at: '2023-01-01T00:00:00Z'
  },
  {
    id: 'usr-5',
    email: 'viewer@alquraniyyah.sch.id',
    full_name: 'Pemeriksa Data (Viewer)',
    role: 'viewer',
    is_active: true,
    created_at: '2023-01-01T00:00:00Z'
  }
];

export const initialLetterKopSettings: LetterKopSettings = {
  header_line1: 'YAYASAN PENDIDIKAN ISLAM',
  header_line2: 'PONDOK PESANTREN AL-QUR\'ANIYYAH',
  address: 'Jl. Panti Asuhan Ceger No.6 Jurangmangu Timur Pondok Aren Tangerang Selatan 15222',
  contact: 'Telp. (021) 7319421 / 73440835 | Hp. 08158968401 / 0811916942',
  kop_image_url: '/kop_yayasan.jpg',
  kop_image_mode: 'full_page',
  kop_top_padding_cm: 5.8,
  hide_kop_on_print: true,
  print_top_margin_cm: 3.5,
  default_city: 'Tangerang Selatan',
  default_signer_name: 'Dr. KH. M. Sobron Zayyan, SQ., MA',
  default_signer_title: 'Ketua Umum'
};

import { LetterTemplate, OfficialLetter, LetterKopSettings } from '../types';

export const initialLetterTemplates: LetterTemplate[] = [
  {
    id: 'tpl-1',
    code: 'SK-GT',
    title: 'SK Pengangkatan Guru Tetap / Kontrak (Format Resmi YASPIQ)',
    type: 'sk_pengangkatan',
    subject_template: 'PENGANGKATAN SDR. {nama} {nirg_nirk} MENJADI GURU TETAP (GT) YAYASAN PENDIDIKAN ISLAM PONDOK PESANTREN AL-QUR\'ANIYYAH TAHUN PEMBELAJARAN 2024-2025',
    header_title: 'KEPUTUSAN KETUA UMUM YAYASAN PENDIDIKAN ISLAM PONDOK PESANTREN AL-QUR\'ANIYYAH',
    considering_text: [
      'Bahwa untuk meningkatkan mutu pendidikan dan tercapainya tujuan pembelajaran di Yayasan Pendidikan Islam Pondok Pesantren Al-Qur\'aniyyah, maka dipandang perlu untuk mengangkat Guru yang amanah, professional, loyal, berdedikasi dan berkualitas.',
      'Bahwa untuk melaksanakan hal tersebut dengan baik, perlu ditetapkan dengan Keputusan Ketua Umum Yayasan Pendidikan Islam Pondok Pesantren Al-Qur\'aniyyah.'
    ],
    in_view_text: [
      'Undang-Undang Republik Indonesia Nomor 28 Tahun 2004 Tentang Perubahan atas Undang-Undang Nomor 16 TAHUN 2001 Tentang Yayasan.',
      'Undang-Undang Republik Indonesia Nomor 20 Tahun 2003 Tentang Sistem Pendidikan Nasional.',
      'Undang-Undang Republik Indonesia Nomor 13 Tahun 2003 Tentang Ketenagakerjaan.',
      'Akta Pendirian YASPIQ Nomor 05 Tanggal 06 November 2001 Notaris Ruwin Diara, SH.',
      'Akta Perubahan YASPIQ Nomor 19 Tanggal 27 November 2008 Notaris Syaifuddin Arief, SH, MH.',
      'Anggaran Dasar (AD) YASPIQ BAB III Pasal 4 Tentang Maksud dan Tujuan Yayasan.',
      'Anggaran Rumah Tangga (ART) YASPIQ BAB II Tentang fungsi, Tugas, dan Wewenang.',
      'Peraturan YASPIQ Nomor 3 Tahun 2008 Tentang Kepegawaian YASPIQ.',
      'Peraturan YASPIQ Nomor 4 tahun 2008 Tentang Tata Tertib Guru/Asatidzah YASPIQ.',
      'Statuta Sekolah Bab II Pasal 12 tentang kedudukan, tugas, dan wewenang unsur organisasi sekolah.'
    ],
    observing_text: [
      'Hasil penilaian kinerja oleh atasan langsung yang bersangkutan, direkomendasikan untuk diperpanjang sebagai Guru Tetap (GT) Yayasan.'
    ],
    deciding_text: {
      'Pertama': 'Mengangkat Sdr. :\n1. Nama : {nama}\n2. Tempat/Tgl. Lahir : {tempat_tgl_lahir}\n3. Pendidikan : {pendidikan}\n4. Ditugaskan dalam jabatan : {jabatan}\n5. Pada Unit : {unit}',
      'Kedua': 'Keputusan ini berlaku terhitung mulai tanggal {tmt_mulai} sampai dengan tanggal {tmt_selesai};',
      'Ketiga': 'Kepadanya diberikan imbalan/ jasa sesuai dengan kemampuan dan peraturan Yayasan;',
      'Keempat': 'Pengangkatan sebagai Guru Tetap (GT) Yayasan Pendidikan Islam Pondok Pesantren AL-Qur\'aniyyah berdasarkan Penilaian Kinerja, Kebutuhan dan Kemampuan Yayasan;',
      'Kelima': 'Uraian tugas, tanggung jawab dan wewenang sesuai dengan uraian tugas, tanggung jawab dan wewenang pada struktur organisasi Unit Kelembagaan Yayasan dan peraturan / ketentuan lainnya yang berlaku;',
      'Keenam': 'Jika kemudian hari terdapat kekeliruan dalam penetapan ini, maka akan diadakan perubahan dan pembetulan seperlunya;',
      'Ketujuh': 'Keputusan ini disampaikan kepada yang bersangkutan untuk dimaklumi dan diindahkan.'
    },
    footer_city: 'Tangerang Selatan',
    signer_name: 'Dr. KH. M. Sobron Zayyan, SQ., MA',
    signer_title: 'Ketua Umum',
    is_default: true
  },
  {
    id: 'tpl-2',
    code: 'SP-1',
    title: 'Surat Peringatan Pertama (SP-1)',
    type: 'sp_peringatan',
    subject_template: 'SURAT PERINGATAN PERTAMA (SP-1) UNTUK SDR. {nama}',
    header_title: 'SURAT PERINGATAN PERTAMA (SP-1) YAYASAN PENDIDIKAN ISLAM PONDOK PESANTREN AL-QUR\'ANIYYAH',
    considering_text: [
      'Bahwa Kedisiplinan dan kepatuhan terhadap peraturan yayasan adalah kewajiban seluruh guru dan karyawan.',
      'Bahwa saudara {nama} telah melakukan tindakan/kelalaian yang tidak sesuai dengan tata tertib kepegawaian.'
    ],
    in_view_text: [
      'Peraturan Kepegawaian YASPIQ Nomor 3 Tahun 2008.',
      'Peraturan YASPIQ Nomor 4 tahun 2008 Tentang Tata Tertib Guru/Asatidzah & Karyawan YASPIQ.'
    ],
    observing_text: [
      'Hasil evaluasi kehadiran dan Laporan Kedisiplinan dari Atasan Langsung / Kepala Unit.'
    ],
    deciding_text: {
      'Pertama': 'Memberikan Surat Peringatan Pertama (SP-1) kepada Sdr/Sdri {nama} (Jabatan: {jabatan}, Unit: {unit});',
      'Kedua': 'Meminta yang bersangkutan untuk segera melakukan perbaikan kinerja dan kedisiplinan kerja secara sungguh-sungguh;',
      'Ketiga': 'Jika dalam kurun waktu 3 (tiga) bulan ke depan tidak ada perubahan, maka Yayasan akan menerbitkan Surat Peringatan berikutnya (SP-2) atau tindakan tegas sesuai aturan kepegawaian.'
    },
    footer_city: 'Tangerang Selatan',
    signer_name: 'Dr. KH. M. Sobron Zayyan, SQ., MA',
    signer_title: 'Ketua Umum',
    is_default: true
  }
];

export const initialOfficialLetters: OfficialLetter[] = [
  {
    id: 'ltr-1',
    letter_number: '047 /SK/YASPIQ/VII/2024',
    template_id: 'tpl-1',
    type: 'sk_pengangkatan',
    title: 'SK Pengangkatan Guru Tetap Sdr. Irsyam Maulana, SE',
    employee_id: 'emp-2',
    employee_name: 'Irsyam Maulana, SE',
    employee_email: 'irsyam.maulana@alquraniyyah.sch.id',
    employee_nik: '3201012345670001',
    employee_nirg_nirk: 'NRIG : E-0047-1415',
    employee_position: 'Guru',
    employee_unit: 'SMP IT AL-Qur\'aniyyah',
    employee_gender: 'Laki-laki',
    employee_birth_info: 'Jakarta, 30-12-1988',
    employee_education_level: 'S1',
    subject: 'PENGANGKATAN SDR. IRSYAM MAULANA, SE NRIG : E-0047-1415 MENJADI GURU TETAP (GT) YAYASAN PENDIDIKAN ISLAM PONDOK PESANTREN AL-QUR\'ANIYYAH TAHUN PEMBELAJARAN 2024-2025',
    header_title: 'KEPUTUSAN KETUA UMUM YAYASAN PENDIDIKAN ISLAM PONDOK PESANTREN AL-QUR\'ANIYYAH',
    considering: [
      'Bahwa untuk meningkatkan mutu pendidikan dan tercapainya tujuan pembelajaran di Yayasan Pendidikan Islam Pondok Pesantren Al-Qur\'aniyyah, maka dipandang perlu untuk mengangkat Guru yang amanah, professional, loyal, berdedikasi dan berkualitas.',
      'Bahwa untuk melaksanakan hal tersebut dengan baik, perlu ditetapkan dengan Keputusan Ketua Umum Yayasan Pendidikan Islam Pondok Pesantren Al-Qur\'aniyyah.'
    ],
    in_view: [
      'Undang-Undang Republik Indonesia Nomor 28 Tahun 2004 Tentang Perubahan atas Undang-Undang Nomor 16 TAHUN 2001 Tentang Yayasan.',
      'Undang-Undang Republik Indonesia Nomor 20 Tahun 2003 Tentang Sistem Pendidikan Nasional.',
      'Undang-Undang Republik Indonesia Nomor 13 Tahun 2003 Tentang Ketenagakerjaan.',
      'Akta Pendirian YASPIQ Nomor 05 Tanggal 06 November 2001 Notaris Ruwin Diara, SH.',
      'Akta Perubahan YASPIQ Nomor 19 Tanggal 27 November 2008 Notaris Syaifuddin Arief, SH, MH.',
      'Anggaran Dasar (AD) YASPIQ BAB III Pasal 4 Tentang Maksud dan Tujuan Yayasan.',
      'Anggaran Rumah Tangga (ART) YASPIQ BAB II Tentang fungsi, Tugas, dan Wewenang.',
      'Peraturan YASPIQ Nomor 3 Tahun 2008 Tentang Kepegawaian YASPIQ.',
      'Peraturan YASPIQ Nomor 4 tahun 2008 Tentang Tata Tertib Guru/Asatidzah YASPIQ.',
      'Statuta Sekolah Bab II Pasal 12 tentang kedudukan, tugas, dan wewenang unsur organisasi sekolah.'
    ],
    observing: [
      'Hasil penilaian kinerja oleh atasan langsung yang bersangkutan, direkomendasikan untuk diperpanjang sebagai Guru Tetap (GT) Yayasan.'
    ],
    deciding: {
      'Pertama': 'Mengangkat Sdr. :\n1. Nama : Irsyam Maulana, SE\n2. Tempat/Tgl. Lahir : Jakarta, 30-12-1988\n3. Pendidikan : S1\n4. Ditugaskan dalam jabatan : Guru\n5. Pada Unit : SMP IT AL-Qur\'aniyyah',
      'Kedua': 'Keputusan ini berlaku terhitung mulai tanggal ditetapkan surat ini sampai dengan tanggal 30 Juni 2025;',
      'Ketiga': 'Kepadanya diberikan imbalan/ jasa sesuai dengan kemampuan dan peraturan Yayasan;',
      'Keempat': 'Pengangkatan sebagai Guru Tetap (GT) Yayasan Pendidikan Islam Pondok Pesantren AL-Qur\'aniyyah berdasarkan Penilaian Kinerja, Kebutuhan dan Kemampuan Yayasan;',
      'Kelima': 'Uraian tugas, tanggung jawab dan wewenang sesuai dengan uraian tugas, tanggung jawab dan wewenang pada struktur organisasi Unit Kelembagaan Yayasan dan peraturan / ketentuan lainnya yang berlaku;',
      'Keenam': 'Jika kemudian hari terdapat kekeliruan dalam penetapan ini, maka akan diadakan perubahan dan pembetulan seperlunya;',
      'Ketujuh': 'Keputusan ini disampaikan kepada yang bersangkutan untuk dimaklumi dan diindahkan.'
    },
    effective_date: '2024-07-11',
    end_date: '2025-06-30',
    issued_date: '2024-07-11',
    issued_city: 'Tangerang Selatan',
    signer_name: 'Dr. KH. M. Sobron Zayyan, SQ., MA',
    signer_title: 'Ketua Umum',
    status: 'diterbitkan',
    created_at: '2024-07-11T08:00:00Z'
  },
  {
    id: 'ltr-2',
    letter_number: '052 /SK/YASPIQ/VIII/2024',
    template_id: 'tpl-1',
    type: 'sk_pengangkatan',
    title: 'SK Pengangkatan Guru Tetap Sdr. Ahmad Fauzi, S.Pd.',
    employee_id: 'emp-2',
    employee_name: 'Ahmad Fauzi, S.Pd.',
    employee_email: 'ahmad.fauzi@alquraniyyah.sch.id',
    employee_nik: '3201012345670001',
    employee_nirg_nirk: 'NRIG : G-SDIT-2019-002',
    employee_position: 'Guru PAI & Tahfidz',
    employee_unit: 'SD IT Al-Qur\'aniyyah',
    employee_gender: 'Laki-laki',
    employee_birth_info: 'Sukabumi, 15-09-1988',
    employee_education_level: 'S1',
    subject: 'PENGANGKATAN SDR. AHMAD FAUZI, S.PD. NRIG : G-SDIT-2019-002 MENJADI GURU TETAP (GT) SD IT AL-QUR\'ANIYYAH TAHUN AJARAN 2024-2025',
    header_title: 'KEPUTUSAN KETUA UMUM YAYASAN PENDIDIKAN ISLAM PONDOK PESANTREN AL-QUR\'ANIYYAH',
    considering: [
      'Bahwa dalam rangka menjaga kelancaran kegiatan belajar mengajar dan pembinaan hafalan Al-Qur\'an santri/siswa SD IT Al-Qur\'aniyyah, dipandang perlu mengangkat Guru PAI & Tahfidz yang kompeten dan berakhlakul karimah.',
      'Bahwa saudara Ahmad Fauzi, S.Pd. telah memenuhi standar kualifikasi pendidik dan pengasuh santri di lingkungan Yayasan.'
    ],
    in_view: [
      'Undang-Undang RI Nomor 20 Tahun 2003 Tentang Sistem Pendidikan Nasional.',
      'Peraturan YASPIQ Nomor 3 Tahun 2008 Tentang Kepegawaian Yayasan.'
    ],
    observing: [
      'Rekomendasi Kepala Sekolah SD IT Al-Qur\'aniyyah dan Direktur Pendidikan Pesantren.'
    ],
    deciding: {
      'Pertama': 'Mengangkat Sdr. :\n1. Nama : Ahmad Fauzi, S.Pd.\n2. Tempat/Tgl. Lahir : Sukabumi, 15-09-1988\n3. Pendidikan : S1 Pendidikan Agama Islam\n4. Ditugaskan dalam jabatan : Guru PAI & Pembina Tahfidz\n5. Pada Unit : SD IT Al-Qur\'aniyyah',
      'Kedua': 'Keputusan ini berlaku TMT 01 Agustus 2024 sampai dengan 31 Juli 2025;',
      'Ketiga': 'Kepada yang bersangkutan diberikan hak gaji, honorarium, dan tunjangan sesuai ketentuan Yayasan.'
    },
    effective_date: '2024-08-01',
    end_date: '2025-07-31',
    issued_date: '2024-08-01',
    issued_city: 'Tangerang Selatan',
    signer_name: 'Dr. KH. M. Sobron Zayyan, SQ., MA',
    signer_title: 'Ketua Umum',
    status: 'diterbitkan',
    created_at: '2024-08-01T09:00:00Z'
  },
  {
    id: 'ltr-3',
    letter_number: '012 /SP-1/YASPIQ/IX/2024',
    template_id: 'tpl-2',
    type: 'sp_peringatan',
    title: 'Surat Peringatan Pertama (SP-1) Sdr. M. Rizky Pratama, S.Si.',
    employee_id: 'emp-5',
    employee_name: 'M. Rizky Pratama, S.Si.',
    employee_email: 'rizky.pratama@alquraniyyah.sch.id',
    employee_nik: '3201015678900001',
    employee_nirg_nirk: 'NIRK : K-YAS-2023-012',
    employee_position: 'Staf Laboratorium & Sarpras',
    employee_unit: 'Unit Sarana & Logistik',
    employee_gender: 'Laki-laki',
    employee_birth_info: 'Depok, 12-06-1993',
    employee_education_level: 'S1',
    subject: 'SURAT PERINGATAN PERTAMA (SP-1) ATAS KELALAIAN KEDISIPLINAN DAN REKAPITULASI PRESENSI KERJA',
    header_title: 'SURAT PERINGATAN PERTAMA (SP-1) YAYASAN PENDIDIKAN ISLAM PONDOK PESANTREN AL-QUR\'ANIYYAH',
    considering: [
      'Bahwa seluruh karyawan dan staf kepegawaian wajib mematuhi jam kerja dan tata tertib kepegawaian Yayasan.',
      'Bahwa Sdr. M. Rizky Pratama, S.Si. telah terbukti melakukan keterlambatan dan ketidakhadiran tanpa keterangan sah selama 3 hari berturut-turut pada bulan Agustus 2024.'
    ],
    in_view: [
      'Peraturan YASPIQ Nomor 3 Tahun 2008 Tentang Kepegawaian.',
      'Peraturan YASPIQ Nomor 4 Tahun 2008 Tentang Tata Tertib Kepegawaian & Kedisiplinan Kerja.'
    ],
    observing: [
      'Laporan Absensi Presensi Harian dari Kepala Unit Sarana & Logistik.'
    ],
    deciding: {
      'Pertama': 'Menerbitkan Surat Peringatan Pertama (SP-1) kepada Sdr. M. Rizky Pratama, S.Si. (Staf Laboratorium & Sarpras);',
      'Kedua': 'Meminta yang bersangkutan untuk segera memperbaiki disiplin kehadiran dan menjalankan tugas dengan penuh tanggung jawab;',
      'Ketiga': 'Masa berlaku SP-1 ini adalah selama 3 (tiga) bulan sejak tanggal diterbitkan.'
    },
    effective_date: '2024-09-01',
    issued_date: '2024-09-01',
    issued_city: 'Tangerang Selatan',
    signer_name: 'Dr. KH. M. Sobron Zayyan, SQ., MA',
    signer_title: 'Ketua Umum',
    status: 'diterbitkan',
    created_at: '2024-09-01T10:00:00Z'
  },
  {
    id: 'ltr-4',
    letter_number: '088 /SKP/YASPIQ/VII/2024',
    template_id: 'tpl-1',
    type: 'sk_penugasan',
    title: 'SK Penugasan Multi-Unit Ustadzah Fatimah Zahra, S.Ag., M.Pd.',
    employee_id: 'emp-3',
    employee_name: 'Ustadzah Fatimah Zahra, S.Ag., M.Pd.',
    employee_email: 'fatimah.zahra@alquraniyyah.sch.id',
    employee_nik: '3201013456780001',
    employee_nirg_nirk: 'NRIG : G-SMA-2018-005',
    employee_position: 'Guru PAI & Pembina Halaqah Tahfidz',
    employee_unit: 'SMA IT & LPBQ Al-Qur\'aniyyah',
    employee_gender: 'Perempuan',
    employee_birth_info: 'Bandung, 20-03-1990',
    employee_education_level: 'S2',
    subject: 'PENUGASAN MULTI-UNIT SEBAGAI GURU PAI SMA IT DAN PEMBINA HALAQAH TAHFIDZ LPBQ PESANTREN AL-QUR\'ANIYYAH TAHUN 2024/2025',
    header_title: 'KEPUTUSAN KETUA UMUM YAYASAN PENDIDIKAN ISLAM PONDOK PESANTREN AL-QUR\'ANIYYAH',
    considering: [
      'Bahwa dalam rangka mengoptimalkan kompetensi keilmuan Al-Qur\'an dan pengasuhan santri putri, dipandang perlu memberikan amanah penugasan di lebih dari satu unit lembaga.',
      'Bahwa Ustadzah Fatimah Zahra, S.Ag., M.Pd. memiliki integritas dan dedikasi tinggi dalam bidang Al-Qur\'an dan Pendidikan Islam.'
    ],
    in_view: [
      'Statuta Pondok Pesantren Al-Qur\'aniyyah Bab II Pasal 12.',
      'Peraturan Kepegawaian YASPIQ Mengenai Multi-Penugasan Lintas Unit.'
    ],
    observing: [
      'Rekomendasi Rapat Pimpinan (Rapim) Yayasan Pendidikan Islam Pondok Pesantren Al-Qur\'aniyyah.'
    ],
    deciding: {
      'Pertama': 'Menugaskan Ustadzah Fatimah Zahra, S.Ag., M.Pd. dalam amanah :\n1. Tugas Utama : Guru PAI di SMA IT Al-Qur\'aniyyah\n2. Tugas Tambahan : Pembina Halaqah Tahfidz di LPBQ Pesantren',
      'Kedua': 'SK Penugasan ini berlaku mulai TMT 15 Juli 2024 s/d 14 Juli 2025;',
      'Ketiga': 'Kepadanya diberikan tunjangan jabatan & penugasan sesuai ketentuan yang berlaku.'
    },
    effective_date: '2024-07-15',
    end_date: '2025-07-14',
    issued_date: '2024-07-15',
    issued_city: 'Tangerang Selatan',
    signer_name: 'Dr. KH. M. Sobron Zayyan, SQ., MA',
    signer_title: 'Ketua Umum',
    status: 'diterbitkan',
    created_at: '2024-07-15T08:30:00Z'
  },
  {
    id: 'ltr-5',
    letter_number: '015 /SKET/YASPIQ/I/2025',
    template_id: 'tpl-1',
    type: 'surat_keterangan',
    title: 'Surat Keterangan Kerja Sdri. Siti Rahmawati, S.Kom.',
    employee_id: 'emp-4',
    employee_name: 'Siti Rahmawati, S.Kom.',
    employee_email: 'rahma.tu@alquraniyyah.sch.id',
    employee_nik: '3201014567890001',
    employee_nirg_nirk: 'NIRK : K-TU-2024-004',
    employee_position: 'Staf Tata Usaha & Kesiswaan',
    employee_unit: 'SMP IT Al-Qur\'aniyyah',
    employee_gender: 'Perempuan',
    employee_birth_info: 'Jakarta, 28-11-1995',
    employee_education_level: 'S1',
    subject: 'SURAT KETERANGAN PENGALAMAN KERJA / BEKERJA AKTIF SEBAGAI STAF TATA USAHA SMP IT AL-QUR\'ANIYYAH',
    header_title: 'SURAT KETERANGAN KERJA YAYASAN PENDIDIKAN ISLAM PONDOK PESANTREN AL-QUR\'ANIYYAH',
    considering: [
      'Bahwa yang bersangkutan adalah benar karyawan aktif di lingkungan Yayasan Pendidikan Islam Pondok Pesantren Al-Qur\'aniyyah.',
      'Bahwa surat keterangan ini diterbitkan atas permintaan yang bersangkutan untuk keperluan pengurusan administrasi kepegawaian / pendidikan.'
    ],
    in_view: [
      'Peraturan YASPIQ Nomor 3 Tahun 2008 Tentang Kepegawaian.'
    ],
    observing: [
      'Data Induk Kepegawaian SIMKA Al-Qur\'aniyyah.'
    ],
    deciding: {
      'Pertama': 'Menerangkan bahwa Sdri. Siti Rahmawati, S.Kom. adalah benar Karyawan Aktif yang bertugas sebagai Staf Tata Usaha & Kesiswaan di SMP IT Al-Qur\'aniyyah sejak 01 Juli 2024 sampai dengan saat ini;',
      'Kedua': 'Selama bertugas yang bersangkutan menunjukkan loyalitas, integritas, dan dedikasi yang sangat baik;',
      'Ketiga': 'Demikian Surat Keterangan Kerja ini dibuat untuk dapat dipergunakan sebagaimana mestinya.'
    },
    effective_date: '2025-01-10',
    issued_date: '2025-01-10',
    issued_city: 'Tangerang Selatan',
    signer_name: 'Dr. KH. M. Sobron Zayyan, SQ., MA',
    signer_title: 'Ketua Umum',
    status: 'diterbitkan',
    created_at: '2025-01-10T08:30:00Z'
  }
];

import { LetterKopTemplate, LetterDeliveryLog } from '../types';

export const initialKopTemplates: LetterKopTemplate[] = [
  {
    id: 'kop-tpl-1',
    name: 'KOP Resmi Yayasan Al-Qur\'aniyyah (Background A4)',
    unit_id: 'u-1',
    header_line1: 'YAYASAN PENDIDIKAN ISLAM',
    header_line2: 'PONDOK PESANTREN AL-QUR\'ANIYYAH',
    address: 'Jl. Panti Asuhan Ceger No.6 Jurangmangu Timur Pondok Aren Tangerang Selatan 15222',
    contact: 'Telp. (021) 7319421 / 73440835 | Hp. 08158968401 / 0811916942',
    kop_image_url: '/kop_yayasan.jpg',
    kop_image_mode: 'full_page',
    kop_top_padding_cm: 5.8,
    print_top_margin_cm: 3.5,
    is_default: true
  },
  {
    id: 'kop-tpl-2',
    name: 'KOP SMP IT Al-Qur\'aniyyah',
    unit_id: 'u-4',
    header_line1: 'YAYASAN PENDIDIKAN ISLAM AL-QUR\'ANIYYAH',
    header_line2: 'SMP ISLAM TERPADU AL-QUR\'ANIYYAH',
    address: 'Jl. Pesantren Al-Qur\'aniyyah No. 12, Cipayung, Tangerang Selatan',
    contact: 'Telp: (021) 7458001 | Email: smpit@alquraniyyah.sch.id',
    kop_image_url: '',
    kop_image_mode: 'full_page',
    kop_top_padding_cm: 4.2,
    print_top_margin_cm: 3.5,
    is_default: false
  },
  {
    id: 'kop-tpl-3',
    name: 'KOP SMA IT Al-Qur\'aniyyah',
    unit_id: 'u-5',
    header_line1: 'YAYASAN PENDIDIKAN ISLAM AL-QUR\'ANIYYAH',
    header_line2: 'SMA ISLAM TERPADU AL-QUR\'ANIYYAH',
    address: 'Jl. Pesantren Al-Qur\'aniyyah No. 12, Cipayung, Tangerang Selatan',
    contact: 'Telp: (021) 7458002 | Email: smait@alquraniyyah.sch.id',
    kop_image_url: '',
    kop_image_mode: 'full_page',
    kop_top_padding_cm: 4.2,
    print_top_margin_cm: 3.5,
    is_default: false
  }
];

export const initialDeliveryLogs: LetterDeliveryLog[] = [
  {
    id: 'log-del-1',
    letter_id: 'ltr-1',
    letter_number: '047 /SK/YASPIQ/VII/2024',
    letter_title: 'SK Pengangkatan Guru Tetap Sdr. Irsyam Maulana, SE',
    employee_id: 'emp-2',
    employee_name: 'Irsyam Maulana, SE',
    channel: 'email',
    recipient_address: 'irsyam.maulana@alquraniyyah.sch.id',
    status: 'sent',
    sent_at: '2026-09-26T14:30:00Z'
  },
  {
    id: 'log-del-2',
    letter_id: 'ltr-2',
    letter_number: '052 /SK/YASPIQ/VIII/2024',
    letter_title: 'SK Pengangkatan Guru Tetap Sdr. Ahmad Fauzi, S.Pd.',
    employee_id: 'emp-2',
    employee_name: 'Ahmad Fauzi, S.Pd.',
    channel: 'whatsapp',
    recipient_address: '081234567890',
    status: 'sent',
    sent_at: '2026-09-26T15:10:00Z'
  }
];


