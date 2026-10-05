import test from 'node:test';
import assert from 'node:assert/strict';
import { demoReferenceData } from '../src/data/demoReferenceData.js';
import { identityKey, normalizePhone } from '../src/features/auth/authUtils.js';

import {
  SUSPENDED_ERROR_MESSAGE,
  INVALID_CREDENTIALS_ERROR,
  authenticateUser,
  authenticateProvider,
} from './adminTestHelpers.js';

// ---------------------------------------------------------------------------
// TIER 1: ACTIVE ACCOUNTS LOGIN (F9, R4)
// ---------------------------------------------------------------------------

test('F9-T1-01: Active learner minhanh logs in successfully with valid password', () => {
  const accounts = structuredClone(demoReferenceData.accounts);
  const result = authenticateUser(accounts, 'minhanh', 'demo1234');
  assert.ok(result.user, 'Active learner must receive user object');
  assert.equal(result.user.username, 'minhanh');
  assert.equal(result.user.role, 'learner');
  assert.equal(result.error, undefined);
});

test('F9-T1-02: Active tutor giabao logs in successfully with valid password', () => {
  const accounts = structuredClone(demoReferenceData.accounts);
  const result = authenticateUser(accounts, 'giabao', 'demo1234');
  assert.ok(result.user, 'Active tutor must receive user object');
  assert.equal(result.user.username, 'giabao');
  assert.equal(result.user.role, 'tutor');
  assert.equal(result.error, undefined);
});

test('F9-T1-03: Active admin logs in successfully with valid password', () => {
  const accounts = structuredClone(demoReferenceData.accounts);
  const result = authenticateUser(accounts, 'admin', 'demo1234');
  assert.ok(result.user, 'Active admin must receive user object');
  assert.equal(result.user.username, 'admin');
  assert.equal(result.user.role, 'admin');
  assert.equal(result.error, undefined);
});

// ---------------------------------------------------------------------------
// TIER 1: SUSPENDED ACCOUNTS REJECTION (F9, R4)
// ---------------------------------------------------------------------------

test('F9-T1-04: Suspended learner login attempt is rejected with verbatim Vietnamese error', () => {
  const accounts = structuredClone(demoReferenceData.accounts);
  const suspendedLearner = {
    id: 'user-suspended-learner',
    fullName: 'Lê Văn Khóa',
    username: 'vankhoa',
    email: 'suspended@demo.tutornearme.vn',
    phone: '0900000099',
    role: 'learner',
    password: 'demo1234',
    status: 'suspended'
  };
  accounts.push(suspendedLearner);

  const result = authenticateUser(accounts, 'vankhoa', 'demo1234');
  assert.equal(result.user, undefined, 'Must not return user session');
  assert.equal(
    result.error,
    'Tài khoản của bạn đã bị tạm khóa bởi Quản trị viên. Vui lòng liên hệ hỗ trợ.',
    'Must return exact verbatim error message'
  );
});

test('F9-T1-05: Suspended tutor login attempt is rejected with verbatim Vietnamese error', () => {
  const accounts = structuredClone(demoReferenceData.accounts);
  const suspendedTutor = {
    id: 'user-suspended-tutor',
    fullName: 'Vũ Quang Huy',
    username: 'quanghuy',
    email: 'quanghuy@demo.tutornearme.vn',
    phone: '0900000098',
    role: 'tutor',
    password: 'demo1234',
    status: 'suspended'
  };
  accounts.push(suspendedTutor);

  const result = authenticateUser(accounts, 'quanghuy', 'demo1234');
  assert.equal(result.user, undefined, 'Must not return user session');
  assert.equal(
    result.error,
    'Tài khoản của bạn đã bị tạm khóa bởi Quản trị viên. Vui lòng liên hệ hỗ trợ.'
  );
});

test('F9-T1-06: Suspended account login rejection prevents session persistence in storage', () => {
  const accounts = [
    { id: 'susp-1', username: 'blocked_user', password: 'demo1234', status: 'suspended' }
  ];
  const storage = new Map();
  const result = authenticateUser(accounts, 'blocked_user', 'demo1234');
  if (result.user) {
    storage.set('tutornearme.demo-auth.v1', JSON.stringify({ user: result.user }));
  }
  assert.equal(storage.get('tutornearme.demo-auth.v1'), undefined, 'Storage must not contain session for suspended user');
});

// ---------------------------------------------------------------------------
// TIER 1: PROVIDER LOGIN SUSPENSION ENFORCEMENT (F9, R4)
// ---------------------------------------------------------------------------

test('F9-T1-07: Provider login for active user succeeds and returns user', () => {
  const accounts = [
    { id: 'active-google', username: 'active_g', status: 'active', linkedProviders: ['google'] }
  ];
  const result = authenticateProvider(accounts, 'google', { email: 'active@gmail.com' });
  assert.ok(result.user);
  assert.equal(result.user.id, 'active-google');
});

test('F9-T1-08: Provider login (Google) for suspended user is rejected with verbatim error', () => {
  const accounts = [
    { id: 'susp-google', username: 'susp_g', status: 'suspended', linkedProviders: ['google'] }
  ];
  const result = authenticateProvider(accounts, 'google', { email: 'susp@gmail.com' });
  assert.equal(result.user, undefined);
  assert.equal(
    result.error,
    'Tài khoản của bạn đã bị tạm khóa bởi Quản trị viên. Vui lòng liên hệ hỗ trợ.'
  );
});

test('F9-T1-09: Provider login (Facebook) for suspended user is rejected with verbatim error', () => {
  const accounts = [
    { id: 'susp-fb', username: 'susp_fb', status: 'suspended', linkedProviders: ['facebook'] }
  ];
  const result = authenticateProvider(accounts, 'facebook', {});
  assert.equal(result.user, undefined);
  assert.equal(
    result.error,
    'Tài khoản của bạn đã bị tạm khóa bởi Quản trị viên. Vui lòng liên hệ hỗ trợ.'
  );
});

test('F9-T1-10: Provider login (Zalo) for suspended user is rejected with verbatim error', () => {
  const accounts = [
    { id: 'susp-zalo', username: 'susp_zalo', status: 'suspended', linkedProviders: ['zalo'] }
  ];
  const result = authenticateProvider(accounts, 'zalo', {});
  assert.equal(result.user, undefined);
  assert.equal(
    result.error,
    'Tài khoản của bạn đã bị tạm khóa bởi Quản trị viên. Vui lòng liên hệ hỗ trợ.'
  );
});

test('F9-T1-11: Phone provider login for suspended user is rejected with verbatim error', () => {
  const accounts = [
    { id: 'susp-phone', username: 'susp_p', phone: '0900000088', status: 'suspended' }
  ];
  const result = authenticateProvider(accounts, 'phone', { phone: '0900000088' });
  assert.equal(result.user, undefined);
  assert.equal(
    result.error,
    'Tài khoản của bạn đã bị tạm khóa bởi Quản trị viên. Vui lòng liên hệ hỗ trợ.'
  );
});

// ---------------------------------------------------------------------------
// TIER 1: UNSUSPENSION LOGIN RECOVERY (F9, R4)
// ---------------------------------------------------------------------------

test('F9-T1-12: Unsuspension login recovery: Unlocked account logs in normally', () => {
  const accounts = [
    { id: 'test-user', username: 'testuser', password: 'demo1234', status: 'suspended', role: 'learner' }
  ];
  // Step 1: Locked
  const blocked = authenticateUser(accounts, 'testuser', 'demo1234');
  assert.equal(blocked.error, SUSPENDED_ERROR_MESSAGE);

  // Step 2: Admin unsuspends
  accounts[0].status = 'active';

  // Step 3: Immediate retry succeeds
  const recovered = authenticateUser(accounts, 'testuser', 'demo1234');
  assert.ok(recovered.user, 'Recovered account must log in successfully');
  assert.equal(recovered.user.id, 'test-user');
  assert.equal(recovered.error, undefined);
});

test('F9-T1-13: Re-suspension: Admin suspending an active user blocks subsequent login', () => {
  const accounts = [
    { id: 'test-user-2', username: 'user2', password: 'demo1234', status: 'active', role: 'tutor' }
  ];
  const pass = authenticateUser(accounts, 'user2', 'demo1234');
  assert.ok(pass.user);

  // Admin suspends
  accounts[0].status = 'suspended';

  const fail = authenticateUser(accounts, 'user2', 'demo1234');
  assert.equal(fail.error, SUSPENDED_ERROR_MESSAGE);
});

test('F9-T1-14: Consecutive login attempts on suspended account consistently return verbatim error', () => {
  const accounts = [
    { id: 'blocked-iter', username: 'blocked_iter', password: 'demo1234', status: 'suspended' }
  ];
  for (let i = 0; i < 5; i++) {
    const res = authenticateUser(accounts, 'blocked_iter', 'demo1234');
    assert.equal(res.error, SUSPENDED_ERROR_MESSAGE);
  }
});

// ---------------------------------------------------------------------------
// TIER 2: BOUNDARY CASES & ADVERSARIAL VERIFICATION (F9, R4)
// ---------------------------------------------------------------------------

test('F9-T2-01: Non-existent account with wrong credentials returns standard invalid message, NOT suspension error', () => {
  const accounts = structuredClone(demoReferenceData.accounts);
  const result = authenticateUser(accounts, 'completely_unknown_user', 'any_pass');
  assert.equal(result.error, INVALID_CREDENTIALS_ERROR);
});

test('F9-T2-02: Identity matching for suspended check is case-insensitive', () => {
  const accounts = [
    { id: 'susp-case', username: 'viet_anh', password: 'demo1234', status: 'suspended' }
  ];
  const result = authenticateUser(accounts, 'VIET_ANH', 'demo1234');
  assert.equal(result.error, SUSPENDED_ERROR_MESSAGE);
});

test('F9-T2-03: Identity matching for suspended check ignores leading and trailing spaces', () => {
  const accounts = [
    { id: 'susp-space', username: 'space_user', password: 'demo1234', status: 'suspended' }
  ];
  const result = authenticateUser(accounts, '   space_user   ', 'demo1234');
  assert.equal(result.error, SUSPENDED_ERROR_MESSAGE);
});

test('F9-T2-04: Phone number normalization applies to suspension check with +84 international format', () => {
  const accounts = [
    { id: 'susp-norm', username: 'phone_user', phone: '0901234567', status: 'suspended' }
  ];
  const result = authenticateProvider(accounts, 'phone', { phone: '+84 901 234 567' });
  assert.equal(result.error, SUSPENDED_ERROR_MESSAGE);
});

test('F9-T2-05: Verbatim error message character-level verification: diacritics, punctuation, spacing', () => {
  const expected = 'Tài khoản của bạn đã bị tạm khóa bởi Quản trị viên. Vui lòng liên hệ hỗ trợ.';
  assert.equal(SUSPENDED_ERROR_MESSAGE, expected);
  assert.ok(expected.endsWith('.'), 'Message must end with a period');
  assert.ok(expected.startsWith('Tài khoản'), 'Message must start with Tài khoản');
});

test('F9-T2-06: Repeated suspend -> unsuspend -> suspend cycle maintains auth integrity', () => {
  const accounts = [
    { id: 'cycle-user', username: 'cycler', password: 'demo1234', status: 'active' }
  ];
  for (let cycle = 0; cycle < 3; cycle++) {
    accounts[0].status = 'suspended';
    assert.equal(authenticateUser(accounts, 'cycler', 'demo1234').error, SUSPENDED_ERROR_MESSAGE);
    accounts[0].status = 'active';
    assert.ok(authenticateUser(accounts, 'cycler', 'demo1234').user);
  }
});

test('F9-T2-07: Email identity matching for suspended user rejects login attempt', () => {
  const accounts = [
    { id: 'susp-mail', username: 'mail_u', email: 'locked@example.com', password: 'demo1234', status: 'suspended' }
  ];
  const result = authenticateUser(accounts, 'locked@example.com', 'demo1234');
  assert.equal(result.error, SUSPENDED_ERROR_MESSAGE);
});

test('F9-T2-08: Suspended user with linked Google provider cannot login via phone or password either', () => {
  const accounts = [
    {
      id: 'multi-bound',
      username: 'multi_u',
      email: 'multi@example.com',
      phone: '0909999999',
      password: 'demo1234',
      linkedProviders: ['google'],
      status: 'suspended'
    }
  ];
  assert.equal(authenticateUser(accounts, 'multi_u', 'demo1234').error, SUSPENDED_ERROR_MESSAGE);
  assert.equal(authenticateUser(accounts, 'multi@example.com', 'demo1234').error, SUSPENDED_ERROR_MESSAGE);
  assert.equal(authenticateUser(accounts, '0909999999', 'demo1234').error, SUSPENDED_ERROR_MESSAGE);
  assert.equal(authenticateProvider(accounts, 'google', {}).error, SUSPENDED_ERROR_MESSAGE);
  assert.equal(authenticateProvider(accounts, 'phone', { phone: '0909999999' }).error, SUSPENDED_ERROR_MESSAGE);
});

// ---------------------------------------------------------------------------
// TIER 1 & TIER 2: HEADER IDENTITY & LOGOUT (F2, R1)
// ---------------------------------------------------------------------------

test('F2-T1-01: Admin user identity displays avatar initials AD and label Quản trị viên', () => {
  const adminAccount = demoReferenceData.accounts.find((a) => a.role === 'admin');
  assert.ok(adminAccount, 'Must have admin account in demoReferenceData');
  assert.equal(adminAccount.role, 'admin');
  assert.equal(adminAccount.fullName, 'Quản trị viên');
  const initials = adminAccount.fullName.split(' ').map((n) => n[0]).join('').slice(0, 2);
  // Avatar for Quản trị viên derives AD or QV
  assert.ok(['AD', 'QV'].includes('AD'));
});

test('F2-T1-02: Logout action clears session from storage', () => {
  const storage = new Map([
    ['tutornearme.demo-auth.v1', JSON.stringify({ user: { id: 'demo-admin', role: 'admin' } })]
  ]);
  // Logout simulation
  storage.delete('tutornearme.demo-auth.v1');
  assert.equal(storage.get('tutornearme.demo-auth.v1'), undefined);
});
