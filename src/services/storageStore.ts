import {
  initialUnits,
  initialDepartments,
  initialPositions,
  initialTasks,
  initialEmployees,
  initialAssignments,
  initialEducation,
  initialPositionHistory,
  initialDocuments,
  initialDocumentTypes,
  initialTraining,
  initialAttendance,
  initialLeave,
  initialNotes,
  initialAuditLogs,
  initialUsers,
  initialOfficialLetters,
  initialLetterTemplates,
  initialLetterKopSettings,
  initialKopTemplates,
  initialDeliveryLogs
} from '../lib/mockData';
import {
  Unit,
  Department,
  Position,
  Task,
  Employee,
  EmployeeAssignment,
  EmployeeEducation,
  EmployeePositionHistory,
  EmployeeDocument,
  DocumentTypeDefinition,
  EmployeeTraining,
  EmployeeAttendance,
  EmployeeLeave,
  EmployeeNote,
  AuditLog,
  UserProfile,
  OfficialLetter,
  LetterTemplate,
  LetterKopSettings,
  LetterKopTemplate,
  LetterDeliveryLog
} from '../types';
import { supabase, isConfigured } from '../lib/supabase';

// Keys for localStorage
const STORAGE_KEYS = {
  UNITS: 'simka_units',
  DEPARTMENTS: 'simka_departments',
  POSITIONS: 'simka_positions',
  TASKS: 'simka_tasks',
  EMPLOYEES: 'simka_employees',
  ASSIGNMENTS: 'simka_assignments',
  EDUCATION: 'simka_education',
  HISTORY: 'simka_history',
  DOCUMENTS: 'simka_documents',
  DOC_TYPES: 'simka_doc_types',
  TRAINING: 'simka_training',
  ATTENDANCE: 'simka_attendance',
  LEAVE: 'simka_leave',
  NOTES: 'simka_notes',
  AUDIT: 'simka_audit',
  USERS: 'simka_users',
  CURRENT_USER: 'simka_current_user',
  OFFICIAL_LETTERS: 'simka_official_letters',
  LETTER_TEMPLATES: 'simka_letter_templates',
  KOP_SETTINGS: 'simka_kop_settings',
  KOP_TEMPLATES: 'simka_kop_templates',
  DELIVERY_LOGS: 'simka_delivery_logs'
};

function getItem<T>(key: string, initialData: T): T {
  try {
    const data = localStorage.getItem(key);
    if (!data) {
      localStorage.setItem(key, JSON.stringify(initialData));
      return initialData;
    }
    const parsed = JSON.parse(data);
    if (Array.isArray(initialData) && Array.isArray(parsed) && parsed.length === 0 && (initialData as any[]).length > 0) {
      localStorage.setItem(key, JSON.stringify(initialData));
      return initialData;
    }
    return parsed;
  } catch (err) {
    console.error(`Error reading ${key} from storage:`, err);
    return initialData;
  }
}

function setItem<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.error(`Error writing ${key} to storage:`, err);
  }
}

function cleanForDb(obj: any): any {
  if (!obj || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(cleanForDb);
  
  const cleaned: Record<string, any> = {};
  const ignoredKeys = new Set([
    'assignments',
    'primary_assignment',
    'assignment_count',
    'units_list',
    'positions_list',
    'data_completeness_pct',
    'unit_name',
    'department_name',
    'position_name',
    'task_name',
    'employee_name',
    'employee_number'
  ]);

  for (const [key, val] of Object.entries(obj)) {
    if (ignoredKeys.has(key)) continue;
    if (val !== undefined) {
      cleaned[key] = val;
    }
  }
  return cleaned;
}

class StorageStore {
  public syncPromise: Promise<void> | null = null;

  constructor() {
    if (isConfigured) {
      this.syncPromise = this.initSupabaseSync();
    }
  }

  public async initSupabaseSync(): Promise<void> {
    if (!isConfigured) return;

    try {
      const [
        { data: units },
        { data: departments },
        { data: positions },
        { data: tasks },
        { data: employees },
        { data: assignments },
        { data: education },
        { data: history },
        { data: documents },
        { data: training },
        { data: attendance },
        { data: leave },
        { data: notes },
        { data: auditLogs }
      ] = await Promise.all([
        supabase.from('units').select('*'),
        supabase.from('departments').select('*'),
        supabase.from('positions').select('*'),
        supabase.from('tasks').select('*'),
        supabase.from('employees').select('*'),
        supabase.from('employee_assignments').select('*'),
        supabase.from('employee_education').select('*'),
        supabase.from('employee_position_history').select('*'),
        supabase.from('employee_documents').select('*'),
        supabase.from('employee_training').select('*'),
        supabase.from('employee_attendance').select('*'),
        supabase.from('employee_leave').select('*'),
        supabase.from('employee_notes').select('*'),
        supabase.from('audit_logs').select('*')
      ]);

      localStorage.setItem('simka_synced_with_supabase', 'true');

      if (units !== null) this.setUnitsLocal(units);
      if (departments !== null) this.setDepartmentsLocal(departments);
      if (positions !== null) this.setPositionsLocal(positions);
      if (tasks !== null) this.setTasksLocal(tasks);
      if (employees !== null) this.setEmployeesLocal(employees);
      if (assignments !== null) this.setAssignmentsLocal(assignments);
      if (education !== null) this.setEducationLocal(education);
      if (history !== null) this.setHistoryLocal(history);
      if (documents !== null) this.setDocumentsLocal(documents);
      if (training !== null) this.setTrainingLocal(training);
      if (attendance !== null) this.setAttendanceLocal(attendance);
      if (leave !== null) this.setLeaveLocal(leave);
      if (notes !== null) this.setNotesLocal(notes);
      if (auditLogs !== null) this.setAuditLogsLocal(auditLogs);
    } catch (err) {
      console.error('Error syncing with Supabase:', err);
    }
  }

  // Master Data Local Setters
  private setUnitsLocal(units: Unit[]): void { setItem(STORAGE_KEYS.UNITS, units); }
  private setDepartmentsLocal(deps: Department[]): void { setItem(STORAGE_KEYS.DEPARTMENTS, deps); }
  private setPositionsLocal(positions: Position[]): void { setItem(STORAGE_KEYS.POSITIONS, positions); }
  private setTasksLocal(tasks: Task[]): void { setItem(STORAGE_KEYS.TASKS, tasks); }
  
  // Transactional Local Setters
  private setEmployeesLocal(employees: Employee[]): void { setItem(STORAGE_KEYS.EMPLOYEES, employees); }
  private setAssignmentsLocal(assignments: EmployeeAssignment[]): void { setItem(STORAGE_KEYS.ASSIGNMENTS, assignments); }
  private setEducationLocal(edu: EmployeeEducation[]): void { setItem(STORAGE_KEYS.EDUCATION, edu); }
  private setHistoryLocal(his: EmployeePositionHistory[]): void { setItem(STORAGE_KEYS.HISTORY, his); }
  private setDocumentsLocal(docs: EmployeeDocument[]): void { setItem(STORAGE_KEYS.DOCUMENTS, docs); }
  private setTrainingLocal(training: EmployeeTraining[]): void { setItem(STORAGE_KEYS.TRAINING, training); }
  private setAttendanceLocal(att: EmployeeAttendance[]): void { setItem(STORAGE_KEYS.ATTENDANCE, att); }
  private setLeaveLocal(leave: EmployeeLeave[]): void { setItem(STORAGE_KEYS.LEAVE, leave); }
  private setNotesLocal(notes: EmployeeNote[]): void { setItem(STORAGE_KEYS.NOTES, notes); }
  private setAuditLogsLocal(logs: AuditLog[]): void { setItem(STORAGE_KEYS.AUDIT, logs); }

  // Master Data Getters & Setters
  getUnits(): Unit[] { return getItem<Unit[]>(STORAGE_KEYS.UNITS, initialUnits); }
  setUnits(units: Unit[]): void {
    this.setUnitsLocal(units);
    if (isConfigured) {
      if (units.length === 0) {
        supabase.from('units').delete().neq('id', '00000000-0000-0000-0000-000000000000').then();
      } else {
        supabase.from('units').upsert(cleanForDb(units)).then();
      }
    }
  }

  getDepartments(): Department[] { return getItem<Department[]>(STORAGE_KEYS.DEPARTMENTS, initialDepartments); }
  setDepartments(deps: Department[]): void {
    this.setDepartmentsLocal(deps);
    if (isConfigured) {
      if (deps.length === 0) {
        supabase.from('departments').delete().neq('id', '00000000-0000-0000-0000-000000000000').then();
      } else {
        supabase.from('departments').upsert(cleanForDb(deps)).then();
      }
    }
  }

  getPositions(): Position[] { return getItem<Position[]>(STORAGE_KEYS.POSITIONS, initialPositions); }
  setPositions(positions: Position[]): void {
    this.setPositionsLocal(positions);
    if (isConfigured) {
      if (positions.length === 0) {
        supabase.from('positions').delete().neq('id', '00000000-0000-0000-0000-000000000000').then();
      } else {
        supabase.from('positions').upsert(cleanForDb(positions)).then();
      }
    }
  }

  getTasks(): Task[] { return getItem<Task[]>(STORAGE_KEYS.TASKS, initialTasks); }
  setTasks(tasks: Task[]): void {
    this.setTasksLocal(tasks);
    if (isConfigured) {
      if (tasks.length === 0) {
        supabase.from('tasks').delete().neq('id', '00000000-0000-0000-0000-000000000000').then();
      } else {
        supabase.from('tasks').upsert(cleanForDb(tasks)).then();
      }
    }
  }

  // Employees
  getEmployees(): Employee[] { return getItem<Employee[]>(STORAGE_KEYS.EMPLOYEES, initialEmployees); }
  setEmployees(employees: Employee[]): void {
    this.setEmployeesLocal(employees);
    if (isConfigured) {
      if (employees.length === 0) {
        supabase.from('employees').delete().neq('id', '00000000-0000-0000-0000-000000000000').then();
      } else {
        supabase.from('employees').upsert(cleanForDb(employees)).then();
      }
    }
  }

  // Assignments
  getAssignments(): EmployeeAssignment[] { return getItem<EmployeeAssignment[]>(STORAGE_KEYS.ASSIGNMENTS, initialAssignments); }
  setAssignments(assignments: EmployeeAssignment[]): void {
    this.setAssignmentsLocal(assignments);
    if (isConfigured) {
      if (assignments.length === 0) {
        supabase.from('employee_assignments').delete().neq('id', '00000000-0000-0000-0000-000000000000').then();
      } else {
        supabase.from('employee_assignments').upsert(cleanForDb(assignments)).then();
      }
    }
  }

  // Education
  getEducation(): EmployeeEducation[] { return getItem<EmployeeEducation[]>(STORAGE_KEYS.EDUCATION, initialEducation); }
  setEducation(edu: EmployeeEducation[]): void {
    this.setEducationLocal(edu);
    if (isConfigured) {
      if (edu.length === 0) {
        supabase.from('employee_education').delete().neq('id', '00000000-0000-0000-0000-000000000000').then();
      } else {
        supabase.from('employee_education').upsert(cleanForDb(edu)).then();
      }
    }
  }

  // Position History
  getHistory(): EmployeePositionHistory[] { return getItem<EmployeePositionHistory[]>(STORAGE_KEYS.HISTORY, initialPositionHistory); }
  setHistory(his: EmployeePositionHistory[]): void {
    this.setHistoryLocal(his);
    if (isConfigured) {
      if (his.length === 0) {
        supabase.from('employee_position_history').delete().neq('id', '00000000-0000-0000-0000-000000000000').then();
      } else {
        supabase.from('employee_position_history').upsert(cleanForDb(his)).then();
      }
    }
  }

  // Documents
  getDocuments(): EmployeeDocument[] { return getItem<EmployeeDocument[]>(STORAGE_KEYS.DOCUMENTS, initialDocuments); }
  setDocuments(docs: EmployeeDocument[]): void {
    this.setDocumentsLocal(docs);
    if (isConfigured) {
      if (docs.length === 0) {
        supabase.from('employee_documents').delete().neq('id', '00000000-0000-0000-0000-000000000000').then();
      } else {
        supabase.from('employee_documents').upsert(cleanForDb(docs)).then();
      }
    }
  }

  // Document Types Definition
  getDocumentTypes(): DocumentTypeDefinition[] { return getItem<DocumentTypeDefinition[]>(STORAGE_KEYS.DOC_TYPES, initialDocumentTypes); }
  setDocumentTypes(types: DocumentTypeDefinition[]): void {
    setItem(STORAGE_KEYS.DOC_TYPES, types);
  }

  // Training
  getTraining(): EmployeeTraining[] { return getItem<EmployeeTraining[]>(STORAGE_KEYS.TRAINING, initialTraining); }
  setTraining(training: EmployeeTraining[]): void {
    this.setTrainingLocal(training);
    if (isConfigured) {
      if (training.length === 0) {
        supabase.from('employee_training').delete().neq('id', '00000000-0000-0000-0000-000000000000').then();
      } else {
        supabase.from('employee_training').upsert(cleanForDb(training)).then();
      }
    }
  }

  // Attendance
  getAttendance(): EmployeeAttendance[] { return getItem<EmployeeAttendance[]>(STORAGE_KEYS.ATTENDANCE, initialAttendance); }
  setAttendance(att: EmployeeAttendance[]): void {
    this.setAttendanceLocal(att);
    if (isConfigured) {
      if (att.length === 0) {
        supabase.from('employee_attendance').delete().neq('id', '00000000-0000-0000-0000-000000000000').then();
      } else {
        supabase.from('employee_attendance').upsert(cleanForDb(att)).then();
      }
    }
  }

  // Leave
  getLeave(): EmployeeLeave[] { return getItem<EmployeeLeave[]>(STORAGE_KEYS.LEAVE, initialLeave); }
  setLeave(leave: EmployeeLeave[]): void {
    this.setLeaveLocal(leave);
    if (isConfigured) {
      if (leave.length === 0) {
        supabase.from('employee_leave').delete().neq('id', '00000000-0000-0000-0000-000000000000').then();
      } else {
        supabase.from('employee_leave').upsert(cleanForDb(leave)).then();
      }
    }
  }

  // Notes
  getNotes(): EmployeeNote[] { return getItem<EmployeeNote[]>(STORAGE_KEYS.NOTES, initialNotes); }
  setNotes(notes: EmployeeNote[]): void {
    this.setNotesLocal(notes);
    if (isConfigured) {
      if (notes.length === 0) {
        supabase.from('employee_notes').delete().neq('id', '00000000-0000-0000-0000-000000000000').then();
      } else {
        supabase.from('employee_notes').upsert(cleanForDb(notes)).then();
      }
    }
  }

  // Official Letters
  getOfficialLetters(): OfficialLetter[] { return getItem<OfficialLetter[]>(STORAGE_KEYS.OFFICIAL_LETTERS, initialOfficialLetters); }
  setOfficialLetters(letters: OfficialLetter[]): void {
    setItem(STORAGE_KEYS.OFFICIAL_LETTERS, letters);
    if (isConfigured) {
      if (letters.length === 0) {
        supabase.from('official_letters').delete().neq('id', '00000000-0000-0000-0000-000000000000').then();
      } else {
        supabase.from('official_letters').upsert(cleanForDb(letters)).then();
      }
    }
  }

  // Letter Templates
  getLetterTemplates(): LetterTemplate[] { return getItem<LetterTemplate[]>(STORAGE_KEYS.LETTER_TEMPLATES, initialLetterTemplates); }
  setLetterTemplates(templates: LetterTemplate[]): void {
    setItem(STORAGE_KEYS.LETTER_TEMPLATES, templates);
    if (isConfigured) {
      if (templates.length === 0) {
        supabase.from('letter_templates').delete().neq('id', '00000000-0000-0000-0000-000000000000').then();
      } else {
        supabase.from('letter_templates').upsert(cleanForDb(templates)).then();
      }
    }
  }

  // Kop Settings
  getLetterKopSettings(): LetterKopSettings {
    const settings = getItem<LetterKopSettings>(STORAGE_KEYS.KOP_SETTINGS, initialLetterKopSettings);
    if (!settings.kop_image_url || settings.kop_top_padding_cm! < 6.8) {
      settings.kop_image_url = '/kop_yayasan.jpg';
      settings.kop_image_mode = 'full_page';
      settings.kop_top_padding_cm = 6.8;
      this.setLetterKopSettings(settings);
    }
    return settings;
  }
  setLetterKopSettings(settings: LetterKopSettings): void {
    setItem(STORAGE_KEYS.KOP_SETTINGS, settings);
  }

  // Kop Templates
  getKopTemplates(): LetterKopTemplate[] {
    const list = getItem<LetterKopTemplate[]>(STORAGE_KEYS.KOP_TEMPLATES, initialKopTemplates);
    if (list.length > 0 && (!list[0].kop_image_url || list[0].kop_top_padding_cm! < 6.8)) {
      list[0].kop_image_url = '/kop_yayasan.jpg';
      list[0].kop_image_mode = 'full_page';
      list[0].kop_top_padding_cm = 6.8;
      this.setKopTemplates(list);
    }
    return list;
  }
  setKopTemplates(templates: LetterKopTemplate[]): void {
    setItem(STORAGE_KEYS.KOP_TEMPLATES, templates);
    if (isConfigured) {
      if (templates.length === 0) {
        supabase.from('letter_kop_templates').delete().neq('id', '00000000-0000-0000-0000-000000000000').then();
      } else {
        supabase.from('letter_kop_templates').upsert(cleanForDb(templates)).then();
      }
    }
  }

  // Delivery Logs
  getDeliveryLogs(): LetterDeliveryLog[] { return getItem<LetterDeliveryLog[]>(STORAGE_KEYS.DELIVERY_LOGS, initialDeliveryLogs); }
  setDeliveryLogs(logs: LetterDeliveryLog[]): void {
    setItem(STORAGE_KEYS.DELIVERY_LOGS, logs);
    if (isConfigured) {
      if (logs.length === 0) {
        supabase.from('letter_delivery_logs').delete().neq('id', '00000000-0000-0000-0000-000000000000').then();
      } else {
        supabase.from('letter_delivery_logs').upsert(cleanForDb(logs)).then();
      }
    }
  }

  // Audit Logs
  getAuditLogs(): AuditLog[] { return getItem<AuditLog[]>(STORAGE_KEYS.AUDIT, initialAuditLogs); }
  setAuditLogs(logs: AuditLog[]): void {
    this.setAuditLogsLocal(logs);
    if (isConfigured) {
      if (logs.length === 0) {
        supabase.from('audit_logs').delete().neq('id', '00000000-0000-0000-0000-000000000000').then();
      } else {
        supabase.from('audit_logs').upsert(cleanForDb(logs)).then();
      }
    }
  }

  // Users
  getUsers(): UserProfile[] { return getItem<UserProfile[]>(STORAGE_KEYS.USERS, initialUsers); }
  setUsers(users: UserProfile[]): void {
    setItem(STORAGE_KEYS.USERS, users);
    if (isConfigured) {
      if (users.length > 0) {
        supabase.from('user_profiles').upsert(cleanForDb(users)).then();
      }
    }
  }

  getCurrentUser(): UserProfile | null {
    return getItem<UserProfile | null>(STORAGE_KEYS.CURRENT_USER, initialUsers[0]);
  }
  setCurrentUser(user: UserProfile | null): void {
    setItem(STORAGE_KEYS.CURRENT_USER, user);
  }

  resetToDefault(): void {
    localStorage.clear();
    this.loadDemoData();
  }

  // Clear transactional/employee data only, keeping master data (units, positions, tasks, users) intact
  clearEmployeeDataOnly(): void {
    this.setEmployees([]);
    this.setAssignments([]);
    this.setEducation([]);
    this.setHistory([]);
    this.setDocuments([]);
    this.setTraining([]);
    this.setAttendance([]);
    this.setLeave([]);
    this.setNotes([]);
    this.setAuditLogs([]);
    this.setOfficialLetters([]);
  }

  // Clear all data including master data (100% clean slate)
  clearAllData(): void {
    this.setUnits([]);
    this.setDepartments([]);
    this.setPositions([]);
    this.setTasks([]);
    this.setEmployees([]);
    this.setAssignments([]);
    this.setEducation([]);
    this.setHistory([]);
    this.setDocuments([]);
    this.setTraining([]);
    this.setAttendance([]);
    this.setLeave([]);
    this.setNotes([]);
    this.setAuditLogs([]);
    this.setOfficialLetters([]);
    this.setLetterTemplates([]);
  }

  // Load pesantren demo/sample data
  loadDemoData(): void {
    this.setUnits(initialUnits);
    this.setDepartments(initialDepartments);
    this.setPositions(initialPositions);
    this.setTasks(initialTasks);
    this.setEmployees(initialEmployees);
    this.setAssignments(initialAssignments);
    this.setEducation(initialEducation);
    this.setHistory(initialPositionHistory);
    this.setDocuments(initialDocuments);
    this.setDocumentTypes(initialDocumentTypes);
    this.setTraining(initialTraining);
    this.setAttendance(initialAttendance);
    this.setLeave(initialLeave);
    this.setNotes(initialNotes);
    this.setAuditLogs(initialAuditLogs);
    this.setUsers(initialUsers);
    this.setOfficialLetters(initialOfficialLetters);
    this.setLetterTemplates(initialLetterTemplates);
    this.setLetterKopSettings(initialLetterKopSettings);
  }
}

export const store = new StorageStore();
