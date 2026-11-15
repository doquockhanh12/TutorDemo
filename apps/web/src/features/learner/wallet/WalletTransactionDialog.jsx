import { useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import Button from '../../../components/Button.jsx';
import Badge from '../../../components/Badge.jsx';
import useDialogFocus from '../../../hooks/useDialogFocus.js';
import { walletDemoAmounts, walletTransactionTypes } from '../../../data/walletDemo.js';
import WalletQr from './WalletQr.jsx';
import WalletStatusTestControls from './WalletStatusTestControls.jsx';
import { formatWalletMoney, formatWalletTime, walletStatus } from './walletPresentation.js';
import { useWalletRecipients } from '../hooks/useLearnerWallet.js';

export default function WalletTransactionDialog({ mode, transaction, service, mockControls, availableBalance, linkedAccounts, onCreated, onRefresh, onRestart, onClose }) {
  const [amount, setAmount] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const locked = useRef(false);
  const recipients = useWalletRecipients(linkedAccounts);
  const [recipientId, setRecipientId] = useState(recipients[0]?.id || '');
  const close = () => { if (!locked.current) onClose(); };
  const dialogRef = useDialogFocus(close);
  const isTopUp = mode === 'topup' || transaction?.type === 'topup';
  const title = transaction ? 'Chi tiết giao dịch' : isTopUp ? 'Nạp tiền' : 'Rút tiền';
  const status = transaction && walletStatus(transaction.status);
  const run = async (action) => {
    if (locked.current) return;
    locked.current = true;
    setBusy(true); setError('');
    try { await action(); } catch (err) { setError(err.message || 'Không thực hiện được giao dịch. Vui lòng thử lại.'); }
    finally { locked.current = false; setBusy(false); }
  };
  const submit = (event) => {
    event.preventDefault();
    if (!/^\d+$/.test(amount)) { setError('Nhập số tiền nguyên bằng VND.'); return; }
    run(async () => {
      const next = await (isTopUp ? service.createTopUp(Number(amount)) : service.requestWithdrawal({ amount: Number(amount), linkedAccountId: recipientId }));
      onCreated(next); await onRefresh();
    });
  };
  const check = () => run(async () => {
    const next = await (isTopUp ? service.getTopUpStatus(transaction.id) : service.getWithdrawalStatus(transaction.id));
    onCreated(next); await onRefresh();
  });
  const simulate = (outcome) => run(async () => {
    const next = await (isTopUp ? mockControls.simulateTopUp(transaction.id, outcome) : mockControls.simulateWithdrawal(transaction.id, outcome));
    onCreated(next); await onRefresh();
  });
  return createPortal(<div className="learner-wallet-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) close(); }}>
    <section className="learner-wallet-dialog" ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="wallet-dialog-title" tabIndex={-1} aria-busy={busy}>
      <header><h2 id="wallet-dialog-title">{title}</h2><button className="icon-button" aria-label="Đóng giao dịch" disabled={busy} onClick={close}><X size={20} aria-hidden="true" /></button></header>
      {!transaction ? <form onSubmit={submit} noValidate>
        <p>{isTopUp ? 'Nhập số tiền muốn nạp vào ví của bạn.' : 'Kiểm tra tài khoản nhận trước khi xác nhận. Số tiền sẽ được giữ trong khi xử lý.'}</p>
        {!isTopUp && <p>Số dư khả dụng: <strong>{formatWalletMoney(availableBalance)}</strong></p>}
        {!isTopUp && <>
          <label htmlFor="wallet-recipient">Tài khoản nhận tiền</label>
          <select id="wallet-recipient" value={recipientId} disabled={busy} onChange={(event) => setRecipientId(event.target.value)}>
            {recipients.map((account) => <option key={account.id} value={account.id}>{account.providerName} · {account.maskedNumber}</option>)}
          </select>
        </>}
        <label htmlFor="wallet-amount">Số tiền (VND)</label>
        <input id="wallet-amount" inputMode="numeric" autoComplete="off" value={amount} disabled={busy} onChange={(event) => { setAmount(event.target.value); setError(''); }} placeholder="Nhập số tiền" aria-describedby={error ? 'wallet-action-error' : undefined} aria-invalid={!!error} />
        {isTopUp && <div className="learner-wallet-presets">{walletDemoAmounts.map((value) => <Button key={value} variant="secondary" size="sm" disabled={busy} onClick={() => setAmount(String(value))}>{formatWalletMoney(value)}</Button>)}</div>}
        {error && <p className="learner-wallet-error" role="alert" id="wallet-action-error">{error}</p>}
        <div className="learner-wallet-dialog-actions"><Button variant="secondary" onClick={close} disabled={busy}>Hủy</Button><Button type="submit" disabled={busy || !amount || (!isTopUp && !recipientId)}>{busy ? 'Đang xử lý…' : isTopUp ? 'Tạo mã QR' : 'Xác nhận rút tiền'}</Button></div>
      </form> : <>
        <div className="learner-wallet-detail-summary" aria-live="polite"><span>{walletTransactionTypes[transaction.type] || 'Giao dịch'}</span><strong>{formatWalletMoney(transaction.amount)}</strong><Badge tone={status.tone}>{status.label}</Badge></div>
        <dl className="learner-wallet-details"><div><dt>Mã giao dịch</dt><dd>{transaction.id}</dd></div><div><dt>Thời gian</dt><dd>{formatWalletTime(transaction.createdAt)}</dd></div>{transaction.linkedAccount && <div><dt>Tài khoản liên quan</dt><dd>{transaction.linkedAccount.providerName} · {transaction.linkedAccount.maskedNumber}</dd></div>}</dl>
        {isTopUp && transaction.status === 'pending' && <>
          <WalletQr payload={transaction.qrPayload} label="Mã QR" />
          <p className="learner-wallet-qr-expiry">Hết hạn lúc {formatWalletTime(transaction.expiresAt)}</p>
        </>}
        {transaction.type === 'withdrawal' && transaction.status === 'processing' && <p className="learner-wallet-note">Đang giữ {formatWalletMoney(transaction.amount)}. Khoản này chưa thể dùng cho giao dịch khác.</p>}
        {error && <p className="learner-wallet-error" role="alert">{error}</p>}
        {isTopUp && ['failed', 'expired'].includes(transaction.status) && <Button disabled={busy} onClick={() => { setError(''); onRestart('topup'); }}>Tạo lại giao dịch</Button>}
        {['pending', 'processing'].includes(transaction.status) && <>
          <Button variant="secondary" disabled={busy} onClick={check}>Kiểm tra trạng thái</Button>
          <WalletStatusTestControls busy={busy} allowExpired={isTopUp} onResult={simulate} />
        </>}
      </>}
    </section>
  </div>, document.body);
}
