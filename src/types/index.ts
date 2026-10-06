// SIMKA Al-Qur'aniyyah - TypeScript Type Definitions

export type UserRole = 'super_admin' | 'admin_yayasan' | 'admin_unit' | 'hr_kepegawaian' | 'viewer';

export type EmploymentStatus = 'Tetap' | 'Kontrak' | 'Honorer' | 'Magang' | 'Freelance' | 'Lainnya';

export type AssignmentStatus = 'Aktif' | 'Selesai' | 'Nonaktif';

export type AttendanceStatus = 'Hadir' | 'Izin' | 'Sakit' | 'Cuti' | 'Dinas' | 'Alpa';

export type LeaveStatus = 'Pending' | 'Disetujui' | 'Ditolak';

export type PositionCategory = 'Pimpinan' | 'Pendidik' | 'Tenaga Kependidikan' | 'Staff' | 'Operasional';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  unit_id?: string | null;
  avatar_url?: string | null;
  is_active: boolean;
  last_login?: string | null;
  created_at: string;
}

export interface Unit {
  id: string;
  code: string;
  name: string;
  description?: string;
  is_active: boolean;
  sort_order: number;
  created_at?: string;
}

export interface Department {
  id: string;
  unit_id: string;
  code: string;
  name: string;
  description?: string;
  is_active: boolean;
  unit_name?: string;
  created_at?: string;
}

export interface Position {
  id: string;
  code: string;
  name: string;
  category: PositionCategory;
  description?: string;
  is_active: boolean;
  sort_order: number;
  created_at?: string;
}

export interface Task {
  id: string;
  position_id?: string | null;
  code?: string;
  name: string;
  description?: string;
  is_active: boolean;
  position_name?: string;
  created_at?: string;
}

export interface FormalEducationRecord {
  level: 'SD' | 'SMP' | 'SMA/SMK' | 'S1' | 'S2' | 'S3' | string;
  year?: string;
  institution?: string;
}

export interface NonformalEducationRecord {
  name: string;
  institution?: string;
  year?: string;
  notes?: string;
}

export interface Employee {
  id: string;
  employee_number: string; // e.g. YPA-0001
  nik: string;             // 16 digits
  nip?: string;
  nirg?: string;           // Nomor Induk Registrasi Guru
  nirk?: string;           // Nomor Induk Registrasi Karyawan
  no_kk?: string;
  
  // Personal
  full_name: string;
  nickname?: string;
  photo_url?: string;
  gender: 'Laki-laki' | 'Perempuan';
  birth_place?: string;
  birth_date?: string;
  religion: string;
  marital_status: string;
  last_education?: string; // Pendidikan Terakhir (SD, SMP, SMA, S1, S2, S3, Pesantren)
  
  // Address
  address?: string;
  rt?: string;
  rw?: string;
  kelurahan?: string;
  kecamatan?: string;
  city?: string;
  province?: string;
  postal_code?: string;
  
  // Contact
  phone?: string;
  whatsapp?: string;
  email?: string;
  
  // Employment
  employment_status: EmploymentStatus;
  join_date: string;
  entry_year?: string;    // Tahun Masuk
  exit_year?: string;     // Tahun Keluar
  appointment_date?: string;
  appointment_sk_number?: string;
  appointment_sk_date?: string;
  contract_end_date?: string;
  is_active: boolean;
  inactive_reason?: string;
  inactive_date?: string;

  // Bank & Finance
  bank_name?: string;
  bank_account_number?: string;

  // Education breakdown
  formal_education?: FormalEducationRecord[];
  nonformal_education?: NonformalEducationRecord[];
  
  created_at?: string;
  updated_at?: string;

  // Joined / computed fields for lists
  assignments?: EmployeeAssignment[];
  primary_assignment?: EmployeeAssignment;
  assignment_count?: number;
  units_list?: string[];
  positions_list?: string[];
  data_completeness_pct?: number;
}

export interface EmployeeAssignment {
  id: string;
  employee_id: string;
  unit_id: string;
  department_id?: string | null;
  position_id: string;
  task_id?: string | null;
  custom_task_name?: string;
  task_description?: string;
  sk_number?: string;
  sk_date?: string;
  start_date: string;
  end_date?: string | null;
  is_primary: boolean;
  status: AssignmentStatus;
  notes?: string;
  created_at?: string;
  updated_at?: string;

  // Join data
  employee_name?: string;
  employee_number?: string;
  unit_name?: string;
  department_name?: string;
  position_name?: string;
  task_name?: string;
}

export interface EmployeeEducation {
  id: string;
  employee_id: string;
  level: string; // SD, SMP, SMA, D3, S1, S2, S3, Pondok Pesantren
  institution_name: string;
  major?: string;
  start_year?: number;
  end_year?: number;
  certificate_number?: string;
  notes?: string;
  created_at?: string;

  // Joined employee info
  employee_name?: string;
  employee_number?: string;
  employee_nik?: string;
  units_list?: string[];
  employment_status?: string;
}

export interface EmployeePositionHistory {
  id: string;
  employee_id: string;
  period_label: string; // e.g. "2022-2024"
  unit_name: string;
  position_name: string;
  task_name?: string;
  start_date?: string;
  end_date?: string;
  sk_number?: string;
  notes?: string;
  created_at?: string;
}

export interface EmployeeDocument {
  id: string;
  employee_id: string;
  document_type: string; // KTP, KK, Ijazah, SK Pengangkatan, SK Penugasan, Kontrak Kerja, Sertifikat, NPWP, BPJS, dll.
  title: string;
  file_url: string;
  file_name: string;
  file_size?: number;
  mime_type?: string;
  uploaded_by?: string;
  created_at?: string;

  // Joined employee info
  employee_name?: string;
  employee_number?: string;
  employee_nik?: string;
  units_list?: string[];
}

export interface DocumentTypeDefinition {
  id: string;
  name: string; // e.g. "KTP", "Kartu Keluarga", "Ijazah", "SK Pengangkatan", "Sertifikat Pendidik", "NPWP", "BPJS", etc.
  code: string;
  description?: string;
  is_mandatory: boolean; // if true, tracked in matrix and completeness
  is_active: boolean;
  sort_order: number;
}

export interface EmployeeTraining {
  id: string;
  employee_id: string;
  name: string;
  organizer: string;
  date: string;
  location?: string;
  duration_hours?: number;
  certificate_number?: string;
  expiry_date?: string;
  certificate_url?: string;
  created_at?: string;
}

export interface EmployeeAttendance {
  id: string;
  employee_id: string;
  date: string;
  check_in?: string;
  check_out?: string;
  status: AttendanceStatus;
  notes?: string;
  employee_name?: string;
  employee_number?: string;
  created_at?: string;
}

export interface EmployeeLeave {
  id: string;
  employee_id: string;
  leave_type: string;
  start_date: string;
  end_date: string;
  total_days: number;
  reason: string;
  attachment_url?: string;
  status: LeaveStatus;
  approver_id?: string;
  approver_name?: string;
  approved_at?: string;
  approval_notes?: string;
  employee_name?: string;
  employee_number?: string;
  created_at?: string;
  updated_at?: string;
}

export interface EmployeeNote {
  id: string;
  employee_id: string;
  note_date: string;
  content: string;
  created_by?: string;
  created_by_name?: string;
  is_confidential: boolean;
  created_at?: string;
}

export interface AuditLog {
  id: string;
  user_id?: string;
  user_name: string;
  action: string;
  module: string;
  record_id?: string;
  details?: Record<string, any>;
  ip_address?: string;
  created_at: string;
}

export interface DashboardStats {
  total_employees: number;
  active_employees: number;
  inactive_employees: number;
  total_teachers: number;
  total_staff: number;
  permanent_employees: number;
  contract_employees: number;
  honorary_employees: number;
  total_active_assignments: number;
  multi_assignment_employees: number;
  multi_unit_employees: number;
  assignments_per_unit: { unit_id: string; unit_name: string; count: number }[];
  assignments_per_position: { position_id: string; position_name: string; count: number }[];
  gender_distribution: { male: number; female: number };
  employment_status_distribution: { status: string; count: number }[];
  education_distribution: { level: string; count: number }[];
  incomplete_data_employees: { id: string; name: string; number: string; percentage: number; missing: string[] }[];
  expiring_contracts: { id: string; employee_id: string; name: string; number: string; end_date: string; days_left: number }[];
}

export interface ExcelImportRow {
  nirg?: string;
  nirk?: string;
  nama: string;
  nik: string;
  nip?: string;
  no_kk?: string;
  nickname?: string;
  jenis_kelamin?: string;
  tempat_lahir?: string;
  tanggal_lahir?: string;
  agama?: string;
  status_pernikahan?: string;
  alamat?: string;
  rt?: string;
  rw?: string;
  kelurahan?: string;
  kecamatan?: string;
  kota?: string;
  provinsi?: string;
  kode_pos?: string;
  no_hp?: string;
  whatsapp?: string;
  email?: string;
  status_kepegawaian?: string;
  tahun_masuk?: string;
  tahun_keluar?: string;
  tanggal_masuk?: string;
  tanggal_pengangkatan?: string;
  sk_pengangkatan?: string;
  tanggal_sk_pengangkatan?: string;
  tanggal_akhir_kontrak?: string;
  nama_bank?: string;
  nomor_rekening?: string;
  unit: string;
  divisi?: string;
  jabatan: string;
  tugas?: string;
  deskripsi_tugas?: string;
  sk_penugasan?: string;
  tanggal_sk_penugasan?: string;
  tanggal_mulai_penugasan?: string;
  tanggal_selesai_penugasan?: string;
  is_primary?: boolean;
  status_penugasan?: string;
  pendidikan_terakhir?: string;
  sd_tahun?: string;
  sd_instansi?: string;
  smp_tahun?: string;
  smp_instansi?: string;
  sma_tahun?: string;
  sma_instansi?: string;
  s1_tahun?: string;
  s1_instansi?: string;
  s2_tahun?: string;
  s2_instansi?: string;
  s3_tahun?: string;
  s3_instansi?: string;
  nonformal_nama?: string;
  nonformal_instansi?: string;
  nonformal_tahun?: string;
  nonformal_keterangan?: string;
  institusi?: string;
  jurusan?: string;
  tahun_lulus?: number;
  nomor_ijazah?: string;
}

export interface ExcelImportPreview {
  raw_rows_count: number;
  grouped_employees_count: number;
  total_assignments_count: number;
  duplicate_assignments_count: number;
  valid_rows: {
    employee: Partial<Employee>;
    assignments: Partial<EmployeeAssignment>[];
    education?: Partial<EmployeeEducation>[];
    is_existing: boolean;
  }[];
  errors: { row: number; message: string; data: any }[];
}

// -----------------------------------------------------------------------------
// OFFICIAL LETTERS & SK PENYURATAN TYPES
// -----------------------------------------------------------------------------

export type LetterType = 'sk_pengangkatan' | 'sp_peringatan' | 'sk_penugasan' | 'surat_keterangan' | 'custom';

export type LetterStatus = 'draft' | 'diterbitkan' | 'terkirim';

export interface LetterTemplate {
  id: string;
  code: string;
  title: string;
  type: LetterType;
  subject_template: string;
  header_title: string; // e.g. "KEPUTUSAN KETUA UMUM YAYASAN PENDIDIKAN ISLAM PONDOK PESANTREN AL-QUR'ANIYYAH"
  considering_text: string[]; // Menimbang
  in_view_text: string[];     // Mengingat
  observing_text: string[];   // Memperhatikan
  deciding_text: Record<string, string>; // Memutuskan (Pertama, Kedua, ...)
  footer_city: string;
  signer_name: string;
  signer_title: string;
  is_default?: boolean;
  created_at?: string;
}

export interface OfficialLetter {
  id: string;
  letter_number: string; // e.g. "047 /SK/YASPIQ/VII/2024"
  template_id?: string;
  type: LetterType;
  title: string;
  employee_id: string;
  employee_name: string;
  employee_email?: string;
  employee_nik?: string;
  employee_nirg_nirk?: string;
  employee_position?: string;
  employee_unit?: string;
  employee_gender?: string;
  employee_birth_info?: string;
  employee_education_level?: string;
  
  subject: string;
  header_title: string;
  considering: string[];
  in_view: string[];
  observing: string[];
  deciding: Record<string, string>;
  
  effective_date: string; // Tanggal Berlaku (TMT)
  end_date?: string;       // Tanggal Berakhir
  issued_date: string;    // Tanggal Penetapan
  issued_city: string;    // Kota Penetapan (Tangerang Selatan / Bogor)
  signer_name: string;    // e.g. "Dr. KH. M. Sobron Zayyan, SQ., MA"
  signer_title: string;   // e.g. "Ketua Umum"
  
  status: LetterStatus;
  sent_at?: string;
  pdf_url?: string;
  created_at: string;
  updated_at?: string;
}

export interface LetterKopSettings {
  header_line1: string; // "YAYASAN PENDIDIKAN ISLAM"
  header_line2: string; // "PONDOK PESANTREN AL-QUR'ANIYYAH"
  address: string;      // "Jl. Pesantren Al-Qur'aniyyah No. 12, Cipayung, Megamendung, Bogor"
  contact: string;      // "Telp: (0251) 8240000 | Email: yayasan@alquraniyyah.sch.id"
  kop_image_url?: string; // Gambar Kop Surat yang diupload (Base64/URL)
  kop_image_mode?: 'full_page' | 'header_only'; // Background 1 Halaman A4 penuh atau Header saja
  kop_top_padding_cm?: number; // Jarak posisi teks dari atas halaman saat Kop Gambar digunakan (dalam cm)
  hide_kop_on_print?: boolean; // Sembunyikan Kop saat dicetak di kertas berkop fisik
  print_top_margin_cm?: number; // Jarak margin atas saat cetak tanpa kop (dalam cm)
  logo_url?: string;
  stamp_url?: string;
  default_city: string; // "Tangerang Selatan"
  default_signer_name: string; // "Dr. KH. M. Sobron Zayyan, SQ., MA"
  default_signer_title: string; // "Ketua Umum"
}

export interface LetterKopTemplate {
  id: string;
  name: string; // e.g. "KOP Yayasan", "KOP SD IT", "KOP SMP IT", "KOP SMA IT"
  unit_id?: string;
  header_line1: string;
  header_line2: string;
  address: string;
  contact: string;
  kop_image_url?: string;
  kop_image_mode?: 'full_page' | 'header_only';
  kop_top_padding_cm?: number;
  print_top_margin_cm?: number;
  is_default?: boolean;
  created_at?: string;
}

export interface LetterDeliveryLog {
  id: string;
  letter_id: string;
  letter_number: string;
  letter_title: string;
  employee_id: string;
  employee_name: string;
  channel: 'whatsapp' | 'email';
  recipient_address: string; // whatsapp phone or email address
  status: 'sent' | 'pending' | 'failed' | 'skipped';
  sent_at: string;
  error_message?: string;
}


