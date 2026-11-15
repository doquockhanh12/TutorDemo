import Button from '../../../components/Button.jsx';

// Test-only UI, kept separate from production service calls and primary actions.
export default function WalletStatusTestControls({ onResult, busy, allowExpired = false }) {
  return <fieldset className="learner-wallet-test-controls" disabled={busy}>
    <legend>Kiểm thử trạng thái</legend>
    <Button variant="quiet" size="sm" disabled={busy} onClick={() => onResult('succeeded')}>Thành công</Button>
    <Button variant="quiet" size="sm" disabled={busy} onClick={() => onResult('failed')}>Thất bại</Button>
    {allowExpired && <Button variant="quiet" size="sm" disabled={busy} onClick={() => onResult('expired')}>Hết hạn</Button>}
  </fieldset>;
}
