import { createContext, useContext } from 'react';
import useLearnerMessagesStore from './hooks/useLearnerMessagesStore.js';
import { fallbackLearnerMessages } from '../../services/learner/messagesService.js';
const LearnerMessagesContext = createContext(null);
export function LearnerMessagesProvider({ children }) {
  const value = useLearnerMessagesStore();
  return <LearnerMessagesContext.Provider value={value}>{children}</LearnerMessagesContext.Provider>;
}
export default function useLearnerMessagesState() {
  return useContext(LearnerMessagesContext) || fallbackLearnerMessages();
}
