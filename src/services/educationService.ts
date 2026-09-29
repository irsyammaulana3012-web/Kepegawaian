import { EmployeeEducation, EmployeePositionHistory } from '../types';
import { store } from './storageStore';
import { auditService } from './auditService';

export const educationService = {
  async getAllEducation(filters: { search?: string; level?: string; unit_id?: string } = {}): Promise<EmployeeEducation[]> {
    const all = store.getEducation();
    const employees = store.getEmployees();
    const assignments = store.getAssignments();
    const units = store.getUnits();

    let enriched = all.map(edu => {
      const emp = employees.find(e => e.id === edu.employee_id);
      const empAssignments = assignments.filter(a => a.employee_id === edu.employee_id && a.status === 'Aktif');
      const unitNames = Array.from(
        new Set(
          empAssignments.map(a => units.find(u => u.id === a.unit_id)?.name).filter(Boolean)
        )
      ) as string[];

      return {
        ...edu,
        employee_name: emp?.full_name || 'Tidak Diketahui',
        employee_number: emp?.employee_number || '',
        employee_nik: emp?.nik || '',
        units_list: unitNames,
        employment_status: emp?.employment_status || ''
      };
    });

    if (filters.search) {
      const q = filters.search.toLowerCase();
      enriched = enriched.filter(e =>
        (e.employee_name && e.employee_name.toLowerCase().includes(q)) ||
        (e.institution_name && e.institution_name.toLowerCase().includes(q)) ||
        (e.major && e.major.toLowerCase().includes(q)) ||
        (e.employee_nik && e.employee_nik.includes(q)) ||
        (e.employee_number && e.employee_number.toLowerCase().includes(q))
      );
    }

    if (filters.level && filters.level !== 'all') {
      enriched = enriched.filter(e => e.level === filters.level);
    }

    if (filters.unit_id && filters.unit_id !== 'all') {
      enriched = enriched.filter(e => {
        const empAssignments = assignments.filter(a => a.employee_id === e.employee_id && a.status === 'Aktif');
        return empAssignments.some(a => a.unit_id === filters.unit_id);
      });
    }

    return enriched.sort((a, b) => (b.end_year || 0) - (a.end_year || 0));
  },

  async getEducationByEmployee(employeeId: string): Promise<EmployeeEducation[]> {
    const all = store.getEducation();
    return all.filter(e => e.employee_id === employeeId).sort((a, b) => (b.end_year || 0) - (a.end_year || 0));
  },

  async saveEducation(education: Partial<EmployeeEducation>): Promise<EmployeeEducation> {
    const list = store.getEducation();
    let saved: EmployeeEducation;

    if (education.id) {
      const index = list.findIndex(e => e.id === education.id);
      if (index === -1) throw new Error('Riwayat pendidikan tidak ditemukan');
      saved = { ...list[index], ...education, id: education.id } as EmployeeEducation;
      list[index] = saved;
      await auditService.log('UPDATE', 'education', saved.id, { institution: saved.institution_name, level: saved.level });
    } else {
      saved = {
        id: `edu-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        employee_id: education.employee_id || '',
        level: education.level || 'S1',
        institution_name: education.institution_name || '',
        major: education.major || '',
        start_year: education.start_year ? Number(education.start_year) : undefined,
        end_year: education.end_year ? Number(education.end_year) : undefined,
        certificate_number: education.certificate_number || '',
        notes: education.notes || '',
        created_at: new Date().toISOString()
      };
      list.push(saved);
      await auditService.log('CREATE', 'education', saved.id, { institution: saved.institution_name, level: saved.level });
    }

    store.setEducation(list);
    return saved;
  },

  async deleteEducation(id: string): Promise<void> {
    const list = store.getEducation().filter(e => e.id !== id);
    store.setEducation(list);
    await auditService.log('DELETE', 'education', id);
  },

  // Position History / Timeline
  async getHistoryByEmployee(employeeId: string): Promise<EmployeePositionHistory[]> {
    const list = store.getHistory();
    return list.filter(h => h.employee_id === employeeId).sort((a, b) => {
      const dateA = a.start_date ? new Date(a.start_date).getTime() : 0;
      const dateB = b.start_date ? new Date(b.start_date).getTime() : 0;
      return dateB - dateA;
    });
  },

  async saveHistory(history: Partial<EmployeePositionHistory>): Promise<EmployeePositionHistory> {
    const list = store.getHistory();
    let saved: EmployeePositionHistory;

    if (history.id) {
      const index = list.findIndex(h => h.id === history.id);
      if (index === -1) throw new Error('Riwayat jabatan tidak ditemukan');
      saved = { ...list[index], ...history, id: history.id } as EmployeePositionHistory;
      list[index] = saved;
      await auditService.log('UPDATE', 'history', saved.id);
    } else {
      saved = {
        id: `his-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        employee_id: history.employee_id || '',
        period_label: history.period_label || '',
        unit_name: history.unit_name || '',
        position_name: history.position_name || '',
        task_name: history.task_name || '',
        start_date: history.start_date || '',
        end_date: history.end_date || '',
        sk_number: history.sk_number || '',
        notes: history.notes || '',
        created_at: new Date().toISOString()
      };
      list.push(saved);
      await auditService.log('CREATE', 'history', saved.id);
    }

    store.setHistory(list);
    return saved;
  },

  async deleteHistory(id: string): Promise<void> {
    const list = store.getHistory().filter(h => h.id !== id);
    store.setHistory(list);
    await auditService.log('DELETE', 'history', id);
  }
};
