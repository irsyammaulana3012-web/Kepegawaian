import { EmployeeNote } from '../types';
import { store } from './storageStore';
import { auditService } from './auditService';

export const notesService = {
  async getNotesByEmployee(employeeId: string): Promise<EmployeeNote[]> {
    const list = store.getNotes();
    return list.filter(n => n.employee_id === employeeId).sort((a, b) => {
      return new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime();
    });
  },

  async addNote(
    employeeId: string,
    content: string,
    isConfidential = false
  ): Promise<EmployeeNote> {
    const list = store.getNotes();
    const currentUser = store.getCurrentUser();

    const newNote: EmployeeNote = {
      id: `not-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      employee_id: employeeId,
      note_date: new Date().toISOString().split('T')[0],
      content,
      created_by: currentUser?.id,
      created_by_name: currentUser?.full_name || 'HR Admin',
      is_confidential: isConfidential,
      created_at: new Date().toISOString()
    };

    list.push(newNote);
    store.setNotes(list);

    await auditService.log('ADD_INTERNAL_NOTE', 'notes', newNote.id, {
      employee_id: employeeId,
      is_confidential: isConfidential
    });

    return newNote;
  },

  async deleteNote(id: string): Promise<void> {
    const list = store.getNotes().filter(n => n.id !== id);
    store.setNotes(list);
    await auditService.log('DELETE_INTERNAL_NOTE', 'notes', id);
  }
};
