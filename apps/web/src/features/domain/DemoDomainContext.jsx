import { createContext, useContext, useEffect, useState } from 'react';
import useDemoAuth from '../auth/DemoAuthContext.jsx';
import { DOMAIN_STORAGE_KEY, restoreDemoState, requestIsCompleted, decideRequest, updateLearnerRequest, completeDomainLesson, addLearnerRequest } from './demoDomain.js';
import { normalizeRanges, normalizeSessionMinutes, isValidAvailability, overlaps } from '../../data/tutorSchedule.js';
import { selectTutorIncome } from './incomeSelectors.js';

const Context = createContext(null);
export function DemoDomainProvider({ children }) {
  const { user, updateProfile } = useDemoAuth();
  const [state, setState] = useState(() => restoreDemoState(localStorage));
  const [anonymousSaved, setAnonymousSaved] = useState([]);
  useEffect(() => { setAnonymousSaved([]); }, [user?.id]);
  useEffect(() => {
    if (user?.role !== 'tutor') return;
    setState((current) => {
      if (current.profiles.some((p) => p.accountId === user.id)) return current;
      // New profile values come only from the user's registration fields.
      const profile = { id: user.id, accountId: user.id, name: user.fullName,
        initials: user.fullName.split(/\s+/).slice(-2).map((s) => s[0]).join(''),
        subjects: user.subjects || [], levels: [], location: user.area || '', areas: user.area ? [user.area] : [],
        price: Number(user.fee), university: user.university || '', intro: '', approach: '',
        schedule: [], availability: [], formats: [], sessionMinutes: normalizeSessionMinutes(user.duration),
        rating: null, reviews: 0, verified: false };
      return { ...current, profiles: [...current.profiles, profile],
        settings: { ...current.settings, [profile.id]: { sessionMinutes: profile.sessionMinutes } } };
    });
  }, [user]);
  useEffect(() => { try { localStorage.setItem(DOMAIN_STORAGE_KEY, JSON.stringify(state)); } catch { /* Demo storage may be unavailable. */ } }, [state]);
  const tutorId = state.profiles.find((p) => p.accountId === user?.id)?.id;
  const createRequest = (values) => {
    const result = addLearnerRequest(state, user, values);
    if (result.state) setState(result.state);
    return result;
  };
  const decide = (id, status) => { const result = decideRequest(state, id, status, tutorId); if (result.error) return result.error; setState(result.state); return ''; };
  const updateLearnerRequests = (items) => setState((current) => items.reduce((next, item) => updateLearnerRequest(next, user?.id, item.id, item), current));
  const setSaved = (update) => {
    if (user?.role !== 'learner') { setAnonymousSaved(update); return; }
    setState((current) => ({ ...current, savedByAccount: { ...current.savedByAccount,
      [user.id]: typeof update === 'function' ? update(current.savedByAccount[user.id] || []) : update } }));
  };
  const saveAvailability = (ranges, duration) => {
    const next = normalizeRanges(ranges);
    if (!tutorId || next.length !== ranges.length || next.some((range) => {
      const unchanged = state.availability.some((old) => old.id === range.id && old.date === range.date && old.start === range.start && old.end === range.end);
      return range.tutorId !== tutorId || (!unchanged && !isValidAvailability(range, next, state.lessons, range.id)) || next.some((other) => other !== range && overlaps(other, range)) || state.lessons.some((l) => l.status !== 'cancelled' && overlaps(l, range));
    })) return 'Không thể lưu: khoảng thời gian không hợp lệ hoặc trùng lịch. Lịch nháp được giữ để bạn chỉnh sửa.';
    setState((current) => ({ ...current, availability: [...current.availability.filter((r) => r.tutorId !== tutorId), ...next],
      settings: duration === undefined ? current.settings : { ...current.settings, [tutorId]: { sessionMinutes: normalizeSessionMinutes(duration) } } })); return '';
  };
  const setSessionMinutes = (duration) => setState((current) => ({ ...current, settings: { ...current.settings, [tutorId]: { sessionMinutes: normalizeSessionMinutes(duration) } } }));
  const saveTutorProfile = (draft) => {
    if (!tutorId) return;
    updateProfile({ fullName: draft.name });
    setState((current) => ({ ...current, profiles: current.profiles.map((profile) => profile.id === tutorId ? {
      ...profile, name: draft.name.trim(), initials: draft.name.trim().split(/\s+/).slice(-2).map((s) => s[0]).join(''),
      subjects: draft.subjects.split(',').map((s) => s.trim()).filter(Boolean), levels: [...draft.levels],
      location: draft.area.trim(), areas: [draft.area.trim()], price: Number(draft.fee), intro: draft.bio,
      sessionMinutes: normalizeSessionMinutes(draft.sessionMinutes),
    } : profile), settings: { ...current.settings, [tutorId]: { sessionMinutes: normalizeSessionMinutes(draft.sessionMinutes) } } }));
  };
  const completeLesson = (id) => setState((current) => completeDomainLesson(current, tutorId, id));
  const saveLessonNotes = (id, notes) => setState((current) => ({ ...current, lessons: current.lessons.map((l) => l.id === id && l.tutorId === tutorId ? { ...l, notes } : l) }));
  return <Context.Provider value={{ ...state, tutorId, sessionMinutes: normalizeSessionMinutes(state.settings[tutorId]?.sessionMinutes ?? user?.duration), anonymousSaved, createRequest, decide, updateLearnerRequests, setSaved, saveAvailability, setSessionMinutes, saveTutorProfile, completeLesson, saveLessonNotes }}>{children}</Context.Provider>;
}
export default function useDemoDomain() { const value = useContext(Context); if (!value) throw new Error('DemoDomainProvider missing'); return value; }
export function useTutorIncome(referenceDate = new Date()) {
  const { lessons, tutorId } = useDemoDomain();
  return selectTutorIncome(lessons, tutorId, referenceDate);
}
export function useLearnerRequests() {
  const state = useDemoDomain(); const { user } = useDemoAuth();
  return [state.requests.filter((r) => r.learnerId === user?.id).map((r) => ({ ...r, completed: requestIsCompleted(state, r) })), state.updateLearnerRequests];
}
export function useSavedTutors() { const state = useDemoDomain(); const { user } = useDemoAuth(); return [user?.role === 'learner' ? state.savedByAccount[user.id] || [] : state.anonymousSaved, state.setSaved]; }
export function useTutorProfile() {
  const state = useDemoDomain(); const { user } = useDemoAuth();
  const profile = state.profiles.find((p) => p.id === state.tutorId);
  return [{ name: profile?.name || user?.fullName || '', subjects: profile?.subjects.join(', ') || user?.subjects?.join(', ') || '',
    levels: profile?.levels || [], area: profile?.location || user?.area || '', fee: profile?.price ?? user?.fee ?? '',
    bio: profile?.intro || '', rating: profile?.rating, sessionMinutes: normalizeSessionMinutes(state.settings[state.tutorId]?.sessionMinutes ?? user?.duration) }, state.saveTutorProfile];
}
export function usePublicTutors() {
  return useDemoDomain().profiles.map((tutor) => ({ ...tutor, subject: tutor.subjects[0], area: tutor.location,
    time: tutor.availability[0], fee: tutor.price, tone: tutor.avatarTone, bio: tutor.intro }));
}
