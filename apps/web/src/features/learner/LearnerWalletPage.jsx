import { useState } from 'react';
import { ArrowDownLeft, ArrowUpRight, ChevronRight, Link2, Plus, RefreshCw, Wallet } from 'lucide-react';
import LearnerHeader from './LearnerHeader.jsx';
import useDemoAuth from '../auth/DemoAuthContext.jsx';
import Button from '../../components/Button.jsx';
import Badge from '../../components/Badge.jsx';
import { walletTransactionTypes } from '../../data/walletDemo.js';
import useLearnerWallet from './hooks/useLearnerWallet.js';
import { formatWalletMoney, formatWalletTime, walletStatus } from './wallet/walletPresentation.js';
import WalletTransactionDialog from './wallet/WalletTransactionDialog.jsx';
import './search.css';
import './learner-wallet.css';

export default function LearnerWalletPage() {
  const { user } = useDemoAuth();
  return <WalletSession key={user.id} user={user} />;
}

function WalletSession({ user }) {
  const { service, mockControls, data, loading, error, load, transactionFor, eligibleAccounts } = useLearnerWallet(user);
  const [dialog, setDialog] = useState(null);
  const [selected, setSelected] = useState(null);
  const [linkNotice, setLinkNotice] = useState(false);
  const transaction = transactionFor(selected);
  const open = (mode, item = null) => { setSelected(item); setDialog(mode); };
  const startAction = (mode) => {
    const eligible = eligibleAccounts(mode);
    if (!eligible.length) { setLinkNotice(true); return; }
    open(mode);
  };
  const icons = { topup: ArrowDownLeft, withdrawal: ArrowUpRight };
  return <div className="public-page public-page--learner learner-search-page learner-wallet-page density-comfortable">
    <LearnerHeader compact />
    <main className="learner-container learner-wallet-main">
      <div className="learner-wallet-title"><div><span className="learner-wallet-eyebrow">TÀI KHOẢN CỦA BẠN</span><h1>Ví của tôi</h1></div></div>
      <section className="learner-wallet-balance" aria-labelledby="wallet-balance-title" aria-busy={loading}>
        <div><span className="learner-wallet-balance-icon"><Wallet size={24} aria-hidden="true" /></span><h2 id="wallet-balance-title">Số dư khả dụng</h2><strong data-testid="wallet-available">{loading || error || !data ? '—' : formatWalletMoney(data.wallet.availableBalance)}</strong><p>{data && !error ? `Đang giữ để rút: ${formatWalletMoney(data.wallet.heldBalance)}` : 'Thông tin số dư của bạn'}</p></div>
        <div className="learner-wallet-actions"><Button disabled={loading || !!error} onClick={() => startAction('topup')}><Plus size={18} aria-hidden="true" /> Nạp tiền</Button><Button variant="secondary" disabled={loading || !!error} onClick={() => startAction('withdrawal')}><ArrowUpRight size={18} aria-hidden="true" /> Rút tiền</Button></div>
      </section>
      <section className="learner-wallet-linked" aria-labelledby="wallet-linked-title">
        <div className="learner-wallet-history-heading"><h2 id="wallet-linked-title">Tài khoản liên kết</h2><Button variant="secondary" onClick={() => setLinkNotice(true)}><Link2 size={17} aria-hidden="true" /> Liên kết tài khoản</Button></div>
        <p className="learner-wallet-linked-empty">Chưa liên kết</p>
        {linkNotice && <p className="learner-wallet-note" role="status">Tính năng liên kết tài khoản sẽ sớm khả dụng.</p>}
      </section>
      <section className="learner-wallet-history" aria-labelledby="wallet-history-title" aria-busy={loading}>
        <div className="learner-wallet-history-heading"><h2 id="wallet-history-title">Lịch sử giao dịch</h2><Button variant="quiet" disabled={loading} onClick={() => load()} aria-label="Tải lại lịch sử giao dịch"><RefreshCw size={17} aria-hidden="true" /> Làm mới</Button></div>
        {loading ? <div className="learner-wallet-state" role="status">Đang tải ví và lịch sử giao dịch…</div> : error ? <div className="learner-wallet-state"><p className="learner-wallet-error" role="alert">{error}</p><Button variant="secondary" onClick={() => load()}>Thử lại</Button></div> : !data?.transactions.length ? <div className="learner-wallet-state"><Wallet size={34} aria-hidden="true" /><h3>Chưa có giao dịch</h3><p>Các khoản nạp và rút tiền sẽ xuất hiện tại đây.</p></div> : <ul className="learner-wallet-transactions">
          {data.transactions.map((item) => {
            const Icon = icons[item.type] || Wallet; const status = walletStatus(item.status);
            return <li key={item.id}><button className="learner-wallet-transaction" onClick={() => open('detail', item)}>
              <span className={`learner-wallet-transaction-icon is-${item.type}`}><Icon size={21} aria-hidden="true" /></span>
              <span className="learner-wallet-transaction-copy"><strong>{walletTransactionTypes[item.type] || 'Giao dịch'}</strong><time dateTime={item.createdAt}>{formatWalletTime(item.createdAt)}</time><small>Mã giao dịch: {item.id}</small></span>
              <span className="learner-wallet-transaction-value"><strong>{item.type === 'topup' ? '+' : '−'}{formatWalletMoney(item.amount)}</strong><Badge tone={status.tone}>{status.label}</Badge></span>
              <ChevronRight size={18} aria-hidden="true" />
            </button></li>;
          })}
        </ul>}
      </section>
    </main>
    {dialog && <WalletTransactionDialog mode={dialog} transaction={transaction} service={service} mockControls={mockControls} availableBalance={data?.wallet.availableBalance ?? 0} linkedAccounts={data?.linkedAccounts || []} onCreated={setSelected} onRefresh={() => load(true)} onRestart={open} onClose={() => { setDialog(null); setSelected(null); }} />}
  </div>;
}
