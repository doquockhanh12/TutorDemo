import { useMemo } from 'react';
import { filterLearnerConversations } from '../../../services/learner/messagesService.js';
export default function useLearnerMessageList(conversations, search, filter) {
 return useMemo(() => filterLearnerConversations(conversations, search, filter), [conversations, search, filter]);
}
