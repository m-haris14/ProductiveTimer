import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Pomodoro from "./component/Pomodoro/pomodoro";
import Dashboard from "./View/Pages/Dashboard/Dashboard";
import Login from "./View/Pages/Login/Login";
import Layout from "./View/Layout/Layout";
import Task from "./View/Pages/Task/Task";
import Reports from "./View/Pages/Report/Reports";
import Attendence from "./View/Pages/Attendence/Attendence";
import Settings from "./View/Pages/Setting/Settings";
import Register from "./View/Pages/Register/Register";
import AdminLayout from "./View/Layout/AdminLayout";
import AdminDashboard from "./View/Pages/Dashboard/AdminDashboard";
import Project from "./View/Pages/ُProject";
import Employee from "./View/Pages/Employee";

// Protected route waits until AuthContext finishes initialization
const ProtectedRoute = ({ children }) => {
  const { user, initialized } = useAuth();

  if (!initialized) {
    // Optional: show nothing or a spinner while checking localStorage
    return null;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// Redirects logged-in users away from login page
const PublicRoute = ({ children }) => {
  const { user, initialized } = useAuth();

  if (!initialized) return null;

  if (user) return <Navigate to="/" replace />;

  return children;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Employee */}
          <Route
            path="/login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />
          
          <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route index element={<Dashboard />} />
            <Route path="pomodoro" element={<Pomodoro />} />
            <Route path="register" element={<Register />} />
            <Route path="tasks" element={<Task />} />
            <Route path="reports" element={<Reports />} />
            <Route path="settings" element={<Settings />} />
            <Route path="attendence" element={<Attendence />} />
          </Route>

          {/* Catch-all redirects */}
          <Route path="*" element={<Navigate to="/" replace />} />
          {/* Admin panal */}
          <Route path="/" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
            <Route path="/adminDashboard" element={<AdminDashboard />} />
            <Route path="pomodoro" element={<Pomodoro />} />
            <Route path="register" element={<Register />} />
            <Route path="employee" element={<Employee/>} />
            <Route path="tasks" element={<Task />} />
            <Route path="reports" element={<Reports />} />
            <Route path="project" element={<Project/>} />
            <Route path="settings" element={<Settings />} />
            <Route path="attendence" element={<Attendence />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
