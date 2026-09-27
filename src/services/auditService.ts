import { AuditLog } from '../types';
import { store } from './storageStore';

export const auditService = {
  async getLogs(): Promise<AuditLog[]> {
    const logs = store.getAuditLogs();
    return [...logs].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  },

  async log(
    action: string,
    module: string,
    recordId?: string,
    details?: Record<string, any>
  ): Promise<AuditLog> {
    const logs = store.getAuditLogs();
    const currentUser = store.getCurrentUser();
    
    const newLog: AuditLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      user_id: currentUser?.id,
      user_name: currentUser?.full_name || 'System / Admin',
      action,
      module,
      record_id: recordId,
      details,
      created_at: new Date().toISOString()
    };

    logs.unshift(newLog);
    // Keep last 500 logs
    if (logs.length > 500) logs.length = 500;
    store.setAuditLogs(logs);
    return newLog;
  }
};
