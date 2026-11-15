// View selectors only; the existing wallet adapter owns funds and persistence.
export function selectWalletTransaction(data, selected) {
  const storedTransaction = selected && data?.transactions.find((item) => item.id === selected.id);
  return storedTransaction && (['succeeded', 'failed', 'expired'].includes(storedTransaction.status) || Date.parse(storedTransaction.updatedAt) > Date.parse(selected.updatedAt)) ? storedTransaction : selected;
}
export const selectWithdrawalRecipients = (linkedAccounts) => linkedAccounts.filter((account) => account.canWithdraw);
export const selectEligibleWalletAccounts = (data, mode) => data?.linkedAccounts.filter((account) => mode !== 'withdrawal' || account.canWithdraw) || [];
