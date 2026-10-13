import { Link } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import Avatar from '../../components/Avatar.jsx';
import useDemoAuth from '../auth/DemoAuthContext.jsx';
import { PublicHeader } from '../public/PublicChrome.jsx';

const navigation = [['Tìm gia sư', '/learner/search'], ['Lịch học', '/learner/schedule'], ['Góc phụ huynh', '/learner#stories'], ['Trở thành Gia Sư', '/tutor']];

export default function LearnerHeader() {
  const { user, logout } = useDemoAuth();
  const initials = (user.fullName || user.username).split(' ').slice(-2).map((word) => word[0]).join('');
  const actions = <>
    <Link className="learner-account" to="/learner/dashboard"><Avatar initials={initials} name={user.fullName || user.username} size="sm" imageUrl={user.avatarUrl} /><span>{user.username}</span></Link>
    <button className="learner-logout" type="button" onClick={logout}><LogOut size={17} aria-hidden="true" /> Đăng xuất</button>
  </>;
  return <PublicHeader kind="learner" navigation={navigation} actions={actions} />;
}
