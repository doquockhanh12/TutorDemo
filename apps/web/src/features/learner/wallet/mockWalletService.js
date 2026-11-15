import { walletDemoSeed, walletLinkProviders } from '../../../data/walletDemo.js';

export const walletStorageKey = (accountId) => `tnm.demo.wallet.v1:${encodeURIComponent(accountId)}`;
export const TOP_UP_LIFETIME = 10 * 60 * 1000;

export function validateWalletAmount(amount) {
  if (typeof amount !== 'number' || !Number.isSafeInteger(amount) || amount <= 0 || amount > 1000000000) {
    throw new Error('Nhập số tiền nguyên từ 1 đến 1.000.000.000 VND.');
  }
}

// This is a local UI simulator, not a payment/authorization service.
export function createMockWalletService(actor, options = {}) {
  const storage = options.storage ?? globalThis.localStorage;
  const now = options.now ?? (() => new Date());
  const wait = options.wait ?? (() => new Promise((resolve) => setTimeout(resolve, 200)));
  const makeId = options.makeId ?? (() => `TNM-${crypto.randomUUID()}`);
  const authorize = () => {
    if (!actor?.id || actor.role !== 'learner' || actor.appealOnly) throw new Error('Bạn cần đăng nhập tài khoản Learner để xem ví.');
  };
  const save = (state) => {
    try { storage.setItem(walletStorageKey(actor.id), JSON.stringify(state)); }
    catch { throw new Error('Không lưu được giao dịch. Vui lòng thử lại.'); }
  };
  const read = () => {
    authorize();
    let state;
    try {
      const raw = storage.getItem(walletStorageKey(actor.id));
      state = raw ? JSON.parse(raw) : { ...structuredClone(walletDemoSeed), accountId: actor.id };
      if (state.accountId !== actor.id || !Number.isSafeInteger(state.balance) || state.balance < 0 || !Array.isArray(state.transactions)) throw new Error();
      // Restore existing wallets without discarding funds or history.
      state.linkedAccounts ??= [];
      state.bankLinkSessions ??= [];
      if (!Array.isArray(state.linkedAccounts) || !Array.isArray(state.bankLinkSessions)) throw new Error();
    } catch { throw new Error('Không tải được dữ liệu ví. Vui lòng thử lại.'); }
    let changed = false;
    for (const transaction of state.transactions) {
      if (transaction.type === 'topup' && transaction.status === 'pending' && Date.parse(transaction.expiresAt) <= now().getTime()) {
        transaction.status = 'expired'; transaction.updatedAt = now().toISOString(); changed = true;
      }
    }
    for (const session of state.bankLinkSessions) {
      if (session.status === 'pending' && Date.parse(session.expiresAt) <= now().getTime()) {
        session.status = 'expired'; session.updatedAt = now().toISOString(); changed = true;
      }
    }
    if (changed) save(state);
    return state;
  };
  const summary = (state) => {
    const heldBalance = state.transactions.filter((item) => item.type === 'withdrawal' && item.status === 'processing').reduce((sum, item) => sum + item.amount, 0);
    return { balance: state.balance, heldBalance, availableBalance: state.balance - heldBalance, currency: 'VND' };
  };
  const find = (state, id, type) => {
    const transaction = state.transactions.find((item) => item.id === id && item.type === type);
    if (!transaction) throw new Error('Không tìm thấy giao dịch thuộc tài khoản này.');
    return transaction;
  };
  const create = async (type, amount, linkedAccountId) => {
    await wait(); validateWalletAmount(amount);
    const state = read();
    const account = type === 'withdrawal'
      ? state.linkedAccounts.find((item) => item.id === linkedAccountId && item.canWithdraw)
      : state.linkedAccounts[0];
    if (!account) throw new Error(type === 'withdrawal' ? 'Chọn tài khoản nhận tiền đã liên kết.' : 'Vui lòng liên kết tài khoản trước khi nạp tiền.');
    if (type === 'withdrawal' && amount > summary(state).availableBalance) throw new Error('Số tiền rút vượt số dư khả dụng.');
    const timestamp = now().toISOString();
    const transaction = { id: makeId(), type, amount, createdAt: timestamp, updatedAt: timestamp,
      status: type === 'topup' ? 'pending' : 'processing', linkedAccount: structuredClone(account) };
    if (type === 'topup') {
      transaction.expiresAt = new Date(now().getTime() + TOP_UP_LIFETIME).toISOString();
      transaction.qrPayload = `TUTORNEARME-DEMO|${transaction.id}|${amount}VND|NOT-A-REAL-PAYMENT`;
    }
    state.transactions.push(transaction); save(state);
    return structuredClone(transaction);
  };
  const status = async (id, type) => { await wait(); return structuredClone(find(read(), id, type)); };
  const simulate = async (id, type, outcome) => {
    await wait();
    const allowed = type === 'topup' ? ['succeeded', 'expired', 'failed'] : ['succeeded', 'failed'];
    if (!allowed.includes(outcome)) throw new Error('Kết quả kiểm thử không hợp lệ.');
    const state = read(); const transaction = find(state, id, type);
    // Terminal states are absorbing: repeated clicks/polls/reloads never apply money twice.
    if (transaction.status !== (type === 'topup' ? 'pending' : 'processing')) return structuredClone(transaction);
    if (outcome === 'succeeded') {
      const nextBalance = state.balance + (type === 'topup' ? transaction.amount : -transaction.amount);
      if (!Number.isSafeInteger(nextBalance) || nextBalance < 0) throw new Error('Số dư không hợp lệ.');
      state.balance = nextBalance;
    }
    transaction.status = outcome; transaction.updatedAt = now().toISOString(); save(state);
    return structuredClone(transaction);
  };
  const findSession = (state, id) => {
    const session = state.bankLinkSessions.find((item) => item.id === id);
    if (!session) throw new Error('Không tìm thấy phiên liên kết thuộc tài khoản này.');
    return session;
  };
  const startBankLink = async (provider) => {
    await wait(); const state = read();
    const fixture = walletLinkProviders.find((item) => item.id === provider);
    if (!fixture) throw new Error('Đơn vị liên kết không hợp lệ.');
    // Reuse pending sessions for repeated requests to the same provider.
    const pending = state.bankLinkSessions.find((item) => item.provider === provider && item.status === 'pending');
    if (pending) return structuredClone(pending);
    const session = { id: makeId(), provider, providerName: fixture.name, status: 'pending', createdAt: now().toISOString(), expiresAt: new Date(now().getTime() + TOP_UP_LIFETIME).toISOString() };
    if (fixture.confirmation === 'url') session.url = `/learner/wallet?bankLink=${encodeURIComponent(session.id)}`;
    else session.qrPayload = `TUTORNEARME-INTERNAL-LINK|${session.id}|${provider}|NO-BANK-AUTH`;
    state.bankLinkSessions.push(session); save(state); return structuredClone(session);
  };
  const simulateBankLink = async (id, outcome) => {
    await wait();
    if (!['succeeded', 'failed', 'expired'].includes(outcome)) throw new Error('Kết quả kiểm thử không hợp lệ.');
    const state = read(); const session = findSession(state, id);
    if (session.status !== 'pending') return structuredClone(session);
    if (outcome === 'succeeded') {
      const fixture = walletLinkProviders.find((item) => item.id === session.provider);
      let account = state.linkedAccounts.find((item) => item.provider === session.provider);
      if (!account) {
        account = { id: makeId(), provider: fixture.id, providerName: fixture.name, category: fixture.category, maskedNumber: fixture.maskedNumber, canWithdraw: fixture.canWithdraw, linkedAt: now().toISOString() };
        state.linkedAccounts.push(account);
      }
      session.linkedAccount = structuredClone(account);
    }
    session.status = outcome; session.updatedAt = now().toISOString(); save(state); return structuredClone(session);
  };
  return {
    async getWallet() { await wait(); return summary(read()); },
    async getWalletTransactions() { await wait(); return read().transactions.filter((item) => ['topup', 'withdrawal'].includes(item.type)).slice().reverse().sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt)).map((item) => structuredClone(item)); },
    async getLinkedAccounts() { await wait(); return structuredClone(read().linkedAccounts); },
    startBankLink,
    async getBankLinkStatus(id) { await wait(); return structuredClone(findSession(read(), id)); },
    createTopUp: (amount) => create('topup', amount),
    getTopUpStatus: (id) => status(id, 'topup'),
    requestWithdrawal: ({ amount, linkedAccountId } = {}) => create('withdrawal', amount, linkedAccountId),
    getWithdrawalStatus: (id) => status(id, 'withdrawal'),
    // Keep test-only outcomes in the mock; do not carry these into a real API adapter.
    simulateTopUp: (id, outcome) => simulate(id, 'topup', outcome),
    simulateWithdrawal: (id, outcome) => simulate(id, 'withdrawal', outcome),
    simulateBankLink,
  };
}
