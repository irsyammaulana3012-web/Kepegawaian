import React, { useState, useEffect } from 'react';
import { ShieldAlert, Plus, Edit2, Trash2, CheckCircle2, User } from 'lucide-react';
import { UserProfile, UserRole } from '../../types';
import { store } from '../../services/storageStore';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';

export const UserManagement: React.FC = () => {
  const { isSuperAdmin } = useAuth();
  const { success, error } = useToast();

  const [users, setUsers] = useState<UserProfile[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<UserRole>('viewer');

  const loadUsers = () => {
    setUsers(store.getUsers());
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleOpenAdd = () => {
    setEditingUser(null);
    setEmail('');
    setFullName('');
    setRole('viewer');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (u: UserProfile) => {
    setEditingUser(u);
    setEmail(u.email);
    setFullName(u.full_name);
    setRole(u.role);
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !fullName.trim()) {
      error('Email dan nama lengkap wajib diisi');
      return;
    }

    const all = store.getUsers();
    if (editingUser) {
      const idx = all.findIndex(u => u.id === editingUser.id);
      if (idx !== -1) {
        all[idx] = { ...all[idx], email, full_name: fullName, role };
      }
    } else {
      all.push({
        id: `usr-${Date.now()}`,
        email,
        full_name: fullName,
        role,
        is_active: true,
        created_at: new Date().toISOString()
      });
    }

    store.setUsers(all);
    success('User Disimpan', `Pengguna ${fullName} berhasil disimpan.`);
    setIsModalOpen(false);
    loadUsers();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-emerald-800" />
            <span>Pengguna & Manajemen Hak Akses (RBAC)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Role: Super Admin, Admin Yayasan, Admin Unit, HR Kepegawaian, Viewer
          </p>
        </div>

        {isSuperAdmin && (
          <Button variant="primary" size="sm" leftIcon={<Plus className="w-4 h-4" />} onClick={handleOpenAdd}>
            Tambah Pengguna Baru
          </Button>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <table className="w-full text-left text-xs text-slate-700 whitespace-nowrap">
          <thead className="bg-slate-50 border-b border-slate-100 font-bold text-slate-600 uppercase text-[11px]">
            <tr>
              <th className="py-3 px-4">Nama Lengkap</th>
              <th className="py-3 px-4">Email Akun</th>
              <th className="py-3 px-4">Role / Hak Akses</th>
              <th className="py-3 px-4 text-center">Status</th>
              {isSuperAdmin && <th className="py-3 px-4 text-right">Aksi</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-slate-50/80">
                <td className="py-3.5 px-4 font-bold text-slate-900">{u.full_name}</td>
                <td className="py-3.5 px-4 font-mono text-slate-500">{u.email}</td>
                <td className="py-3.5 px-4">
                  <Badge
                    variant={
                      u.role === 'super_admin'
                        ? 'rose'
                        : u.role === 'admin_yayasan'
                        ? 'gold'
                        : u.role === 'hr_kepegawaian'
                        ? 'emerald'
                        : 'blue'
                    }
                    size="sm"
                  >
                    {u.role.replace('_', ' ').toUpperCase()}
                  </Badge>
                </td>
                <td className="py-3.5 px-4 text-center">
                  <Badge variant={u.is_active ? 'emerald' : 'slate'} size="sm">
                    {u.is_active ? 'Aktif' : 'Nonaktif'}
                  </Badge>
                </td>
                {isSuperAdmin && (
                  <td className="py-3.5 px-4 text-right">
                    <button onClick={() => handleOpenEdit(u)} className="p-1.5 text-slate-400 hover:text-amber-700 rounded-lg">
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingUser ? 'Edit User' : 'Tambah User'}>
        <form onSubmit={handleSave} className="space-y-4">
          <Input label="Nama Lengkap" isRequired value={fullName} onChange={(e) => setFullName(e.target.value)} />
          <Input label="Email Akun" type="email" isRequired value={email} onChange={(e) => setEmail(e.target.value)} />
          <Select
            label="Role Hak Akses"
            value={role}
            onChange={(e) => setRole(e.target.value as any)}
            options={[
              { value: 'super_admin', label: 'Super Admin' },
              { value: 'admin_yayasan', label: 'Admin Yayasan' },
              { value: 'hr_kepegawaian', label: 'HR / Kepegawaian' },
              { value: 'admin_unit', label: 'Admin Unit' },
              { value: 'viewer', label: 'Viewer' }
            ]}
          />
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Batal</Button>
            <Button type="submit" variant="primary">Simpan User</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
