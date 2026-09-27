import { Unit, Department, Position, Task } from '../types';
import { store } from './storageStore';
import { auditService } from './auditService';

export const masterDataService = {
  // Units
  async getUnits(): Promise<Unit[]> {
    return store.getUnits().sort((a, b) => a.sort_order - b.sort_order);
  },

  async getUnitById(id: string): Promise<Unit | null> {
    const units = store.getUnits();
    return units.find(u => u.id === id) || null;
  },

  async saveUnit(unit: Partial<Unit>): Promise<Unit> {
    const units = store.getUnits();
    let saved: Unit;
    if (unit.id) {
      const index = units.findIndex(u => u.id === unit.id);
      if (index === -1) throw new Error('Unit tidak ditemukan');
      saved = { ...units[index], ...unit, id: unit.id } as Unit;
      units[index] = saved;
      await auditService.log('UPDATE', 'master', saved.id, { entity: 'Unit', name: saved.name });
    } else {
      saved = {
        id: `u-${Date.now()}`,
        code: unit.code || `U-${Date.now()}`,
        name: unit.name || '',
        description: unit.description || '',
        is_active: unit.is_active !== undefined ? unit.is_active : true,
        sort_order: unit.sort_order || (units.length + 1),
        created_at: new Date().toISOString()
      };
      units.push(saved);
      await auditService.log('CREATE', 'master', saved.id, { entity: 'Unit', name: saved.name });
    }
    store.setUnits(units);
    return saved;
  },

  async deleteUnit(id: string): Promise<void> {
    // Check if assignments use this unit
    const assignments = store.getAssignments();
    const isUsed = assignments.some(a => a.unit_id === id);
    if (isUsed) {
      throw new Error('Unit tidak dapat dihapus karena masih digunakan oleh data penugasan karyawan.');
    }
    const units = store.getUnits().filter(u => u.id !== id);
    store.setUnits(units);
    await auditService.log('DELETE', 'master', id, { entity: 'Unit' });
  },

  // Departments
  async getDepartments(): Promise<Department[]> {
    const deps = store.getDepartments();
    const units = store.getUnits();
    return deps.map(d => ({
      ...d,
      unit_name: units.find(u => u.id === d.unit_id)?.name || '-'
    }));
  },

  async getDepartmentsByUnit(unitId: string): Promise<Department[]> {
    const deps = await this.getDepartments();
    return deps.filter(d => d.unit_id === unitId);
  },

  async saveDepartment(department: Partial<Department>): Promise<Department> {
    const deps = store.getDepartments();
    let saved: Department;
    if (department.id) {
      const index = deps.findIndex(d => d.id === department.id);
      if (index === -1) throw new Error('Departemen tidak ditemukan');
      saved = { ...deps[index], ...department, id: department.id } as Department;
      deps[index] = saved;
      await auditService.log('UPDATE', 'master', saved.id, { entity: 'Department', name: saved.name });
    } else {
      saved = {
        id: `d-${Date.now()}`,
        unit_id: department.unit_id || '',
        code: department.code || `D-${Date.now()}`,
        name: department.name || '',
        description: department.description || '',
        is_active: department.is_active !== undefined ? department.is_active : true,
        created_at: new Date().toISOString()
      };
      deps.push(saved);
      await auditService.log('CREATE', 'master', saved.id, { entity: 'Department', name: saved.name });
    }
    store.setDepartments(deps);
    return saved;
  },

  async deleteDepartment(id: string): Promise<void> {
    const deps = store.getDepartments().filter(d => d.id !== id);
    store.setDepartments(deps);
    await auditService.log('DELETE', 'master', id, { entity: 'Department' });
  },

  // Positions
  async getPositions(): Promise<Position[]> {
    return store.getPositions().sort((a, b) => a.sort_order - b.sort_order);
  },

  async savePosition(position: Partial<Position>): Promise<Position> {
    const positions = store.getPositions();
    let saved: Position;
    if (position.id) {
      const index = positions.findIndex(p => p.id === position.id);
      if (index === -1) throw new Error('Jabatan tidak ditemukan');
      saved = { ...positions[index], ...position, id: position.id } as Position;
      positions[index] = saved;
      await auditService.log('UPDATE', 'master', saved.id, { entity: 'Position', name: saved.name });
    } else {
      saved = {
        id: `p-${Date.now()}`,
        code: position.code || `P-${Date.now()}`,
        name: position.name || '',
        category: position.category || 'Staff',
        description: position.description || '',
        is_active: position.is_active !== undefined ? position.is_active : true,
        sort_order: position.sort_order || (positions.length + 1),
        created_at: new Date().toISOString()
      };
      positions.push(saved);
      await auditService.log('CREATE', 'master', saved.id, { entity: 'Position', name: saved.name });
    }
    store.setPositions(positions);
    return saved;
  },

  async deletePosition(id: string): Promise<void> {
    const assignments = store.getAssignments();
    const isUsed = assignments.some(a => a.position_id === id);
    if (isUsed) {
      throw new Error('Jabatan tidak dapat dihapus karena masih digunakan oleh data penugasan karyawan.');
    }
    const positions = store.getPositions().filter(p => p.id !== id);
    store.setPositions(positions);
    await auditService.log('DELETE', 'master', id, { entity: 'Position' });
  },

  // Tasks
  async getTasks(): Promise<Task[]> {
    const tasks = store.getTasks();
    const positions = store.getPositions();
    return tasks.map(t => ({
      ...t,
      position_name: positions.find(p => p.id === t.position_id)?.name || 'Semua Jabatan'
    }));
  },

  async getTasksByPosition(positionId?: string): Promise<Task[]> {
    const tasks = await this.getTasks();
    if (!positionId) return tasks;
    return tasks.filter(t => !t.position_id || t.position_id === positionId);
  },

  async saveTask(task: Partial<Task>): Promise<Task> {
    const tasks = store.getTasks();
    let saved: Task;
    if (task.id) {
      const index = tasks.findIndex(t => t.id === task.id);
      if (index === -1) throw new Error('Tugas tidak ditemukan');
      saved = { ...tasks[index], ...task, id: task.id } as Task;
      tasks[index] = saved;
      await auditService.log('UPDATE', 'master', saved.id, { entity: 'Task', name: saved.name });
    } else {
      saved = {
        id: `t-${Date.now()}`,
        position_id: task.position_id || null,
        code: task.code || `T-${Date.now()}`,
        name: task.name || '',
        description: task.description || '',
        is_active: task.is_active !== undefined ? task.is_active : true,
        created_at: new Date().toISOString()
      };
      tasks.push(saved);
      await auditService.log('CREATE', 'master', saved.id, { entity: 'Task', name: saved.name });
    }
    store.setTasks(tasks);
    return saved;
  },

  async deleteTask(id: string): Promise<void> {
    const tasks = store.getTasks().filter(t => t.id !== id);
    store.setTasks(tasks);
    await auditService.log('DELETE', 'master', id, { entity: 'Task' });
  }
};
