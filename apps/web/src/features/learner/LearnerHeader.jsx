import { Link, useLocation } from 'react-router-dom';
import { BookOpen, CalendarDays, ClipboardList, MessageSquare, Search } from 'lucide-react';
import useDemoAuth from '../auth/DemoAuthContext.jsx';
import { PublicHeader } from '../public/PublicChrome.jsx';
import LearnerAccountMenu from './LearnerAccountMenu.jsx';
import useLearnerMessagesState from './LearnerMessagesState.jsx';
import './header.css';

const navigation = [
  ['Lớp học của tôi', '/learner/classes', BookOpen],
  ['Thời khóa biểu', '/learner/schedule', CalendarDays],
  ['Tìm gia sư', '/learner/search', Search],
  ['Yêu cầu học', '/requests', ClipboardList],
];

export default function LearnerHeader({ compact = false }) {
  const { user, logout } = useDemoAuth();
  const location = useLocation();
  const { pathname } = location;
  const { unreadMessages } = useLearnerMessagesState();

  const isTutorProfile = pathname.startsWith('/tutors/');
  const isMapPage = pathname === '/map' || pathname === '/learner/map';
  const isClassDetail = pathname.startsWith('/learner/classes/');
  const isMessagesPage = pathname === '/learner/messages';

  // Determine origin for contextual navigation
  const stateFrom = location.state?.from || '';
  const isFromMessages = isTutorProfile && stateFrom === '/learner/messages';
  const isMessagesActive = isMessagesPage || isFromMessages;

  // If in a detail view with a known origin, use the originating path for header tab highlighting
  let effectivePath = pathname;
  if (isClassDetail && stateFrom) {
    effectivePath = stateFrom;
  } else if (isTutorProfile) {
    if (stateFrom && !isFromMessages) {
      effectivePath = stateFrom;
    } else if (isFromMessages) {
      effectivePath = '/learner/messages';
    } else {
      effectivePath = '/learner/search';
    }
  }

  const isSearchActive =
    (effectivePath === '/learner/search' || effectivePath.startsWith('/learner/search/')) ||
    isMapPage ||
    (isTutorProfile && (!stateFrom || stateFrom === '/learner/search' || stateFrom === '/learner/map' || stateFrom === '/map'));

  const links = navigation.map(([label, href, Icon]) => {
    let active = false;
    if (href === '/learner/search') {
      active = isSearchActive;
    } else {
      active = effectivePath === href || effectivePath.startsWith(`${href}/`);
    }
    return [label, href, active, Icon];
  });

  const actions = (
    <>
      <Link
        to="/learner/messages"
        className={`learner-header-msg-btn ${isMessagesActive ? 'is-active' : ''}`}
        aria-label={`Tin nhắn${unreadMessages > 0 ? `, ${unreadMessages} tin chưa đọc` : ''}`}
        title="Hộp thư tin nhắn với gia sư"
      >
        <MessageSquare size={19} aria-hidden="true" />
        <span>Tin nhắn</span>
        {unreadMessages > 0 && (
          <span className="learner-header-msg-badge" aria-hidden="true">
            {unreadMessages}
          </span>
        )}
      </Link>
      <LearnerAccountMenu user={user} onLogout={logout} />
    </>
  );

  return (
    <PublicHeader
      kind="learner"
      navigation={links}
      actions={actions}
      persistentActions
      className={`learner-app-header${compact ? ' learner-app-header--compact' : ''}${isMessagesPage ? ' learner-app-header--messages' : ''}`}
    />
  );
}
