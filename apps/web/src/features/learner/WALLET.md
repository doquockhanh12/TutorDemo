# Ví của tôi

## Cập nhật giao diện liên kết — mới nhất

Theo yêu cầu mới nhất, khối Tài khoản liên kết chỉ hiện “Chưa liên kết” và nút “Liên kết tài khoản”. Bấm nút hiện thông báo inline role=status “Tính năng liên kết tài khoản sẽ sớm khả dụng.” bằng treatment learner-wallet-note hiện có. Không render danh sách đơn vị, tài khoản liên kết hoặc WalletBankLinkDialog; query bankLink cũ không tự mở dialog. Nạp/rút khi chưa có recipient cũng hiện cùng thông báo, không mở vòng chọn đơn vị. Service/fixtures và dữ liệu đã lưu được giữ nguyên; các giao dịch/recipient đã có vẫn có thể được đọc theo service hiện hành. Phần mô tả luồng liên kết/API dưới đây được giữ làm tài liệu tích hợp, không còn là UI đang mở cho người dùng.

Route Learner protected `/learner/wallet`, dùng LearnerHeader. Menu avatar giữ một dòng Ví của tôi (Lucide Wallet), sau separator dưới Gia sư yêu thích, trước Hồ sơ cá nhân. Link đóng menu, active aria-current tô nền theo route. URL cũ `/learner/dashboard?tab=wallet` redirect replace tới route mới.

## Nối API

`wallet/walletService.js` là adapter duy nhất cho UI. `createWalletService(actor)` trả chín Promise methods:

- `getWallet()` → `{ balance, heldBalance, availableBalance, currency: 'VND' }`.
- `getWalletTransactions()` → nạp/rút mới nhất trước, không tạo/hiển thị luồng học phí trong batch này.
- `getLinkedAccounts()` → array `{id, provider, providerName, category, maskedNumber, canWithdraw, linkedAt}`.
- `startBankLink(provider)` → phiên `{id, provider, providerName, status, expiresAt, url?, qrPayload?}`.
- `getBankLinkStatus(sessionId)` → phiên hiện hành, khi succeeded kèm `linkedAccount` đã che số.
- `createTopUp(amount)` → transaction nạp pending, kèm `qrPayload`, `expiresAt`.
- `getTopUpStatus(id)` → transaction nạp hiện hành.
- `requestWithdrawal({amount, linkedAccountId})` → transaction rút processing, giữ tiền ngay. Service kiểm tra account thuộc Learner và canWithdraw.
- `getWithdrawalStatus(id)` → transaction rút hiện hành.

Transaction: `{ id, type: 'topup'|'withdrawal', amount, status, createdAt, updatedAt, linkedAccount? }`; ISO timestamps, amount là số nguyên VND. `linkedAccount` là snapshot dữ liệu đã che số do service trả về. Status: pending/processing/succeeded/failed/expired. UI dùng WalletQr/QRCode local để render `qrPayload`; nếu API thật trả QR image thay vì payload, đổi riêng renderer. Không gửi dữ liệu thanh toán tới dịch vụ QR bên ngoài.

Nhóm trưởng thay delegate trong walletService bằng API, giữ contract trên. Identity/quyền truy cập, idempotency, giữ/hoàn tiền, expiry và settlement phải do service thật đảm nhiệm; không tin actor ID hoặc số dư client. UI không tự cộng/trừ số dư. Khi dùng API thật bỏ `mockControls` và WalletStatusTestControls; production adapter không export simulation methods. Bank link thật phải được xác thực tại ứng dụng/trang đối tác, server xác nhận callback rồi status API trả linkedAccount; UI không tự tạo số tài khoản.

## Liên kết và UI

Ví giữ ngôn ngữ nghiệp vụ tự nhiên: Số dư khả dụng, Tài khoản liên kết, Nạp tiền/Rút tiền, Mã QR. Không có badge Ví demo hoặc nhãn Mock/Mô phỏng/Dữ liệu mẫu. WalletStatusTestControls là cụm nhỏ cuối dialog với legend Kiểm thử trạng thái và nút Thành công/Thất bại/Hết hạn, tách khỏi primary actions.

MoMo (Ví điện tử), Techcombank/BIDV (Ngân hàng) do fixtures trong data/walletDemo.js cung cấp. UI gọi startBankLink sau Tiếp tục, render URL và/hoặc QR nếu session thực sự trả field đó; không tự đoán theo tên đơn vị. Mock MoMo trả URL nội bộ `/learner/wallet?bankLink=<session-id>` để kiểm thử xác nhận tại tab khác, không gọi app thật. Hai ngân hàng trả QR nội bộ chỉ chứa thông tin phiên. Poll getBankLinkStatus mỗi 3 giây; phiên hết hạn sau 10 phút. Thất bại/hết hạn tạo phiên mới qua Thử lại; pending cùng provider được reuse, success lặp không tạo linked account trùng.

Nạp/rút khi chưa có linked account đủ điều kiện sẽ mở dialog liên kết trước; sau service success và reload dữ liệu, quay lại đúng intent trong phiên UI. Intent chưa được lưu qua reload; số dư, account, session và transaction được lưu. Link qua URL có thể khôi phục session sau reload, original tab đọc status để tiếp tục intent. Recipient dropdown của Rút tiền chỉ lấy account canWithdraw từ service, hiển thị maskedNumber; transaction giữ snapshot để detail không phụ thuộc account tương lai.

## Mock và dữ liệu

`wallet/mockWalletService.js` chứa lưu trữ và chuyển kết quả: `simulateBankLink(id, outcome)`, `simulateTopUp(id, outcome)` / `simulateWithdrawal(id, outcome)` chỉ dùng trong mock. Terminal status không chuyển lại, không cộng/trừ lặp. Tiền rút processing tính vào heldBalance; thành công giảm balance một lần, thất bại giải phóng hold một lần. Topup pending tự expired sau 10 phút, kiểm tra service/poll 5 giây. Nạp failed/expired không cộng tiền; UI cho Tạo lại giao dịch với ID mới. Guard useRef chặn submit/confirm lặp đồng bộ trong cùng dialog; nút disabled khi đang xử lý. Trạng thái được lưu trước khi service báo thành công; lỗi storage không xóa dữ liệu hoặc báo thành công giả.

`data/walletDemo.js` giữ seed, presets, nhãn trạng thái, provider options và account fixtures đã che số. Seed ví mới: 0 VND, history/accounts/sessions trống. Restore ví cũ thêm collections còn thiếu, bảo toàn số dư và lịch sử. Học phí sẽ thiết kế riêng: không tạo giao dịch tuition, không gán Lesson/Request, không hiển thị tuition trong history nạp/rút; dữ liệu cũ vẫn được giữ trong storage.

Storage riêng theo Learner ID: `tnm.demo.wallet.v1:<encoded-account-id>`. Reload giữ linked accounts, phiên liên kết, pending/processing và số dư; account khác có ví riêng. Đây là state UI local, không phải permission/payment/ledger backend. Tab xác nhận mock dùng chung storage và status polling, không có đồng bộ giao dịch đa thiết bị, callback thanh toán thật hoặc policy học phí; các phần này vẫn UNKNOWN/chưa triển khai.

## Kiểm thử

`node --test tests/walletService.test.js`: 11 cases gồm settlement một lần, holds/refunds, insufficient funds, expiry/failure, persistence/ownership/role, invalid amounts, storage failure, history sorting, bank-link fixtures/retry/dedup/expiry, recipient eligibility và restore ví cũ. E2E `tests/e2e/wallet.spec.js`: menu/route, mỗi provider URL/QR, link failure/expired/retry, resume cả nạp/rút, xác nhận tab thứ hai, topup/recreate/success, overdraw, duplicate submits, holds qua reload, failure refund, loading/error/retry, masked recipient dropdown và 1440/1024/768/390/320px. Dùng Chrome có sẵn qua channel chrome.
