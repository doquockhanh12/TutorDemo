// Frontend demo defaults only. No invented historic balance or tuition payment.
export const walletDemoSeed = { balance: 0, transactions: [], linkedAccounts: [], bankLinkSessions: [] };
export const walletDemoAmounts = [100000, 200000, 500000];
export const walletTransactionTypes = { topup: 'Nạp tiền', withdrawal: 'Rút tiền', tuition: 'Thanh toán học phí' };
export const walletStatuses = {
  pending: { label: 'Chờ thanh toán', tone: 'warning' },
  processing: { label: 'Đang xử lý', tone: 'info' },
  succeeded: { label: 'Thành công', tone: 'success' },
  expired: { label: 'Hết hạn', tone: 'neutral' },
  failed: { label: 'Thất bại', tone: 'danger' },
};

// Provider fixtures are for local confirmation only, never real banking credentials.
export const walletLinkProviders = [
  { id: 'momo', name: 'MoMo', category: 'Ví điện tử', confirmation: 'url', maskedNumber: '•••• 5678', canWithdraw: true },
  { id: 'techcombank', name: 'Techcombank', category: 'Ngân hàng', confirmation: 'qr', maskedNumber: '•••• 1234', canWithdraw: true },
  { id: 'bidv', name: 'BIDV', category: 'Ngân hàng', confirmation: 'qr', maskedNumber: '•••• 6789', canWithdraw: true },
];
