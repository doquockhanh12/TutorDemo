import { useEffect, useMemo, useState } from 'react';
import useDemoAuth from '../../auth/DemoAuthContext.jsx';
import useDemoDomain from '../../domain/DemoDomainContext.jsx';
import { selectReportNotifications } from '../reportNotifications.js';
import { loadStoredConversations, persistLearnerConversations, createLearnerConversation, readNotificationIds, writeNotificationIds, openLearnerConversation, appendLearnerMessage } from '../../../services/learner/messagesService.js';

export default function useLearnerMessagesStore() {
  const { user } = useDemoAuth();
  const { issues } = useDemoDomain();
  const accountId = user?.role === 'learner' ? user.id : null;
  const readKey = `tnm.learner.report-notifications.read.v1:${accountId}`;
  const [readByAccount, setReadByAccount] = useState({});
  const storedRead = useMemo(() => readNotificationIds(readKey), [readKey]);
  const readIds = readByAccount[accountId] || storedRead;
  const notifications = useMemo(() => selectReportNotifications(issues, accountId), [issues, accountId]);
  const systemConversation = {
    id: 'tutornearme-notifications', type: 'notifications', name: 'Thông báo từ TutorNearMe',
    subject: '', color: 'blue', unread: notifications.filter((item) => !readIds.includes(item.id)).length,
    messages: notifications,
  };
  const [conversations, setConversations] = useState(loadStoredConversations);

  useEffect(() => { persistLearnerConversations(conversations); }, [conversations]);

  const unreadMessages = useMemo(
    () => conversations.reduce((sum, item) => sum + (item.unread || 0), 0) + systemConversation.unread,
    [conversations, systemConversation.unread]
  );

  const unreadConversations = useMemo(
    () => conversations.filter((item) => (item.unread || 0) > 0).length + (systemConversation.unread > 0 ? 1 : 0),
    [conversations, systemConversation.unread]
  );

  const markOpened = (id) => {
    if (id === systemConversation.id) {
      if (!accountId) return;
      const next = [...new Set([...readIds, ...notifications.map((item) => item.id)])];
      setReadByAccount((current) => ({ ...current, [accountId]: next }));
      writeNotificationIds(readKey, next);
      return;
    }
    setConversations((current) => openLearnerConversation(current, id));
  };

  const appendMessage = (id, message) => setConversations((current) => appendLearnerMessage(current, id, message));

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

    const newConv = createLearnerConversation(tutor, tutorId);

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

  return { conversations: [systemConversation, ...conversations], unreadMessages, unreadConversations, markOpened, appendMessage, getOrCreateConversation };
}
