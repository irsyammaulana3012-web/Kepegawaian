import { EmployeeDocument } from '../types';
import { store } from './storageStore';
import { auditService } from './auditService';
import { supabase, isConfigured } from '../lib/supabase';

export const documentService = {
  async getAllDocuments(filters: { search?: string; document_type?: string; unit_id?: string } = {}): Promise<EmployeeDocument[]> {
    const all = store.getDocuments();
    const employees = store.getEmployees();
    const assignments = store.getAssignments();
    const units = store.getUnits();

    let enriched = all.map(doc => {
      const emp = employees.find(e => e.id === doc.employee_id);
      const empAssignments = assignments.filter(a => a.employee_id === doc.employee_id && a.status === 'Aktif');
      const unitNames = Array.from(
        new Set(
          empAssignments.map(a => units.find(u => u.id === a.unit_id)?.name).filter(Boolean)
        )
      ) as string[];

      return {
        ...doc,
        employee_name: emp?.full_name || 'Tidak Diketahui',
        employee_number: emp?.employee_number || '',
        employee_nik: emp?.nik || '',
        units_list: unitNames
      };
    });

    if (filters.search) {
      const q = filters.search.toLowerCase();
      enriched = enriched.filter(d =>
        (d.title && d.title.toLowerCase().includes(q)) ||
        (d.file_name && d.file_name.toLowerCase().includes(q)) ||
        (d.employee_name && d.employee_name.toLowerCase().includes(q)) ||
        (d.employee_nik && d.employee_nik.includes(q)) ||
        (d.employee_number && d.employee_number.toLowerCase().includes(q))
      );
    }

    if (filters.document_type && filters.document_type !== 'all') {
      enriched = enriched.filter(d => d.document_type === filters.document_type);
    }

    if (filters.unit_id && filters.unit_id !== 'all') {
      enriched = enriched.filter(d => {
        const empAssignments = assignments.filter(a => a.employee_id === d.employee_id && a.status === 'Aktif');
        return empAssignments.some(a => a.unit_id === filters.unit_id);
      });
    }

    return enriched.sort((a, b) => {
      return new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime();
    });
  },

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

  // Document Types Definition CRUD
  async getDocumentTypes(): Promise<import('../types').DocumentTypeDefinition[]> {
    const list = store.getDocumentTypes();
    return list.filter(t => t.is_active).sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
  },

  async getAllDocumentTypes(): Promise<import('../types').DocumentTypeDefinition[]> {
    const list = store.getDocumentTypes();
    return list.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
  },

  async saveDocumentType(type: Partial<import('../types').DocumentTypeDefinition>): Promise<import('../types').DocumentTypeDefinition> {
    const list = store.getDocumentTypes();
    let saved: import('../types').DocumentTypeDefinition;

    if (type.id) {
      const idx = list.findIndex(t => t.id === type.id);
      if (idx === -1) throw new Error('Jenis dokumen tidak ditemukan.');
      saved = { ...list[idx], ...type } as import('../types').DocumentTypeDefinition;
      list[idx] = saved;
      await auditService.log('UPDATE_DOC_TYPE', 'document_types', saved.id, { name: saved.name });
    } else {
      saved = {
        id: `dt-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        name: type.name || 'Dokumen Baru',
        code: type.code || (type.name || 'DOC').toUpperCase().replace(/\s+/g, '_'),
        description: type.description || '',
        is_mandatory: type.is_mandatory ?? true,
        is_active: type.is_active ?? true,
        sort_order: type.sort_order || (list.length + 1)
      };
      list.push(saved);
      await auditService.log('CREATE_DOC_TYPE', 'document_types', saved.id, { name: saved.name });
    }

    store.setDocumentTypes(list);
    return saved;
  },

  async deleteDocumentType(id: string): Promise<void> {
    const list = store.getDocumentTypes().filter(t => t.id !== id);
    store.setDocumentTypes(list);
    await auditService.log('DELETE_DOC_TYPE', 'document_types', id);
  },

  formatBytes(bytes?: number): string {
    if (!bytes || bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }
};
