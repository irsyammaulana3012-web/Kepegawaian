import { Employee, DashboardStats, EmployeeAssignment } from '../types';
import { store } from './storageStore';
import { auditService } from './auditService';
import { assignmentService } from './assignmentService';

export interface EmployeeFilterOptions {
  search?: string;
  unit_id?: string;
  unit_ids?: string[]; // For Multi-Unit intersection filter!
  position_id?: string;
  task_id?: string;
  employment_status?: string;
  gender?: string;
  is_active?: boolean;
  page?: number;
  limit?: number;
}

export const employeeService = {
  // Generate next automatic ID: YPA-0001, YPA-0002, etc.
  async getNextEmployeeNumber(): Promise<string> {
    const employees = store.getEmployees();
    let maxNum = 0;
    employees.forEach(e => {
      const match = e.employee_number.match(/YPA-(\d+)/);
      if (match) {
        const num = parseInt(match[1], 10);
        if (num > maxNum) maxNum = num;
      }
    });
    const next = maxNum + 1;
    return `YPA-${String(next).padStart(4, '0')}`;
  },

  // Calculate completeness percentage (0 - 100%)
  calculateCompleteness(emp: Employee, assignments: EmployeeAssignment[], docsCount: number): { percentage: number; missing: string[] } {
    const missing: string[] = [];
    let score = 0;
    const totalChecks = 8;

    // 1. Personal Basic
    if (emp.full_name && emp.gender && emp.birth_date && emp.birth_place) score += 1;
    else missing.push('Data Kelahiran & Nama Lengkap');

    // 2. Identity
    if (emp.nik && emp.nik.length === 16 && emp.no_kk) score += 1;
    else missing.push('NIK (16 Digit) / No KK');

    // 3. Address
    if (emp.address && emp.city && emp.province) score += 1;
    else missing.push('Alamat Lengkap');

    // 4. Contact
    if (emp.phone || emp.whatsapp || emp.email) score += 1;
    else missing.push('Nomor Kontak / Email');

    // 5. Employment Basic
    if (emp.employment_status && emp.join_date) score += 1;
    else missing.push('Status & Tanggal Masuk');

    // 6. SK Pengangkatan
    if (emp.appointment_sk_number || emp.appointment_sk_date) score += 1;
    else missing.push('SK Pengangkatan');

    // 7. Penugasan Aktif
    const activeAssignments = assignments.filter(a => a.employee_id === emp.id && a.status === 'Aktif');
    if (activeAssignments.length > 0) score += 1;
    else missing.push('Penugasan Aktif');

    // 8. Dokumen Uploaded
    if (docsCount > 0) score += 1;
    else missing.push('Dokumen / Berkas');

    const percentage = Math.round((score / totalChecks) * 100);
    return { percentage, missing };
  },

  async getEmployees(filters: EmployeeFilterOptions = {}): Promise<{ data: Employee[]; total: number; page: number; limit: number }> {
    const rawEmployees = store.getEmployees();
    const allAssignments = await assignmentService.getAssignments();
    const allDocs = store.getDocuments();
    const units = store.getUnits();
    const positions = store.getPositions();

    // Map rich computed fields for each employee
    let enriched = rawEmployees.map(emp => {
      const empAssignments = allAssignments.filter(a => a.employee_id === emp.id);
      const activeAssignments = empAssignments.filter(a => a.status === 'Aktif');
      const primaryAssignment = activeAssignments.find(a => a.is_primary) || activeAssignments[0] || empAssignments[0];
      const empDocs = allDocs.filter(d => d.employee_id === emp.id);
      
      const unitsList = Array.from(
        new Set(
          activeAssignments
            .map(a => units.find(u => u.id === a.unit_id)?.name)
            .filter(Boolean)
        )
      ) as string[];

      const positionsList = Array.from(
        new Set(
          activeAssignments
            .map(a => positions.find(p => p.id === a.position_id)?.name)
            .filter(Boolean)
        )
      ) as string[];

      const { percentage } = this.calculateCompleteness(emp, empAssignments, empDocs.length);

      return {
        ...emp,
        assignments: empAssignments,
        primary_assignment: primaryAssignment,
        assignment_count: activeAssignments.length,
        units_list: unitsList,
        positions_list: positionsList,
        data_completeness_pct: percentage
      };
    });

    // Apply Filters
    if (filters.search) {
      const q = filters.search.toLowerCase().trim();
      enriched = enriched.filter(e =>
        e.full_name.toLowerCase().includes(q) ||
        e.employee_number.toLowerCase().includes(q) ||
        e.nik.includes(q) ||
        (e.nip && e.nip.includes(q)) ||
        (e.phone && e.phone.includes(q)) ||
        (e.nickname && e.nickname.toLowerCase().includes(q))
      );
    }

    if (filters.is_active !== undefined) {
      enriched = enriched.filter(e => e.is_active === filters.is_active);
    }

    if (filters.gender) {
      enriched = enriched.filter(e => e.gender === filters.gender);
    }

    if (filters.employment_status) {
      enriched = enriched.filter(e => e.employment_status === filters.employment_status);
    }

    // Single Unit filter
    if (filters.unit_id) {
      enriched = enriched.filter(e =>
        e.assignments?.some(a => a.unit_id === filters.unit_id && a.status === 'Aktif')
      );
    }

    // Multi-Unit Intersection Filter (e.g. employee must have active assignments in ALL specified units: SMP IT + SMA IT)
    if (filters.unit_ids && filters.unit_ids.length > 0) {
      enriched = enriched.filter(e => {
        const empUnitIds = new Set(
          e.assignments?.filter(a => a.status === 'Aktif').map(a => a.unit_id) || []
        );
        return filters.unit_ids!.every(requiredUnitId => empUnitIds.has(requiredUnitId));
      });
    }

    if (filters.position_id) {
      enriched = enriched.filter(e =>
        e.assignments?.some(a => a.position_id === filters.position_id && a.status === 'Aktif')
      );
    }

    if (filters.task_id) {
      enriched = enriched.filter(e =>
        e.assignments?.some(a => a.task_id === filters.task_id && a.status === 'Aktif')
      );
    }

    const total = enriched.length;
    const page = filters.page || 1;
    const limit = filters.limit || 25;
    const offset = (page - 1) * limit;
    const paginated = enriched.slice(offset, offset + limit);

    return {
      data: paginated,
      total,
      page,
      limit
    };
  },

  async getEmployeeById(id: string): Promise<Employee | null> {
    const rawEmployees = store.getEmployees();
    const emp = rawEmployees.find(e => e.id === id);
    if (!emp) return null;

    const allAssignments = await assignmentService.getAssignmentsByEmployee(id);
    const activeAssignments = allAssignments.filter(a => a.status === 'Aktif');
    const primary = activeAssignments.find(a => a.is_primary) || activeAssignments[0] || allAssignments[0];
    const docs = store.getDocuments().filter(d => d.employee_id === id);
    const { percentage } = this.calculateCompleteness(emp, allAssignments, docs.length);

    return {
      ...emp,
      assignments: allAssignments,
      primary_assignment: primary,
      assignment_count: activeAssignments.length,
      data_completeness_pct: percentage
    };
  },

  async saveEmployee(
    employee: Partial<Employee>,
    initialAssignment?: Partial<EmployeeAssignment>
  ): Promise<Employee> {
    const employees = store.getEmployees();

    // Validation
    if (!employee.full_name?.trim()) {
      throw new Error('Nama lengkap karyawan wajib diisi.');
    }
    if (!employee.nik?.trim() || employee.nik.length !== 16 || !/^\d{16}$/.test(employee.nik)) {
      throw new Error('NIK harus berupa 16 digit angka yang valid.');
    }
    if (!employee.gender) {
      throw new Error('Jenis kelamin wajib dipilih.');
    }
    if (!employee.join_date) {
      throw new Error('Tanggal mulai bekerja wajib diisi.');
    }

    // Check NIK uniqueness
    const duplicateNik = employees.find(e => e.nik === employee.nik && e.id !== employee.id);
    if (duplicateNik) {
      throw new Error(`NIK ${employee.nik} sudah digunakan oleh karyawan ${duplicateNik.full_name} (${duplicateNik.employee_number}). NIK harus unik.`);
    }

    let saved: Employee;

    if (employee.id) {
      const index = employees.findIndex(e => e.id === employee.id);
      if (index === -1) throw new Error('Karyawan tidak ditemukan.');
      saved = {
        ...employees[index],
        ...employee,
        updated_at: new Date().toISOString()
      } as Employee;
      employees[index] = saved;

      await auditService.log('UPDATE', 'employees', saved.id, {
        name: saved.full_name,
        number: saved.employee_number
      });
    } else {
      const nextNumber = await this.getNextEmployeeNumber();
      saved = {
        id: `emp-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        employee_number: employee.employee_number || nextNumber,
        nik: employee.nik,
        nip: employee.nip || '',
        no_kk: employee.no_kk || '',
        full_name: employee.full_name.trim(),
        nickname: employee.nickname || '',
        photo_url: employee.photo_url || '',
        gender: employee.gender,
        birth_place: employee.birth_place || '',
        birth_date: employee.birth_date || '',
        religion: employee.religion || 'Islam',
        marital_status: employee.marital_status || 'Belum Menikah',
        address: employee.address || '',
        rt: employee.rt || '',
        rw: employee.rw || '',
        kelurahan: employee.kelurahan || '',
        kecamatan: employee.kecamatan || '',
        city: employee.city || '',
        province: employee.province || '',
        postal_code: employee.postal_code || '',
        phone: employee.phone || '',
        whatsapp: employee.whatsapp || '',
        email: employee.email || '',
        employment_status: employee.employment_status || 'Tetap',
        join_date: employee.join_date,
        appointment_date: employee.appointment_date || '',
        appointment_sk_number: employee.appointment_sk_number || '',
        appointment_sk_date: employee.appointment_sk_date || '',
        contract_end_date: employee.contract_end_date || '',
        is_active: employee.is_active !== undefined ? employee.is_active : true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      employees.push(saved);

      await auditService.log('CREATE', 'employees', saved.id, {
        name: saved.full_name,
        number: saved.employee_number
      });

      // If initial assignment provided, save it
      if (initialAssignment && initialAssignment.unit_id && initialAssignment.position_id) {
        await assignmentService.saveAssignment({
          ...initialAssignment,
          employee_id: saved.id,
          is_primary: true,
          status: 'Aktif',
          start_date: initialAssignment.start_date || saved.join_date
        });
      }
    }

    store.setEmployees(employees);
    return saved;
  },

  async toggleActiveStatus(id: string, isActive: boolean, reason?: string): Promise<void> {
    const employees = store.getEmployees();
    const index = employees.findIndex(e => e.id === id);
    if (index === -1) throw new Error('Karyawan tidak ditemukan.');

    employees[index].is_active = isActive;
    employees[index].inactive_reason = !isActive ? (reason || 'Dinonaktifkan oleh administrator') : undefined;
    employees[index].inactive_date = !isActive ? new Date().toISOString().split('T')[0] : undefined;
    employees[index].updated_at = new Date().toISOString();

    store.setEmployees(employees);

    await auditService.log(
      isActive ? 'ACTIVATE_EMPLOYEE' : 'DEACTIVATE_EMPLOYEE',
      'employees',
      id,
      { employee: employees[index].full_name, reason }
    );
  },

  async deleteEmployee(id: string): Promise<void> {
    const employees = store.getEmployees();
    const target = employees.find(e => e.id === id);
    if (!target) throw new Error('Karyawan tidak ditemukan.');

    // Cascade delete assignments, education, etc.
    store.setEmployees(employees.filter(e => e.id !== id));
    store.setAssignments(store.getAssignments().filter(a => a.employee_id !== id));
    store.setEducation(store.getEducation().filter(ed => ed.employee_id !== id));
    store.setHistory(store.getHistory().filter(h => h.employee_id !== id));
    store.setDocuments(store.getDocuments().filter(d => d.employee_id !== id));
    store.setTraining(store.getTraining().filter(t => t.employee_id !== id));
    store.setAttendance(store.getAttendance().filter(at => at.employee_id !== id));
    store.setLeave(store.getLeave().filter(l => l.employee_id !== id));
    store.setNotes(store.getNotes().filter(n => n.employee_id !== id));

    await auditService.log('DELETE', 'employees', id, {
      name: target.full_name,
      number: target.employee_number
    });
  },

  // Calculate rich Dashboard Statistics
  async getDashboardStats(): Promise<DashboardStats> {
    const employees = store.getEmployees();
    const assignments = await assignmentService.getAssignments();
    const units = store.getUnits();
    const positions = store.getPositions();
    const education = store.getEducation();
    const docs = store.getDocuments();

    const activeEmployees = employees.filter(e => e.is_active);
    const inactiveEmployees = employees.filter(e => !e.is_active);

    const activeAssignments = assignments.filter(a => a.status === 'Aktif');

    // Count Teachers & Staff based on position category or assignments
    const teacherPositions = new Set(positions.filter(p => p.category === 'Pendidik' || p.code === 'GUR' || p.code === 'WLK').map(p => p.id));
    const teachersSet = new Set<string>();
    const staffSet = new Set<string>();

    activeAssignments.forEach(a => {
      if (teacherPositions.has(a.position_id)) {
        teachersSet.add(a.employee_id);
      } else {
        staffSet.add(a.employee_id);
      }
    });

    const permanentCount = activeEmployees.filter(e => e.employment_status === 'Tetap').length;
    const contractCount = activeEmployees.filter(e => e.employment_status === 'Kontrak').length;
    const honoraryCount = activeEmployees.filter(e => e.employment_status === 'Honorer').length;

    // Multi-Assignment and Multi-Unit Calculations
    const empActiveAssignmentsMap: Record<string, Set<string>> = {};
    const empActiveUnitsMap: Record<string, Set<string>> = {};

    activeAssignments.forEach(a => {
      if (!empActiveAssignmentsMap[a.employee_id]) empActiveAssignmentsMap[a.employee_id] = new Set();
      empActiveAssignmentsMap[a.employee_id].add(a.id);

      if (!empActiveUnitsMap[a.employee_id]) empActiveUnitsMap[a.employee_id] = new Set();
      empActiveUnitsMap[a.employee_id].add(a.unit_id);
    });

    let multiAssignmentCount = 0;
    let multiUnitCount = 0;

    Object.keys(empActiveAssignmentsMap).forEach(empId => {
      if (empActiveAssignmentsMap[empId].size > 1) multiAssignmentCount++;
    });

    Object.keys(empActiveUnitsMap).forEach(empId => {
      if (empActiveUnitsMap[empId].size > 1) multiUnitCount++;
    });

    // Assignments per unit
    const assignmentsPerUnit = units.map(u => ({
      unit_id: u.id,
      unit_name: u.name,
      count: activeAssignments.filter(a => a.unit_id === u.id).length
    })).filter(u => u.count > 0 || u.unit_name === 'Yayasan');

    // Assignments per position
    const assignmentsPerPosition = positions.map(p => ({
      position_id: p.id,
      position_name: p.name,
      count: activeAssignments.filter(a => a.position_id === p.id).length
    })).filter(p => p.count > 0);

    // Gender
    const maleCount = activeEmployees.filter(e => e.gender === 'Laki-laki').length;
    const femaleCount = activeEmployees.filter(e => e.gender === 'Perempuan').length;

    // Employment Status distribution
    const statusDist: Record<string, number> = {};
    activeEmployees.forEach(e => {
      statusDist[e.employment_status] = (statusDist[e.employment_status] || 0) + 1;
    });

    // Education distribution
    const eduDist: Record<string, number> = {};
    education.forEach(ed => {
      eduDist[ed.level] = (eduDist[ed.level] || 0) + 1;
    });

    // Incomplete Data list
    const incompleteList: { id: string; name: string; number: string; percentage: number; missing: string[] }[] = [];
    activeEmployees.forEach(emp => {
      const empAssignments = assignments.filter(a => a.employee_id === emp.id);
      const empDocs = docs.filter(d => d.employee_id === emp.id);
      const { percentage, missing } = this.calculateCompleteness(emp, empAssignments, empDocs.length);
      if (percentage < 100) {
        incompleteList.push({
          id: emp.id,
          name: emp.full_name,
          number: emp.employee_number,
          percentage,
          missing
        });
      }
    });

    // Expiring contracts (<= 90 days)
    const today = new Date();
    const expiringContracts: { id: string; employee_id: string; name: string; number: string; end_date: string; days_left: number }[] = [];

    activeEmployees.forEach(emp => {
      if (emp.employment_status === 'Kontrak' && emp.contract_end_date) {
        const endDate = new Date(emp.contract_end_date);
        const diffTime = endDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays >= -10 && diffDays <= 90) {
          expiringContracts.push({
            id: `exp-${emp.id}`,
            employee_id: emp.id,
            name: emp.full_name,
            number: emp.employee_number,
            end_date: emp.contract_end_date,
            days_left: diffDays
          });
        }
      }
    });

    return {
      total_employees: employees.length,
      active_employees: activeEmployees.length,
      inactive_employees: inactiveEmployees.length,
      total_teachers: teachersSet.size,
      total_staff: staffSet.size,
      permanent_employees: permanentCount,
      contract_employees: contractCount,
      honorary_employees: honoraryCount,
      total_active_assignments: activeAssignments.length,
      multi_assignment_employees: multiAssignmentCount,
      multi_unit_employees: multiUnitCount,
      assignments_per_unit: assignmentsPerUnit,
      assignments_per_position: assignmentsPerPosition,
      gender_distribution: { male: maleCount, female: femaleCount },
      employment_status_distribution: Object.entries(statusDist).map(([status, count]) => ({ status, count })),
      education_distribution: Object.entries(eduDist).map(([level, count]) => ({ level, count })),
      incomplete_data_employees: incompleteList.sort((a, b) => a.percentage - b.percentage),
      expiring_contracts: expiringContracts.sort((a, b) => a.days_left - b.days_left)
    };
  }
};
