
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
import './tutor-messages.css';

const initialConversations = [
  {
    id: 1,
    name: 'Nguyễn Minh Anh',
    subject: 'Tiếng Anh',
    avatar: 'MA',
    color: 'blue',
    unread: 2,
    messages: [
      {
        id: 1,
        from: 'them',
        text: 'Em chào thầy ạ!',
        time: '09:20',
      },
      {
        id: 2,
        from: 'them',
        text: 'Thầy cho em hỏi buổi học tiếp theo mình ôn phần nào ạ?',
        time: '09:22',
      },
      {
        id: 3,
        from: 'me',
        text: 'Chào em! Buổi tới chúng ta sẽ ôn ngữ pháp và luyện đọc nhé.',
        time: '09:25',
      },
      {
        id: 4,
        from: 'them',
        text: 'Dạ vâng ạ, em sẽ chuẩn bị bài trước.',
        time: '09:28',
      },
    ],
  },
  {
    id: 2,
    name: 'Trần Khánh Linh',
    subject: 'IELTS',
    avatar: 'KL',
    color: 'purple',
    unread: 1,
    messages: [
      {
        id: 1,
        from: 'them',
        text: 'Thầy ơi, em đã làm xong bài Writing rồi ạ.',
        time: '10:10',
      },
      {
        id: 2,
        from: 'me',
        text: 'Tốt lắm! Em gửi bài ở đây để thầy xem nhé.',
        time: '10:15',
      },
      {
        id: 3,
        from: 'them',
        text: 'Dạ, em gửi thầy ngay ạ.',
        time: '10:18',
      },
    ],
  },
  {
    id: 3,
    name: 'Phạm Gia Huy',
    subject: 'Tiếng Anh',
    avatar: 'GH',
    color: 'orange',
    unread: 0,
    messages: [
      {
        id: 1,
        from: 'me',
        text: 'Em nhớ hoàn thành bài tập buổi trước nhé.',
        time: 'Hôm qua',
      },
      {
        id: 2,
        from: 'them',
        text: 'Dạ em làm gần xong rồi thầy.',
        time: 'Hôm qua',
      },
    ],
  },
  {
    id: 4,
    name: 'Lê Ngọc Mai',
    subject: 'IELTS',
    avatar: 'NM',
    color: 'green',
    unread: 0,
    messages: [
      {
        id: 1,
        from: 'them',
        text: 'Cảm ơn thầy về buổi học hôm qua ạ.',
        time: 'Thứ 2',
      },
    ],
  },
];

function getLastMessage(conversation) {
  return conversation.messages[conversation.messages.length - 1];
}

export default function TutorMessages() {
  const [conversations, setConversations] = useState(
    initialConversations
  );
  const [activeId, setActiveId] = useState(initialConversations[0].id);
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
      (item) =>
        item.name.toLowerCase().includes(keyword) ||
        item.subject.toLowerCase().includes(keyword) ||
        getLastMessage(item).text.toLowerCase().includes(keyword)
    );
  }, [conversations, search]);

  const unreadCount = conversations.reduce(
    (sum, item) => sum + item.unread,
    0
  );

  function openConversation(id) {
    setActiveId(id);
    setMobileChatOpen(true);
    setNotice('');

    setConversations((current) =>
      current.map((item) =>
        item.id === id ? { ...item, unread: 0 } : item
      )
    );
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

    setConversations((current) =>
      current.map((item) =>
        item.id === activeId
          ? {
              ...item,
              messages: [
                ...item.messages,
                {
                  id: `${Date.now()}-${Math.random()}`,
                  from: 'me',
                  text,
                  time,
                },
              ],
            }
          : item
      )
    );

    setDraft('');
    setNotice('Tin nhắn đã được thêm vào cuộc trò chuyện demo.');
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
              <span>{conversations.length} học viên</span>
            </div>
            <span className="messages-inbox__count">
              {unreadCount} chưa đọc
            </span>
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
                <p>Không tìm thấy cuộc hội thoại.</p>
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
                  title="Tùy chọn hội thoại demo"
                  onClick={() =>
                    setNotice(
                      'Đây là hội thoại demo. Các tùy chọn nâng cao chưa được kết nối.'
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
                          <CheckCheck size={14} aria-label="Đã gửi demo" />
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
        Tin nhắn hiện được lưu trong state của trang demo; chưa gửi đến người
        dùng thật.
      </p>
    </TutorShell>
  );
}
