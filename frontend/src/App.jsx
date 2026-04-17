import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/AdminDashboard';
import SuperAdminDashboard from './pages/SuperAdminDashboard';
import StudentDashboard from './pages/StudentDashboard';
import StudentLeaderboard from './pages/StudentLeaderboard';
import StudentPerformance from './pages/StudentPerformance';
import CreateExam from './pages/CreateExam';
import ManageExams from './pages/ManageExams';
import ImportQuestions from './pages/Admin/ImportQuestions';
import TakeExam from './pages/TakeExam';
import ResultPage from './pages/ResultPage';
import ProctoringView from './pages/ProctoringView';
import ExamHistory from './pages/ExamHistory';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import HelpCenter from './pages/HelpCenter';
import AdminAlerts from './pages/Admin/AdminAlerts';

// Super Admin Detailed Pages
import StudentManagement from './pages/SuperAdmin/StudentManagement';
import ExamManagement from './pages/SuperAdmin/ExamManagement';
import ExamAnalytics from './pages/SuperAdmin/ExamAnalytics';
import AdminManagement from './pages/SuperAdmin/AdminManagement';
import AdminDetails from './pages/SuperAdmin/AdminDetails';
import SystemLogs from './pages/SuperAdmin/SystemLogs';
import SystemSettings from './pages/SuperAdmin/SystemSettings';

// Admin Track Pages
import TrackStudents from './pages/Admin/TrackStudents';
import ExamDetails from './pages/Admin/ExamDetails';
import TrackAttempts from './pages/Admin/TrackAttempts';
import AdminStudentDetails from './pages/Admin/AdminStudentDetails';

const ProtectedRoute = ({ children, roles = [] }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  if (roles.length && !roles.includes(user.role)) return <Navigate to="/" />;
  return children;
};

const RootRedirect = () => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  if (user.role === 'super_admin') return <Navigate to="/super-admin" />;
  if (user.role === 'admin') return <Navigate to="/admin" />;
  if (user.role === 'student') return <Navigate to="/dashboard" />;
  return <Navigate to="/login" />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          <Route path="/" element={<RootRedirect />} />

          {/* Student Routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute roles={['student']}><Layout><StudentDashboard /></Layout></ProtectedRoute>
          } />
          <Route path="/leaderboard" element={
            <ProtectedRoute roles={['student']}><Layout><StudentLeaderboard /></Layout></ProtectedRoute>
          } />
          <Route path="/performance" element={
            <ProtectedRoute roles={['student']}><Layout><StudentPerformance /></Layout></ProtectedRoute>
          } />
          <Route path="/exam/:examId" element={
            <ProtectedRoute roles={['student']}><TakeExam /></ProtectedRoute>
          } />
          <Route path="/results/:attemptId" element={
            <ProtectedRoute roles={['student']}><Layout><ResultPage /></Layout></ProtectedRoute>
          } />

          {/* Shared Authenticated Routes */}
          <Route path="/profile" element={
            <ProtectedRoute><Layout><Profile /></Layout></ProtectedRoute>
          } />
          <Route path="/settings" element={
            <ProtectedRoute><Layout><Settings /></Layout></ProtectedRoute>
          } />
          <Route path="/help" element={
            <ProtectedRoute><Layout><HelpCenter /></Layout></ProtectedRoute>
          } />

          {/* Admin Routes */}
          <Route path="/admin" element={
            <ProtectedRoute roles={['admin']}><Layout><AdminDashboard /></Layout></ProtectedRoute>
          } />
          <Route path="/admin/alerts" element={
            <ProtectedRoute roles={['admin', 'super_admin']}><Layout><AdminAlerts /></Layout></ProtectedRoute>
          } />
          <Route path="/admin/create-exam" element={
            <ProtectedRoute roles={['admin']}><Layout><CreateExam /></Layout></ProtectedRoute>
          } />
          <Route path="/admin/manage-exams" element={
            <ProtectedRoute roles={['admin']}><Layout><ManageExams /></Layout></ProtectedRoute>
          } />
          <Route path="/admin/proctoring/:attemptId" element={
            <ProtectedRoute roles={['admin']}><Layout><ProctoringView /></Layout></ProtectedRoute>
          } />
          <Route path="/admin/exam-history" element={
            <ProtectedRoute roles={['admin']}><Layout><ExamHistory /></Layout></ProtectedRoute>
          } />

          {/* Super Admin Routes */}
          <Route path="/super-admin" element={
            <ProtectedRoute roles={['super_admin']}><Layout><SuperAdminDashboard /></Layout></ProtectedRoute>
          } />
          <Route path="/super-admin/students" element={
            <ProtectedRoute roles={['super_admin']}><Layout><StudentManagement /></Layout></ProtectedRoute>
          } />
          <Route path="/super-admin/exams" element={
            <ProtectedRoute roles={['super_admin']}><Layout><ExamManagement /></Layout></ProtectedRoute>
          } />
          <Route path="/super-admin/exam/:id" element={
            <ProtectedRoute roles={['super_admin']}><Layout><ExamAnalytics /></Layout></ProtectedRoute>
          } />
          <Route path="/super-admin/admins" element={
            <ProtectedRoute roles={['super_admin']}><Layout><AdminManagement /></Layout></ProtectedRoute>
          } />
          <Route path="/super-admin/admin/:id" element={
            <ProtectedRoute roles={['super_admin']}><Layout><AdminDetails /></Layout></ProtectedRoute>
          } />
          <Route path="/super-admin/logs" element={
            <ProtectedRoute roles={['super_admin']}><Layout><SystemLogs /></Layout></ProtectedRoute>
          } />
          <Route path="/super-admin/settings" element={
            <ProtectedRoute roles={['super_admin']}><Layout><SystemSettings /></Layout></ProtectedRoute>
          } />

          {/* Upgraded Admin Track Routes */}
          <Route path="/admin/students" element={
            <ProtectedRoute roles={['admin']}><Layout><TrackStudents /></Layout></ProtectedRoute>
          } />
          <Route path="/admin/exam/:id" element={
            <ProtectedRoute roles={['admin']}><Layout><ExamDetails /></Layout></ProtectedRoute>
          } />
          <Route path="/admin/attempts" element={
            <ProtectedRoute roles={['admin']}><Layout><TrackAttempts /></Layout></ProtectedRoute>
          } />
          <Route path="/admin/student/:id" element={
            <ProtectedRoute roles={['admin']}><Layout><AdminStudentDetails /></Layout></ProtectedRoute>
          } />
          <Route path="/admin/exams/:id/import" element={
            <ProtectedRoute roles={['admin']}><Layout><ImportQuestions /></Layout></ProtectedRoute>
          } />

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
