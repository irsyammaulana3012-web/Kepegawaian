import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { Employee, EmployeeAssignment } from '../types';
import { auditService } from './auditService';

export const exportService = {
  // Export to Excel
  exportEmployeesToExcel(employees: Employee[], filename = 'Data_Karyawan_SIMKA'): void {
    const data = employees.map((emp, index) => ({
      'No': index + 1,
      'ID Karyawan': emp.employee_number,
      'Nama Lengkap': emp.full_name,
      'NIK': emp.nik,
      'NIP': emp.nip || '-',
      'Jenis Kelamin': emp.gender,
      'Status Kepegawaian': emp.employment_status,
      'Jumlah Penugasan': emp.assignment_count || 0,
      'Penugasan Utama': emp.primary_assignment ? `${emp.primary_assignment.position_name || ''} - ${emp.primary_assignment.unit_name || ''}` : '-',
      'Unit Penugasan': emp.units_list?.join(', ') || '-',
      'Jabatan': emp.positions_list?.join(', ') || '-',
      'No HP / WhatsApp': emp.phone || emp.whatsapp || '-',
      'Email': emp.email || '-',
      'Tanggal Masuk': emp.join_date,
      'Kelengkapan Data': `${emp.data_completeness_pct || 0}%`,
      'Status': emp.is_active ? 'Aktif' : 'Nonaktif'
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Data Karyawan');

    XLSX.writeFile(workbook, `${filename}_${new Date().toISOString().split('T')[0]}.xlsx`);
    auditService.log('EXPORT_EXCEL', 'employees', undefined, { count: employees.length, filename });
  },

  // Export Multiple Assignments Report to Excel
  exportAssignmentsToExcel(assignments: EmployeeAssignment[], filename = 'Rekap_Multiple_Penugasan_SIMKA'): void {
    const data = assignments.map((asg, index) => ({
      'No': index + 1,
      'ID Karyawan': asg.employee_number || '-',
      'Nama Karyawan': asg.employee_name || '-',
      'Unit': asg.unit_name || '-',
      'Divisi / Bagian': asg.department_name || '-',
      'Jabatan': asg.position_name || '-',
      'Tugas': asg.task_name || '-',
      'Status Penugasan': asg.status,
      'Penugasan Utama': asg.is_primary ? 'Ya (Utama)' : 'Penugasan Tambahan',
      'No SK': asg.sk_number || '-',
      'Tanggal Mulai': asg.start_date,
      'Tanggal Selesai': asg.end_date || '-',
      'Keterangan': asg.notes || '-'
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Rekap Penugasan');

    XLSX.writeFile(workbook, `${filename}_${new Date().toISOString().split('T')[0]}.xlsx`);
    auditService.log('EXPORT_EXCEL', 'assignments', undefined, { count: assignments.length, filename });
  },

  // Export to CSV
  exportToCsv(data: any[], filename = 'Export_SIMKA'): void {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const csv = XLSX.utils.sheet_to_csv(worksheet);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    auditService.log('EXPORT_CSV', 'general', undefined, { count: data.length, filename });
  },

  // Export to PDF
  exportEmployeesToPdf(employees: Employee[], title = 'LAPORAN DATA KARYAWAN SIMKA'): void {
    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

    // Header
    doc.setFontSize(16);
    doc.setTextColor(22, 101, 52); // Emerald 800
    doc.text('YAYASAN PENDIDIKAN ISLAM PONDOK PESANTREN AL-QUR\'ANIYYAH', 14, 15);
    
    doc.setFontSize(12);
    doc.setTextColor(51, 65, 85);
    doc.text(title, 14, 22);

    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.text(`Dicetak pada: ${new Date().toLocaleDateString('id-ID', { dateStyle: 'full' })} | Total: ${employees.length} Karyawan`, 14, 28);

    const headers = [['No', 'ID', 'Nama Lengkap', 'NIK', 'Status', 'Unit Penugasan', 'Jabatan & Tugas', 'Status Aktif']];
    const rows = employees.map((emp, idx) => [
      idx + 1,
      emp.employee_number,
      emp.full_name,
      emp.nik,
      emp.employment_status,
      emp.units_list?.join(', ') || '-',
      emp.primary_assignment ? `${emp.primary_assignment.position_name || ''} (${emp.primary_assignment.task_name || ''})` : '-',
      emp.is_active ? 'Aktif' : 'Nonaktif'
    ]);

    (doc as any).autoTable({
      head: headers,
      body: rows,
      startY: 32,
      theme: 'grid',
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [22, 101, 52], textColor: [255, 255, 255] },
      alternateRowStyles: { fillColor: [248, 250, 252] }
    });

    doc.save(`Laporan_Karyawan_${new Date().toISOString().split('T')[0]}.pdf`);
    auditService.log('EXPORT_PDF', 'employees', undefined, { count: employees.length });
  },

  // Trigger Print View
  triggerPrint(): void {
    window.print();
  }
};
