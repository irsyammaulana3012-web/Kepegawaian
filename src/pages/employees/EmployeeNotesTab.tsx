import React, { useState, useEffect } from 'react';
import { StickyNote, Plus, Trash2, Lock, Unlock } from 'lucide-react';
import { EmployeeNote } from '../../types';
import { notesService } from '../../services/notesService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Badge } from '../../components/ui/Badge';
import { ConfirmationDialog } from '../../components/ui/ConfirmationDialog';

interface EmployeeNotesTabProps {
  employeeId: string;
}

export const EmployeeNotesTab: React.FC<EmployeeNotesTabProps> = ({ employeeId }) => {
  const { canEdit, isSuperAdmin, isAdminYayasan } = useAuth();
  const { success, error } = useToast();

  const [notes, setNotes] = useState<EmployeeNote[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [content, setContent] = useState('');
  const [isConfidential, setIsConfidential] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [noteToDelete, setNoteToDelete] = useState<EmployeeNote | null>(null);

  const loadNotes = async () => {
    setIsLoading(true);
    try {
      const data = await notesService.getNotesByEmployee(employeeId);
      // Filter confidential notes if viewer
      const filtered = data.filter(n => !n.is_confidential || isSuperAdmin || isAdminYayasan);
      setNotes(filtered);
    } catch (err: any) {
      error('Gagal memuat catatan', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadNotes();
  }, [employeeId, isSuperAdmin, isAdminYayasan]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) {
      error('Isi catatan tidak boleh kosong');
      return;
    }

    setIsSaving(true);
    try {
      await notesService.addNote(employeeId, content.trim(), isConfidential);
      success('Catatan Disimpan', 'Catatan internal HR berhasil ditambahkan.');
      setIsModalOpen(false);
      setContent('');
      setIsConfidential(false);
      loadNotes();
    } catch (err: any) {
      error('Gagal Menyimpan Catatan', err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!noteToDelete) return;
    try {
      await notesService.deleteNote(noteToDelete.id);
      success('Catatan Dihapus', 'Catatan internal telah dihapus.');
      setNoteToDelete(null);
      loadNotes();
    } catch (err: any) {
      error('Gagal Menghapus', err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between p-4 rounded-2xl bg-white border border-slate-200">
        <div>
          <h3 className="text-sm font-bold text-slate-900">Catatan Internal & Evaluasi HR</h3>
          <p className="text-xs text-slate-500">Catatan rahasia, rekomendasi pengembangan, dan apresiasi kinerja</p>
        </div>
        {canEdit && (
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => setIsModalOpen(true)}
          >
            Tambah Catatan
          </Button>
        )}
      </div>

      {notes.length === 0 ? (
        <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-500 text-xs">
          Belum ada catatan internal untuk karyawan ini.
        </div>
      ) : (
        <div className="space-y-3">
          {notes.map((n) => (
            <div
              key={n.id}
              className={`p-5 rounded-2xl border transition shadow-sm space-y-2 ${
                n.is_confidential
                  ? 'bg-amber-50/40 border-amber-200/80'
                  : 'bg-white border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-800">
                    {new Date(n.note_date).toLocaleDateString('id-ID', { dateStyle: 'full' })}
                  </span>
                  {n.is_confidential && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-200/70 text-amber-900">
                      <Lock className="w-3 h-3" />
                      <span>Rahasia</span>
                    </span>
                  )}
                </div>

                {canEdit && (
                  <button
                    onClick={() => setNoteToDelete(n)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">{n.content}</p>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                <span>Ditulis oleh: <strong className="text-slate-600">{n.created_by_name || 'Admin'}</strong></span>
                <span>{new Date(n.created_at || '').toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Tambah Catatan Internal HR">
        <form onSubmit={handleAdd} className="space-y-4">
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-700 uppercase">Isi Catatan *</label>
            <textarea
              rows={4}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 outline-none"
              placeholder="Tulis catatan evaluasi, masukan, atau rekomendasi..."
              required
            />
          </div>

          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={isConfidential}
              onChange={(e) => setIsConfidential(e.target.checked)}
              className="w-4 h-4 rounded text-emerald-800 focus:ring-emerald-600 border-slate-300"
            />
            <span className="text-xs font-semibold text-slate-800">
              Tandai sebagai catatan rahasia (Hanya Super Admin & Yayasan)
            </span>
          </label>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Batal</Button>
            <Button type="submit" variant="primary" isLoading={isSaving}>Simpan Catatan</Button>
          </div>
        </form>
      </Modal>

      <ConfirmationDialog
        isOpen={Boolean(noteToDelete)}
        onClose={() => setNoteToDelete(null)}
        onConfirm={handleDelete}
        title="Hapus Catatan?"
        message="Apakah Anda yakin ingin menghapus catatan ini?"
      />
    </div>
  );
};
