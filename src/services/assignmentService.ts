import { EmployeeAssignment, Unit, Position } from '../types';
import { store } from './storageStore';
import { auditService } from './auditService';
import { initialUnits, initialPositions } from '../lib/mockData';

export function resolveUnitName(a: Partial<EmployeeAssignment>, units: Unit[]): string {
  if (a.unit_name && a.unit_name !== '-') return a.unit_name;
  
  // 1. Match by id in current units and initialUnits
  const unitById = units.find(u => u.id === a.unit_id) || initialUnits.find(u => u.id === a.unit_id);
  if (unitById?.name) return unitById.name;

  // 2. Match by code
  if (a.unit_id) {
    const unitByCode = units.find(u => u.code?.toLowerCase() === a.unit_id?.toLowerCase()) ||
                       initialUnits.find(u => u.code?.toLowerCase() === a.unit_id?.toLowerCase());
    if (unitByCode?.name) return unitByCode.name;
  }

  // 3. Match from task_description
  if (a.task_description) {
    const desc = a.task_description.toLowerCase();
    const matched = initialUnits.find(u => desc.includes(u.name.toLowerCase()));
    if (matched?.name) return matched.name;
    if (desc.includes('smp')) return 'SMP IT';
    if (desc.includes('sma')) return 'SMA IT';
    if (desc.includes('sd')) return 'SD IT';
    if (desc.includes('tk')) return 'TK IT';
    if (desc.includes('pesantren') || desc.includes('ponpes')) return 'Pondok Pesantren';
    if (desc.includes('yayasan')) return 'Yayasan';
    if (desc.includes('tahfidz')) return 'Lembaga Tahfidz';
    if (desc.includes('lpbq')) return 'LPBQ';
    if (desc.includes('tpa')) return 'TPA';
  }

  return '-';
}

export function resolvePositionName(a: Partial<EmployeeAssignment>, positions: Position[]): string {
  if (a.position_name && a.position_name !== '-') return a.position_name;

  // 1. Match by id
  const posById = positions.find(p => p.id === a.position_id) || initialPositions.find(p => p.id === a.position_id);
  if (posById?.name) return posById.name;

  // 2. Match by code
  if (a.position_id) {
    const posByCode = positions.find(p => p.code?.toLowerCase() === a.position_id?.toLowerCase()) ||
                       initialPositions.find(p => p.code?.toLowerCase() === a.position_id?.toLowerCase());
    if (posByCode?.name) return posByCode.name;
  }

  // 3. Match from custom_task_name
  if (a.custom_task_name) {
    const task = a.custom_task_name.toLowerCase();
    const matched = initialPositions.find(p => task.includes(p.name.toLowerCase()));
    if (matched?.name) return matched.name;

    if (task.includes('wali')) return 'Wali Kelas';
    if (task.includes('guru') || task.includes('pengajar')) return 'Guru';
    if (task.includes('pengasuh') || task.includes('pengasuhan')) return 'Pengasuh';
    if (task.includes('operator')) return 'Operator';
    if (task.includes('bendahara') || task.includes('keuangan')) return 'Bendahara';
    if (task.includes('tata usaha') || task.includes('tu')) return 'Tata Usaha';
    if (task.includes('kepala sekolah')) return 'Kepala Sekolah';
    if (task.includes('pimpinan') || task.includes('dewan')) return 'Pimpinan';
    if (task.includes('staff')) return 'Staff';
  }

  return '-';
}

export const assignmentService = {
  async getAssignments(): Promise<EmployeeAssignment[]> {
    const assignments = store.getAssignments();
    const employees = store.getEmployees();
    const units = store.getUnits();
    const positions = store.getPositions();
    const tasks = store.getTasks();
    const departments = store.getDepartments();

    return assignments.map(a => {
      const emp = employees.find(e => e.id === a.employee_id);
      const unitName = resolveUnitName(a, units);
      const positionName = resolvePositionName(a, positions);
      const tsk = tasks.find(t => t.id === a.task_id);
      const dept = departments.find(d => d.id === a.department_id);

      return {
        ...a,
        employee_name: a.employee_name || emp?.full_name || 'Tidak Diketahui',
        employee_number: a.employee_number || emp?.employee_number || '-',
        unit_name: unitName,
        position_name: positionName,
        task_name: a.custom_task_name || tsk?.name || '-',
        department_name: dept?.name || '-'
      };
    });
  },

  async getAssignmentsByEmployee(employeeId: string): Promise<EmployeeAssignment[]> {
    const all = await this.getAssignments();
    return all.filter(a => a.employee_id === employeeId);
  },

  async getAssignmentById(id: string): Promise<EmployeeAssignment | null> {
    const all = await this.getAssignments();
    return all.find(a => a.id === id) || null;
  },

  async saveAssignment(assignment: Partial<EmployeeAssignment>): Promise<EmployeeAssignment> {
    const assignments = store.getAssignments();
    const employees = store.getEmployees();
    const emp = employees.find(e => e.id === assignment.employee_id);

    if (!assignment.employee_id) {
      throw new Error('ID Karyawan wajib diisi.');
    }
    if (!assignment.unit_id) {
      throw new Error('Unit penugasan wajib dipilih.');
    }
    if (!assignment.position_id) {
      throw new Error('Jabatan wajib dipilih.');
    }
    if (!assignment.start_date) {
      throw new Error('Tanggal mulai penugasan wajib diisi.');
    }
    if (assignment.start_date && assignment.end_date) {
      if (new Date(assignment.end_date) < new Date(assignment.start_date)) {
        throw new Error('Tanggal selesai tidak boleh sebelum tanggal mulai.');
      }
    }

    // Check for duplicate identical active assignment
    const isDuplicate = assignments.some(a => 
      a.id !== assignment.id &&
      a.employee_id === assignment.employee_id &&
      a.unit_id === assignment.unit_id &&
      a.position_id === assignment.position_id &&
      a.task_id === assignment.task_id &&
      a.status === 'Aktif' &&
      (assignment.status === 'Aktif' || !assignment.status)
    );

    if (isDuplicate) {
      throw new Error('Penugasan aktif dengan Unit, Jabatan, dan Tugas yang sama persis sudah ada untuk karyawan ini.');
    }

    let saved: EmployeeAssignment;

    // If this assignment is set to is_primary = true, reset other assignments for this employee
    if (assignment.is_primary) {
      assignments.forEach(a => {
        if (a.employee_id === assignment.employee_id && a.id !== assignment.id) {
          a.is_primary = false;
        }
      });
    }

    if (assignment.id) {
      const index = assignments.findIndex(a => a.id === assignment.id);
      if (index === -1) throw new Error('Penugasan tidak ditemukan.');
      saved = {
        ...assignments[index],
        ...assignment,
        updated_at: new Date().toISOString()
      } as EmployeeAssignment;
      assignments[index] = saved;

      await auditService.log('UPDATE_ASSIGNMENT', 'assignments', saved.id, {
        employee: emp?.full_name,
        unit: saved.unit_id,
        position: saved.position_id,
        is_primary: saved.is_primary,
        status: saved.status
      });
    } else {
      // Check if employee has any existing assignment; if not, make this primary
      const existingForEmp = assignments.filter(a => a.employee_id === assignment.employee_id && a.status === 'Aktif');
      const shouldBePrimary = assignment.is_primary !== undefined ? assignment.is_primary : (existingForEmp.length === 0);

      saved = {
        id: `asg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        employee_id: assignment.employee_id,
        unit_id: assignment.unit_id,
        department_id: assignment.department_id || null,
        position_id: assignment.position_id,
        task_id: assignment.task_id || null,
        custom_task_name: assignment.custom_task_name || '',
        task_description: assignment.task_description || '',
        sk_number: assignment.sk_number || '',
        sk_date: assignment.sk_date || '',
        start_date: assignment.start_date,
        end_date: assignment.end_date || null,
        is_primary: shouldBePrimary,
        status: assignment.status || 'Aktif',
        notes: assignment.notes || '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      assignments.push(saved);

      await auditService.log('CREATE_ASSIGNMENT', 'assignments', saved.id, {
        employee: emp?.full_name,
        unit: saved.unit_id,
        position: saved.position_id,
        is_primary: saved.is_primary,
        status: saved.status
      });
    }

    const units = store.getUnits();
    const positions = store.getPositions();
    const resolvedUnit = resolveUnitName(saved, units);
    const resolvedPos = resolvePositionName(saved, positions);

    saved.unit_name = resolvedUnit !== '-' ? resolvedUnit : (saved.unit_name || '-');
    saved.position_name = resolvedPos !== '-' ? resolvedPos : (saved.position_name || '-');
    saved.employee_name = emp?.full_name || saved.employee_name || 'Tidak Diketahui';
    saved.employee_number = emp?.employee_number || saved.employee_number || '-';

    store.setAssignments(assignments);
    return saved;
  },

  async deleteAssignment(id: string): Promise<void> {
    const assignments = store.getAssignments();
    const target = assignments.find(a => a.id === id);
    if (!target) throw new Error('Penugasan tidak ditemukan.');

    const filtered = assignments.filter(a => a.id !== id);
    store.setAssignments(filtered);

    await auditService.log('DELETE_ASSIGNMENT', 'assignments', id, {
      employee_id: target.employee_id,
      unit_id: target.unit_id,
      position_id: target.position_id
    });
  },

  async setPrimary(id: string): Promise<void> {
    const assignments = store.getAssignments();
    const target = assignments.find(a => a.id === id);
    if (!target) throw new Error('Penugasan tidak ditemukan.');

    assignments.forEach(a => {
      if (a.employee_id === target.employee_id) {
        a.is_primary = (a.id === id);
      }
    });
    store.setAssignments(assignments);

    await auditService.log('SET_PRIMARY_ASSIGNMENT', 'assignments', id, {
      employee_id: target.employee_id
    });
  }
};
