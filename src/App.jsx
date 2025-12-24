// App.jsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";

// Employee Pages
import Dashboard from "./View/Pages/Dashboard/Dashboard";
import Task from "./View/Pages/Task/Task";
import Reports from "./View/Pages/Report/Reports";
import Attendence from "./View/Pages/Attendence/Attendence";
import Settings from "./View/Pages/Setting/Settings";
import Employee from "./View/Pages/Employee/Employee"

// Admin Pages
import AdminDashboard from "./View/Pages/Dashboard/AdminDashboard";
import Register from "./View/Pages/Register/Register";

// Auth Pages
import Login from "./View/Pages/Login/Login";

// Layouts
import Layout from "./View/Layout/Layout";
import AdminLayout from "./View/Layout/AdminLayout";

// Common Components
import Pomodoro from "./component/Pomodoro/pomodoro";
import Project from "./View/Pages/Project/Project";
import AdminAttendance from "./View/Pages/Attendence/AdminAttendence";

// ====================== ROUTES INSIDE PROVIDER ======================
function AppRoutes() {
  const { user, initialized } = useAuth();

  if (!initialized) return <div>Loading...</div>; // optional spinner

  const token = user; // logged-in check
  const designation = user?.designation;

  const isAdmin = designation === "Admin";
  const isEmployee = !isAdmin;

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
          <Route index element={<Dashboard />} />
          <Route path="pomodoro" element={<Pomodoro />} />
          <Route path="tasks" element={<Task />} />
          <Route path="reports" element={<Reports />} />
          <Route path="settings" element={<Settings />} />
          <Route path="attendence" element={<Attendence />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      )}

      {/* ================= ADMIN ROUTES ================= */}
      {token && isAdmin && (
        <Route path="/" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="register" element={<Register />} />
          <Route path="*" element={<Navigate to="/" replace />} />
          <Route path="project" element={<Project/>}/>
          <Route path="adminAttendence" element={<AdminAttendance/>}/>
          <Route path="employee" element={<Employee/>}/>
        </Route>
      )}
    </Routes>
  );
}

// ====================== MAIN APP ======================
export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
