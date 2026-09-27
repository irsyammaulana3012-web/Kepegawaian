import { EmployeeLeave, LeaveStatus } from '../types';
import { store } from './storageStore';
import { auditService } from './auditService';

export const leaveService = {
  async getLeaveRequests(employeeId?: string): Promise<EmployeeLeave[]> {
    const list = store.getLeave();
    const employees = store.getEmployees();

    let enriched = list.map(l => {
      const emp = employees.find(e => e.id === l.employee_id);
      return {
        ...l,
        employee_name: emp?.full_name || 'Tidak Diketahui',
        employee_number: emp?.employee_number || '-'
      };
    });

    if (employeeId) {
      enriched = enriched.filter(l => l.employee_id === employeeId);
    }

    return enriched.sort((a, b) => new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime());
  },

  async applyLeave(leave: Partial<EmployeeLeave>): Promise<EmployeeLeave> {
    const list = store.getLeave();
    const employees = store.getEmployees();
    const emp = employees.find(e => e.id === leave.employee_id);

    if (!leave.employee_id) throw new Error('Karyawan wajib dipilih.');
    if (!leave.leave_type) throw new Error('Jenis cuti/izin wajib dipilih.');
    if (!leave.start_date || !leave.end_date) throw new Error('Tanggal mulai dan selesai cuti wajib diisi.');
    if (!leave.reason) throw new Error('Alasan permohonan cuti wajib diisi.');

    const newLeave: EmployeeLeave = {
      id: `lev-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      employee_id: leave.employee_id,
      leave_type: leave.leave_type,
      start_date: leave.start_date,
      end_date: leave.end_date,
      total_days: leave.total_days || 1,
      reason: leave.reason,
      attachment_url: leave.attachment_url,
      status: 'Pending',
      created_at: new Date().toISOString()
    };

    list.push(newLeave);
    store.setLeave(list);

    await auditService.log('APPLY_LEAVE', 'leave', newLeave.id, {
      employee: emp?.full_name,
      type: newLeave.leave_type,
      days: newLeave.total_days
    });

    return newLeave;
  },

  async updateLeaveStatus(
    id: string,
    status: LeaveStatus,
    approvalNotes?: string
  ): Promise<EmployeeLeave> {
    const list = store.getLeave();
    const index = list.findIndex(l => l.id === id);
    if (index === -1) throw new Error('Permohonan cuti tidak ditemukan.');

    const currentUser = store.getCurrentUser();
    list[index].status = status;
    list[index].approver_id = currentUser?.id;
    list[index].approver_name = currentUser?.full_name || 'Administrator';
    list[index].approved_at = new Date().toISOString();
    list[index].approval_notes = approvalNotes;
    list[index].updated_at = new Date().toISOString();

    store.setLeave(list);

    await auditService.log(
      status === 'Disetujui' ? 'APPROVE_LEAVE' : 'REJECT_LEAVE',
      'leave',
      id,
      { status, approver: list[index].approver_name }
    );

    return list[index];
  },

  async deleteLeave(id: string): Promise<void> {
    const list = store.getLeave().filter(l => l.id !== id);
    store.setLeave(list);
    await auditService.log('DELETE_LEAVE', 'leave', id);
  }
};
