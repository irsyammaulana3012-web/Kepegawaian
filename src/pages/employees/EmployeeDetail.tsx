import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  User,
  FileText,
  Briefcase,
  GraduationCap,
  History,
  FolderLock,
  CalendarCheck,
  CalendarOff,
  StickyNote,
  Edit,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Building2,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Printer,
  CreditCard
} from 'lucide-react';
import { Employee } from '../../types';
import { employeeService } from '../../services/employeeService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Card } from '../../components/ui/Card';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { Skeleton } from '../../components/ui/Skeleton';

// Tab subcomponents
import { EmployeeAssignmentsTab } from './EmployeeAssignmentsTab';
import { EmployeeEducationTab } from './EmployeeEducationTab';
import { EmployeeHistoryTimelineTab } from './EmployeeHistoryTimelineTab';
import { EmployeeDocumentsTab } from './EmployeeDocumentsTab';
import { EmployeeAttendanceTab } from './EmployeeAttendanceTab';
import { EmployeeLeaveTab } from './EmployeeLeaveTab';
import { EmployeeNotesTab } from './EmployeeNotesTab';

export const EmployeeDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { canEdit } = useAuth();
  const { error } = useToast();

  const [employee, setEmployee] = useState<Employee | null>(null);
  const [activeTab, setActiveTab] = useState<'profile' | 'employment' | 'assignments' | 'education' | 'history' | 'documents' | 'attendance' | 'leave' | 'notes'>('assignments');
  const [isLoading, setIsLoading] = useState(true);

  const loadEmployee = async () => {
    if (!id) return;
    try {
      setIsLoading(true);
      const data = await employeeService.getEmployeeById(id);
      if (!data) {
        error('Data karyawan tidak ditemukan');
        navigate('/employees');
        return;
      }
      setEmployee(data);
    } catch (err: any) {
      error('Gagal memuat profil', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadEmployee();
  }, [id]);

  if (isLoading || !employee) {
    return (
      <div className="space-y-6 max-w-6xl mx-auto">
        <Skeleton height={200} />
        <Skeleton height={400} />
      </div>
    );
  }

  const tabs = [
    { id: 'assignments', label: '1. Penugasan (Multi-Unit)', icon: <Briefcase className="w-4 h-4" />, count: employee.assignment_count, highlight: true },
    { id: 'profile', label: '2. Profil Pribadi', icon: <User className="w-4 h-4" /> },
    { id: 'employment', label: '3. Kepegawaian', icon: <FileText className="w-4 h-4" /> },
    { id: 'education', label: '4. Pendidikan', icon: <GraduationCap className="w-4 h-4" /> },
    { id: 'history', label: '5. Riwayat Penugasan', icon: <History className="w-4 h-4" /> },
    { id: 'documents', label: '6. Dokumen & Berkas', icon: <FolderLock className="w-4 h-4" /> },
    { id: 'attendance', label: '7. Absensi Presensi', icon: <CalendarCheck className="w-4 h-4" /> },
    { id: 'leave', label: '8. Cuti & Izin', icon: <CalendarOff className="w-4 h-4" /> },
    { id: 'notes', label: '9. Catatan Internal', icon: <StickyNote className="w-4 h-4" /> }
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12 animate-in fade-in duration-200">
      {/* Top Breadcrumb & Action */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/employees')}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-emerald-800 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Daftar Karyawan</span>
        </button>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Printer className="w-4 h-4" />}
            onClick={() => window.print()}
          >
            Cetak Biodata
          </Button>
          {canEdit && (
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Edit className="w-4 h-4" />}
              onClick={() => navigate(`/employees/${employee.id}/edit`)}
            >
              Edit Profil
            </Button>
          )}
        </div>
      </div>

      {/* HERO PROFILE HEADER */}
      <div className="rounded-3xl bg-white border border-slate-200/80 p-6 sm:p-8 shadow-sm relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            {/* Avatar / Photo */}
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-emerald-100 text-emerald-900 font-extrabold flex items-center justify-center text-3xl shrink-0 border-2 border-emerald-300 shadow-md">
              {employee.photo_url ? (
                <img
                  src={employee.photo_url}
                  alt={employee.full_name}
                  className="w-full h-full object-cover rounded-2xl"
                />
              ) : (
                employee.full_name.charAt(0).toUpperCase()
              )}
            </div>

            {/* Main Info */}
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  {employee.full_name}
                </h1>
                <Badge variant={employee.is_active ? 'emerald' : 'slate'} size="sm">
                  {employee.is_active ? 'Karyawan Aktif' : 'Nonaktif'}
                </Badge>
              </div>

              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600">
                <span className="font-mono font-bold text-emerald-900 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                  ID: {employee.employee_number}
                </span>
                {employee.nirg && (
                  <span className="font-mono font-bold text-amber-900 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                    NIRG: {employee.nirg}
                  </span>
                )}
                {employee.nirk && (
                  <span className="font-mono font-bold text-indigo-900 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200">
                    NIRK: {employee.nirk}
                  </span>
                )}
                <span>NIK: <strong>{employee.nik}</strong></span>
                {employee.nip && <span>NIP: <strong>{employee.nip}</strong></span>}
                <span>Status: <strong className="text-emerald-800">{employee.employment_status}</strong></span>
              </div>

              {/* Primary Assignment Tag */}
              {employee.primary_assignment && (
                <p className="text-xs text-slate-700 pt-1 flex items-center gap-1.5">
                  <span className="font-bold text-slate-500">Penugasan Utama:</span>
                  <span className="font-extrabold text-emerald-950">
                    {employee.primary_assignment.position_name}
                  </span>
                  <span>di</span>
                  <span className="font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                    {employee.primary_assignment.unit_name}
                  </span>
                </p>
              )}
            </div>
          </div>

          {/* Completeness Gauge Card */}
          <div className="w-full md:w-56 p-4 rounded-2xl bg-slate-50 border border-slate-200/80 shrink-0">
            <ProgressBar
              value={employee.data_completeness_pct || 0}
              showLabel
              color={(employee.data_completeness_pct || 0) === 100 ? 'emerald' : 'gold'}
            />
            <p className="text-[10px] text-slate-500 mt-2 text-center">
              {(employee.data_completeness_pct || 0) === 100
                ? '✓ Seluruh berkas & profil telah lengkap'
                : 'Lengkapi seluruh data pribadi & dokumen'}
            </p>
          </div>
        </div>
      </div>

      {/* 10 NAVIGATION TABS */}
      <div className="border-b border-slate-200 overflow-x-auto scrollbar-none">
        <nav className="flex space-x-2 min-w-max pb-2">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all duration-150 ${
                  isActive
                    ? 'bg-emerald-800 text-white shadow-md shadow-emerald-900/10'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
                {tab.count !== undefined && tab.count > 0 && (
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${
                      isActive ? 'bg-amber-400 text-emerald-950' : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* TAB CONTENTS */}
      <div className="animate-in fade-in duration-150">
        {/* TAB 1: PROFIL PRIBADI */}
        {activeTab === 'profile' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card title="Data Identitas & Registrasi Yayasan">
              <div className="divide-y divide-slate-100 text-xs">
                <div className="py-2.5 flex justify-between">
                  <span className="text-slate-500">NIRG (Registrasi Guru)</span>
                  <span className="font-mono font-bold text-amber-900">{employee.nirg || '-'}</span>
                </div>
                <div className="py-2.5 flex justify-between">
                  <span className="text-slate-500">NIRK (Registrasi Karyawan)</span>
                  <span className="font-mono font-bold text-indigo-900">{employee.nirk || '-'}</span>
                </div>
                <div className="py-2.5 flex justify-between">
                  <span className="text-slate-500">Nama Lengkap</span>
                  <span className="font-bold text-slate-900">{employee.full_name}</span>
                </div>
                <div className="py-2.5 flex justify-between">
                  <span className="text-slate-500">Nama Panggilan</span>
                  <span className="font-medium text-slate-800">{employee.nickname || '-'}</span>
                </div>
                <div className="py-2.5 flex justify-between">
                  <span className="text-slate-500">Pendidikan Terakhir</span>
                  <span className="font-bold text-emerald-800">{employee.last_education || '-'}</span>
                </div>
                <div className="py-2.5 flex justify-between">
                  <span className="text-slate-500">Jenis Kelamin</span>
                  <span className="font-medium text-slate-800">{employee.gender}</span>
                </div>
                <div className="py-2.5 flex justify-between">
                  <span className="text-slate-500">Tempat, Tanggal Lahir</span>
                  <span className="font-medium text-slate-800">
                    {employee.birth_place || '-'},{' '}
                    {employee.birth_date ? new Date(employee.birth_date).toLocaleDateString('id-ID', { dateStyle: 'long' }) : '-'}
                  </span>
                </div>
                <div className="py-2.5 flex justify-between">
                  <span className="text-slate-500">Agama</span>
                  <span className="font-medium text-slate-800">{employee.religion}</span>
                </div>
                <div className="py-2.5 flex justify-between">
                  <span className="text-slate-500">Status Pernikahan</span>
                  <span className="font-medium text-slate-800">{employee.marital_status}</span>
                </div>
                <div className="py-2.5 flex justify-between">
                  <span className="text-slate-500">Nomor KK</span>
                  <span className="font-mono font-medium text-slate-800">{employee.no_kk || '-'}</span>
                </div>
              </div>
            </Card>

            <Card title="Alamat & Kontak Domisili">
              <div className="divide-y divide-slate-100 text-xs">
                <div className="py-2.5">
                  <span className="text-slate-500 block mb-1">Alamat Lengkap:</span>
                  <span className="font-medium text-slate-900 leading-relaxed">{employee.address || '-'}</span>
                </div>
                <div className="py-2.5 flex justify-between">
                  <span className="text-slate-500">RT / RW</span>
                  <span className="font-medium text-slate-800">{employee.rt || '-'} / {employee.rw || '-'}</span>
                </div>
                <div className="py-2.5 flex justify-between">
                  <span className="text-slate-500">Kelurahan / Kecamatan</span>
                  <span className="font-medium text-slate-800">{employee.kelurahan || '-'}, {employee.kecamatan || '-'}</span>
                </div>
                <div className="py-2.5 flex justify-between">
                  <span className="text-slate-500">Kota / Provinsi</span>
                  <span className="font-medium text-slate-800">{employee.city || '-'}, {employee.province || '-'}</span>
                </div>
                <div className="py-2.5 flex justify-between">
                  <span className="text-slate-500">No. HP / WhatsApp</span>
                  <span className="font-bold text-emerald-800 font-mono">{employee.phone || employee.whatsapp || '-'}</span>
                </div>
                <div className="py-2.5 flex justify-between">
                  <span className="text-slate-500">Email</span>
                  <span className="font-medium text-slate-800">{employee.email || '-'}</span>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* TAB 2: DATA KEPEGAWAIAN */}
        {activeTab === 'employment' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card title="Status & Masa Kerja">
              <div className="divide-y divide-slate-100 text-xs">
                <div className="py-2.5 flex justify-between">
                  <span className="text-slate-500">Status Kepegawaian</span>
                  <Badge variant="emerald" size="sm">{employee.employment_status}</Badge>
                </div>
                <div className="py-2.5 flex justify-between">
                  <span className="text-slate-500">Tahun Masuk</span>
                  <span className="font-bold text-slate-900">{employee.entry_year || (employee.join_date ? employee.join_date.split('-')[0] : '-')}</span>
                </div>
                {employee.exit_year && (
                  <div className="py-2.5 flex justify-between">
                    <span className="text-slate-500">Tahun Keluar</span>
                    <span className="font-bold text-rose-800">{employee.exit_year}</span>
                  </div>
                )}
                <div className="py-2.5 flex justify-between">
                  <span className="text-slate-500">Tanggal Mulai Bekerja (TMT)</span>
                  <span className="font-bold text-slate-900">
                    {new Date(employee.join_date).toLocaleDateString('id-ID', { dateStyle: 'long' })}
                  </span>
                </div>
                <div className="py-2.5 flex justify-between">
                  <span className="text-slate-500">SK Pengangkatan Yayasan</span>
                  <span className="font-mono font-medium text-slate-800">{employee.appointment_sk_number || '-'}</span>
                </div>
                <div className="py-2.5 flex justify-between">
                  <span className="text-slate-500">Tanggal SK</span>
                  <span className="font-medium text-slate-800">
                    {employee.appointment_sk_date ? new Date(employee.appointment_sk_date).toLocaleDateString('id-ID') : '-'}
                  </span>
                </div>
                {employee.contract_end_date && (
                  <div className="py-2.5 flex justify-between">
                    <span className="text-slate-500">Tanggal Berakhir Kontrak</span>
                    <span className="font-bold text-amber-800">
                      {new Date(employee.contract_end_date).toLocaleDateString('id-ID', { dateStyle: 'long' })}
                    </span>
                  </div>
                )}
              </div>
            </Card>

            <Card title="Rekening Perbankan & Status">
              <div className="space-y-4 text-xs">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                  <h4 className="font-bold text-slate-900 mb-2 flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-emerald-700" />
                    <span>Rekening Penggajian</span>
                  </h4>
                  <div className="divide-y divide-slate-100 text-xs">
                    <div className="py-1.5 flex justify-between">
                      <span className="text-slate-500">Bank</span>
                      <span className="font-bold text-slate-800">{employee.bank_name || 'Bank Syariah Indonesia (BSI)'}</span>
                    </div>
                    <div className="py-1.5 flex justify-between">
                      <span className="text-slate-500">Nomor Rekening</span>
                      <span className="font-mono font-extrabold text-emerald-900 text-sm">
                        {employee.bank_account_number || '-'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-emerald-700" />
                    <span className="font-bold text-emerald-950">Status: {employee.is_active ? 'Aktif Bekerja' : 'Nonaktif'}</span>
                  </div>
                  {!employee.is_active && employee.inactive_reason && (
                    <p className="mt-2 text-rose-700 font-medium">Alasan: {employee.inactive_reason}</p>
                  )}
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* TAB 3: MULTIPLE ASSIGNMENTS (CORE) */}
        {activeTab === 'assignments' && (
          <EmployeeAssignmentsTab
            employeeId={employee.id}
            onAssignmentsUpdated={loadEmployee}
          />
        )}

        {/* TAB 4: PENDIDIKAN */}
        {activeTab === 'education' && (
          <EmployeeEducationTab employeeId={employee.id} employee={employee} />
        )}

        {/* TAB 5: RIWAYAT PENUGASAN TIMELINE */}
        {activeTab === 'history' && (
          <EmployeeHistoryTimelineTab employeeId={employee.id} />
        )}

        {/* TAB 6: DOKUMEN */}
        {activeTab === 'documents' && (
          <EmployeeDocumentsTab employeeId={employee.id} />
        )}

        {/* TAB 7: ABSENSI */}
        {activeTab === 'attendance' && (
          <EmployeeAttendanceTab employeeId={employee.id} />
        )}

        {/* TAB 9: CUTI & IZIN */}
        {activeTab === 'leave' && (
          <EmployeeLeaveTab employeeId={employee.id} />
        )}

        {/* TAB 10: CATATAN INTERNAL */}
        {activeTab === 'notes' && (
          <EmployeeNotesTab employeeId={employee.id} />
        )}
      </div>
    </div>
  );
};
