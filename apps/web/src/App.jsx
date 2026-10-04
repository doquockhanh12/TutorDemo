import { Navigate, Route, Routes } from 'react-router-dom';
import LearnerSearch from './features/learner/LearnerSearch.jsx';
import LearnerMapPage from './features/learner/LearnerMapPage.jsx';
import LearnerDashboard from './features/learner/LearnerDashboard.jsx';
import TutorDashboard from './features/tutor/TutorDashboard.jsx';
import TutorClassMap from './features/tutor/TutorClassMap.jsx';
import TutorClassSearch from './features/tutor/TutorClassSearch.jsx';
import AdminDashboard from './features/admin/AdminDashboard.jsx';
import HomePage from './features/public/HomePage.jsx';
import LearnerLanding from './features/public/LearnerLanding.jsx';
import TutorLanding from './features/public/TutorLanding.jsx';
import { MyRequests, NewRequest, RequestDetail } from './features/learner/LearnerPages.jsx';
import TutorProfilePage from './features/learner/TutorProfilePage.jsx';
import { TutorProfile, TutorRequestDetail, TutorRequests } from './features/tutor/TutorPages.jsx';
import TutorTimetable from './features/tutor/TutorTimetable.jsx';
import TutorIncome from './features/tutor/TutorIncome.jsx';
import { TutorWorkspaceProvider } from './features/tutor/TutorWorkspaceState.jsx';
import LoginPage from './features/auth/LoginPage.jsx';
import RegistrationPage from './features/auth/RegistrationPage.jsx';
import { ProtectedRoute } from './features/auth/AuthNavigation.jsx';

function Protected({ role, children }) { return <ProtectedRoute role={role}>{children}</ProtectedRoute>; }

export default function App() {
  return <TutorWorkspaceProvider><Routes>
    <Route path="/" element={<HomePage />} /><Route path="/learner" element={<LearnerLanding />} /><Route path="/tutor" element={<TutorLanding />} />
    <Route path="/login" element={<LoginPage />} /><Route path="/register" element={<RegistrationPage role="learner" />} /><Route path="/tutor/register" element={<RegistrationPage role="tutor" />} />
    <Route path="/learner/search" element={<Protected role="learner"><LearnerSearch /></Protected>} />
    <Route path="/learner/map" element={<Protected role="learner"><LearnerMapPage /></Protected>} />
    <Route path="/learner/dashboard" element={<Protected role="learner"><LearnerDashboard /></Protected>} />
    <Route path="/tutor/timetable" element={<Protected role="tutor"><TutorTimetable /></Protected>} />
    <Route path="/tutor/income" element={<Protected role="tutor"><TutorIncome /></Protected>} />
    <Route path="/tutor/map" element={<Protected role="tutor"><TutorClassMap /></Protected>} />
    <Route path="/tutor/find-students" element={<Protected role="tutor"><TutorClassSearch /></Protected>} />
    <Route path="/tutors/:id" element={<Protected role="learner"><TutorProfilePage /></Protected>} />
    <Route path="/requests/new" element={<Protected role="learner"><NewRequest /></Protected>} /><Route path="/requests" element={<Protected role="learner"><MyRequests /></Protected>} /><Route path="/requests/:id" element={<Protected role="learner"><RequestDetail /></Protected>} />
    <Route path="/tutor/dashboard" element={<Protected role="tutor"><TutorDashboard /></Protected>} /><Route path="/tutor/profile" element={<Protected role="tutor"><TutorProfile /></Protected>} /><Route path="/tutor/availability" element={<Protected role="tutor"><Navigate to="/tutor/timetable" replace /></Protected>} /><Route path="/tutor/requests" element={<Protected role="tutor"><TutorRequests /></Protected>} /><Route path="/tutor/requests/:id" element={<Protected role="tutor"><TutorRequestDetail /></Protected>} /><Route path="/tutor/lessons" element={<Protected role="tutor"><Navigate to="/tutor/timetable" replace /></Protected>} />
    <Route path="/admin/dashboard" element={<Protected role="admin"><AdminDashboard /></Protected>} />
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes></TutorWorkspaceProvider>;
}
