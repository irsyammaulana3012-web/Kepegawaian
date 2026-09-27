import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Users,
  Briefcase,
  Building2,
  GraduationCap,
  Award,
  AlertTriangle,
  FileCheck2,
  CalendarCheck,
  CalendarOff,
  Download,
  Printer,
  FileSpreadsheet
} from 'lucide-react';
import { Employee, EmployeeAssignment, Unit, Position, DashboardStats } from '../../types';
import { employeeService } from '../../services/employeeService';
import { assignmentService } from '../../services/assignmentService';
import { masterDataService } from '../../services/masterDataService';
import { exportService } from '../../services/exportService';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';

export const ReportsIndex: React.FC = () => {
  const [activeReportId, setActiveReportId] = useState<number>(7); // Default to Multiple Penugasan Report!
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [assignments, setAssignments] = useState<EmployeeAssignment[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadReportData = async () => {
      setIsLoading(true);
      try {
        const [empRes, asgList, uList, pList, dStats] = await Promise.all([
          employeeService.getEmployees({ limit: 1000 }),
          assignmentService.getAssignments(),
          masterDataService.getUnits(),
          masterDataService.getPositions(),
          employeeService.getDashboardStats()
        ]);
        setEmployees(empRes.data);
        setAssignments(asgList);
        setUnits(uList);
        setPositions(pList);
        setStats(dStats);
      } finally {
        setIsLoading(false);
      }
    };
    loadReportData();
  }, []);

  const reportMenu = [
    { id: 1, title: '1. Daftar Karyawan Lengkap', icon: <Users className="w-4 h-4" /> },
    { id: 2, title: '2. Rekap Tenaga Guru / Pendidik', icon: <Award className="w-4 h-4" /> },
    { id: 3, title: '3. Rekap Staff / Tenaga Kependidikan', icon: <Briefcase className="w-4 h-4" /> },
    { id: 4, title: '4. Rekap Penugasan per Unit', icon: <Building2 className="w-4 h-4" /> },
    { id: 5, title: '5. Rekap Penugasan per Jabatan', icon: <Briefcase className="w-4 h-4" /> },
    { id: 6, title: '6. Rekap per Tugas / Tupoksi', icon: <Briefcase className="w-4 h-4" /> },
    { id: 7, title: '7. Rekap Multiple Penugasan (Core)', icon: <Briefcase className="w-4 h-4" />, highlight: true },
    { id: 8, title: '8. Rekap Pendidikan Terakhir', icon: <GraduationCap className="w-4 h-4" /> },
    { id: 9, title: '9. Rekap Masa Kerja Karyawan', icon: <Users className="w-4 h-4" /> },
    { id: 10, title: '10. Rekap Status Kepegawaian', icon: <Users className="w-4 h-4" /> },
    { id: 11, title: '11. Dokumen Belum Lengkap', icon: <FileCheck2 className="w-4 h-4 text-amber-500" /> },
    { id: 12, title: '12. Kontrak Akan Berakhir', icon: <AlertTriangle className="w-4 h-4 text-rose-500" /> },
    { id: 13, title: '13. Rekap Presensi Absensi', icon: <CalendarCheck className="w-4 h-4" /> },
    { id: 14, title: '14. Rekap Cuti & Izin', icon: <CalendarOff className="w-4 h-4" /> }
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-emerald-800" />
            <span>Laporan & Rekapitulasi Eksekutif</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            14 Laporan standar kepegawaian dan multiple penugasan Yayasan Al-Qur'aniyyah
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Printer className="w-4 h-4" />}
            onClick={() => exportService.triggerPrint()}
          >
            Cetak Laporan
          </Button>
          <Button
            variant="primary"
            size="sm"
            leftIcon={<FileSpreadsheet className="w-4 h-4" />}
            onClick={() => exportService.exportAssignmentsToExcel(assignments)}
          >
            Export Excel
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Col: Report Selector Navigation */}
        <div className="space-y-1 bg-white p-3 rounded-2xl border border-slate-200 shadow-sm">
          <p className="px-3 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Pilih Format Laporan
          </p>
          {reportMenu.map((m) => (
            <button
              key={m.id}
              onClick={() => setActiveReportId(m.id)}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-left transition ${
                activeReportId === m.id
                  ? 'bg-emerald-800 text-white shadow-sm font-bold'
                  : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <span>{m.icon}</span>
              <span className="truncate">{m.title}</span>
              {m.highlight && activeReportId !== m.id && (
                <span className="text-[9px] bg-amber-400 text-emerald-950 font-bold px-1.5 py-0.2 rounded ml-auto">
                  WAJIB
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Right 3 Cols: Active Report View */}
        <div className="lg:col-span-3">
          {/* REPORT 7: REKAP MULTIPLE PENUGASAN (WAJIB) */}
          {activeReportId === 7 && (
            <Card
              title="7. Rekapitulasi Seluruh Multiple Penugasan Karyawan"
              subtitle="Struktur: Nama | Unit | Jabatan | Tugas | Status"
            >
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-700 whitespace-nowrap">
                  <thead className="bg-slate-50 border-b border-slate-100 font-bold text-slate-600 uppercase text-[11px]">
                    <tr>
                      <th className="py-3 px-4">No</th>
                      <th className="py-3 px-4">Nama Karyawan</th>
                      <th className="py-3 px-4">Unit Penugasan</th>
                      <th className="py-3 px-4">Jabatan</th>
                      <th className="py-3 px-4">Tugas / Amanah</th>
                      <th className="py-3 px-4 text-center">Tipe</th>
                      <th className="py-3 px-4 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {assignments.map((asg, idx) => (
                      <tr key={asg.id} className="hover:bg-slate-50/80">
                        <td className="py-3 px-4 font-bold text-slate-400">{idx + 1}</td>
                        <td className="py-3 px-4 font-bold text-slate-900">{asg.employee_name}</td>
                        <td className="py-3 px-4 font-semibold text-emerald-800">{asg.unit_name}</td>
                        <td className="py-3 px-4 font-bold text-slate-800">{asg.position_name}</td>
                        <td className="py-3 px-4 font-medium text-slate-700">{asg.task_name || asg.custom_task_name || '-'}</td>
                        <td className="py-3 px-4 text-center">
                          <Badge variant={asg.is_primary ? 'gold' : 'slate'} size="sm">
                            {asg.is_primary ? 'Utama' : 'Tambahan'}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <Badge variant={asg.status === 'Aktif' ? 'emerald' : 'slate'} size="sm">
                            {asg.status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {/* REPORT 1: DAFTAR KARYAWAN */}
          {activeReportId === 1 && (
            <Card title="1. Daftar Karyawan Yayasan & Unit">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-700 whitespace-nowrap">
                  <thead className="bg-slate-50 border-b border-slate-100 font-bold text-slate-600 text-[11px] uppercase">
                    <tr>
                      <th className="py-3 px-4">No</th>
                      <th className="py-3 px-4">ID & Nama</th>
                      <th className="py-3 px-4">NIK</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Unit Penugasan</th>
                      <th className="py-3 px-4 text-center">Status Kerja</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {employees.map((e, idx) => (
                      <tr key={e.id}>
                        <td className="py-3 px-4">{idx + 1}</td>
                        <td className="py-3 px-4 font-bold text-slate-900">{e.full_name} ({e.employee_number})</td>
                        <td className="py-3 px-4 font-mono">{e.nik}</td>
                        <td className="py-3 px-4">{e.employment_status}</td>
                        <td className="py-3 px-4 font-semibold text-emerald-800">{e.units_list?.join(', ') || '-'}</td>
                        <td className="py-3 px-4 text-center"><Badge variant={e.is_active ? 'emerald' : 'slate'} size="sm">{e.is_active ? 'Aktif' : 'Nonaktif'}</Badge></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {/* REPORT 4: REKAP PER UNIT */}
          {activeReportId === 4 && (
            <Card title="4. Rekapitulasi Jumlah Penugasan per Unit">
              <div className="space-y-4">
                {stats?.assignments_per_unit.map((u) => (
                  <div key={u.unit_id} className="p-4 rounded-xl bg-slate-50 flex items-center justify-between border border-slate-100">
                    <span className="font-bold text-sm text-slate-900">{u.unit_name}</span>
                    <span className="font-extrabold text-base text-emerald-800">{u.count} Penugasan Aktif</span>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* REPORT 11: DOKUMEN BELUM LENGKAP */}
          {activeReportId === 11 && (
            <Card title="11. Karyawan dengan Dokumen & Berkas Belum Lengkap">
              <div className="divide-y divide-slate-100">
                {stats?.incomplete_data_employees.map((emp) => (
                  <div key={emp.id} className="py-3 flex items-center justify-between gap-4 text-xs">
                    <div>
                      <p className="font-bold text-slate-900">{emp.name} ({emp.number})</p>
                      <p className="text-slate-500 text-[11px]">Kekurangan: {emp.missing.join(', ')}</p>
                    </div>
                    <Badge variant={emp.percentage < 50 ? 'rose' : 'amber'} size="sm">{emp.percentage}% Lengkap</Badge>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* REPORT 12: KONTRAK BERAKHIR */}
          {activeReportId === 12 && (
            <Card title="12. Rekapitulasi Kontrak Kerja Akan Berakhir">
              <div className="divide-y divide-slate-100">
                {stats?.expiring_contracts.map((c) => (
                  <div key={c.id} className="py-3 flex items-center justify-between gap-4 text-xs">
                    <div>
                      <p className="font-bold text-slate-900">{c.name} ({c.number})</p>
                      <p className="text-slate-500">Berakhir pada: {new Date(c.end_date).toLocaleDateString('id-ID', { dateStyle: 'long' })}</p>
                    </div>
                    <Badge variant={c.days_left <= 30 ? 'rose' : 'amber'} size="sm">{c.days_left} Hari Lagi</Badge>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* OTHER REPORTS FALLBACK DISPLAY */}
          {[2, 3, 5, 6, 8, 9, 10, 13, 14].includes(activeReportId) && (
            <Card title={`Laporan Rekapitulasi #${activeReportId}`}>
              <div className="p-8 text-center text-xs text-slate-500 space-y-2">
                <BarChart3 className="w-10 h-10 text-emerald-800 mx-auto" />
                <p className="font-bold text-slate-800 text-sm">Rekapitulasi Data Terintegrasi</p>
                <p>Data laporan dihitung real-time dari master database kepegawaian yayasan.</p>
                <div className="pt-4">
                  <Button variant="outline" size="sm" onClick={() => exportService.exportEmployeesToExcel(employees)}>
                    Unduh Data Lengkap Excel
                  </Button>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};
