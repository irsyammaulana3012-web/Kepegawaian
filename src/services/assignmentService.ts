import { EmployeeAssignment } from '../types';
import { store } from './storageStore';
import { auditService } from './auditService';

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
      const unit = units.find(u => u.id === a.unit_id);
      const pos = positions.find(p => p.id === a.position_id);
      const tsk = tasks.find(t => t.id === a.task_id);
      const dept = departments.find(d => d.id === a.department_id);

      return {
        ...a,
        employee_name: emp?.full_name || 'Tidak Diketahui',
        employee_number: emp?.employee_number || '-',
        unit_name: unit?.name || '-',
        position_name: pos?.name || '-',
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
