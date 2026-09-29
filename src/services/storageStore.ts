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
  initialTraining,
  initialAttendance,
  initialLeave,
  initialNotes,
  initialAuditLogs,
  initialUsers
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
  EmployeeTraining,
  EmployeeAttendance,
  EmployeeLeave,
  EmployeeNote,
  AuditLog,
  UserProfile
} from '../types';

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
  TRAINING: 'simka_training',
  ATTENDANCE: 'simka_attendance',
  LEAVE: 'simka_leave',
  NOTES: 'simka_notes',
  AUDIT: 'simka_audit',
  USERS: 'simka_users',
  CURRENT_USER: 'simka_current_user'
};

function getItem<T>(key: string, initialData: T): T {
  try {
    const data = localStorage.getItem(key);
    if (!data) {
      localStorage.setItem(key, JSON.stringify(initialData));
      return initialData;
    }
    return JSON.parse(data);
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

class StorageStore {
  // Master Data
  getUnits(): Unit[] {
    return getItem<Unit[]>(STORAGE_KEYS.UNITS, initialUnits);
  }
  setUnits(units: Unit[]): void {
    setItem(STORAGE_KEYS.UNITS, units);
  }

  getDepartments(): Department[] {
    return getItem<Department[]>(STORAGE_KEYS.DEPARTMENTS, initialDepartments);
  }
  setDepartments(deps: Department[]): void {
    setItem(STORAGE_KEYS.DEPARTMENTS, deps);
  }

  getPositions(): Position[] {
    return getItem<Position[]>(STORAGE_KEYS.POSITIONS, initialPositions);
  }
  setPositions(positions: Position[]): void {
    setItem(STORAGE_KEYS.POSITIONS, positions);
  }

  getTasks(): Task[] {
    return getItem<Task[]>(STORAGE_KEYS.TASKS, initialTasks);
  }
  setTasks(tasks: Task[]): void {
    setItem(STORAGE_KEYS.TASKS, tasks);
  }

  // Employees
  getEmployees(): Employee[] {
    return getItem<Employee[]>(STORAGE_KEYS.EMPLOYEES, initialEmployees);
  }
  setEmployees(employees: Employee[]): void {
    setItem(STORAGE_KEYS.EMPLOYEES, employees);
  }

  // Assignments
  getAssignments(): EmployeeAssignment[] {
    return getItem<EmployeeAssignment[]>(STORAGE_KEYS.ASSIGNMENTS, initialAssignments);
  }
  setAssignments(assignments: EmployeeAssignment[]): void {
    setItem(STORAGE_KEYS.ASSIGNMENTS, assignments);
  }

  // Education
  getEducation(): EmployeeEducation[] {
    return getItem<EmployeeEducation[]>(STORAGE_KEYS.EDUCATION, initialEducation);
  }
  setEducation(edu: EmployeeEducation[]): void {
    setItem(STORAGE_KEYS.EDUCATION, edu);
  }

  // Position History
  getHistory(): EmployeePositionHistory[] {
    return getItem<EmployeePositionHistory[]>(STORAGE_KEYS.HISTORY, initialPositionHistory);
  }
  setHistory(his: EmployeePositionHistory[]): void {
    setItem(STORAGE_KEYS.HISTORY, his);
  }

  // Documents
  getDocuments(): EmployeeDocument[] {
    return getItem<EmployeeDocument[]>(STORAGE_KEYS.DOCUMENTS, initialDocuments);
  }
  setDocuments(docs: EmployeeDocument[]): void {
    setItem(STORAGE_KEYS.DOCUMENTS, docs);
  }

  // Training
  getTraining(): EmployeeTraining[] {
    return getItem<EmployeeTraining[]>(STORAGE_KEYS.TRAINING, initialTraining);
  }
  setTraining(training: EmployeeTraining[]): void {
    setItem(STORAGE_KEYS.TRAINING, training);
  }

  // Attendance
  getAttendance(): EmployeeAttendance[] {
    return getItem<EmployeeAttendance[]>(STORAGE_KEYS.ATTENDANCE, initialAttendance);
  }
  setAttendance(att: EmployeeAttendance[]): void {
    setItem(STORAGE_KEYS.ATTENDANCE, att);
  }

  // Leave
  getLeave(): EmployeeLeave[] {
    return getItem<EmployeeLeave[]>(STORAGE_KEYS.LEAVE, initialLeave);
  }
  setLeave(leave: EmployeeLeave[]): void {
    setItem(STORAGE_KEYS.LEAVE, leave);
  }

  // Notes
  getNotes(): EmployeeNote[] {
    return getItem<EmployeeNote[]>(STORAGE_KEYS.NOTES, initialNotes);
  }
  setNotes(notes: EmployeeNote[]): void {
    setItem(STORAGE_KEYS.NOTES, notes);
  }

  // Audit Logs
  getAuditLogs(): AuditLog[] {
    return getItem<AuditLog[]>(STORAGE_KEYS.AUDIT, initialAuditLogs);
  }
  setAuditLogs(logs: AuditLog[]): void {
    setItem(STORAGE_KEYS.AUDIT, logs);
  }

  // Users
  getUsers(): UserProfile[] {
    return getItem<UserProfile[]>(STORAGE_KEYS.USERS, initialUsers);
  }
  setUsers(users: UserProfile[]): void {
    setItem(STORAGE_KEYS.USERS, users);
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
    this.setTraining(initialTraining);
    this.setAttendance(initialAttendance);
    this.setLeave(initialLeave);
    this.setNotes(initialNotes);
    this.setAuditLogs(initialAuditLogs);
    this.setUsers(initialUsers);
  }
}

export const store = new StorageStore();
