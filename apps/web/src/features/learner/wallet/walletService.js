import { createMockWalletService } from './mockWalletService.js';

// API integration seam. Actor comes from auth, never from an editable page field.
export function createWalletService(actor, options) {
  const mock = createMockWalletService(actor, options);
  return {
    getWallet: mock.getWallet,
    getWalletTransactions: mock.getWalletTransactions,
    getLinkedAccounts: mock.getLinkedAccounts,
    startBankLink: mock.startBankLink,
    getBankLinkStatus: mock.getBankLinkStatus,
    createTopUp: mock.createTopUp,
    getTopUpStatus: mock.getTopUpStatus,
    requestWithdrawal: mock.requestWithdrawal,
    getWithdrawalStatus: mock.getWithdrawalStatus,
  };
}
