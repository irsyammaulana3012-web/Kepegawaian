-- ==============================================================================
-- SIMKA AL-QUR'ANIYYAH - REVISI SKEMA DATABASE SUPABASE & STORAGE
-- Mendukung ID String (emp-001, doc-..., u-1, p-1) dan Sinkronisasi Berkas Cloud
-- ==============================================================================

-- 1. ENUMS (Hanya buat jika belum ada)
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

-- 2. HAPUS TABEL LAMA JIKA ADA (Agar tipe ID berganti dari UUID ke TEXT tanpa error konflik)
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS employee_notes CASCADE;
DROP TABLE IF EXISTS employee_leave CASCADE;
DROP TABLE IF EXISTS employee_attendance CASCADE;
DROP TABLE IF EXISTS employee_training CASCADE;
DROP TABLE IF EXISTS employee_documents CASCADE;
DROP TABLE IF EXISTS employee_position_history CASCADE;
DROP TABLE IF EXISTS employee_education CASCADE;
DROP TABLE IF EXISTS employee_assignments CASCADE;
DROP TABLE IF EXISTS employees CASCADE;
DROP TABLE IF EXISTS tasks CASCADE;
DROP TABLE IF EXISTS positions CASCADE;
DROP TABLE IF EXISTS departments CASCADE;
DROP TABLE IF EXISTS units CASCADE;
DROP TABLE IF EXISTS user_profiles CASCADE;
DROP TABLE IF EXISTS official_letters CASCADE;
DROP TABLE IF EXISTS letter_templates CASCADE;

-- 3. MASTER DATA TABLES (Menggunakan TEXT PRIMARY KEY)
CREATE TABLE units (
    id TEXT PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE departments (
    id TEXT PRIMARY KEY,
    unit_id TEXT REFERENCES units(id) ON DELETE CASCADE,
    code VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE positions (
    id TEXT PRIMARY KEY,
    department_id TEXT REFERENCES departments(id) ON DELETE SET NULL,
    code VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    level VARCHAR(50),
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE tasks (
    id TEXT PRIMARY KEY,
    position_id TEXT REFERENCES positions(id) ON DELETE CASCADE,
    code VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE user_profiles (
    id TEXT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role user_role DEFAULT 'viewer',
    unit_id TEXT REFERENCES units(id) ON DELETE SET NULL,
    is_active BOOLEAN DEFAULT TRUE,
    phone VARCHAR(50),
    avatar_url TEXT,
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. EMPLOYEES
CREATE TABLE employees (
    id TEXT PRIMARY KEY,
    employee_number VARCHAR(50) UNIQUE NOT NULL,
    nik VARCHAR(20) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    nickname VARCHAR(100),
    gender VARCHAR(20) NOT NULL,
    birth_place VARCHAR(100),
    birth_date DATE,
    religion VARCHAR(50) DEFAULT 'Islam',
    marital_status VARCHAR(50) DEFAULT 'Belum Menikah',
    address TEXT,
    phone VARCHAR(50),
    whatsapp VARCHAR(50),
    email VARCHAR(255),
    photo_url TEXT,
    employment_status employment_status DEFAULT 'Tetap',
    join_date DATE,
    appointment_date DATE,
    appointment_sk_number VARCHAR(100),
    appointment_sk_date DATE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. EMPLOYEE ASSIGNMENTS (Multi-Penugasan)
CREATE TABLE employee_assignments (
    id TEXT PRIMARY KEY,
    employee_id TEXT NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    unit_id TEXT NOT NULL REFERENCES units(id) ON DELETE RESTRICT,
    department_id TEXT REFERENCES departments(id) ON DELETE SET NULL,
    position_id TEXT NOT NULL REFERENCES positions(id) ON DELETE RESTRICT,
    task_id TEXT REFERENCES tasks(id) ON DELETE SET NULL,
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
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. EMPLOYEE EDUCATION
CREATE TABLE employee_education (
    id TEXT PRIMARY KEY,
    employee_id TEXT NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    level VARCHAR(50) NOT NULL,
    institution_name VARCHAR(255) NOT NULL,
    major VARCHAR(255),
    start_year INT,
    end_year INT,
    certificate_number VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. POSITION HISTORY
CREATE TABLE employee_position_history (
    id TEXT PRIMARY KEY,
    employee_id TEXT NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    period_label VARCHAR(100) NOT NULL,
    unit_name VARCHAR(255) NOT NULL,
    position_name VARCHAR(255) NOT NULL,
    task_name VARCHAR(255),
    start_date DATE,
    end_date DATE,
    sk_number VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. EMPLOYEE DOCUMENTS (Berkas Digital Karyawan)
CREATE TABLE employee_documents (
    id TEXT PRIMARY KEY,
    employee_id TEXT NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    document_type VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    file_url TEXT NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_size BIGINT,
    mime_type VARCHAR(100),
    uploaded_by TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. TRAINING
CREATE TABLE employee_training (
    id TEXT PRIMARY KEY,
    employee_id TEXT NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
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

-- 10. ATTENDANCE
CREATE TABLE employee_attendance (
    id TEXT PRIMARY KEY,
    employee_id TEXT NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    check_in TIME,
    check_out TIME,
    status attendance_status DEFAULT 'Hadir',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 11. LEAVE
CREATE TABLE employee_leave (
    id TEXT PRIMARY KEY,
    employee_id TEXT NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    leave_type VARCHAR(50) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    total_days INT NOT NULL,
    reason TEXT NOT NULL,
    status leave_status DEFAULT 'Pending',
    approved_by TEXT,
    approved_at TIMESTAMP WITH TIME ZONE,
    rejection_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 12. NOTES
CREATE TABLE employee_notes (
    id TEXT PRIMARY KEY,
    employee_id TEXT NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    note_type VARCHAR(50) DEFAULT 'Catatan Umum',
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    author_id TEXT,
    is_confidential BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 13. AUDIT LOGS
CREATE TABLE audit_logs (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    user_email VARCHAR(255),
    action VARCHAR(100) NOT NULL,
    table_name VARCHAR(100) NOT NULL,
    record_id TEXT,
    details JSONB,
    ip_address VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 14. SURAT & TEMPLATE
CREATE TABLE letter_templates (
    id TEXT PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL,
    description TEXT,
    template_html TEXT NOT NULL,
    placeholders JSONB DEFAULT '[]'::jsonb,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE official_letters (
    id TEXT PRIMARY KEY,
    template_id TEXT REFERENCES letter_templates(id) ON DELETE SET NULL,
    letter_number VARCHAR(100) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    recipient_name VARCHAR(255) NOT NULL,
    recipient_unit VARCHAR(255),
    content TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'Draft',
    issue_date DATE NOT NULL,
    created_by TEXT,
    signer_name VARCHAR(255),
    signer_position VARCHAR(255),
    pdf_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 15. ENABLE ROW LEVEL SECURITY (RLS) & IZINKAN AKSES PENUH
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
ALTER TABLE letter_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE official_letters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public full units" ON units FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public full departments" ON departments FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public full positions" ON positions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public full tasks" ON tasks FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public full user_profiles" ON user_profiles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public full employees" ON employees FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public full assignments" ON employee_assignments FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public full education" ON employee_education FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public full history" ON employee_position_history FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public full documents" ON employee_documents FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public full training" ON employee_training FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public full attendance" ON employee_attendance FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public full leave" ON employee_leave FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public full notes" ON employee_notes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public full audit" ON audit_logs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public full templates" ON letter_templates FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public full letters" ON official_letters FOR ALL USING (true) WITH CHECK (true);

-- 16. STORAGE BUCKET UNTUK FILE BERKAS / DOKUMEN DIGITAL
INSERT INTO storage.buckets (id, name, public)
VALUES ('employee-documents', 'employee-documents', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Storage policies
DROP POLICY IF EXISTS "Public Documents Access" ON storage.objects;
DROP POLICY IF EXISTS "Public Documents Upload" ON storage.objects;
DROP POLICY IF EXISTS "Public Documents Update" ON storage.objects;
DROP POLICY IF EXISTS "Public Documents Delete" ON storage.objects;

CREATE POLICY "Public Documents Access" ON storage.objects FOR SELECT USING (bucket_id = 'employee-documents');
CREATE POLICY "Public Documents Upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'employee-documents');
CREATE POLICY "Public Documents Update" ON storage.objects FOR UPDATE USING (bucket_id = 'employee-documents');
CREATE POLICY "Public Documents Delete" ON storage.objects FOR DELETE USING (bucket_id = 'employee-documents');
