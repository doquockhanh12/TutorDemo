import useLearnerMessageList from './hooks/useLearnerMessageList.js';
import { getLastMessage, createOutgoingLearnerMessage } from '../../services/learner/messagesService.js';
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Bell,
  ArrowLeft,
  ArrowUpRight,
  MessageCircle,
  Search,
  Send,
} from 'lucide-react';
import LearnerHeader from './LearnerHeader.jsx';
import LearnerMessageHistory from './ReportNotificationHistory.jsx';
import useLearnerMessagesState from './LearnerMessagesState.jsx';
import { useScheduledTutors } from '../tutor/TutorWorkspaceState.jsx';
import './learner-messages.css';

export default function LearnerMessages() {
  const [searchParams] = useSearchParams();
  const tutorIdParam = searchParams.get('tutorId') || searchParams.get('tutor');
  const tutors = useScheduledTutors();

  const {
    conversations,
    unreadMessages,
    markOpened,
    appendMessage,
    getOrCreateConversation,
  } = useLearnerMessagesState();

  const [activeId, setActiveId] = useState(() => conversations.find((item) => item.type !== 'notifications')?.id ?? null);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [draft, setDraft] = useState('');
  const [mobileChatOpen, setMobileChatOpen] = useState(false);
  const [notice, setNotice] = useState('');
  const chatBodyRef = useRef(null);

  // If navigated from tutor profile with ?tutorId=...
  useEffect(() => {
    if (tutorIdParam) {
      const targetTutor = tutors.find((t) => t.id === tutorIdParam);
      if (targetTutor) {
        const conv = getOrCreateConversation(targetTutor);
        if (conv) {
          setActiveId(conv.id);
          setMobileChatOpen(true);
          markOpened(conv.id);
          return;
        }
      }
      const existing = conversations.find(
        (c) => c.id === tutorIdParam || c.tutorId === tutorIdParam
      );
      if (existing) {
        setActiveId(existing.id);
        setMobileChatOpen(true);
        markOpened(existing.id);
      }
    }
  }, [tutorIdParam, tutors]);

  useLayoutEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    const prevGutter = document.documentElement.style.scrollbarGutter;
    const prevOverflow = document.documentElement.style.overflow;
    document.documentElement.style.scrollbarGutter = 'auto';
    document.documentElement.style.overflow = 'hidden';
    return () => {
      document.documentElement.style.scrollbarGutter = prevGutter;
      document.documentElement.style.overflow = prevOverflow;
    };
  }, []);

  const activeConversation = useMemo(
    () => conversations.find((item) => item.id === activeId) || conversations[0],
    [conversations, activeId]
  );

  const isNotifications = activeConversation?.type === 'notifications';
  const notificationSignature = isNotifications ? JSON.stringify(activeConversation.messages.map((item) => item.id)) : '';
  useEffect(() => {
    if (isNotifications && (mobileChatOpen || window.matchMedia('(min-width: 769px)').matches) && activeConversation.unread > 0) {
      markOpened(activeConversation.id);
    }
  }, [notificationSignature, mobileChatOpen, activeConversation?.unread]);

  // Scroll chat to bottom when conversation or message changes
  useEffect(() => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
    }
  }, [activeConversation?.messages]);

  const filteredConversations = useLearnerMessageList(conversations, search, filter);

  const handleOpenConversation = (id) => {
    setActiveId(id);
    setMobileChatOpen(true);
    setNotice('');
    markOpened(id);
  };

  const handleSendMessage = (event) => {
    event.preventDefault();
    const text = draft.trim();
    if (!text || !activeConversation || isNotifications) return;

    appendMessage(activeConversation.id, createOutgoingLearnerMessage(text));

    setDraft('');
    setNotice('Tin nhắn đã được gửi đến gia sư trong phiên mô phỏng.');
    setTimeout(() => setNotice(''), 4000);
  };

  return (
    <div className="public-page public-page--learner learner-page learner-search-page density-comfortable learner-messages-view">
      <LearnerHeader compact />

      <main className="learner-messages-main learner-messages-main--fullbleed">
        <div className={`learner-messages-card learner-messages-card--fullbleed ${mobileChatOpen ? 'is-chat-open' : ''}`}>
          {/* CỘT TRÁI: DANH SÁCH CUỘC TRÒ CHUYỆN */}
          <aside className="learner-msg-sidebar" aria-label="Danh sách cuộc hội thoại">
            {/* Phần cố định ở trên: Tiêu đề + Nút lọc + Thanh tìm kiếm */}
            <div className="learner-msg-sidebar__fixed-top">
              <div className="learner-msg-sidebar__header">
                <h2>Hội thoại</h2>
                {unreadMessages > 0 && (
                  <span className="learner-msg-unread-pill">
                    {unreadMessages} chưa đọc
                  </span>
                )}
              </div>

              <div className="learner-msg-filters" role="group" aria-label="Lọc tin nhắn">
                <button
                  type="button"
                  className={filter === 'all' ? 'is-active' : ''}
                  onClick={() => setFilter('all')}
                >
                  Tất cả ({conversations.length})
                </button>
                <button
                  type="button"
                  className={filter === 'unread' ? 'is-active' : ''}
                  onClick={() => setFilter('unread')}
                >
                  Chưa đọc ({unreadMessages})
                </button>
              </div>

              <div className="learner-msg-search-box">
                <Search size={16} aria-hidden="true" />
                <input
                  id="learner-msg-search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Tìm theo tên gia sư, môn học..."
                  aria-label="Tìm gia sư hoặc môn học"
                />
              </div>
            </div>

            {/* Phần cuộn độc lập: Danh sách các thầy cô */}
            <div className="learner-msg-conversation-list" role="list">
              {filteredConversations.map((item) => {
                const last = getLastMessage(item);
                const isSelected = activeConversation?.id === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    className={`learner-msg-item ${item.type === 'notifications' ? 'learner-msg-item--system' : ''} ${isSelected ? 'is-active' : ''}`}
                    onClick={() => handleOpenConversation(item.id)}
                  >
                    <span
                      className={`learner-msg-avatar learner-msg-avatar--${item.color || 'blue'}`}
                    >
                      {item.type === 'notifications' ? <Bell size={22} aria-hidden="true" /> : item.avatar || 'GS'}
                    </span>
                    <div className="learner-msg-item__info">
                      <div className="learner-msg-item__top">
                        <strong className="learner-msg-item__name">{item.name}</strong>
                        <time className="learner-msg-item__time">{last.time}</time>
                      </div>
                      <span className="learner-msg-item__subject">
                        {item.type === 'notifications' ? 'Chỉ nhận thông báo' : item.subject ? `Môn ${item.subject}` : 'Gia sư'}
                      </span>
                      <p className="learner-msg-item__snippet">
                        {last.from === 'me' ? 'Bạn: ' : ''}
                        {last.text || (item.type === 'notifications' ? 'Chưa có thông báo.' : '')}
                      </p>
                    </div>
                    {item.unread > 0 && (
                      <span className="learner-msg-unread-dot" aria-label={`${item.unread} tin chưa đọc`}>
                        {item.unread}
                      </span>
                    )}
                  </button>
                );
              })}

              {filteredConversations.length === 0 && (
                <div className="learner-msg-empty-list">
                  <Search size={26} aria-hidden="true" />
                  <p>
                    {filter === 'unread'
                      ? 'Không có tin nhắn chưa đọc.'
                      : 'Không tìm thấy cuộc hội thoại phù hợp.'}
                  </p>
                </div>
              )}
            </div>
          </aside>

          {/* CỘT PHẢI: KHUNG CHAT CHI TIẾT */}
          <section className="learner-msg-chat-pane" aria-label="Khung trò chuyện">
            {activeConversation ? (
              <>
                {/* Header cố định ở trên */}
                <header className="learner-msg-chat-header">
                  <button
                    type="button"
                    className="learner-msg-back-btn"
                    aria-label="Quay lại danh sách hội thoại"
                    onClick={() => setMobileChatOpen(false)}
                  >
                    <ArrowLeft size={18} />
                  </button>

                  <span
                    className={`learner-msg-avatar learner-msg-avatar--${activeConversation.color || 'blue'}`}
                  >
                    {isNotifications ? <Bell size={22} aria-hidden="true" /> : activeConversation.avatar || 'GS'}
                  </span>

                  <div className="learner-msg-chat-header__info">
                    <h3>{isNotifications ? activeConversation.name : `Gia sư ${activeConversation.name}`}</h3>
                    <p>{isNotifications ? 'Thông báo dành riêng cho tài khoản của bạn' : activeConversation.subject ? `Môn ${activeConversation.subject}` : 'Gia sư xác minh'}</p>
                  </div>

                  {!isNotifications && (activeConversation.tutorId || activeConversation.id) && (
                    <Link
                      to={`/tutors/${activeConversation.tutorId || activeConversation.id}`}
                      state={{ from: '/learner/messages', fromLabel: 'Quay lại tin nhắn' }}
                      className="learner-msg-profile-link"
                      title="Xem hồ sơ gia sư"
                    >
                      <span>Xem hồ sơ</span>
                      <ArrowUpRight size={14} aria-hidden="true" />
                    </Link>
                  )}
                </header>

                {notice && (
                  <div className="learner-msg-notice-bar" role="status">
                    {notice}
                  </div>
                )}

                {/* Vùng tin nhắn cuộn độc lập ở giữa */}
                <div className="learner-msg-messages-scroll" ref={chatBodyRef}>
                  {isNotifications && activeConversation.messages.length === 0 && (
                    <div className="learner-msg-no-chat"><Bell size={32} aria-hidden="true" /><h3>Chưa có thông báo</h3><p>Thông báo sẽ xuất hiện sau khi báo cáo gia sư được gửi thành công.</p></div>
                  )}
                  <LearnerMessageHistory messages={activeConversation.messages} notifications={isNotifications} />
                </div>

                {/* Thanh nhập tin nhắn cố định ở đáy */}
                {!isNotifications && <form className="learner-msg-composer" onSubmit={handleSendMessage}>
                  <label className="sr-only" htmlFor="learner-message-input">
                    Nội dung tin nhắn gửi gia sư
                  </label>
                  <input
                    id="learner-message-input"
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    placeholder={`Nhập tin nhắn trao đổi với gia sư ${activeConversation.name}...`}
                    autoComplete="off"
                  />
                  <button
                    type="submit"
                    disabled={!draft.trim()}
                    aria-label="Gửi tin nhắn"
                  >
                    <Send size={16} aria-hidden="true" />
                    <span>Gửi</span>
                  </button>
                </form>}
              </>
            ) : (
              <div className="learner-msg-no-chat">
                <MessageCircle size={44} aria-hidden="true" />
                <h3>Chọn một cuộc hội thoại</h3>
                <p>Chọn gia sư từ danh sách bên trái để bắt đầu trao đổi lịch học và câu hỏi.</p>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
