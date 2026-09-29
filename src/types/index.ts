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

export interface Employee {
  id: string;
  employee_number: string; // e.g. YPA-0001
  nik: string;             // 16 digits
  nip?: string;
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
  appointment_date?: string;
  appointment_sk_number?: string;
  appointment_sk_date?: string;
  contract_end_date?: string;
  is_active: boolean;
  inactive_reason?: string;
  inactive_date?: string;
  
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
  tanggal_masuk?: string;
  tanggal_pengangkatan?: string;
  sk_pengangkatan?: string;
  tanggal_sk_pengangkatan?: string;
  tanggal_akhir_kontrak?: string;
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
