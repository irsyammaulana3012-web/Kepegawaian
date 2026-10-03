-- ==============================================================================
-- SIMKA AL-QUR'ANIYYAH - MASTER DATABASE SCHEMA & MIGRATION
-- Sistem Informasi Manajemen Karyawan Yayasan Pendidikan Islam Pondok Pesantren Al-Qur'aniyyah
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. ENUMS
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('super_admin', 'admin_yayasan', 'admin_unit', 'hr_kepegawaian', 'viewer');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE employment_status AS ENUM ('Tetap', 'Kontrak', 'Honorer', 'Magang', 'Freelance', 'Lainnya');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE assignment_status AS ENUM ('Aktif', 'Selesai', 'Nonaktif');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE attendance_status AS ENUM ('Hadir', 'Izin', 'Sakit', 'Cuti', 'Dinas', 'Alpa');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE leave_status AS ENUM ('Pending', 'Disetujui', 'Ditolak');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. MASTER DATA TABLES

-- 2.1 UNITS (Yayasan, TK IT, SD IT, SMP IT, SMA IT, TPA/TPQ, LPBQ, HALQ, etc.)
CREATE TABLE IF NOT EXISTS units (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2.2 DEPARTMENTS / DIVISI / BAGIAN
CREATE TABLE IF NOT EXISTS departments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    unit_id UUID REFERENCES units(id) ON DELETE CASCADE,
    code VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2.3 POSITIONS / JABATAN (Pimpinan, Kepala Sekolah, Waka, Guru, Wali Kelas, Bendahara, TU, Staff, etc.)
CREATE TABLE IF NOT EXISTS positions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) DEFAULT 'Staff', -- Pimpinan, Pendidik, Tenaga Kependidikan, Staff, Operasional
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2.4 TASKS / TUGAS (Guru Mapel, Wali Kelas VII, Pembina OSIS, Rapim, Bendahara, dll.)
CREATE TABLE IF NOT EXISTS tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    position_id UUID REFERENCES positions(id) ON DELETE SET NULL,
    code VARCHAR(50),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. EMPLOYEES & PROFILES

-- 3.1 USER PROFILES (Linked to Supabase auth.users)
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role user_role DEFAULT 'viewer',
    unit_id UUID REFERENCES units(id) ON DELETE SET NULL, -- for unit-scoped admins
    avatar_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3.2 EMPLOYEES MASTER TABLE
CREATE TABLE IF NOT EXISTS employees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_number VARCHAR(50) UNIQUE NOT NULL, -- e.g. YPA-0001
    nik VARCHAR(20) UNIQUE NOT NULL,             -- 16 digits KTP NIK
    nip VARCHAR(50),
    no_kk VARCHAR(20),
    
    -- Personal Data
    full_name VARCHAR(255) NOT NULL,
    nickname VARCHAR(100),
    photo_url TEXT,
    gender VARCHAR(20) CHECK (gender IN ('Laki-laki', 'Perempuan')),
    birth_place VARCHAR(100),
    birth_date DATE,
    religion VARCHAR(50) DEFAULT 'Islam',
    marital_status VARCHAR(50) DEFAULT 'Belum Menikah',
    
    -- Address
    address TEXT,
    rt VARCHAR(10),
    rw VARCHAR(10),
    kelurahan VARCHAR(100),
    kecamatan VARCHAR(100),
    city VARCHAR(100),
    province VARCHAR(100),
    postal_code VARCHAR(10),
    
    -- Contacts
    phone VARCHAR(30),
    whatsapp VARCHAR(30),
    email VARCHAR(255),
    
    -- Employment Data
    employment_status employment_status DEFAULT 'Tetap',
    join_date DATE NOT NULL,
    appointment_date DATE,
    appointment_sk_number VARCHAR(100),
    appointment_sk_date DATE,
    contract_end_date DATE,
    is_active BOOLEAN DEFAULT TRUE,
    inactive_reason TEXT,
    inactive_date DATE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. MULTIPLE ASSIGNMENTS (CORE CONCEPT: 1 KARYAWAN = MULTIPLE PENUGASAN)
CREATE TABLE IF NOT EXISTS employee_assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    unit_id UUID NOT NULL REFERENCES units(id) ON DELETE RESTRICT,
    department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
    position_id UUID NOT NULL REFERENCES positions(id) ON DELETE RESTRICT,
    task_id UUID REFERENCES tasks(id) ON DELETE SET NULL,
    custom_task_name VARCHAR(255),
    task_description TEXT,
    sk_number VARCHAR(100),
    sk_date DATE,
    start_date DATE NOT NULL,
    end_date DATE,
    is_primary BOOLEAN DEFAULT FALSE,
    status assignment_status DEFAULT 'Aktif',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT chk_assignment_dates CHECK (end_date IS NULL OR end_date >= start_date)
);

-- 5. EMPLOYEE EDUCATION (1 Karyawan = Banyak Riwayat Pendidikan)
CREATE TABLE IF NOT EXISTS employee_education (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    level VARCHAR(50) NOT NULL, -- SD, SMP, SMA, D3, S1, S2, S3, Pondok Pesantren
    institution_name VARCHAR(255) NOT NULL,
    major VARCHAR(255),
    start_year INT,
    end_year INT,
    certificate_number VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. EMPLOYEE POSITION HISTORY (Timeline Riwayat Karir/Penugasan Lampau)
CREATE TABLE IF NOT EXISTS employee_position_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    period_label VARCHAR(100) NOT NULL, -- e.g. "2022-2024"
    unit_name VARCHAR(255) NOT NULL,
    position_name VARCHAR(255) NOT NULL,
    task_name VARCHAR(255),
    start_date DATE,
    end_date DATE,
    sk_number VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. EMPLOYEE DOCUMENTS (Supabase Storage reference)
CREATE TABLE IF NOT EXISTS employee_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    document_type VARCHAR(100) NOT NULL, -- KTP, KK, Ijazah, SK Pengangkatan, SK Penugasan, Kontrak Kerja, Sertifikat, NPWP, BPJS, dll.
    title VARCHAR(255) NOT NULL,
    file_url TEXT NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_size BIGINT,
    mime_type VARCHAR(100),
    uploaded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. EMPLOYEE TRAINING / PELATIHAN & SERTIFIKASI
CREATE TABLE IF NOT EXISTS employee_training (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    organizer VARCHAR(255) NOT NULL,
    date DATE NOT NULL,
    location VARCHAR(255),
    duration_hours INT,
    certificate_number VARCHAR(100),
    expiry_date DATE,
    certificate_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. ATTENDANCE / ABSENSI
CREATE TABLE IF NOT EXISTS employee_attendance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    check_in TIME,
    check_out TIME,
    status attendance_status DEFAULT 'Hadir',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(employee_id, date)
);

-- 10. LEAVE / CUTI & IZIN
CREATE TABLE IF NOT EXISTS employee_leave (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    leave_type VARCHAR(100) NOT NULL, -- Cuti Tahunan, Cuti Melahirkan, Cuti Sakit, Izin Khusus, Dinas Luar
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    total_days INT NOT NULL DEFAULT 1,
    reason TEXT NOT NULL,
    attachment_url TEXT,
    status leave_status DEFAULT 'Pending',
    approver_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    approved_at TIMESTAMP WITH TIME ZONE,
    approval_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 11. INTERNAL NOTES (Catatan Internal HR)
CREATE TABLE IF NOT EXISTS employee_notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    note_date DATE DEFAULT CURRENT_DATE,
    content TEXT NOT NULL,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_by_name VARCHAR(255),
    is_confidential BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 12. AUDIT LOGS (WAJIB: Catat Semua Aktivitas)
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID,
    user_name VARCHAR(255),
    action VARCHAR(100) NOT NULL, -- CREATE, UPDATE, DELETE, LOGIN, LOGOUT, IMPORT, EXPORT, CREATE_ASSIGNMENT, etc.
    module VARCHAR(100) NOT NULL, -- employees, assignments, education, documents, master, auth
    record_id VARCHAR(100),
    details JSONB,
    ip_address VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 13. INDEXES FOR HIGH PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_employees_number ON employees(employee_number);
CREATE INDEX IF NOT EXISTS idx_employees_nik ON employees(nik);
CREATE INDEX IF NOT EXISTS idx_employees_active ON employees(is_active);
CREATE INDEX IF NOT EXISTS idx_assignments_employee ON employee_assignments(employee_id);
CREATE INDEX IF NOT EXISTS idx_assignments_unit ON employee_assignments(unit_id);
CREATE INDEX IF NOT EXISTS idx_assignments_position ON employee_assignments(position_id);
CREATE INDEX IF NOT EXISTS idx_assignments_status ON employee_assignments(status);
CREATE INDEX IF NOT EXISTS idx_education_employee ON employee_education(employee_id);
CREATE INDEX IF NOT EXISTS idx_docs_employee ON employee_documents(employee_id);
CREATE INDEX IF NOT EXISTS idx_training_employee ON employee_training(employee_id);
CREATE INDEX IF NOT EXISTS idx_attendance_emp_date ON employee_attendance(employee_id, date);
CREATE INDEX IF NOT EXISTS idx_leave_emp ON employee_leave(employee_id);
CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_logs(created_at DESC);

-- 14. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE units ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee_education ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee_position_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee_training ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee_attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee_leave ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read master data
CREATE POLICY "Allow read master data" ON units FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow read master departments" ON departments FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow read master positions" ON positions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow read master tasks" ON tasks FOR SELECT TO authenticated USING (true);

-- Allow authenticated users with admin/hr role full access
CREATE POLICY "Allow full access to employees for staff" ON employees FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow full access to assignments for staff" ON employee_assignments FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow full access to education for staff" ON employee_education FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow full access to history for staff" ON employee_position_history FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow full access to documents for staff" ON employee_documents FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow full access to training for staff" ON employee_training FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow full access to attendance for staff" ON employee_attendance FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow full access to leave for staff" ON employee_leave FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow full access to notes for staff" ON employee_notes FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow write audit logs" ON audit_logs FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow read audit logs" ON audit_logs FOR SELECT TO authenticated USING (true);

-- Allow anon/public full access for app operations
CREATE POLICY "Anon full units" ON units FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Anon full departments" ON departments FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Anon full positions" ON positions FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Anon full tasks" ON tasks FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Anon full employees" ON employees FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Anon full assignments" ON employee_assignments FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Anon full education" ON employee_education FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Anon full history" ON employee_position_history FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Anon full documents" ON employee_documents FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Anon full training" ON employee_training FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Anon full attendance" ON employee_attendance FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Anon full leave" ON employee_leave FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Anon full notes" ON employee_notes FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Anon full audit" ON audit_logs FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Anon full users" ON user_profiles FOR ALL TO anon USING (true) WITH CHECK (true);

-- 15. SEED DATA - INITIAL MASTER DATA & SAMPLE DEMO
INSERT INTO units (code, name, description, sort_order) VALUES
('YAS', 'Yayasan', 'Kantor Pengurus Yayasan Pendidikan Islam Pondok Pesantren Al-Qur''aniyyah', 1),
('TKIT', 'TK IT Al-Qur''aniyyah', 'Unit Pendidikan Taman Kanak-kanak Islam Terpadu', 2),
('SDIT', 'SD IT Al-Qur''aniyyah', 'Unit Pendidikan Sekolah Dasar Islam Terpadu', 3),
('SMPIT', 'SMP IT Al-Qur''aniyyah', 'Unit Pendidikan Sekolah Menengah Pertama Islam Terpadu', 4),
('SMAIT', 'SMA IT Al-Qur''aniyyah', 'Unit Pendidikan Sekolah Menengah Atas Islam Terpadu', 5),
('TPA', 'TPA/TPQ Al-Qur''aniyyah', 'Taman Pendidikan Al-Qur''an', 6),
('LPBQ', 'LPBQ', 'Lembaga Pengembangan Baca Al-Qur''an', 7),
('HALQ', 'HALQ', 'Halaqah Al-Qur''an Pesantren', 8),
('SARPRAS', 'Unit Sarana & Logistik', 'Pengelolaan aset, gedung, dan fasilitas pesantren', 9)
ON CONFLICT (code) DO NOTHING;

INSERT INTO positions (code, name, category, sort_order) VALUES
('PIN', 'Pimpinan', 'Pimpinan', 1),
('KS', 'Kepala Sekolah', 'Pimpinan', 2),
('WKS', 'Wakil Kepala Sekolah', 'Pimpinan', 3),
('GUR', 'Guru', 'Pendidik', 4),
('WLK', 'Wali Kelas', 'Pendidik', 5),
('BDH', 'Bendahara', 'Tenaga Kependidikan', 6),
('TU', 'Tata Usaha', 'Tenaga Kependidikan', 7),
('OPR', 'Operator', 'Tenaga Kependidikan', 8),
('KOR', 'Koordinator', 'Pimpinan', 9),
('PBN', 'Pembina', 'Pendidik', 10),
('PSG', 'Pengasuh', 'Pendidik', 11),
('STF', 'Staff', 'Staff', 12),
('SEC', 'Security', 'Operasional', 13),
('OB', 'Office Boy / Kebersihan', 'Operasional', 14)
ON CONFLICT (code) DO NOTHING;

INSERT INTO tasks (code, name, description) VALUES
('G-IPS', 'Guru IPS', 'Pengajar Mata Pelajaran Ilmu Pengetahuan Sosial'),
('G-PAI', 'Guru PAI & Tahfidz', 'Pengajar Pendidikan Agama Islam dan Al-Qur''an'),
('G-MTK', 'Guru Matematika', 'Pengajar Mata Pelajaran Matematika'),
('G-IND', 'Guru Bahasa Indonesia', 'Pengajar Mata Pelajaran Bahasa Indonesia'),
('G-ING', 'Guru Bahasa Inggris', 'Pengajar Mata Pelajaran Bahasa Inggris'),
('G-IPA', 'Guru IPA', 'Pengajar Ilmu Pengetahuan Alam'),
('WL-7A', 'Wali Kelas VII-A', 'Pembimbing dan pengasuh akademik santri kelas VII-A'),
('WL-8A', 'Wali Kelas VIII-A', 'Pembimbing dan pengasuh akademik santri kelas VIII-A'),
('WL-10', 'Wali Kelas X', 'Pembimbing akademik siswa kelas X SMA IT'),
('KOR-RAPIM', 'Koordinator Rapim', 'Koordinator Rapat Pimpinan Yayasan'),
('PEM-OSIS', 'Pembina OSIS / Santri', 'Pembina Organisasi Santri Intra Pesantren'),
('PEM-TAHFIDZ', 'Pembina Halaqah Tahfidz', 'Pembina program hafalan Al-Qur''an santri'),
('ADM-KUR', 'Administrasi Kurikulum', 'Pengelolaan dokumen dan kurikulum sekolah'),
('ADM-KES', 'Administrasi Kesiswaan', 'Pengelolaan data dan layanan santri/siswa'),
('SAR-PRAS', 'Koordinator Sarana Prasarana', 'Pengelolaan pemeliharaan fasilitas'),
('HUMAS', 'Humas & Publikasi', 'Hubungan masyarakat dan media sosial pesantren')
ON CONFLICT DO NOTHING;
