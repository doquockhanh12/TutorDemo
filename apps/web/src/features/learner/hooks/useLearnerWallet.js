import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createWalletService } from '../wallet/walletService.js';
import { createMockWalletService } from '../wallet/mockWalletService.js';
import { selectWalletTransaction, selectEligibleWalletAccounts, selectWithdrawalRecipients } from '../../../services/learner/walletViewService.js';
export default function useLearnerWallet(user) {
  const service = useMemo(() => createWalletService(user), [user]);
  const mockControls = useMemo(() => createMockWalletService(user), [user]);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const requestVersion = useRef(0);
  const load = useCallback(async (quiet = false) => {
    const version = ++requestVersion.current;
    if (!quiet) setLoading(true);
    try {
      const [wallet, transactions, linkedAccounts] = await Promise.all([service.getWallet(), service.getWalletTransactions(), service.getLinkedAccounts()]);
      if (version !== requestVersion.current) return;
      const next = { wallet, transactions, linkedAccounts };
      setData(next); setError(''); return next;
    } catch (err) { if (version === requestVersion.current) setError(err.message || 'Không tải được ví.'); }
    finally { if (version === requestVersion.current) setLoading(false); }
  }, [service]);
  useEffect(() => { load(); return () => { requestVersion.current++; }; }, [load]);
  useEffect(() => {
    if (!data?.transactions.some((item) => ['pending', 'processing'].includes(item.status))) return;
    const timer = setInterval(async () => {
      try {
        await Promise.all(data.transactions.filter((item) => ['pending', 'processing'].includes(item.status)).map((item) => item.type === 'topup' ? service.getTopUpStatus(item.id) : service.getWithdrawalStatus(item.id)));
        load(true);
      } catch (err) { setError(err.message); }
    }, 5000);
    return () => clearInterval(timer);
  }, [data, service, load]);

return { service, mockControls, data, loading, error, load,
  transactionFor: (selected) => selectWalletTransaction(data, selected),
  eligibleAccounts: (mode) => selectEligibleWalletAccounts(data, mode),
};
}

export function useWalletRecipients(linkedAccounts) {
  return selectWithdrawalRecipients(linkedAccounts);
}
