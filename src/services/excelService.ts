import * as XLSX from 'xlsx';
import { Employee, EmployeeAssignment, ExcelImportPreview } from '../types';
import { store } from './storageStore';
import { masterDataService } from './masterDataService';
import { employeeService } from './employeeService';
import { assignmentService } from './assignmentService';
import { auditService } from './auditService';

export const excelService = {
  // Generate downloadable sample Excel template
  generateTemplate(): void {
    const templateData = [
      {
        'Nama Lengkap': 'Ahmad Fauzi, S.Pd.',
        'NIK': '3201012345670001',
        'NIP': '198809152015011003',
        'Jenis Kelamin': 'Laki-laki',
        'No HP': '085712345678',
        'Email': 'ahmad.fauzi@alquraniyyah.sch.id',
        'Status Kepegawaian': 'Tetap',
        'Tanggal Masuk': '2019-08-01',
        'Unit Penugasan': 'SMP IT Al-Qur\'aniyyah',
        'Jabatan': 'Guru',
        'Tugas': 'Guru IPS Kelas VII',
        'Penugasan Utama (Ya/Tidak)': 'Ya'
      },
      {
        'Nama Lengkap': 'Ahmad Fauzi, S.Pd.',
        'NIK': '3201012345670001',
        'NIP': '198809152015011003',
        'Jenis Kelamin': 'Laki-laki',
        'No HP': '085712345678',
        'Email': 'ahmad.fauzi@alquraniyyah.sch.id',
        'Status Kepegawaian': 'Tetap',
        'Tanggal Masuk': '2019-08-01',
        'Unit Penugasan': 'SMP IT Al-Qur\'aniyyah',
        'Jabatan': 'Wali Kelas',
        'Tugas': 'Wali Kelas VII-A',
        'Penugasan Utama (Ya/Tidak)': 'Tidak'
      },
      {
        'Nama Lengkap': 'Ahmad Fauzi, S.Pd.',
        'NIK': '3201012345670001',
        'NIP': '198809152015011003',
        'Jenis Kelamin': 'Laki-laki',
        'No HP': '085712345678',
        'Email': 'ahmad.fauzi@alquraniyyah.sch.id',
        'Status Kepegawaian': 'Tetap',
        'Tanggal Masuk': '2019-08-01',
        'Unit Penugasan': 'SMA IT Al-Qur\'aniyyah',
        'Jabatan': 'Guru',
        'Tugas': 'Guru IPS Kelas X',
        'Penugasan Utama (Ya/Tidak)': 'Tidak'
      },
      {
        'Nama Lengkap': 'Ahmad Fauzi, S.Pd.',
        'NIK': '3201012345670001',
        'NIP': '198809152015011003',
        'Jenis Kelamin': 'Laki-laki',
        'No HP': '085712345678',
        'Email': 'ahmad.fauzi@alquraniyyah.sch.id',
        'Status Kepegawaian': 'Tetap',
        'Tanggal Masuk': '2019-08-01',
        'Unit Penugasan': 'Yayasan',
        'Jabatan': 'Koordinator',
        'Tugas': 'Koordinator Rapim',
        'Penugasan Utama (Ya/Tidak)': 'Tidak'
      },
      {
        'Nama Lengkap': 'Ustadzah Fatimah Zahra, S.Ag.',
        'NIK': '3201013456780001',
        'NIP': '199003202018012004',
        'Jenis Kelamin': 'Perempuan',
        'No HP': '081398765432',
        'Email': 'fatimah.zahra@alquraniyyah.sch.id',
        'Status Kepegawaian': 'Tetap',
        'Tanggal Masuk': '2018-01-15',
        'Unit Penugasan': 'HALQ',
        'Jabatan': 'Pembina',
        'Tugas': 'Pembina Halaqah Tahfidz',
        'Penugasan Utama (Ya/Tidak)': 'Ya'
      }
    ];

    const worksheet = XLSX.utils.json_to_sheet(templateData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Data Import Karyawan');

    // Auto width
    const colWidths = [
      { wch: 28 }, // Nama
      { wch: 20 }, // NIK
      { wch: 22 }, // NIP
      { wch: 15 }, // JK
      { wch: 16 }, // HP
      { wch: 30 }, // Email
      { wch: 18 }, // Status
      { wch: 15 }, // Tgl Masuk
      { wch: 25 }, // Unit
      { wch: 18 }, // Jabatan
      { wch: 25 }, // Tugas
      { wch: 25 }  // Utama
    ];
    worksheet['!cols'] = colWidths;

    XLSX.writeFile(workbook, 'Template_Import_Karyawan_SIMKA.xlsx');
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

  // Process & Group rows to handle 1 EMPLOYEE = MULTIPLE ASSIGNMENTS
  async processAndValidate(
    rawRows: any[],
    columnMapping: Record<string, string>
  ): Promise<ExcelImportPreview> {
    const existingEmployees = store.getEmployees();
    const existingAssignments = store.getAssignments();
    const units = await masterDataService.getUnits();
    const positions = await masterDataService.getPositions();
    const tasks = await masterDataService.getTasks();

    const errors: { row: number; message: string; data: any }[] = [];
    const groupedMap = new Map<string, {
      employee: Partial<Employee>;
      assignments: Partial<EmployeeAssignment>[];
      is_existing: boolean;
    }>();

    let totalAssignmentsCount = 0;
    let duplicateAssignmentsCount = 0;

    for (let i = 0; i < rawRows.length; i++) {
      const row = rawRows[i];
      const rowNumber = i + 2; // considering header is row 1

      // Extract values according to mapped columns
      const rawName = String(row[columnMapping.nama] || '').trim();
      const rawNik = String(row[columnMapping.nik] || '').trim();
      const rawNip = String(row[columnMapping.nip] || '').trim();
      const rawGender = String(row[columnMapping.jenis_kelamin] || '').trim();
      const rawPhone = String(row[columnMapping.no_hp] || '').trim();
      const rawEmail = String(row[columnMapping.email] || '').trim();
      const rawStatus = String(row[columnMapping.status_kepegawaian] || 'Tetap').trim();
      const rawJoinDate = String(row[columnMapping.tanggal_masuk] || new Date().toISOString().split('T')[0]).trim();

      const rawUnit = String(row[columnMapping.unit] || '').trim();
      const rawPosition = String(row[columnMapping.jabatan] || '').trim();
      const rawTask = String(row[columnMapping.tugas] || '').trim();
      const rawIsPrimary = String(row[columnMapping.is_primary] || '').toLowerCase();

      // Basic validation
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
        // Auto create unit or default to first
        matchedUnit = units[0];
      }

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

      // Check if employee already exists in DB or in our current grouping map
      let groupKey = rawNik;
      let existingInDb = existingEmployees.find(e => e.nik === rawNik);

      if (!groupedMap.has(groupKey)) {
        groupedMap.set(groupKey, {
          employee: {
            id: existingInDb ? existingInDb.id : undefined,
            employee_number: existingInDb ? existingInDb.employee_number : undefined,
            nik: rawNik,
            nip: rawNip || (existingInDb?.nip || ''),
            full_name: rawName,
            gender: (rawGender.toLowerCase().startsWith('p') ? 'Perempuan' : 'Laki-laki'),
            phone: rawPhone || (existingInDb?.phone || ''),
            email: rawEmail || (existingInDb?.email || ''),
            employment_status: (['Tetap', 'Kontrak', 'Honorer', 'Magang', 'Freelance'].includes(rawStatus) ? rawStatus : 'Tetap') as any,
            join_date: rawJoinDate || (existingInDb?.join_date || new Date().toISOString().split('T')[0]),
            is_active: true
          },
          assignments: [],
          is_existing: Boolean(existingInDb)
        });
      }

      const group = groupedMap.get(groupKey)!;

      // Prepare Assignment
      if (matchedUnit && matchedPosition) {
        const isPrimaryBool = rawIsPrimary === 'ya' || rawIsPrimary === 'yes' || rawIsPrimary === 'true' || rawIsPrimary === '1' || group.assignments.length === 0;

        // Check for duplicate assignment within this employee (in DB or current import file)
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
          // Skip redundant identical assignment
          continue;
        }

        const assignment: Partial<EmployeeAssignment> = {
          unit_id: matchedUnit.id,
          unit_name: matchedUnit.name,
          position_id: matchedPosition.id,
          position_name: matchedPosition.name,
          task_id: matchedTask?.id || null,
          task_name: rawTask || matchedTask?.name || matchedPosition.name,
          custom_task_name: !matchedTask ? rawTask : undefined,
          is_primary: isPrimaryBool,
          status: 'Aktif',
          start_date: rawJoinDate || new Date().toISOString().split('T')[0]
        };

        // If primary, ensure previous ones are not marked primary
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
    }

    await auditService.log('IMPORT_EXCEL', 'employees', undefined, {
      employeesCount: importedEmployees,
      assignmentsCount: importedAssignments
    });

    return { importedEmployees, importedAssignments };
  }
};
