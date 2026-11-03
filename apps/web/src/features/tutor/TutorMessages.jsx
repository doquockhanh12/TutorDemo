
import { useMemo, useState } from 'react';
import {
  Search,
  Send,
  MessageCircle,
  MoreHorizontal,
  ArrowLeft,
  CheckCheck,
} from 'lucide-react';
import { TutorShell } from './TutorPages.jsx';
import useTutorMessagesState from './TutorMessagesState.jsx';
import './tutor-messages.css';



function getLastMessage(conversation) {
  return conversation.messages[conversation.messages.length - 1];
}

export default function TutorMessages() {
  const { conversations, unreadMessages, unreadConversations, markOpened, appendMessage } = useTutorMessagesState();
  const [activeId, setActiveId] = useState(conversations[0]?.id ?? null);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [draft, setDraft] = useState('');
  const [mobileChatOpen, setMobileChatOpen] = useState(false);
  const [notice, setNotice] = useState('');

  const activeConversation = conversations.find(
    (item) => item.id === activeId
  );

  const filteredConversations = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return conversations.filter(
      (item) => (filter === 'all' || item.unread > 0) && (
        item.name.toLowerCase().includes(keyword) ||
        item.subject.toLowerCase().includes(keyword) ||
        getLastMessage(item).text.toLowerCase().includes(keyword))
    );
  }, [conversations, search, filter]);

  function showUnread() {
    setFilter('unread');
    const keyword = search.trim().toLowerCase();
    setActiveId(conversations.find((item) => item.unread > 0 && (item.name.toLowerCase().includes(keyword) || item.subject.toLowerCase().includes(keyword) || getLastMessage(item).text.toLowerCase().includes(keyword)))?.id ?? null);
    setMobileChatOpen(false);
  }

  function openConversation(id) {
    setActiveId(id);
    setMobileChatOpen(true);
    setNotice('');

    markOpened(id);
  }

  function sendMessage(event) {
    event.preventDefault();

    const text = draft.trim();

    if (!text || !activeConversation) return;

    const now = new Date();
    const time = now.toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
    });

    appendMessage(activeId, { id: `${Date.now()}-${Math.random()}`, from: 'me', text, time });

    setDraft('');
    setNotice('Tin nhắn chỉ được giữ trong phiên này; chưa gửi đến người học.');
  }

  return (
    <TutorShell
      title="Tin nhắn"
      subtitle="Trao đổi với học viên và theo dõi các cuộc hội thoại."
    >
      <div
        className={`tutor-messages ${
          mobileChatOpen ? 'tutor-messages--chat-open' : ''
        }`}
      >
        <aside className="messages-inbox">
          <div className="messages-inbox__heading">
            <div>
              <h2>Hội thoại</h2>
              <span>{conversations.length} hội thoại · {unreadConversations} hội thoại chưa đọc</span>
            </div>
            <button type="button" className="messages-inbox__count" onClick={showUnread} aria-label={`Xem hội thoại chưa đọc, ${unreadMessages} tin nhắn`}>
              {unreadMessages} tin chưa đọc
            </button>
          </div>

          <div className="messages-filters" role="group" aria-label="Lọc hội thoại">
            <button type="button" className={filter === 'all' ? 'is-active' : ''} aria-pressed={filter === 'all'} onClick={() => setFilter('all')}>Tất cả</button>
            <button type="button" className={filter === 'unread' ? 'is-active' : ''} aria-pressed={filter === 'unread'} onClick={showUnread}>Chưa đọc</button>
          </div>

          <label className="messages-search">
            <Search size={17} />
            <span className="sr-only">Tìm cuộc trò chuyện</span>
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Tìm học viên..."
            />
          </label>

          <div className="messages-conversation-list">
            {filteredConversations.map((conversation) => {
              const lastMessage = getLastMessage(conversation);

              return (
                <button
                  type="button"
                  key={conversation.id}
                  className={`messages-conversation ${
                    activeId === conversation.id
                      ? 'is-active'
                      : ''
                  }`}
                  onClick={() => openConversation(conversation.id)}
                >
                  <span
                    className={`messages-avatar messages-avatar--${conversation.color}`}
                  >
                    {conversation.avatar}
                  </span>

                  <span className="messages-conversation__content">
                    <span className="messages-conversation__top">
                      <strong>{conversation.name}</strong>
                      <time>{lastMessage.time}</time>
                    </span>
                    <span className="messages-conversation__subject">
                      {conversation.subject}
                    </span>
                    <span className="messages-conversation__preview">
                      {lastMessage.from === 'me' ? 'Bạn: ' : ''}
                      {lastMessage.text}
                    </span>
                  </span>

                  {conversation.unread > 0 && (
                    <span className="messages-unread">
                      {conversation.unread}
                    </span>
                  )}
                </button>
              );
            })}

            {filteredConversations.length === 0 && (
              <div className="messages-empty">
                <Search size={25} />
                <p>{filter === 'unread' ? 'Không có hội thoại chưa đọc phù hợp.' : 'Không tìm thấy cuộc hội thoại.'}</p>
              </div>
            )}
          </div>
        </aside>

        <section className="messages-chat" aria-label="Khung hội thoại">
          {activeConversation ? (
            <>
              <header className="messages-chat__header">
                <button
                  type="button"
                  className="messages-back"
                  aria-label="Quay lại danh sách hội thoại"
                  onClick={() => setMobileChatOpen(false)}
                >
                  <ArrowLeft size={19} />
                </button>

                <span
                  className={`messages-avatar messages-avatar--${activeConversation.color}`}
                >
                  {activeConversation.avatar}
                </span>

                <div className="messages-chat__person">
                  <h2>{activeConversation.name}</h2>
                  <p>{activeConversation.subject} · Học viên</p>
                </div>

                <button
                  type="button"
                  className="messages-icon-button"
                  aria-label="Tùy chọn hội thoại"
                  title="Tùy chọn hội thoại"
                  onClick={() =>
                    setNotice(
                      'Các tùy chọn nâng cao chưa được kết nối.'
                    )
                  }
                >
                  <MoreHorizontal size={21} />
                </button>
              </header>

              {notice && (
                <p className="messages-notice" role="status">
                  {notice}
                </p>
              )}

              <div className="messages-chat__body">
                <div className="messages-day-divider">
                  <span>Cuộc trò chuyện</span>
                </div>

                {activeConversation.messages.map((message) => (
                  <div
                    className={`messages-message messages-message--${message.from}`}
                    key={message.id}
                  >
                    <div className="messages-bubble">
                      <p>{message.text}</p>
                      <span>
                        {message.time}
                        {message.from === 'me' && (
                          <CheckCheck size={14} aria-label="Tin nhắn trong phiên" />
                        )}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <form className="messages-composer" onSubmit={sendMessage}>
                <label className="sr-only" htmlFor="tutor-message-input">
                  Nội dung tin nhắn
                </label>
                <input
                  id="tutor-message-input"
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  placeholder="Nhập tin nhắn..."
                  autoComplete="off"
                />
                <button
                  type="submit"
                  disabled={!draft.trim()}
                  aria-label="Gửi tin nhắn"
                >
                  <Send size={18} />
                  <span>Gửi</span>
                </button>
              </form>
            </>
          ) : (
            <div className="messages-empty">
              <MessageCircle size={38} />
              <h3>Chọn một cuộc hội thoại</h3>
              <p>Chọn học viên để xem và gửi tin nhắn.</p>
            </div>
          )}
        </section>
      </div>

      <p className="messages-demo-note">
        Cuộc trò chuyện chỉ tồn tại trong phiên này; tin nhắn mới chưa được gửi đến người học.
      </p>
    </TutorShell>
  );
}
