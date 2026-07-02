import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';

// Public Pages
import Home from './pages/public/Home';
import Pricing from './pages/public/Pricing';
import About from './pages/public/About';
import Contact from './pages/public/Contact';
import Login from './pages/public/Login';
import Register from './pages/public/Register';

// Student Pages
import StudentLayout from './components/StudentLayout';
import StudentDashboard from './pages/student/StudentDashboard';
import StudentProfile from './pages/student/StudentProfile';
import StudentSeat from './pages/student/StudentSeat';
import StudentPayments from './pages/student/StudentPayments';
import StudentAttendance from './pages/student/StudentAttendance';
import StudentNotifications from './pages/student/StudentNotifications';

// Admin Pages
import AdminLayout from './components/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminStudents from './pages/admin/AdminStudents';
import AdminSeats from './pages/admin/AdminSeats';
import AdminPlans from './pages/admin/AdminPlans';
import AdminPayments from './pages/admin/AdminPayments';
import AdminAttendance from './pages/admin/AdminAttendance';
import AdminSettings from './pages/admin/AdminSettings';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routing Scope */}
          <Route
            path="/*"
            element={
              <>
                <Navbar />
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/pricing" element={<Pricing />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                </Routes>
              </>
            }
          />

          {/* Student Dashboard Routing Scope */}
          <Route
            path="/dashboard/*"
            element={
              <StudentLayout>
                <Routes>
                  <Route path="/" element={<StudentDashboard />} />
                  <Route path="/profile" element={<StudentProfile />} />
                  <Route path="/seat" element={<StudentSeat />} />
                  <Route path="/payments" element={<StudentPayments />} />
                  <Route path="/attendance" element={<StudentAttendance />} />
                  <Route path="/notifications" element={<StudentNotifications />} />
                </Routes>
              </StudentLayout>
            }
          />

          {/* Admin Dashboard Routing Scope */}
          <Route
            path="/admin/*"
            element={
              <AdminLayout>
                <Routes>
                  <Route path="/" element={<AdminDashboard />} />
                  <Route path="/students" element={<AdminStudents />} />
                  <Route path="/seats" element={<AdminSeats />} />
                  <Route path="/plans" element={<AdminPlans />} />
                  <Route path="/payments" element={<AdminPayments />} />
                  <Route path="/attendance" element={<AdminAttendance />} />
                  <Route path="/settings" element={<AdminSettings />} />
                </Routes>
              </AdminLayout>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
