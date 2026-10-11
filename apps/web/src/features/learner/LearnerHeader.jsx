import { useLocation } from 'react-router-dom';
import useDemoAuth from '../auth/DemoAuthContext.jsx';
import { PublicHeader } from '../public/PublicChrome.jsx';
import LearnerAccountMenu from './LearnerAccountMenu.jsx';
import './header.css';

const navigation = [['Tìm gia sư', '/learner/search'], ['Yêu cầu học', '/requests'], ['Góc phụ huynh', '/learner#stories']];

export default function LearnerHeader({ compact = false }) {
  const { user, logout } = useDemoAuth();
  const { pathname } = useLocation();
  const links = navigation.map(([label, href]) => [label, href, pathname === href || pathname.startsWith(`${href}/`)]);
  const actions = <LearnerAccountMenu user={user} onLogout={logout} />;
  return <PublicHeader kind="learner" navigation={links} actions={actions} persistentActions className={`learner-app-header${compact ? ' learner-app-header--compact' : ''}`} />;
}
