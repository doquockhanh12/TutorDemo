import { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import Button from '../../../components/Button.jsx';

export default function WalletQr({ payload, label = 'Mã QR' }) {
  const [image, setImage] = useState('');
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let active = true; setImage(''); setError(false);
    QRCode.toDataURL(payload, { width: 220, margin: 4, errorCorrectionLevel: 'M' })
      .then((value) => { if (active) setImage(value); }).catch(() => { if (active) setError(true); });
    return () => { active = false; };
  }, [payload, attempt]);
  return <div className="learner-wallet-qr">
    <strong>{label}</strong>
    {image ? <img src={image} width="220" height="220" alt={label} /> : error ? <><p role="alert">Không tạo được hình QR.</p><Button variant="secondary" onClick={() => setAttempt((value) => value + 1)}>Thử lại QR</Button></> : <p role="status">Đang tạo QR…</p>}
  </div>;
}
