// App.jsx
import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ToastProvider } from "./context/ToastContext";
import { ConfirmProvider } from "./context/ConfirmContext";

// Employee Pages
import Dashboard from "./View/Pages/Dashboard/Dashboard";
import Task from "./View/Pages/Task/Task";
import Reports from "./View/Pages/Report/Reports";
import ProjectReport from "./View/Pages/Report/ProjectReport";
import Attendence from "./View/Pages/Attendence/Attendence";
import Settings from "./View/Pages/Setting/Settings";

// Admin Pages
import AdminDashboard from "./View/Pages/Dashboard/AdminDashboard";

// Auth Pages
import Login from "./View/Pages/Login/Login";

// Layouts
import Layout from "./View/Layout/Layout";
import AdminLayout from "./View/Layout/AdminLayout";

import AdminAttendance from "./View/Pages/Attendence/AdminAttendence";
import AdminTask from "./View/Pages/Task/AdminTask";

import AdminSetting from "./View/Pages/Setting/AdminSetting";
import AdminEmployee from "./View/Pages/Employee/AdminEmployee";
import AdminProject from "./View/Pages/Project/AdminProject";
import AdminLeave from "./View/Pages/Leave/AdminLeave";
import EmployeeLeave from "./View/Pages/Leave/EmployeeLeave";
import EmployeeProject from "./View/Pages/Project/EmployeeProject";
import ProjectDetails from "./View/Pages/Project/ProjectDetails";

// ====================== ROUTES INSIDE PROVIDER ======================
function AppRoutes() {
  const { user, initialized } = useAuth();

  if (!initialized) return <div>Loading...</div>; // optional spinner

  const token = user; // logged-in check
  const designation = user?.designation;

  const isAdmin = designation === "Admin";
  const isTeamLead = designation === "Team Lead";
  const isManagement = isAdmin || isTeamLead;
  const isEmployee = !isAdmin && !isTeamLead;

  return (
    <Routes>
      {/* ================= PUBLIC ROUTE ================= */}
      {!token && (
        <>
          <Route path="/login" element={<Login />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </>
      )}

      {/* ================= EMPLOYEE ROUTES ================= */}
      {token && isEmployee && (
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard employeeId={user._id} />} />
          <Route path="tasks" element={<Task />} />
          <Route path="reports" element={<Reports />} />
          <Route path="settings" element={<Settings />} />
          <Route path="attendence" element={<Attendence />} />
          <Route path="leave" element={<EmployeeLeave />} />
          <Route path="projects" element={<EmployeeProject />} />
          <Route path="projects/:projectId" element={<ProjectDetails />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      )}

      {/* ================= MANAGEMENT ROUTES (Admin & TL) ================= */}
      {token && isManagement && (
        <Route path="/" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="admintask" element={<AdminTask />} />
          <Route path="adminProject" element={<AdminProject />} />
          <Route path="projects/:projectId" element={<ProjectDetails />} />

          {/* Admin Only Routes */}
          {isAdmin && (
            <>
              <Route path="adminAttendence" element={<AdminAttendance />} />
              <Route path="adminEmployee" element={<AdminEmployee />} />
              <Route path="adminLeave" element={<AdminLeave />} />
              <Route path="adminSetting" element={<AdminSetting />} />
              <Route path="project-reports" element={<ProjectReport />} />
            </>
          )}

          {/* Fallback for Team Leads trying to access Admin-only pages or just any missing route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      )}
    </Routes>
  );
}

// ====================== MAIN APP ======================
export default function App() {
  return (
    <ToastProvider>
      <ConfirmProvider>
        <AuthProvider>
          <HashRouter>
            <AppRoutes />
          </HashRouter>
        </AuthProvider>
      </ConfirmProvider>
    </ToastProvider>
  );
}
