import { Navigate, Route, Routes } from 'react-router-dom';
import LearnerSearch from './features/learner/LearnerSearch.jsx';
import LearnerDashboard from './features/learner/LearnerDashboard.jsx';
import TutorDashboard from './features/tutor/TutorDashboard.jsx';
import TutorClassMap from './features/tutor/TutorClassMap.jsx';
import TutorClassSearch from './features/tutor/TutorClassSearch.jsx';
import AdminDashboard from './features/admin/AdminDashboard.jsx';
import AdminTutorsPage from './features/admin/AdminTutorsPage.jsx';
import AdminUsersPage from './features/admin/AdminUsersPage.jsx';
import AdminReviewsPage from './features/admin/AdminReviewsPage.jsx';
import AdminIssuesPage from './features/admin/AdminIssuesPage.jsx';
import AdminAppealsPage from './features/admin/AdminAppealsPage.jsx';
import UserAppealsPage from './features/appeals/UserAppealsPage.jsx';
import HomePage from './features/public/HomePage.jsx';
import LearnerLanding from './features/public/LearnerLanding.jsx';
import TutorLanding from './features/public/TutorLanding.jsx';
import { MyRequests, NewRequest, RequestDetail } from './features/learner/LearnerPages.jsx';
import LearnerMapPage from './features/learner/LearnerMapPage.jsx';
import TutorProfilePage from './features/learner/TutorProfilePage.jsx';
import { TutorProfile, TutorRequestDetail, TutorRequests } from './features/tutor/TutorPages.jsx';
import TutorTimetable from './features/tutor/TutorTimetable.jsx';
import TutorIncome from './features/tutor/TutorIncome.jsx';
<<<<<<< HEAD
import TutorSettingsPage from './features/tutor/TutorSettingsPage.jsx';
=======
import TutorReviews from './features/tutor/TutorReviews.jsx';
import TutorMessages from './features/tutor/TutorMessages.jsx';
>>>>>>> feat/tutor-messages-and-rate
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
    <Route path="/map" element={<Protected role="learner"><LearnerMapPage /></Protected>} />
    <Route path="/learner/dashboard" element={<Protected role="learner"><LearnerDashboard /></Protected>} />
    <Route path="/tutor/timetable" element={<Protected role="tutor"><TutorTimetable /></Protected>} />
    <Route path="/tutor/income" element={<Protected role="tutor"><TutorIncome /></Protected>} />
<<<<<<< HEAD
    <Route path="/tutor/settings" element={<Protected role="tutor"><TutorSettingsPage /></Protected>} />
=======
    <Route path="/tutor/reviews" element={<Protected role="tutor"><TutorReviews /></Protected>} />
    <Route path="/tutor/messages" element={<Protected role="tutor"><TutorMessages /></Protected>} />
>>>>>>> feat/tutor-messages-and-rate
    <Route path="/tutor/map" element={<Protected role="tutor"><TutorClassMap /></Protected>} />
    <Route path="/tutor/find-students" element={<Protected role="tutor"><TutorClassSearch /></Protected>} />
    <Route path="/tutors/:id" element={<Protected role="learner"><TutorProfilePage /></Protected>} />
    <Route path="/requests/new" element={<Protected role="learner"><NewRequest /></Protected>} /><Route path="/requests" element={<Protected role="learner"><MyRequests /></Protected>} /><Route path="/requests/:id" element={<Protected role="learner"><RequestDetail /></Protected>} />
    <Route path="/tutor/dashboard" element={<Protected role="tutor"><TutorDashboard /></Protected>} /><Route path="/tutor/profile" element={<Protected role="tutor"><TutorProfile /></Protected>} /><Route path="/tutor/availability" element={<Protected role="tutor"><Navigate to="/tutor/timetable" replace /></Protected>} /><Route path="/tutor/requests" element={<Protected role="tutor"><TutorRequests /></Protected>} /><Route path="/tutor/requests/:id" element={<Protected role="tutor"><TutorRequestDetail /></Protected>} /><Route path="/tutor/lessons" element={<Protected role="tutor"><Navigate to="/tutor/timetable" replace /></Protected>} />
    <Route path="/admin/dashboard" element={<Protected role="admin"><AdminDashboard /></Protected>} />
    <Route path="/admin/tutors" element={<Protected role="admin"><AdminTutorsPage /></Protected>} />
    <Route path="/admin/users" element={<Protected role="admin"><AdminUsersPage /></Protected>} />
    <Route path="/admin/reviews" element={<Protected role="admin"><AdminReviewsPage /></Protected>} />
    <Route path="/admin/issues" element={<Protected role="admin"><AdminIssuesPage /></Protected>} />
    <Route path="/admin/appeals" element={<Protected role="admin"><AdminAppealsPage /></Protected>} />
    <Route path="/appeals" element={<UserAppealsPage />} />
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes></TutorWorkspaceProvider>;
}
