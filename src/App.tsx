import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';

// Layout
import { DashboardLayout } from './layouts/DashboardLayout';

// Pages
import { Dashboard } from './pages/Dashboard';
import { EmployeeList } from './pages/employees/EmployeeList';
import { EmployeeDetail } from './pages/employees/EmployeeDetail';
import { EmployeeForm } from './pages/employees/EmployeeForm';
import { AssignmentsOverview } from './pages/assignments/AssignmentsOverview';
import { EducationList } from './pages/education/EducationList';
import { DocumentList } from './pages/documents/DocumentList';
import { MasterUnits } from './pages/master/MasterUnits';
import { MasterDepartments } from './pages/master/MasterDepartments';
import { MasterPositions } from './pages/master/MasterPositions';
import { MasterTasks } from './pages/master/MasterTasks';
import { ImportExportIndex } from './pages/import-export/ImportExportIndex';
import { ReportsIndex } from './pages/reports/ReportsIndex';
import { AttendanceList } from './pages/attendance/AttendanceList';
import { LeaveList } from './pages/leave/LeaveList';
import { ExpiringContracts } from './pages/contracts/ExpiringContracts';
import { AuditLogList } from './pages/audit/AuditLogList';
import { UserManagement } from './pages/users/UserManagement';
import { SettingsPage } from './pages/settings/SettingsPage';
import { Login } from './pages/auth/Login';
import { ForgotPassword } from './pages/auth/ForgotPassword';

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-10 h-10 border-4 border-emerald-800 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <Routes>
            {/* Public Auth Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />

            {/* Protected Application Routes */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Dashboard />} />
              
              {/* Data Karyawan */}
              <Route path="employees" element={<EmployeeList />} />
              <Route path="employees/new" element={<EmployeeForm />} />
              <Route path="employees/:id" element={<EmployeeDetail />} />
              <Route path="employees/:id/edit" element={<EmployeeForm />} />

              {/* Multiple Assignments Cockpit */}
              <Route path="assignments" element={<AssignmentsOverview />} />

              {/* Pendidikan & Dokumen Repository */}
              <Route path="education" element={<EducationList />} />
              <Route path="documents" element={<DocumentList />} />

              {/* Master Data */}
              <Route path="master/units" element={<MasterUnits />} />
              <Route path="master/departments" element={<MasterDepartments />} />
              <Route path="master/positions" element={<MasterPositions />} />
              <Route path="master/tasks" element={<MasterTasks />} />

              {/* Import & Export */}
              <Route path="import-export" element={<ImportExportIndex />} />

              {/* Kepegawaian */}
              <Route path="attendance" element={<AttendanceList />} />
              <Route path="leave" element={<LeaveList />} />
              <Route path="contracts" element={<ExpiringContracts />} />

              {/* Reports & Logs */}
              <Route path="reports" element={<ReportsIndex />} />
              <Route path="audit-logs" element={<AuditLogList />} />
              <Route path="users" element={<UserManagement />} />
              <Route path="settings" element={<SettingsPage />} />
            </Route>

            {/* Catch All Redirect */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
};

export default App;
