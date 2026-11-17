import { createContext, useContext, useMemo, useState } from 'react';
import { initialConversations } from '../../data/tutorConversations.js';

const MessagesContext = createContext(null);

export function TutorMessagesProvider({ children }) {
  const [conversations, setConversations] = useState(initialConversations);
  const unreadMessages = useMemo(() => conversations.reduce((sum, item) => sum + item.unread, 0), [conversations]);
  const unreadConversations = useMemo(() => conversations.filter((item) => item.unread > 0).length, [conversations]);
  const markOpened = (id) => setConversations((current) => current.map((item) => item.id === id ? { ...item, unread: 0 } : item));
  const appendMessage = (id, message) => setConversations((current) => current.map((item) => item.id === id ? { ...item, messages: [...item.messages, message] } : item));
  const openLearnerConversation = ({ name, subject }) => {
    const cleanName = (name || 'Học viên').trim();
    const cleanSubject = (subject || 'Lớp học').trim();
    const existing = conversations.find(
      (item) => item.name.toLocaleLowerCase('vi-VN') === cleanName.toLocaleLowerCase('vi-VN')
    );
    if (existing) {
      markOpened(existing.id);
      return existing.id;
    }
    const avatar = cleanName.split(/\s+/).filter(Boolean).slice(-2).map((part) => part[0]).join('').toUpperCase() || 'HV';
    const newId = `conv-${Date.now()}`;
    const time = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    const created = {
      id: newId,
      name: cleanName,
      avatar,
      color: 'blue',
      subject: cleanSubject,
      unread: 0,
      messages: [
        {
          id: `msg-${Date.now()}`,
          from: 'me',
          text: `Xin chào ${cleanName}, mình trao đổi thêm về lịch và nội dung lớp ${cleanSubject} nhé.`,
          time,
        },
      ],
    };
    setConversations((current) => [created, ...current]);
    return newId;
  };
  return <MessagesContext.Provider value={{ conversations, unreadMessages, unreadConversations, markOpened, appendMessage, openLearnerConversation }}>{children}</MessagesContext.Provider>;
}

export default function useTutorMessagesState() {
  const value = useContext(MessagesContext);
  if (!value) throw new Error('TutorMessagesProvider missing');
  return value;
}
