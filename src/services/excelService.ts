import * as XLSX from 'xlsx';
import { Employee, EmployeeAssignment, EmployeeEducation, ExcelImportPreview } from '../types';
import { store } from './storageStore';
import { masterDataService } from './masterDataService';
import { employeeService } from './employeeService';
import { assignmentService } from './assignmentService';
import { educationService } from './educationService';
import { auditService } from './auditService';

export const excelService = {
  // Generate downloadable comprehensive sample Excel template
  generateTemplate(): void {
    const templateData = [
      {
        'Nama Lengkap': 'Ahmad Fauzi, S.Pd.',
        'NIK': '3201012345670001',
        'NIP': '198809152015011003',
        'No KK': '3201019988770001',
        'Nama Panggilan': 'Ustadz Fauzi',
        'Jenis Kelamin': 'Laki-laki',
        'Tempat Lahir': 'Bogor',
        'Tanggal Lahir': '1988-09-15',
        'Agama': 'Islam',
        'Status Pernikahan': 'Menikah',
        'Alamat Lengkap': 'Jl. Pesantren No. 12, Ciriung',
        'RT': '002',
        'RW': '005',
        'Kelurahan': 'Ciriung',
        'Kecamatan': 'Cibinong',
        'Kota/Kabupaten': 'Kabupaten Bogor',
        'Provinsi': 'Jawa Barat',
        'Kode Pos': '16918',
        'No HP': '085712345678',
        'WhatsApp': '085712345678',
        'Email': 'ahmad.fauzi@alquraniyyah.sch.id',
        'Status Kepegawaian': 'Tetap',
        'Tanggal Masuk': '2019-08-01',
        'Tanggal Pengangkatan': '2020-01-01',
        'Nomor SK Pengangkatan': 'SK-YPA/2020/001',
        'Tanggal SK Pengangkatan': '2020-01-01',
        'Tanggal Akhir Kontrak': '',
        'Unit Penugasan': 'SMP IT Al-Qur\'aniyyah',
        'Divisi/Bagian': 'Kurikulum',
        'Jabatan': 'Guru',
        'Tugas Pokok': 'Guru IPS Terpadu',
        'Deskripsi Tugas Khusus': 'Pengampu mata pelajaran IPS Kelas VII & VIII',
        'Nomor SK Penugasan': 'SKP-SMP/2024/012',
        'Tanggal SK Penugasan': '2024-07-01',
        'Tanggal Mulai Penugasan': '2024-07-01',
        'Tanggal Selesai Penugasan': '',
        'Penugasan Utama (Ya/Tidak)': 'Ya',
        'Status Penugasan': 'Aktif',
        'Pendidikan Terakhir': 'S1',
        'Nama Institusi/Kampus': 'Universitas Negeri Jakarta',
        'Jurusan': 'Pendidikan IPS',
        'Tahun Lulus': '2012',
        'Nomor Ijazah': 'IJZ-UNJ-2012-98765'
      },
      {
        'Nama Lengkap': 'Ahmad Fauzi, S.Pd.',
        'NIK': '3201012345670001',
        'NIP': '198809152015011003',
        'No KK': '3201019988770001',
        'Nama Panggilan': 'Ustadz Fauzi',
        'Jenis Kelamin': 'Laki-laki',
        'Tempat Lahir': 'Bogor',
        'Tanggal Lahir': '1988-09-15',
        'Agama': 'Islam',
        'Status Pernikahan': 'Menikah',
        'Alamat Lengkap': 'Jl. Pesantren No. 12, Ciriung',
        'RT': '002',
        'RW': '005',
        'Kelurahan': 'Ciriung',
        'Kecamatan': 'Cibinong',
        'Kota/Kabupaten': 'Kabupaten Bogor',
        'Provinsi': 'Jawa Barat',
        'Kode Pos': '16918',
        'No HP': '085712345678',
        'WhatsApp': '085712345678',
        'Email': 'ahmad.fauzi@alquraniyyah.sch.id',
        'Status Kepegawaian': 'Tetap',
        'Tanggal Masuk': '2019-08-01',
        'Tanggal Pengangkatan': '2020-01-01',
        'Nomor SK Pengangkatan': 'SK-YPA/2020/001',
        'Tanggal SK Pengangkatan': '2020-01-01',
        'Tanggal Akhir Kontrak': '',
        'Unit Penugasan': 'SMP IT Al-Qur\'aniyyah',
        'Divisi/Bagian': 'Kesiswaan',
        'Jabatan': 'Wali Kelas',
        'Tugas Pokok': 'Wali Kelas VII-A',
        'Deskripsi Tugas Khusus': 'Membimbing dan memantau perkembangan siswa kelas VII-A',
        'Nomor SK Penugasan': 'SKP-SMP/2024/013',
        'Tanggal SK Penugasan': '2024-07-01',
        'Tanggal Mulai Penugasan': '2024-07-01',
        'Tanggal Selesai Penugasan': '',
        'Penugasan Utama (Ya/Tidak)': 'Tidak',
        'Status Penugasan': 'Aktif',
        'Pendidikan Terakhir': 'S1',
        'Nama Institusi/Kampus': 'Universitas Negeri Jakarta',
        'Jurusan': 'Pendidikan IPS',
        'Tahun Lulus': '2012',
        'Nomor Ijazah': 'IJZ-UNJ-2012-98765'
      },
      {
        'Nama Lengkap': 'Ahmad Fauzi, S.Pd.',
        'NIK': '3201012345670001',
        'NIP': '198809152015011003',
        'No KK': '3201019988770001',
        'Nama Panggilan': 'Ustadz Fauzi',
        'Jenis Kelamin': 'Laki-laki',
        'Tempat Lahir': 'Bogor',
        'Tanggal Lahir': '1988-09-15',
        'Agama': 'Islam',
        'Status Pernikahan': 'Menikah',
        'Alamat Lengkap': 'Jl. Pesantren No. 12, Ciriung',
        'RT': '002',
        'RW': '005',
        'Kelurahan': 'Ciriung',
        'Kecamatan': 'Cibinong',
        'Kota/Kabupaten': 'Kabupaten Bogor',
        'Provinsi': 'Jawa Barat',
        'Kode Pos': '16918',
        'No HP': '085712345678',
        'WhatsApp': '085712345678',
        'Email': 'ahmad.fauzi@alquraniyyah.sch.id',
        'Status Kepegawaian': 'Tetap',
        'Tanggal Masuk': '2019-08-01',
        'Tanggal Pengangkatan': '2020-01-01',
        'Nomor SK Pengangkatan': 'SK-YPA/2020/001',
        'Tanggal SK Pengangkatan': '2020-01-01',
        'Tanggal Akhir Kontrak': '',
        'Unit Penugasan': 'SMA IT Al-Qur\'aniyyah',
        'Divisi/Bagian': 'Kurikulum',
        'Jabatan': 'Guru',
        'Tugas Pokok': 'Guru Sosiologi',
        'Deskripsi Tugas Khusus': 'Mata pelajaran Sosiologi Kelas X & XI',
        'Nomor SK Penugasan': 'SKP-SMA/2024/008',
        'Tanggal SK Penugasan': '2024-07-01',
        'Tanggal Mulai Penugasan': '2024-07-01',
        'Tanggal Selesai Penugasan': '',
        'Penugasan Utama (Ya/Tidak)': 'Tidak',
        'Status Penugasan': 'Aktif',
        'Pendidikan Terakhir': 'S1',
        'Nama Institusi/Kampus': 'Universitas Negeri Jakarta',
        'Jurusan': 'Pendidikan IPS',
        'Tahun Lulus': '2012',
        'Nomor Ijazah': 'IJZ-UNJ-2012-98765'
      },
      {
        'Nama Lengkap': 'Ahmad Fauzi, S.Pd.',
        'NIK': '3201012345670001',
        'NIP': '198809152015011003',
        'No KK': '3201019988770001',
        'Nama Panggilan': 'Ustadz Fauzi',
        'Jenis Kelamin': 'Laki-laki',
        'Tempat Lahir': 'Bogor',
        'Tanggal Lahir': '1988-09-15',
        'Agama': 'Islam',
        'Status Pernikahan': 'Menikah',
        'Alamat Lengkap': 'Jl. Pesantren No. 12, Ciriung',
        'RT': '002',
        'RW': '005',
        'Kelurahan': 'Ciriung',
        'Kecamatan': 'Cibinong',
        'Kota/Kabupaten': 'Kabupaten Bogor',
        'Provinsi': 'Jawa Barat',
        'Kode Pos': '16918',
        'No HP': '085712345678',
        'WhatsApp': '085712345678',
        'Email': 'ahmad.fauzi@alquraniyyah.sch.id',
        'Status Kepegawaian': 'Tetap',
        'Tanggal Masuk': '2019-08-01',
        'Tanggal Pengangkatan': '2020-01-01',
        'Nomor SK Pengangkatan': 'SK-YPA/2020/001',
        'Tanggal SK Pengangkatan': '2020-01-01',
        'Tanggal Akhir Kontrak': '',
        'Unit Penugasan': 'Yayasan',
        'Divisi/Bagian': 'Sekretariat',
        'Jabatan': 'Koordinator',
        'Tugas Pokok': 'Koordinator Rapat Pimpinan',
        'Deskripsi Tugas Khusus': 'Menyiapkan agenda rapat pimpinan yayasan',
        'Nomor SK Penugasan': 'SK-YPA/2024/005',
        'Tanggal SK Penugasan': '2024-01-10',
        'Tanggal Mulai Penugasan': '2024-01-10',
        'Tanggal Selesai Penugasan': '',
        'Penugasan Utama (Ya/Tidak)': 'Tidak',
        'Status Penugasan': 'Aktif',
        'Pendidikan Terakhir': 'S1',
        'Nama Institusi/Kampus': 'Universitas Negeri Jakarta',
        'Jurusan': 'Pendidikan IPS',
        'Tahun Lulus': '2012',
        'Nomor Ijazah': 'IJZ-UNJ-2012-98765'
      },
      {
        'Nama Lengkap': 'Ustadzah Fatimah Zahra, S.Ag.',
        'NIK': '3201013456780001',
        'NIP': '199003202018012004',
        'No KK': '3201018899000002',
        'Nama Panggilan': 'Ustadzah Fatimah',
        'Jenis Kelamin': 'Perempuan',
        'Tempat Lahir': 'Bandung',
        'Tanggal Lahir': '1990-03-20',
        'Agama': 'Islam',
        'Status Pernikahan': 'Menikah',
        'Alamat Lengkap': 'Kompleks Pesantren Blok B No. 4',
        'RT': '001',
        'RW': '003',
        'Kelurahan': 'Ciriung',
        'Kecamatan': 'Cibinong',
        'Kota/Kabupaten': 'Kabupaten Bogor',
        'Provinsi': 'Jawa Barat',
        'Kode Pos': '16918',
        'No HP': '081398765432',
        'WhatsApp': '081398765432',
        'Email': 'fatimah.zahra@alquraniyyah.sch.id',
        'Status Kepegawaian': 'Tetap',
        'Tanggal Masuk': '2018-01-15',
        'Tanggal Pengangkatan': '2018-07-01',
        'Nomor SK Pengangkatan': 'SK-YPA/2018/019',
        'Tanggal SK Pengangkatan': '2018-07-01',
        'Tanggal Akhir Kontrak': '',
        'Unit Penugasan': 'HALQ',
        'Divisi/Bagian': 'Tahfidz Qur\'an',
        'Jabatan': 'Pembina',
        'Tugas Pokok': 'Pembina Halaqah Tahfidz Putri',
        'Deskripsi Tugas Khusus': 'Membina hafalan santriwati juz 1-15',
        'Nomor SK Penugasan': 'SK-HLQ/2024/002',
        'Tanggal SK Penugasan': '2024-01-05',
        'Tanggal Mulai Penugasan': '2024-01-05',
        'Tanggal Selesai Penugasan': '',
        'Penugasan Utama (Ya/Tidak)': 'Ya',
        'Status Penugasan': 'Aktif',
        'Pendidikan Terakhir': 'S1',
        'Nama Institusi/Kampus': 'UIN Syarif Hidayatullah',
        'Jurusan': 'Ilmu Al-Qur\'an dan Tafsir',
        'Tahun Lulus': '2013',
        'Nomor Ijazah': 'IJZ-UIN-2013-44123'
      }
    ];

    const worksheet = XLSX.utils.json_to_sheet(templateData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Data Import Karyawan');

    // Auto width adjustments
    const colWidths = Object.keys(templateData[0]).map(key => ({
      wch: Math.max(key.length + 4, 18)
    }));
    worksheet['!cols'] = colWidths;

    XLSX.writeFile(workbook, 'Template_Import_Lengkap_SIMKA_Al-Quraniyyah.xlsx');
  },

  // Parse uploaded Excel / CSV file
  async parseFile(file: File): Promise<any[]> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          const rawRows = XLSX.utils.sheet_to_json(worksheet, { defval: '' });
          resolve(rawRows);
        } catch (err) {
          reject(new Error('Gagal membaca file Excel. Pastikan format valid (.xlsx, .xls, atau .csv).'));
        }
      };
      reader.onerror = () => reject(new Error('Gagal membaca berkas.'));
      reader.readAsArrayBuffer(file);
    });
  },

  // Process & Group rows to handle 1 EMPLOYEE = MULTIPLE ASSIGNMENTS + COMPLETE DATA
  async processAndValidate(
    rawRows: any[],
    columnMapping: Record<string, string>
  ): Promise<ExcelImportPreview> {
    const existingEmployees = store.getEmployees();
    const existingAssignments = store.getAssignments();
    const units = await masterDataService.getUnits();
    const departments = await masterDataService.getDepartments();
    const positions = await masterDataService.getPositions();
    const tasks = await masterDataService.getTasks();

    const errors: { row: number; message: string; data: any }[] = [];
    const groupedMap = new Map<string, {
      employee: Partial<Employee>;
      assignments: Partial<EmployeeAssignment>[];
      education?: Partial<EmployeeEducation>[];
      is_existing: boolean;
    }>();

    let totalAssignmentsCount = 0;
    let duplicateAssignmentsCount = 0;

    for (let i = 0; i < rawRows.length; i++) {
      const row = rawRows[i];
      const rowNumber = i + 2; // header is row 1

      // Helper function to extract value from row
      const getVal = (mapKey: string, defaultVal: string = '') => {
        const colHeader = columnMapping[mapKey];
        if (!colHeader || row[colHeader] === undefined) return defaultVal;
        return String(row[colHeader]).trim();
      };

      // 1. Personal Identity Fields
      const rawName = getVal('nama');
      const rawNik = getVal('nik');
      const rawNip = getVal('nip');
      const rawKk = getVal('no_kk');
      const rawNickname = getVal('nickname');
      const rawGender = getVal('jenis_kelamin');
      const rawBirthPlace = getVal('tempat_lahir');
      const rawBirthDate = getVal('tanggal_lahir');
      const rawReligion = getVal('agama', 'Islam');
      const rawMarital = getVal('status_pernikahan', 'Menikah');

      // 2. Address & Domisili Fields
      const rawAddress = getVal('alamat');
      const rawRt = getVal('rt');
      const rawRw = getVal('rw');
      const rawKelurahan = getVal('kelurahan');
      const rawKecamatan = getVal('kecamatan');
      const rawCity = getVal('kota');
      const rawProvince = getVal('provinsi');
      const rawPostalCode = getVal('kode_pos');

      // 3. Contact Fields
      const rawPhone = getVal('no_hp');
      const rawWa = getVal('whatsapp');
      const rawEmail = getVal('email');

      // 4. Employment Fields
      const rawStatus = getVal('status_kepegawaian', 'Tetap');
      const rawJoinDate = getVal('tanggal_masuk', new Date().toISOString().split('T')[0]);
      const rawAppointmentDate = getVal('tanggal_pengangkatan');
      const rawAppointmentSkNumber = getVal('sk_pengangkatan');
      const rawAppointmentSkDate = getVal('tanggal_sk_pengangkatan');
      const rawContractEndDate = getVal('tanggal_akhir_kontrak');

      // 5. Assignment Fields
      const rawUnit = getVal('unit');
      const rawDivisi = getVal('divisi');
      const rawPosition = getVal('jabatan');
      const rawTask = getVal('tugas');
      const rawTaskDesc = getVal('deskripsi_tugas');
      const rawSkPenugasan = getVal('sk_penugasan');
      const rawTglSkPenugasan = getVal('tanggal_sk_penugasan');
      const rawTglMulaiPenugasan = getVal('tanggal_mulai_penugasan', rawJoinDate);
      const rawTglSelesaiPenugasan = getVal('tanggal_selesai_penugasan');
      const rawIsPrimary = getVal('is_primary').toLowerCase();
      const rawStatusPenugasan = getVal('status_penugasan', 'Aktif');

      // 6. Education Fields
      const rawEduLevel = getVal('pendidikan_terakhir');
      const rawEduInstitution = getVal('institusi');
      const rawEduMajor = getVal('jurusan');
      const rawEduYear = getVal('tahun_lulus');
      const rawEduCertNum = getVal('nomor_ijazah');

      // Validation
      if (!rawName) {
        errors.push({ row: rowNumber, message: 'Kolom Nama Karyawan kosong', data: row });
        continue;
      }
      if (!rawNik) {
        errors.push({ row: rowNumber, message: 'Kolom NIK kosong (NIK diperlukan sebagai identitas unik)', data: row });
        continue;
      }
      if (rawNik.length !== 16 || !/^\d{16}$/.test(rawNik)) {
        errors.push({ row: rowNumber, message: `NIK "${rawNik}" tidak valid (harus 16 digit angka)`, data: row });
        continue;
      }

      // Resolve Unit
      let matchedUnit = units.find(u =>
        u.name.toLowerCase() === rawUnit.toLowerCase() ||
        u.code.toLowerCase() === rawUnit.toLowerCase() ||
        u.name.toLowerCase().includes(rawUnit.toLowerCase())
      );
      if (!matchedUnit && rawUnit) {
        matchedUnit = units[0];
      }

      // Resolve Department / Divisi
      let matchedDept = departments.find(d =>
        d.name.toLowerCase() === rawDivisi.toLowerCase() ||
        (rawDivisi && d.name.toLowerCase().includes(rawDivisi.toLowerCase()))
      );

      // Resolve Position
      let matchedPosition = positions.find(p =>
        p.name.toLowerCase() === rawPosition.toLowerCase() ||
        p.code.toLowerCase() === rawPosition.toLowerCase() ||
        p.name.toLowerCase().includes(rawPosition.toLowerCase())
      );
      if (!matchedPosition && rawPosition) {
        matchedPosition = positions[0];
      }

      // Resolve Task
      let matchedTask = tasks.find(t =>
        t.name.toLowerCase() === rawTask.toLowerCase() ||
        (t.code && t.code.toLowerCase() === rawTask.toLowerCase())
      );

      // Check if employee exists
      const groupKey = rawNik;
      const existingInDb = existingEmployees.find(e => e.nik === rawNik);

      if (!groupedMap.has(groupKey)) {
        const normalizedGender = (rawGender.toLowerCase().startsWith('p') || rawGender.toLowerCase().includes('wanita') || rawGender.toLowerCase().includes('perempuan'))
          ? 'Perempuan'
          : 'Laki-laki';

        const normalizedStatus = (['Tetap', 'Kontrak', 'Honorer', 'Magang', 'Freelance'].includes(rawStatus)
          ? rawStatus
          : 'Tetap') as any;

        groupedMap.set(groupKey, {
          employee: {
            id: existingInDb ? existingInDb.id : undefined,
            employee_number: existingInDb ? existingInDb.employee_number : undefined,
            nik: rawNik,
            nip: rawNip || (existingInDb?.nip || ''),
            no_kk: rawKk || (existingInDb?.no_kk || ''),
            full_name: rawName,
            nickname: rawNickname || (existingInDb?.nickname || ''),
            gender: normalizedGender,
            birth_place: rawBirthPlace || (existingInDb?.birth_place || ''),
            birth_date: rawBirthDate || (existingInDb?.birth_date || ''),
            religion: rawReligion || (existingInDb?.religion || 'Islam'),
            marital_status: rawMarital || (existingInDb?.marital_status || 'Menikah'),
            address: rawAddress || (existingInDb?.address || ''),
            rt: rawRt || (existingInDb?.rt || ''),
            rw: rawRw || (existingInDb?.rw || ''),
            kelurahan: rawKelurahan || (existingInDb?.kelurahan || ''),
            kecamatan: rawKecamatan || (existingInDb?.kecamatan || ''),
            city: rawCity || (existingInDb?.city || ''),
            province: rawProvince || (existingInDb?.province || ''),
            postal_code: rawPostalCode || (existingInDb?.postal_code || ''),
            phone: rawPhone || (existingInDb?.phone || ''),
            whatsapp: rawWa || rawPhone || (existingInDb?.whatsapp || ''),
            email: rawEmail || (existingInDb?.email || ''),
            employment_status: normalizedStatus,
            join_date: rawJoinDate || (existingInDb?.join_date || new Date().toISOString().split('T')[0]),
            appointment_date: rawAppointmentDate || (existingInDb?.appointment_date || undefined),
            appointment_sk_number: rawAppointmentSkNumber || (existingInDb?.appointment_sk_number || undefined),
            appointment_sk_date: rawAppointmentSkDate || (existingInDb?.appointment_sk_date || undefined),
            contract_end_date: rawContractEndDate || (existingInDb?.contract_end_date || undefined),
            is_active: true
          },
          assignments: [],
          education: [],
          is_existing: Boolean(existingInDb)
        });
      }

      const group = groupedMap.get(groupKey)!;

      // Add Education if present and not already added
      if (rawEduInstitution || rawEduLevel) {
        const eduLevel = rawEduLevel || 'S1';
        const alreadyHasEdu = group.education?.some(e => e.institution_name === rawEduInstitution && e.level === eduLevel);
        if (!alreadyHasEdu && rawEduInstitution) {
          group.education = group.education || [];
          group.education.push({
            level: eduLevel,
            institution_name: rawEduInstitution,
            major: rawEduMajor || undefined,
            end_year: rawEduYear ? parseInt(rawEduYear, 10) : undefined,
            certificate_number: rawEduCertNum || undefined
          });
        }
      }

      // Prepare Assignment
      if (matchedUnit && matchedPosition) {
        const isPrimaryBool = rawIsPrimary === 'ya' || rawIsPrimary === 'yes' || rawIsPrimary === 'true' || rawIsPrimary === '1' || group.assignments.length === 0;

        const isDuplicateInDb = existingAssignments.some(a =>
          existingInDb &&
          a.employee_id === existingInDb.id &&
          a.unit_id === matchedUnit!.id &&
          a.position_id === matchedPosition!.id &&
          (a.task_id === matchedTask?.id || (!a.task_id && !matchedTask)) &&
          a.status === 'Aktif'
        );

        const isDuplicateInBatch = group.assignments.some(a =>
          a.unit_id === matchedUnit!.id &&
          a.position_id === matchedPosition!.id &&
          (a.task_id === matchedTask?.id || (!a.task_id && !matchedTask))
        );

        if (isDuplicateInDb || isDuplicateInBatch) {
          duplicateAssignmentsCount++;
          continue;
        }

        const assignment: Partial<EmployeeAssignment> = {
          unit_id: matchedUnit.id,
          unit_name: matchedUnit.name,
          department_id: matchedDept?.id || null,
          department_name: matchedDept?.name || rawDivisi || undefined,
          position_id: matchedPosition.id,
          position_name: matchedPosition.name,
          task_id: matchedTask?.id || null,
          task_name: rawTask || matchedTask?.name || matchedPosition.name,
          custom_task_name: !matchedTask ? rawTask : undefined,
          task_description: rawTaskDesc || undefined,
          sk_number: rawSkPenugasan || undefined,
          sk_date: rawTglSkPenugasan || undefined,
          start_date: rawTglMulaiPenugasan || rawJoinDate || new Date().toISOString().split('T')[0],
          end_date: rawTglSelesaiPenugasan || null,
          is_primary: isPrimaryBool,
          status: (['Aktif', 'Selesai', 'Nonaktif'].includes(rawStatusPenugasan) ? rawStatusPenugasan : 'Aktif') as any
        };

        if (isPrimaryBool) {
          group.assignments.forEach(a => { a.is_primary = false; });
        }

        group.assignments.push(assignment);
        totalAssignmentsCount++;
      }
    }

    const validRows = Array.from(groupedMap.values());

    return {
      raw_rows_count: rawRows.length,
      grouped_employees_count: validRows.length,
      total_assignments_count: totalAssignmentsCount,
      duplicate_assignments_count: duplicateAssignmentsCount,
      valid_rows: validRows,
      errors: errors
    };
  },

  // Final Commit Import to Database / Store
  async commitImport(validRows: ExcelImportPreview['valid_rows']): Promise<{ importedEmployees: number; importedAssignments: number }> {
    let importedEmployees = 0;
    let importedAssignments = 0;

    for (const item of validRows) {
      let savedEmployee: Employee;

      if (item.is_existing && item.employee.id) {
        // Update existing employee data
        savedEmployee = await employeeService.saveEmployee(item.employee);
      } else {
        // Create new employee
        savedEmployee = await employeeService.saveEmployee(item.employee);
        importedEmployees++;
      }

      // Add all non-duplicate assignments for this employee
      for (const asg of item.assignments) {
        await assignmentService.saveAssignment({
          ...asg,
          employee_id: savedEmployee.id
        });
        importedAssignments++;
      }

      // Save education records if present
      if (item.education && item.education.length > 0) {
        for (const edu of item.education) {
          await educationService.saveEducation({
            ...edu,
            employee_id: savedEmployee.id
          });
        }
      }
    }

    await auditService.log('IMPORT_EXCEL', 'employees', undefined, {
      employeesCount: importedEmployees,
      assignmentsCount: importedAssignments
    });

    return { importedEmployees, importedAssignments };
  }
};
