import { initialLearnerConversations, sanitizeConversations } from '../../data/learnerConversations.js';
const STORAGE_KEY = 'tutornearme_learner_conversations_v2';

export function loadStoredConversations() {
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

export function persistLearnerConversations(conversations) {
  try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify(conversations)); } catch { /* Same optional session persistence. */ }
}
export function createLearnerConversation(tutor, tutorId) { return {
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
          timestamp: new Date().toISOString(),
          from: 'them',
          text: `Chào bạn! Tôi là ${tutor.name}. Bạn có câu hỏi nào về khóa học hoặc lịch học không?`,
          time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        },
      ],
    }; }
export function fallbackLearnerMessages() { return { conversations: initialLearnerConversations, unreadMessages: 2, unreadConversations: 2, markOpened: () => {}, appendMessage: () => {}, getOrCreateConversation: () => null }; }
export function readNotificationIds(readKey) {
  try { const value = JSON.parse(localStorage.getItem(readKey) || '[]'); return Array.isArray(value) ? value : []; }
  catch { return []; }
}
export function writeNotificationIds(readKey, next) {
  try { localStorage.setItem(readKey, JSON.stringify(next)); } catch { /* Read state remains in session. */ }
}
export const openLearnerConversation = (current, id) => current.map((item) => item.id === id ? { ...item, unread: 0 } : item);
export const appendLearnerMessage = (current, id, message) => current.map((item) => item.id === id ? { ...item, messages: [...item.messages, message] } : item);

export function getLastMessage(conversation) {
  if (!conversation?.messages?.length) return { text: '', time: '' };
  return conversation.messages[conversation.messages.length - 1];
}


export function filterLearnerConversations(conversations, search, filter) {
    const keyword = search.trim().toLowerCase();
    return conversations.filter((item) => {
      const matchFilter = filter === 'all' || (item.unread || 0) > 0;
      if (!matchFilter) return false;
      if (!keyword) return true;
      const last = getLastMessage(item);
      return (
        item.type === 'notifications' || item.name.toLowerCase().includes(keyword) ||
        (item.subject && item.subject.toLowerCase().includes(keyword)) ||
        last.text.toLowerCase().includes(keyword)
      );
    });
}
export function createOutgoingLearnerMessage(text) {
    const now = new Date();
    const time = now.toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
    });

    return {
      id: `msg-${Date.now()}`,
      timestamp: now.toISOString(),
      from: 'me',
      text,
      time,
    };

}
