import { Navigate, Route, Routes } from 'react-router-dom';
import LearnerSearch from './features/learner/LearnerSearch.jsx';
import TutorDashboard from './features/tutor/TutorDashboard.jsx';
import AdminDashboard from './features/admin/AdminDashboard.jsx';
import HomePage from './features/public/HomePage.jsx';
import LearnerLanding from './features/public/LearnerLanding.jsx';
import TutorLanding from './features/public/TutorLanding.jsx';
import { MyRequests, NewRequest, RequestDetail, TutorDetail } from './features/learner/LearnerPages.jsx';
import { TutorAvailability, TutorLessons, TutorProfile, TutorRequestDetail, TutorRequests } from './features/tutor/TutorPages.jsx';
import LoginPage from './features/auth/LoginPage.jsx';
import RegistrationPage from './features/auth/RegistrationPage.jsx';
import { ProtectedRoute } from './features/auth/AuthNavigation.jsx';

function Protected({ role, children }) { return <ProtectedRoute role={role}>{children}</ProtectedRoute>; }

export default function App() {
  return <Routes>
    <Route path="/" element={<HomePage />} /><Route path="/learner" element={<LearnerLanding />} /><Route path="/tutor" element={<TutorLanding />} />
    <Route path="/login" element={<LoginPage />} /><Route path="/register" element={<RegistrationPage role="learner" />} /><Route path="/tutor/register" element={<RegistrationPage role="tutor" />} />
    <Route path="/learner/search" element={<Protected role="learner"><LearnerSearch /></Protected>} />
    <Route path="/tutors/:id" element={<Protected role="learner"><TutorDetail /></Protected>} />
    <Route path="/requests/new" element={<Protected role="learner"><NewRequest /></Protected>} /><Route path="/requests" element={<Protected role="learner"><MyRequests /></Protected>} /><Route path="/requests/:id" element={<Protected role="learner"><RequestDetail /></Protected>} />
    <Route path="/tutor/dashboard" element={<Protected role="tutor"><TutorDashboard /></Protected>} /><Route path="/tutor/profile" element={<Protected role="tutor"><TutorProfile /></Protected>} /><Route path="/tutor/availability" element={<Protected role="tutor"><TutorAvailability /></Protected>} /><Route path="/tutor/requests" element={<Protected role="tutor"><TutorRequests /></Protected>} /><Route path="/tutor/requests/:id" element={<Protected role="tutor"><TutorRequestDetail /></Protected>} /><Route path="/tutor/lessons" element={<Protected role="tutor"><TutorLessons /></Protected>} />
    <Route path="/admin/dashboard" element={<Protected role="admin"><AdminDashboard /></Protected>} />
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>;
}
