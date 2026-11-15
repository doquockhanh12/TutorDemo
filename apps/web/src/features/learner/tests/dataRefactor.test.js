import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { refactorInputs, requestFilters, searchFilters, referenceDate } from './refactorInputs.js';
import { classMaterialsBySubject } from '../../../data/learner/classes.js';
import { selectLearnerClasses, createInitialClassSubmissions } from '../../../services/learner/classesService.js';
import { selectScheduleData } from '../../../services/learner/scheduleService.js';
import { countLearnerRequests, filterLearnerRequests } from '../../../services/learner/requestsService.js';
import { selectLearnerTutor, selectPublicReviews, summarizePublicReviews, selectFeaturedReviews, selectTutorCredentials } from '../../../services/learner/tutorProfileService.js';
import { selectTutorSearch } from '../../../services/learner/discoveryService.js';
import { filterLearnerConversations, loadStoredConversations, persistLearnerConversations, fallbackLearnerMessages, openLearnerConversation, appendLearnerMessage } from '../../../services/learner/messagesService.js';
import { createLearnerRequestPayload, validateLearnerSelection } from '../../../services/learner/bookingService.js';
// Recorded from pre-refactor component functions, not from the extracted services.
const expected = JSON.parse(readFileSync(new URL('./refactorExpected.json', import.meta.url)));
process.env.TZ = 'Asia/Bangkok';
function digest(value) {
  const stable = JSON.stringify(JSON.parse(JSON.stringify(value)), (key, value) => value && typeof value === 'object' && !Array.isArray(value)
    ? Object.fromEntries(Object.keys(value).sort().map((key) => [key, value[key]])) : value);
  return createHash('sha256').update(stable).digest('hex');
}
const check = (key, value) => assert.equal(digest(value), expected[key], key);
test('class fixtures and projections match original JSX for canonical, empty, completed and other-owner inputs', () => {
  const { state, user, requests, tutors } = refactorInputs();
  const before = JSON.stringify({ state, requests, tutors });
  for (const [key, req, actor] of [['canonical', requests, user], ['empty', [], user], ['completed', requests.filter((item) => item.completed), user], ['other', [], { id: 'other' }]]) {
    check(`classes-${key}`, selectLearnerClasses(req, tutors, state.lessons, actor));
  }
  check('materials', classMaterialsBySubject); check('submissions', createInitialClassSubmissions());
  assert.equal(JSON.stringify({ state, requests, tutors }), before);
});
test('schedule ownership, mapping, chronology and live-session grouping match original component', () => {
  const { state, user, requests, tutors } = refactorInputs();
  check('schedule', selectScheduleData(requests, user, state.lessons, tutors, referenceDate));
});
test('every request tab keeps original count/filter/order without mutating requests', () => {
  const { requests } = refactorInputs(); const before = JSON.stringify(requests);
  check('counts', countLearnerRequests(requests));
  for (const filter of requestFilters) check(`requests-${filter}`, filterLearnerRequests(requests, filter));
  assert.equal(JSON.stringify(requests), before);
});
test('profile lookup, public reviews, rating, featured order and fallback credentials match original', () => {
  const { state, tutors } = refactorInputs();
  for (const id of ['quoc-bao', 'demo-tutor', 'missing']) check(`tutor-${id}`, selectLearnerTutor(tutors, id));
  const reviews = selectPublicReviews(state.reviews, tutors[0]);
  check('reviews', reviews); check('rating', summarizePublicReviews(reviews)); check('featured', selectFeaturedReviews(reviews));
  check('credentials', selectTutorCredentials(tutors[0]));
});
test('search combinations preserve original text matching, price/rating/recommended ordering', () => {
  const { tutors } = refactorInputs();
  searchFilters.forEach((filters, index) => check(`search-${index}`, selectTutorSearch(tutors, filters)));
});
test('conversation filtering preserves original all/unread/keyword results', () => {
  const { conversations } = refactorInputs();
  for (const [index, search, filter] of [[0, '', 'all'], [1, '', 'unread'], [2, 'bao', 'all']]) check(`messages-${index}`, filterLearnerConversations(conversations, search, filter));
});
test('message persistence retains exact original key, invalid/empty fallback and immutable open/append operations', () => {
  const values = new Map();
  const previous = globalThis.sessionStorage;
  globalThis.sessionStorage = { getItem: (key) => values.get(key), setItem: (key, value) => values.set(key, value) };
  try {
    const initial = fallbackLearnerMessages().conversations;
    for (const raw of ['[]', '{}', '{broken']) { values.set('tutornearme_learner_conversations_v2', raw); assert.deepEqual(loadStoredConversations(), initial); }
    persistLearnerConversations(initial); assert(values.has('tutornearme_learner_conversations_v2'));
    assert.deepEqual(loadStoredConversations(), initial);
    const opened = openLearnerConversation(initial, initial[0].id);
    assert.equal(opened[0].unread, 0); assert.equal(initial[0].unread, 1);
    const appended = appendLearnerMessage(opened, initial[0].id, { id: 'test-message', text: 'test' });
    assert.equal(appended[0].messages.length, initial[0].messages.length + 1);
  } finally { if (previous === undefined) delete globalThis.sessionStorage; else globalThis.sessionStorage = previous; }
});
test('booking payload preserves concrete proposals/array fields and delegates validation without changing status', () => {
  const { tutors } = refactorInputs();
  const selection = { subjects: 'Tiếng Anh', levels: 'Cơ bản', formats: ['Online'], areas: [], proposals: [{ date: '2026-11-16', start: 540, end: 585, extra: 'not sent' }] };
  const result = createLearnerRequestPayload(tutors[0], selection, ' goal ');
  assert.equal(result.status, 'pending'); assert.deepEqual(result.subjects, ['Tiếng Anh']);
  assert.deepEqual(result.proposals, [{ date: '2026-11-16', start: 540, end: 585 }]); assert.equal(result.goal, 'goal');
  assert.equal(validateLearnerSelection(selection, () => true).ready, true);
  assert.equal(validateLearnerSelection(selection, () => false).errors.proposals, true);
});
