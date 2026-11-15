import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Building2, ExternalLink, Smartphone, X } from 'lucide-react';
import Button from '../../../components/Button.jsx';
import Badge from '../../../components/Badge.jsx';
import useDialogFocus from '../../../hooks/useDialogFocus.js';
import { walletLinkProviders } from '../../../data/walletDemo.js';
import WalletQr from './WalletQr.jsx';
import WalletStatusTestControls from './WalletStatusTestControls.jsx';
import { walletStatus } from './walletPresentation.js';

export default function WalletBankLinkDialog({ service, mockControls, initialSessionId, onLinked, onClose }) {
  const [provider, setProvider] = useState('');
  const [session, setSession] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const locked = useRef(false);
  const finished = useRef(false);
  const close = () => { if (!locked.current) onClose(); };
  const ref = useDialogFocus(close);
  const complete = async (next) => {
    setSession(next);
    if (next.status === 'succeeded' && !finished.current) {
      finished.current = true;
      try { await onLinked(next.linkedAccount); } catch (err) { finished.current = false; throw err; }
    }
  };
  const run = async (action) => {
    if (locked.current) return;
    locked.current = true; setBusy(true); setError('');
    try { await complete(await action()); }
    catch (err) { setError(err.message || 'Không thực hiện được liên kết. Vui lòng thử lại.'); }
    finally { locked.current = false; setBusy(false); }
  };
  useEffect(() => {
    if (!initialSessionId) return;
    let live = true;
    setBusy(true); locked.current = true;
    service.getBankLinkStatus(initialSessionId).then((next) => { if (live) return complete(next); })
      .catch((err) => { if (live) setError(err.message); })
      .finally(() => { if (live) { setBusy(false); locked.current = false; } });
    return () => { live = false; };
  }, [initialSessionId, service]);
  useEffect(() => {
    if (session?.status !== 'pending') return;
    let live = true;
    const timer = setInterval(async () => {
      if (locked.current) return;
      try { const next = await service.getBankLinkStatus(session.id); if (live) await complete(next); }
      catch (err) { if (live) setError(err.message); }
    }, 3000);
    return () => { live = false; clearInterval(timer); };
  }, [session?.id, session?.status, service]);
  const start = () => run(() => service.startBankLink(provider || session?.provider));
  const terminal = session && ['failed', 'expired'].includes(session.status);
  const safeUrl = session?.url && (/^https?:\/\//i.test(session.url) || /^\/(?!\/)/.test(session.url)) ? session.url : null;
  return createPortal(<div className="learner-wallet-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) close(); }}>
    <section ref={ref} className="learner-wallet-dialog" role="dialog" aria-modal="true" aria-labelledby="wallet-bank-title" aria-busy={busy} tabIndex={-1}>
      <header><h2 id="wallet-bank-title">Liên kết tài khoản</h2><button className="icon-button" disabled={busy} onClick={close} aria-label="Đóng liên kết"><X size={20} aria-hidden="true" /></button></header>
      {!session ? <>
        <p>Chọn ví điện tử hoặc ngân hàng để liên kết với ví của bạn.</p>
        <fieldset className="learner-wallet-providers" disabled={busy}><legend>Đơn vị liên kết</legend>{walletLinkProviders.map((item) => {
          const Icon = item.category === 'Ví điện tử' ? Smartphone : Building2;
          return <label key={item.id} className={provider === item.id ? 'is-selected' : ''}><input type="radio" name="wallet-provider" value={item.id} checked={provider === item.id} onChange={() => setProvider(item.id)} /><Icon size={22} aria-hidden="true" /><span><strong>{item.name}</strong><small>{item.category}</small></span></label>;
        })}</fieldset>
        <div className="learner-wallet-dialog-actions"><Button variant="secondary" disabled={busy} onClick={close}>Hủy</Button><Button disabled={busy || !provider} onClick={start}>{busy ? 'Đang xử lý…' : 'Tiếp tục'}</Button></div>
      </> : <>
        <h3>Xác nhận trong ứng dụng</h3>
        <p>{session.providerName}</p>
        <div aria-live="polite"><Badge tone={session.status === 'pending' ? 'warning' : walletStatus(session.status).tone}>{session.status === 'pending' ? 'Đang chờ xác nhận' : walletStatus(session.status).label}</Badge></div>
        {session.status === 'pending' && <>
          {safeUrl && <a className="button button--primary learner-wallet-app-link" href={safeUrl} target="_blank" rel="noopener noreferrer"><ExternalLink size={17} aria-hidden="true" /> Mở ứng dụng</a>}
          {session.qrPayload && <><WalletQr payload={session.qrPayload} label="Mã QR liên kết tài khoản" /><p>Quét mã bằng ứng dụng {session.providerName} để xác nhận liên kết.</p></>}
          <Button variant="secondary" disabled={busy} onClick={() => run(() => service.getBankLinkStatus(session.id))}>Kiểm tra trạng thái</Button>
        </>}
        {terminal && <><p>{session.status === 'expired' ? 'Phiên liên kết đã hết hạn. Vui lòng tạo phiên mới.' : 'Liên kết chưa thành công. Vui lòng thử lại.'}</p><Button disabled={busy} onClick={start}>Thử lại</Button></>}
        {session.status === 'succeeded' && <Button disabled={busy} onClick={() => run(() => service.getBankLinkStatus(session.id))}>Tiếp tục</Button>}
      </>}
      {error && <p className="learner-wallet-error" role="alert">{error}</p>}
      {session?.status === 'pending' && <WalletStatusTestControls busy={busy} allowExpired onResult={(outcome) => run(() => mockControls.simulateBankLink(session.id, outcome))} />}
    </section>
  </div>, document.body);
}
