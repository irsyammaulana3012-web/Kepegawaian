import * as XLSX from 'xlsx';
import { Employee, EmployeeAssignment, EmployeeEducation, ExcelImportPreview } from '../types';
import { store } from './storageStore';
import { masterDataService } from './masterDataService';
import { employeeService } from './employeeService';
import { assignmentService } from './assignmentService';
import { educationService } from './educationService';
import { auditService } from './auditService';

export const excelService = {
  // Generate downloadable comprehensive sample Excel template with Foundation Draft Schema
  generateTemplate(): void {
    const templateData = [
      {
        'NIRG': 'G-SMP-2019-001',
        'NIRK': '',
        'Nama Lengkap': 'Ahmad Fauzi, S.Pd.',
        'NIK': '3201012345670001',
        'NIP': '198809152015011003',
        'Tempat Lahir': 'Bogor',
        'Tanggal Lahir': '1988-09-15',
        'Pendidikan Terakhir': 'S1',
        'Jenis Kelamin (L/P)': 'Laki-laki',
        'Alamat': 'Jl. Pesantren No. 12, Ciriung, Cibinong, Bogor',
        'Unit Kerja': 'SMP IT Al-Qur\'aniyyah',
        'Jabatan': 'Guru',
        'Tugas Pokok': 'Guru IPS Terpadu',
        'Nomor Telepon': '085712345678',
        'Tahun Masuk': '2019',
        'Tahun Keluar': '',
        'Email': 'ahmad.fauzi@alquraniyyah.sch.id',
        'Status Karyawan': 'Tetap',
        'Nama Bank': 'Bank Syariah Indonesia (BSI)',
        'Nomor Rekening': '7123456789',
        'Pendidikan SD - Tahun': '2000',
        'Pendidikan SD - Instansi': 'SDN 01 Cibinong',
        'Pendidikan SMP - Tahun': '2003',
        'Pendidikan SMP - Instansi': 'SMPN 01 Cibinong',
        'Pendidikan SMA/SMK - Tahun': '2006',
        'Pendidikan SMA/SMK - Instansi': 'SMAN 01 Cibinong',
        'Pendidikan S1 - Tahun': '2011',
        'Pendidikan S1 - Instansi': 'Universitas Negeri Jakarta',
        'Pendidikan S2 - Tahun': '',
        'Pendidikan S2 - Instansi': '',
        'Pendidikan S3 - Tahun': '',
        'Pendidikan S3 - Instansi': '',
        'Pendidikan Nonformal - Nama': 'Pondok Pesantren Al-Falah',
        'Pendidikan Nonformal - Instansi': 'Ponpes Al-Falah Bogor',
        'Pendidikan Nonformal - Tahun': '2008',
        'Pendidikan Nonformal - Keterangan': 'Khatam Al-Qur\'an & Kitab Kuning'
      },
      {
        'NIRG': 'G-SMP-2019-001',
        'NIRK': '',
        'Nama Lengkap': 'Ahmad Fauzi, S.Pd.',
        'NIK': '3201012345670001',
        'NIP': '198809152015011003',
        'Tempat Lahir': 'Bogor',
        'Tanggal Lahir': '1988-09-15',
        'Pendidikan Terakhir': 'S1',
        'Jenis Kelamin (L/P)': 'Laki-laki',
        'Alamat': 'Jl. Pesantren No. 12, Ciriung, Cibinong, Bogor',
        'Unit Kerja': 'SMA IT Al-Qur\'aniyyah',
        'Jabatan': 'Guru',
        'Tugas Pokok': 'Guru Sosiologi',
        'Nomor Telepon': '085712345678',
        'Tahun Masuk': '2019',
        'Tahun Keluar': '',
        'Email': 'ahmad.fauzi@alquraniyyah.sch.id',
        'Status Karyawan': 'Tetap',
        'Nama Bank': 'Bank Syariah Indonesia (BSI)',
        'Nomor Rekening': '7123456789',
        'Pendidikan SD - Tahun': '2000',
        'Pendidikan SD - Instansi': 'SDN 01 Cibinong',
        'Pendidikan SMP - Tahun': '2003',
        'Pendidikan SMP - Instansi': 'SMPN 01 Cibinong',
        'Pendidikan SMA/SMK - Tahun': '2006',
        'Pendidikan SMA/SMK - Instansi': 'SMAN 01 Cibinong',
        'Pendidikan S1 - Tahun': '2011',
        'Pendidikan S1 - Instansi': 'Universitas Negeri Jakarta',
        'Pendidikan S2 - Tahun': '',
        'Pendidikan S2 - Instansi': '',
        'Pendidikan S3 - Tahun': '',
        'Pendidikan S3 - Instansi': '',
        'Pendidikan Nonformal - Nama': 'Pondok Pesantren Al-Falah',
        'Pendidikan Nonformal - Instansi': 'Ponpes Al-Falah Bogor',
        'Pendidikan Nonformal - Tahun': '2008',
        'Pendidikan Nonformal - Keterangan': 'Khatam Al-Qur\'an & Kitab Kuning'
      },
      {
        'NIRG': '',
        'NIRK': 'K-YAS-2021-008',
        'Nama Lengkap': 'Siti Rahmawati, S.E.',
        'NIK': '3201015678900002',
        'NIP': '199204122021012005',
        'Tempat Lahir': 'Bandung',
        'Tanggal Lahir': '1992-04-12',
        'Pendidikan Terakhir': 'S1',
        'Jenis Kelamin (L/P)': 'Perempuan',
        'Alamat': 'Kompleks Pesantren Blok C No. 5, Ciriung',
        'Unit Kerja': 'Yayasan',
        'Jabatan': 'Staff Keuangan',
        'Tugas Pokok': 'Administrasi Gaji & Keuangan Yayasan',
        'Nomor Telepon': '081298765432',
        'Tahun Masuk': '2021',
        'Tahun Keluar': '',
        'Email': 'siti.rahma@alquraniyyah.sch.id',
        'Status Karyawan': 'Tetap',
        'Nama Bank': 'Bank Mandiri',
        'Nomor Rekening': '1330019876543',
        'Pendidikan SD - Tahun': '2004',
        'Pendidikan SD - Instansi': 'SDN 02 Bandung',
        'Pendidikan SMP - Tahun': '2007',
        'Pendidikan SMP - Instansi': 'SMPN 03 Bandung',
        'Pendidikan SMA/SMK - Tahun': '2010',
        'Pendidikan SMA/SMK - Instansi': 'SMKN 01 Bandung',
        'Pendidikan S1 - Tahun': '2015',
        'Pendidikan S1 - Instansi': 'Universitas Padjadjaran',
        'Pendidikan S2 - Tahun': '',
        'Pendidikan S2 - Instansi': '',
        'Pendidikan S3 - Tahun': '',
        'Pendidikan S3 - Instansi': '',
        'Pendidikan Nonformal - Nama': 'Pelatihan Akuntansi Syariah',
        'Pendidikan Nonformal - Instansi': 'Ikatan Akuntan Indonesia',
        'Pendidikan Nonformal - Tahun': '2018',
        'Pendidikan Nonformal - Keterangan': 'Sertifikasi Brevet & Akuntansi'
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

    XLSX.writeFile(workbook, 'Template_Draft_Karyawan_Al-Quraniyyah.xlsx');
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
      const rawNirg = getVal('nirg') || getVal('NIRG');
      const rawNirk = getVal('nirk') || getVal('NIRK');
      const rawName = getVal('nama') || getVal('Nama Lengkap');
      const rawNik = getVal('nik') || getVal('NIK');
      const rawNip = getVal('nip') || getVal('NIP');
      const rawKk = getVal('no_kk') || getVal('No KK');
      const rawNickname = getVal('nickname') || getVal('Nama Panggilan');
      const rawGender = getVal('jenis_kelamin') || getVal('Jenis Kelamin (L/P)');
      const rawBirthPlace = getVal('tempat_lahir') || getVal('Tempat Lahir');
      const rawBirthDate = getVal('tanggal_lahir') || getVal('Tanggal Lahir');
      const rawReligion = getVal('agama', 'Islam');
      const rawMarital = getVal('status_pernikahan', 'Menikah');

      // 2. Address & Domisili Fields
      const rawAddress = getVal('alamat') || getVal('Alamat Lengkap');
      const rawRt = getVal('rt');
      const rawRw = getVal('rw');
      const rawKelurahan = getVal('kelurahan');
      const rawKecamatan = getVal('kecamatan');
      const rawCity = getVal('kota');
      const rawProvince = getVal('provinsi');
      const rawPostalCode = getVal('kode_pos');

      // 3. Contact Fields
      const rawPhone = getVal('no_hp') || getVal('Nomor Telepon');
      const rawWa = getVal('whatsapp') || getVal('Nomor Telepon');
      const rawEmail = getVal('email') || getVal('Email');

      // 4. Employment & Banking Fields
      const rawStatus = getVal('status_kepegawaian') || getVal('Status Karyawan') || 'Tetap';
      const rawTahunMasuk = getVal('tahun_masuk') || getVal('Tahun Masuk');
      const rawTahunKeluar = getVal('tahun_keluar') || getVal('Tahun Keluar');
      const rawJoinDate = getVal('tanggal_masuk', rawTahunMasuk ? `${rawTahunMasuk}-01-01` : new Date().toISOString().split('T')[0]);
      const rawAppointmentDate = getVal('tanggal_pengangkatan');
      const rawAppointmentSkNumber = getVal('sk_pengangkatan');
      const rawAppointmentSkDate = getVal('tanggal_sk_pengangkatan');
      const rawContractEndDate = getVal('tanggal_akhir_kontrak');
      const rawBankName = getVal('nama_bank') || getVal('Nama Bank');
      const rawBankAccountNumber = getVal('nomor_rekening') || getVal('Nomor Rekening');

      // 5. Assignment Fields
      const rawUnit = getVal('unit') || getVal('Unit Kerja') || getVal('Unit Penugasan');
      const rawDivisi = getVal('divisi') || getVal('Divisi/Bagian');
      const rawPosition = getVal('jabatan') || getVal('Jabatan');
      const rawTask = getVal('tugas') || getVal('Tugas Pokok');
      const rawTaskDesc = getVal('deskripsi_tugas') || getVal('Deskripsi Tugas Khusus');
      const rawSkPenugasan = getVal('sk_penugasan') || getVal('Nomor SK Penugasan');
      const rawTglSkPenugasan = getVal('tanggal_sk_penugasan') || getVal('Tanggal SK Penugasan');
      const rawTglMulaiPenugasan = getVal('tanggal_mulai_penugasan', rawJoinDate);
      const rawTglSelesaiPenugasan = getVal('tanggal_selesai_penugasan');
      const rawIsPrimary = (getVal('is_primary') || getVal('Penugasan Utama (Ya/Tidak)')).toLowerCase();
      const rawStatusPenugasan = getVal('status_penugasan', 'Aktif');

      // 6. Education Fields (Summary & Breakdown)
      const rawEduLevel = getVal('pendidikan_terakhir') || getVal('Pendidikan Terakhir');
      const rawSdTahun = getVal('sd_tahun') || getVal('Pendidikan SD - Tahun');
      const rawSdInstansi = getVal('sd_instansi') || getVal('Pendidikan SD - Instansi');
      const rawSmpTahun = getVal('smp_tahun') || getVal('Pendidikan SMP - Tahun');
      const rawSmpInstansi = getVal('smp_instansi') || getVal('Pendidikan SMP - Instansi');
      const rawSmaTahun = getVal('sma_tahun') || getVal('Pendidikan SMA/SMK - Tahun');
      const rawSmaInstansi = getVal('sma_instansi') || getVal('Pendidikan SMA/SMK - Instansi');
      const rawS1Tahun = getVal('s1_tahun') || getVal('Pendidikan S1 - Tahun');
      const rawS1Instansi = getVal('s1_instansi') || getVal('Pendidikan S1 - Instansi');
      const rawS2Tahun = getVal('s2_tahun') || getVal('Pendidikan S2 - Tahun');
      const rawS2Instansi = getVal('s2_instansi') || getVal('Pendidikan S2 - Instansi');
      const rawS3Tahun = getVal('s3_tahun') || getVal('Pendidikan S3 - Tahun');
      const rawS3Instansi = getVal('s3_instansi') || getVal('Pendidikan S3 - Instansi');

      const rawNonformalNama = getVal('nonformal_nama') || getVal('Pendidikan Nonformal - Nama');
      const rawNonformalInstansi = getVal('nonformal_instansi') || getVal('Pendidikan Nonformal - Instansi');
      const rawNonformalTahun = getVal('nonformal_tahun') || getVal('Pendidikan Nonformal - Tahun');
      const rawNonformalKet = getVal('nonformal_keterangan') || getVal('Pendidikan Nonformal - Keterangan');

      const rawEduInstitution = getVal('institusi') || getVal('Nama Institusi/Kampus');
      const rawEduMajor = getVal('jurusan') || getVal('Jurusan');
      const rawEduYear = getVal('tahun_lulus') || getVal('Tahun Lulus');
      const rawEduCertNum = getVal('nomor_ijazah') || getVal('Nomor Ijazah');

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

        const formalEduList: any[] = [];
        if (rawSdInstansi) formalEduList.push({ level: 'SD', year: rawSdTahun, institution: rawSdInstansi });
        if (rawSmpInstansi) formalEduList.push({ level: 'SMP', year: rawSmpTahun, institution: rawSmpInstansi });
        if (rawSmaInstansi) formalEduList.push({ level: 'SMA/SMK', year: rawSmaTahun, institution: rawSmaInstansi });
        if (rawS1Instansi) formalEduList.push({ level: 'S1', year: rawS1Tahun, institution: rawS1Instansi });
        if (rawS2Instansi) formalEduList.push({ level: 'S2', year: rawS2Tahun, institution: rawS2Instansi });
        if (rawS3Instansi) formalEduList.push({ level: 'S3', year: rawS3Tahun, institution: rawS3Instansi });

        const nonformalEduList: any[] = [];
        if (rawNonformalNama || rawNonformalInstansi) {
          nonformalEduList.push({
            name: rawNonformalNama || 'Pelatihan / Pesantren',
            institution: rawNonformalInstansi,
            year: rawNonformalTahun,
            notes: rawNonformalKet
          });
        }

        groupedMap.set(groupKey, {
          employee: {
            id: existingInDb ? existingInDb.id : undefined,
            employee_number: existingInDb ? existingInDb.employee_number : undefined,
            nik: rawNik,
            nirg: rawNirg || (existingInDb?.nirg || undefined),
            nirk: rawNirk || (existingInDb?.nirk || undefined),
            nip: rawNip || (existingInDb?.nip || ''),
            no_kk: rawKk || (existingInDb?.no_kk || ''),
            full_name: rawName,
            nickname: rawNickname || (existingInDb?.nickname || ''),
            gender: normalizedGender,
            birth_place: rawBirthPlace || (existingInDb?.birth_place || ''),
            birth_date: rawBirthDate || (existingInDb?.birth_date || ''),
            religion: rawReligion || (existingInDb?.religion || 'Islam'),
            marital_status: rawMarital || (existingInDb?.marital_status || 'Menikah'),
            last_education: rawEduLevel || (existingInDb?.last_education || undefined),
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
            entry_year: rawTahunMasuk || (existingInDb?.entry_year || undefined),
            exit_year: rawTahunKeluar || (existingInDb?.exit_year || undefined),
            join_date: rawJoinDate || (existingInDb?.join_date || new Date().toISOString().split('T')[0]),
            appointment_date: rawAppointmentDate || (existingInDb?.appointment_date || undefined),
            appointment_sk_number: rawAppointmentSkNumber || (existingInDb?.appointment_sk_number || undefined),
            appointment_sk_date: rawAppointmentSkDate || (existingInDb?.appointment_sk_date || undefined),
            contract_end_date: rawContractEndDate || (existingInDb?.contract_end_date || undefined),
            bank_name: rawBankName || (existingInDb?.bank_name || undefined),
            bank_account_number: rawBankAccountNumber || (existingInDb?.bank_account_number || undefined),
            formal_education: formalEduList.length > 0 ? formalEduList : (existingInDb?.formal_education || undefined),
            nonformal_education: nonformalEduList.length > 0 ? nonformalEduList : (existingInDb?.nonformal_education || undefined),
            is_active: true
          },
          assignments: [],
          education: [],
          is_existing: Boolean(existingInDb)
        });
      }

      const group = groupedMap.get(groupKey)!;

      // Add Education records
      const addEduIfValid = (level: string, inst: string, yr?: string, cert?: string, maj?: string) => {
        if (!inst) return;
        const exists = group.education?.some(e => e.level === level && e.institution_name === inst);
        if (!exists) {
          group.education = group.education || [];
          group.education.push({
            level,
            institution_name: inst,
            major: maj || undefined,
            end_year: yr ? parseInt(yr, 10) : undefined,
            certificate_number: cert || undefined
          });
        }
      };

      if (rawSdInstansi) addEduIfValid('SD', rawSdInstansi, rawSdTahun);
      if (rawSmpInstansi) addEduIfValid('SMP', rawSmpInstansi, rawSmpTahun);
      if (rawSmaInstansi) addEduIfValid('SMA/SMK', rawSmaInstansi, rawSmaTahun);
      if (rawS1Instansi) addEduIfValid('S1', rawS1Instansi, rawS1Tahun, rawEduCertNum, rawEduMajor);
      if (rawS2Instansi) addEduIfValid('S2', rawS2Instansi, rawS2Tahun);
      if (rawS3Instansi) addEduIfValid('S3', rawS3Instansi, rawS3Tahun);
      if (rawEduInstitution) addEduIfValid(rawEduLevel || 'S1', rawEduInstitution, rawEduYear, rawEduCertNum, rawEduMajor);
      if (rawNonformalInstansi) addEduIfValid('Pendidikan Nonformal', rawNonformalInstansi, rawNonformalTahun, undefined, rawNonformalNama);

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
