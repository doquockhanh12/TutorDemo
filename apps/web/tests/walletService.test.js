import test from 'node:test';
import assert from 'node:assert/strict';
import { createWalletService } from '../src/features/learner/wallet/walletService.js';
import { createMockWalletService, TOP_UP_LIFETIME, walletStorageKey } from '../src/features/learner/wallet/mockWalletService.js';

async function setup({ linked = true } = {}) {
  const values = new Map(); let clock = new Date('2026-11-15T05:00:00Z'); let id = 0;
  const storage = { getItem: (key) => values.get(key) ?? null, setItem: (key, value) => values.set(key, value) };
  const options = { storage, now: () => clock, wait: async () => {}, makeId: () => `DEMO-${++id}` };
  const actor = { id: 'learner-a', role: 'learner' };
  const env = { values, storage, options, actor, service: createWalletService(actor, options), mock: createMockWalletService(actor, options), tick: (ms) => { clock = new Date(clock.getTime() + ms); } };
  if (linked) { const session = await env.service.startBankLink('techcombank'); await env.mock.simulateBankLink(session.id, 'succeeded'); }
  return env;
}
async function withdraw(service, amount) {
  return service.requestWithdrawal({ amount, linkedAccountId: (await service.getLinkedAccounts())[0].id });
}
test('top-up only credits on success, repeated and concurrent outcomes cannot credit twice', async () => {
  const { service, mock } = await setup();
  const topup = await service.createTopUp(500000);
  assert.equal(topup.status, 'pending'); assert.match(topup.qrPayload, /NOT-A-REAL-PAYMENT/);
  assert.equal((await service.getWallet()).availableBalance, 0);
  await Promise.all([mock.simulateTopUp(topup.id, 'succeeded'), mock.simulateTopUp(topup.id, 'succeeded')]);
  await mock.simulateTopUp(topup.id, 'failed');
  assert.equal((await service.getTopUpStatus(topup.id)).status, 'succeeded');
  assert.equal((await service.getWallet()).availableBalance, 500000);
});
test('withdrawals reserve available funds, fail releases hold, success only debits once after reload', async () => {
  const env = await setup(); const { service, mock } = env;
  const topup = await service.createTopUp(500000); await mock.simulateTopUp(topup.id, 'succeeded');
  const first = await withdraw(service, 200000);
  assert.deepEqual(await service.getWallet(), { balance: 500000, heldBalance: 200000, availableBalance: 300000, currency: 'VND' });
  await assert.rejects(withdraw(service, 300001), /vượt/);
  await mock.simulateWithdrawal(first.id, 'failed');
  assert.equal((await service.getWallet()).availableBalance, 500000);
  const second = await withdraw(service, 100000);
  const reloaded = createMockWalletService(env.actor, env.options);
  assert.equal((await reloaded.getWallet()).heldBalance, 100000);
  await Promise.all([reloaded.simulateWithdrawal(second.id, 'succeeded'), mock.simulateWithdrawal(second.id, 'succeeded')]);
  assert.deepEqual(await service.getWallet(), { balance: 400000, heldBalance: 0, availableBalance: 400000, currency: 'VND' });
});
test('failed and expired topups never credit; pending QR expires from its saved timestamp', async () => {
  const { service, mock, tick } = await setup();
  for (const outcome of ['failed', 'expired']) {
    const tx = await service.createTopUp(10000); await mock.simulateTopUp(tx.id, outcome);
    assert.equal((await service.getTopUpStatus(tx.id)).status, outcome);
    await mock.simulateTopUp(tx.id, 'succeeded');
  }
  const expired = await service.createTopUp(20000); tick(TOP_UP_LIFETIME);
  assert.equal((await service.getTopUpStatus(expired.id)).status, 'expired');
  await mock.simulateTopUp(expired.id, 'succeeded');
  assert.equal((await service.getWallet()).availableBalance, 0);
});
test('wallet and transaction access remain account-scoped; unauthorized roles rejected', async () => {
  const { service, options } = await setup(); const tx = await service.createTopUp(100000);
  const other = createWalletService({ id: 'learner-b', role: 'learner' }, options);
  assert.deepEqual(await other.getWalletTransactions(), []); assert.equal((await other.getWallet()).availableBalance, 0);
  await assert.rejects(other.getTopUpStatus(tx.id), /tài khoản/);
  for (const actor of [null, {id:'x',role:'tutor'}, {id:'x',role:'learner',appealOnly:true}]) await assert.rejects(createWalletService(actor, options).getWallet(), /đăng nhập/);
});
test('invalid VND amounts rejected; simultaneous withdrawals cannot overspend held money', async () => {
  const { service, mock } = await setup();
  for (const amount of [0, -1, 1.2, NaN, Infinity, '1000', 1000000001]) await assert.rejects(service.createTopUp(amount), /số tiền/);
  const tx = await service.createTopUp(100); await mock.simulateTopUp(tx.id, 'succeeded');
  const results = await Promise.allSettled([withdraw(service, 80), withdraw(service, 80)]);
  assert.equal(results.filter((item) => item.status === 'fulfilled').length, 1);
  assert.equal((await service.getWallet()).availableBalance, 20);
});
test('storage failure does not report success or apply money; corrupt data is not silently reset', async () => {
  const { service, mock, storage, values, actor } = await setup(); const tx = await service.createTopUp(1000);
  const original = storage.setItem; storage.setItem = () => { throw new Error('quota'); };
  await assert.rejects(mock.simulateTopUp(tx.id, 'succeeded'), /Không lưu/);
  assert.equal((await service.getWallet()).availableBalance, 0);
  storage.setItem = original; await mock.simulateTopUp(tx.id, 'succeeded'); assert.equal((await service.getWallet()).availableBalance, 1000);
  values.set(walletStorageKey(actor.id), 'broken'); await assert.rejects(service.getWalletTransactions(), /Không tải/);
});
test('history newest first with equal timestamps; tuition flow stays out of scope', async () => {
  const { service, storage, actor } = await setup();
  const first = await service.createTopUp(1000); const second = await service.createTopUp(2000);
  assert.deepEqual((await service.getWalletTransactions()).map((item) => item.id), [second.id, first.id]);
  const state = JSON.parse(storage.getItem(walletStorageKey(actor.id)));
  state.transactions.push({id:'DEMO-TUITION',type:'tuition',amount:500,createdAt:'2026-11-16T05:00:00Z',status:'succeeded',lessonId:'existing-lesson-id'});
  storage.setItem(walletStorageKey(actor.id), JSON.stringify(state));
  const history = await service.getWalletTransactions(); assert(!history.some((item) => item.type === 'tuition'));
  assert(JSON.parse(storage.getItem(walletStorageKey(actor.id))).transactions.some((item) => item.id === 'DEMO-TUITION'));
});

test('linking each provider confirms only service-owned masked account data and persists once', async () => {
  const {service, mock, actor, options} = await setup({linked:false});
  assert.deepEqual(await service.getLinkedAccounts(), []);
  await assert.rejects(service.createTopUp(100), /liên kết/);
  for (const provider of ['momo', 'techcombank', 'bidv']) {
    const session = await service.startBankLink(provider);
    assert.equal(session.status, 'pending');
    assert.equal((await service.startBankLink(provider)).id, session.id);
    assert(session.url || session.qrPayload);
    if (provider === 'momo') assert.match(session.url, /^\/learner\/wallet\?bankLink=/);
    else assert.match(session.qrPayload, /NO-BANK-AUTH/);
    const results = await Promise.all([mock.simulateBankLink(session.id, 'succeeded'), mock.simulateBankLink(session.id, 'succeeded')]);
    assert.equal(results[0].linkedAccount.id, results[1].linkedAccount.id);
    assert.match(results[0].linkedAccount.maskedNumber, /•••• \d{4}/);
  }
  const reloaded = createWalletService(actor, options);
  assert.equal((await reloaded.getLinkedAccounts()).length, 3);
  const other = createWalletService({id:'other',role:'learner'}, options);
  assert.deepEqual(await other.getLinkedAccounts(), []);
  const session = await service.startBankLink('momo');
  await assert.rejects(other.getBankLinkStatus(session.id), /tài khoản/);
  await mock.simulateBankLink(session.id, 'succeeded');
  assert.equal((await reloaded.getLinkedAccounts()).length, 3);
});

test('failed/expired bank links cannot attach accounts; retries get a new session; natural expiry survives reload', async () => {
  const { service, mock, tick, actor, options } = await setup({linked:false});
  for (const outcome of ['failed', 'expired']) {
    const session = await service.startBankLink('bidv');
    await mock.simulateBankLink(session.id, outcome);
    await mock.simulateBankLink(session.id, 'succeeded');
    assert.equal((await service.getBankLinkStatus(session.id)).status, outcome);
    assert.deepEqual(await service.getLinkedAccounts(), []);
    assert.notEqual((await service.startBankLink('bidv')).id, session.id);
  }
  const latest = await service.startBankLink('bidv'); tick(TOP_UP_LIFETIME);
  assert.equal((await createWalletService(actor,options).getBankLinkStatus(latest.id)).status, 'expired');
  await assert.rejects(service.startBankLink('unknown-provider'), /không hợp lệ/);
});

test('withdrawal recipient must be eligible and owned; snapshot is kept in transaction details', async () => {
  const {service,mock,storage,actor} = await setup();
  const tx = await service.createTopUp(200000); await mock.simulateTopUp(tx.id,'succeeded');
  await assert.rejects(service.requestWithdrawal({amount:10000,linkedAccountId:'foreign'}), /tài khoản nhận/);
  await assert.rejects(service.requestWithdrawal(10000), /số tiền/);
  const account = (await service.getLinkedAccounts())[0];
  const withdrawal = await service.requestWithdrawal({amount:10000,linkedAccountId:account.id});
  assert.equal(withdrawal.linkedAccount.maskedNumber, account.maskedNumber);
  const state = JSON.parse(storage.getItem(walletStorageKey(actor.id)));
  state.linkedAccounts[0].canWithdraw=false; storage.setItem(walletStorageKey(actor.id),JSON.stringify(state));
  await assert.rejects(service.requestWithdrawal({amount:10000,linkedAccountId:account.id}), /tài khoản nhận/);
  await mock.simulateWithdrawal(withdrawal.id,'failed'); await mock.simulateWithdrawal(withdrawal.id,'failed');
  assert.equal((await service.getWallet()).availableBalance,200000);
});

test('existing pre-link wallets retain balance/history while exposing an empty linked-account list', async () => {
  const {service,storage,actor} = await setup({linked:false});
  storage.setItem(walletStorageKey(actor.id),JSON.stringify({accountId:actor.id,balance:12345,transactions:[]}));
  assert.equal((await service.getWallet()).availableBalance,12345);
  assert.deepEqual(await service.getLinkedAccounts(),[]);
});
