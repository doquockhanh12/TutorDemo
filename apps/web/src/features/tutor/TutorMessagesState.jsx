import { createContext, useContext, useMemo, useState } from 'react';
import { initialConversations } from '../../data/tutorConversations.js';

const MessagesContext = createContext(null);

export function TutorMessagesProvider({ children }) {
  const [conversations, setConversations] = useState(initialConversations);
  const unreadMessages = useMemo(() => conversations.reduce((sum, item) => sum + item.unread, 0), [conversations]);
  const unreadConversations = useMemo(() => conversations.filter((item) => item.unread > 0).length, [conversations]);
  const markOpened = (id) => setConversations((current) => current.map((item) => item.id === id ? { ...item, unread: 0 } : item));
  const appendMessage = (id, message) => setConversations((current) => current.map((item) => item.id === id ? { ...item, messages: [...item.messages, message] } : item));
  return <MessagesContext.Provider value={{ conversations, unreadMessages, unreadConversations, markOpened, appendMessage }}>{children}</MessagesContext.Provider>;
}

export default function useTutorMessagesState() {
  const value = useContext(MessagesContext);
  if (!value) throw new Error('TutorMessagesProvider missing');
  return value;
}
