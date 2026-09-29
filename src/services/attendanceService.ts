import { EmployeeAttendance, AttendanceStatus } from '../types';
import { store } from './storageStore';
import { auditService } from './auditService';

export const attendanceService = {
  async getAttendance(date?: string, employeeId?: string): Promise<EmployeeAttendance[]> {
    const list = store.getAttendance();
    const employees = store.getEmployees();

    let enriched = list.map(a => {
      const emp = employees.find(e => e.id === a.employee_id);
      return {
        ...a,
        employee_name: emp?.full_name || 'Tidak Diketahui',
        employee_number: emp?.employee_number || '-'
      };
    });

    if (date) {
      enriched = enriched.filter(a => a.date === date);
    }
    if (employeeId) {
      enriched = enriched.filter(a => a.employee_id === employeeId);
    }

    return enriched.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  },

  async recordAttendance(
    employeeId: string,
    date: string,
    status: AttendanceStatus,
    checkIn?: string,
    checkOut?: string,
    notes?: string
  ): Promise<EmployeeAttendance> {
    const list = store.getAttendance();
    const existingIndex = list.findIndex(a => a.employee_id === employeeId && a.date === date);

    let saved: EmployeeAttendance;
    if (existingIndex !== -1) {
      saved = {
        ...list[existingIndex],
        status,
        check_in: checkIn || list[existingIndex].check_in,
        check_out: checkOut || list[existingIndex].check_out,
        notes: notes || list[existingIndex].notes
      };
      list[existingIndex] = saved;
    } else {
      saved = {
        id: `att-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        employee_id: employeeId,
        date,
        check_in: checkIn || '07:30',
        check_out: checkOut,
        status,
        notes: notes || '',
        created_at: new Date().toISOString()
      };
      list.push(saved);
    }

    store.setAttendance(list);
    await auditService.log('RECORD_ATTENDANCE', 'attendance', saved.id, { employee_id: employeeId, status, date });
    return saved;
  },

  async recordBulkAttendance(
    employeeIds: string[],
    date: string,
    status: AttendanceStatus = 'Hadir',
    eventName?: string
  ): Promise<number> {
    const list = store.getAttendance();
    let count = 0;

    for (const empId of employeeIds) {
      const existingIndex = list.findIndex(a => a.employee_id === empId && a.date === date);
      const noteText = eventName ? `Kegiatan: ${eventName}` : 'Presensi Otomatis';

      if (existingIndex !== -1) {
        list[existingIndex] = {
          ...list[existingIndex],
          status,
          notes: noteText
        };
      } else {
        list.push({
          id: `att-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          employee_id: empId,
          date,
          check_in: '08:00',
          status,
          notes: noteText,
          created_at: new Date().toISOString()
        });
      }
      count++;
    }

    store.setAttendance(list);
    await auditService.log('RECORD_BULK_ATTENDANCE', 'attendance', undefined, { count, date, eventName });
    return count;
  },

  async deleteAttendance(id: string): Promise<void> {
    const list = store.getAttendance().filter(a => a.id !== id);
    store.setAttendance(list);
    await auditService.log('DELETE_ATTENDANCE', 'attendance', id);
  }
};
