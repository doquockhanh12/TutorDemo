import { Navigate, Route, Routes } from 'react-router-dom';
import LearnerSearch from './features/learner/LearnerSearch.jsx';
import TutorDashboard from './features/tutor/TutorDashboard.jsx';
import AdminDashboard from './features/admin/AdminDashboard.jsx';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/learner/search" replace />} />
      <Route path="/learner/search" element={<LearnerSearch />} />
      <Route path="/tutor/dashboard" element={<TutorDashboard />} />
      <Route path="/admin/dashboard" element={<AdminDashboard />} />
      <Route path="*" element={<Navigate to="/learner/search" replace />} />
    </Routes>
  );
}
