import { EmployeeTraining } from '../types';
import { store } from './storageStore';
import { auditService } from './auditService';

export const trainingService = {
  async getTrainingByEmployee(employeeId: string): Promise<EmployeeTraining[]> {
    const list = store.getTraining();
    return list.filter(t => t.employee_id === employeeId).sort((a, b) => {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
  },

  async saveTraining(training: Partial<EmployeeTraining>): Promise<EmployeeTraining> {
    const list = store.getTraining();
    let saved: EmployeeTraining;

    if (training.id) {
      const index = list.findIndex(t => t.id === training.id);
      if (index === -1) throw new Error('Data pelatihan tidak ditemukan');
      saved = { ...list[index], ...training, id: training.id } as EmployeeTraining;
      list[index] = saved;
      await auditService.log('UPDATE', 'training', saved.id, { name: saved.name });
    } else {
      saved = {
        id: `trn-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        employee_id: training.employee_id || '',
        name: training.name || '',
        organizer: training.organizer || '',
        date: training.date || new Date().toISOString().split('T')[0],
        location: training.location || '',
        duration_hours: training.duration_hours ? Number(training.duration_hours) : undefined,
        certificate_number: training.certificate_number || '',
        expiry_date: training.expiry_date || undefined,
        certificate_url: training.certificate_url || '',
        created_at: new Date().toISOString()
      };
      list.push(saved);
      await auditService.log('CREATE', 'training', saved.id, { name: saved.name });
    }

    store.setTraining(list);
    return saved;
  },

  async deleteTraining(id: string): Promise<void> {
    const list = store.getTraining().filter(t => t.id !== id);
    store.setTraining(list);
    await auditService.log('DELETE', 'training', id);
  }
};
