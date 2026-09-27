import { EmployeeDocument } from '../types';
import { store } from './storageStore';
import { auditService } from './auditService';
import { supabase, isConfigured } from '../lib/supabase';

export const documentService = {
  async getDocumentsByEmployee(employeeId: string): Promise<EmployeeDocument[]> {
    const all = store.getDocuments();
    return all.filter(d => d.employee_id === employeeId).sort((a, b) => {
      return new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime();
    });
  },

  async uploadDocument(
    employeeId: string,
    documentType: string,
    title: string,
    file: File
  ): Promise<EmployeeDocument> {
    const list = store.getDocuments();
    let fileUrl = '';

    // If Supabase Storage is configured live, upload to bucket
    if (isConfigured) {
      try {
        const fileExt = file.name.split('.').pop();
        const filePath = `employees/${employeeId}/${Date.now()}_${file.name}`;
        const { error } = await supabase.storage.from('employee-documents').upload(filePath, file);
        if (error) {
          console.warn('Supabase storage upload error, falling back to local preview URL:', error.message);
          fileUrl = URL.createObjectURL(file);
        } else {
          const { data: publicData } = supabase.storage.from('employee-documents').getPublicUrl(filePath);
          fileUrl = publicData.publicUrl;
        }
      } catch (err) {
        console.warn('Storage error:', err);
        fileUrl = URL.createObjectURL(file);
      }
    } else {
      // Mock / Offline URL
      fileUrl = URL.createObjectURL(file);
    }

    const newDoc: EmployeeDocument = {
      id: `doc-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      employee_id: employeeId,
      document_type: documentType,
      title: title || file.name,
      file_url: fileUrl,
      file_name: file.name,
      file_size: file.size,
      mime_type: file.type || 'application/octet-stream',
      created_at: new Date().toISOString()
    };

    list.push(newDoc);
    store.setDocuments(list);

    await auditService.log('UPLOAD_DOCUMENT', 'documents', newDoc.id, {
      employee_id: employeeId,
      document_type: documentType,
      file_name: file.name
    });

    return newDoc;
  },

  async deleteDocument(id: string): Promise<void> {
    const list = store.getDocuments();
    const doc = list.find(d => d.id === id);
    if (!doc) throw new Error('Dokumen tidak ditemukan.');

    const filtered = list.filter(d => d.id !== id);
    store.setDocuments(filtered);

    await auditService.log('DELETE_DOCUMENT', 'documents', id, {
      employee_id: doc.employee_id,
      file_name: doc.file_name
    });
  },

  formatBytes(bytes?: number): string {
    if (!bytes || bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }
};
