import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { initialLearnerConversations, sanitizeConversations } from '../../data/learnerConversations.js';

const LearnerMessagesContext = createContext(null);
const STORAGE_KEY = 'tutornearme_learner_conversations_v2';

function loadStoredConversations() {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return sanitizeConversations(parsed);
      }
    }
  } catch (err) {
    // fallback to initial
  }
  return sanitizeConversations(initialLearnerConversations);
}

export function LearnerMessagesProvider({ children }) {
  const [conversations, setConversations] = useState(loadStoredConversations);

  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
    } catch (err) {
      // ignore
    }
  }, [conversations]);

  const unreadMessages = useMemo(
    () => conversations.reduce((sum, item) => sum + (item.unread || 0), 0),
    [conversations]
  );

  const unreadConversations = useMemo(
    () => conversations.filter((item) => (item.unread || 0) > 0).length,
    [conversations]
  );

  const markOpened = (id) => {
    setConversations((current) =>
      current.map((item) => (item.id === id ? { ...item, unread: 0 } : item))
    );
  };

  const appendMessage = (id, message) => {
    setConversations((current) =>
      current.map((item) =>
        item.id === id
          ? { ...item, messages: [...item.messages, message] }
          : item
      )
    );
  };

  const getOrCreateConversation = (tutor) => {
    if (!tutor) return null;
    const tutorId = tutor.id || tutor.tutorId;
    const tutorName = (tutor.name || '').trim().toLowerCase();

    const existing = conversations.find(
      (c) =>
        (tutorId && (c.tutorId === tutorId || c.id === tutorId)) ||
        (tutorName && (c.name || '').trim().toLowerCase() === tutorName)
    );
    if (existing) return existing;

    const newConv = {
      id: tutorId || `conv-${Date.now()}`,
      tutorId: tutorId || `conv-${Date.now()}`,
      name: tutor.name,
      subject: tutor.subjects?.[0] || 'Gia sư',
      avatar: tutor.initials || 'GS',
      color: tutor.avatarTone || 'blue',
      unread: 0,
      messages: [
        {
          id: `intro-${Date.now()}`,
          from: 'them',
          text: `Chào bạn! Tôi là ${tutor.name}. Bạn có câu hỏi nào về khóa học hoặc lịch học không?`,
          time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        },
      ],
    };

    setConversations((prev) => {
      const alreadyInPrev = prev.find(
        (c) =>
          (tutorId && (c.tutorId === tutorId || c.id === tutorId)) ||
          (tutorName && (c.name || '').trim().toLowerCase() === tutorName)
      );
      if (alreadyInPrev) return prev;
      return [newConv, ...prev];
    });
    return newConv;
  };

  return (
    <LearnerMessagesContext.Provider
      value={{
        conversations,
        unreadMessages,
        unreadConversations,
        markOpened,
        appendMessage,
        getOrCreateConversation,
      }}
    >
      {children}
    </LearnerMessagesContext.Provider>
  );
}

export default function useLearnerMessagesState() {
  const value = useContext(LearnerMessagesContext);
  if (!value) {
    // Return safe fallback if rendered outside provider
    return {
      conversations: initialLearnerConversations,
      unreadMessages: 2,
      unreadConversations: 2,
      markOpened: () => {},
      appendMessage: () => {},
      getOrCreateConversation: () => null,
    };
  }
  return value;
}
