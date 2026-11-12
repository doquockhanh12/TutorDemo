import assert from 'node:assert/strict';
import test from 'node:test';
import {
  initialLearnerConversations,
  sanitizeConversations,
} from '../src/data/learnerConversations.js';
import { demoDistance, mapTutors } from '../src/data/tutorMap.js';

test('Learner messaging initial state has valid conversations with tutors', () => {
  assert.ok(Array.isArray(initialLearnerConversations), 'Should be an array');
  assert.ok(initialLearnerConversations.length >= 2, 'Should have initial conversations');

  const first = initialLearnerConversations[0];
  assert.ok(first.id, 'Must have id');
  assert.ok(first.name, 'Must have tutor name');
  assert.ok(Array.isArray(first.messages), 'Must have messages array');
  assert.ok(first.messages.length > 0, 'Must have at least one message');
});

test('sanitizeConversations de-duplicates conversations by ID, tutorId, and name', () => {
  const duplicates = [
    { id: 'ha-linh', tutorId: 'ha-linh', name: 'Phạm Hà Linh', messages: [] },
    { id: 'ha-linh-dup', tutorId: 'ha-linh', name: 'Phạm Hà Linh', messages: [] },
    { id: 'another-dup', tutorId: 'tutor-xyz', name: ' phạm hà linh ', messages: [] },
    { id: 'unique-1', tutorId: 'unique-1', name: 'Trần Gia Bảo', messages: [] },
  ];

  const cleaned = sanitizeConversations(duplicates);
  assert.equal(cleaned.length, 2, 'Should filter out duplicates with same tutorId or name');
  assert.equal(cleaned[0].name, 'Phạm Hà Linh');
  assert.equal(cleaned[1].name, 'Trần Gia Bảo');
});

test('Learner map calculates distance between learner location and selected tutor', () => {
  const LEARNER_LOCATION = {
    name: 'Vị trí của bạn',
    location: 'Quận 1, TP. Hồ Chí Minh',
    x: 75,
    y: 360,
    initials: 'BẠN',
  };

  assert.ok(mapTutors.length > 0, 'Map tutors should exist');
  const targetTutor = mapTutors[0];
  const distance = demoDistance(LEARNER_LOCATION, targetTutor);

  assert.ok(typeof distance === 'string', 'Distance should be a string');
  assert.ok(parseFloat(distance.replace(',', '.')) > 0, 'Distance should be greater than 0');
});
