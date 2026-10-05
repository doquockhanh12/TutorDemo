# Đánh giá Admin UI và kháng cáo

Ngày: 2026-10-05. Phạm vi: frontend-only interactive prototype, Chromium.

## Kết luận

Các màn đã nối luồng có bố cục và thao tác sử dụng được trong các trạng thái đã kiểm tra. Không phát hiện thêm lỗi chồng chữ, chồng khung hoặc nút bị cắt trong các ảnh và hành trình kiểm thử cuối. Đây chưa phải xác nhận production readiness: chưa có backend authentication/authorization, lưu bằng chứng trên server, kiểm chứng tài liệu hay audit trail bảo mật.

## Phạm vi kiểm duyệt

| Màn hình | Kiểm tra |
|---|---|
| `/admin/dashboard` | Số đếm so với shared collections, grid, nội dung review, header/actions |
| `/admin/tutors` | Filter, bảng và cột thao tác cuối, drawer trên/dưới |
| `/admin/users` | Filter, bảng, trạng thái, drawer trên/dưới |
| `/admin/reviews` | Filter, đọc nội dung qua detail, moderation, cột thao tác |
| `/admin/issues` | Hai bên đối soát, lịch sử từng account, lý do cảnh cáo, drawer cuộn hết |
| `/admin/appeals` | Empty/filtered states, hồ sơ có bằng chứng, kết quả và căn cứ xét duyệt |
| `/appeals` | Tutor shell / Learner header, xác thực giới hạn, form, tệp/link, lịch sử và kết quả sau reload |

Admin được kiểm tra ở 1440, 1024, 390 và 360px; form kháng cáo ở 1440, 1024 và 390px. Bảng cuộn ngang bên trong container thay vì ép toàn bộ cột vào mobile. Nội dung rút gọn trong bảng có detail để đọc đầy đủ. QA kiểm tra cả đầu và cuối drawer, cuối bảng, nút trong cell, font sau tải và drawer sau khi animation kết thúc.

State: fresh canonical demo seed; runtime appeal tạo từ account/sự cố hiện có; reload để kiểm tra persisted state; Tutor gửi → Admin xét → Tutor đọc cùng entity. Learner không có sự cố nhắm tới mình nhận empty state đúng, không được nhìn thấy hồ sơ Tutor. Không thêm dữ liệu giả vào fixture để làm màn hình đầy hơn.

## Lỗi tìm thấy và đã sửa

| ID | Vấn đề | Nguyên nhân và sửa |
|---|---|---|
| ADM-REG-001 | Focus ở phía sau drawer | Reuse `useDialogFocus`: trap, ESC, return focus và khóa scroll nền |
| ADM-REG-002 | Đối soát hai cột quá hẹp | Container drawer 520px không đủ; chuyển thành một cột đọc được |
| ADM-REG-003 | Dashboard tràn mobile | Grid minimum và nowrap excerpt vượt container; giới hạn grid/excerpt, wrap header |
| ADM-REG-004 | Tổng review/sự cố hiển thị 0 sai | Selector thiếu output mà UI fallback 0; derive số đếm từ shared collections |
| ADM-REG-005 | Nút thao tác bị cắt trong cell | Tap targets 44px kết hợp nowrap; wrap action row, giữ kích thước nút |

Mỗi lỗi có RED thực tế trước fix, targeted test sau fix và note riêng tại [FRONTEND_REGRESSION_NOTES.md](FRONTEND_REGRESSION_NOTES.md). Không bỏ/skip assertion để đạt green. New feature tests không được mô tả thành regression RED.

## Kết quả kiểm chứng

- `node --test`: 186 passed, 0 failed, 0 skipped; 4498.1765ms.
- `npm run build`: exit 0, 2002 modules, 3.80s. Main chunk 541.11 KB có cảnh báo vượt 500 KB; chưa tối ưu code splitting trong scope này.
- `E2E_BASE_URL=http://127.0.0.1:5174 npm run test:e2e`: 73 passed, 0 failed, 6.9m trước bước hoàn thiện Tutor shell. Bao gồm regression Learner/Tutor/auth/scheduling hiện có.
- Sau bước hoàn thiện Tutor shell và bổ sung Learner entry: `npx playwright test tests/e2e/admin-improvements.spec.js --output=test-results/admin-final-qa` pass 17/17, 0 failed, 1.8m. Bao gồm gửi/tệp bằng chứng/xét duyệt, private history và QA toàn bộ Admin ở bốn chiều rộng.
- `git diff --check`: exit 0; cảnh báo LF/CRLF của Git không phải whitespace error.
- Playwright kiểm tra page errors/React/DOM errors và page overflow; lỗi mạng/asset được phân biệt với lỗi ứng dụng. Không tuyên bố tất cả dịch vụ/ảnh ngoài đều tải thành công.
- Visual review dùng ảnh browser thật từ Playwright và xem ảnh trực tiếp; không sử dụng native Computer Use trong lượt này.

Ảnh QA cuối nằm trong `apps/web/test-results/admin-final-qa/` (ignored artifacts; runner sau có thể xóa). Tests tái tạo ảnh từ deterministic setup: [admin-improvements.spec.js](../../apps/web/tests/e2e/admin-improvements.spec.js).

## Bài học cần giữ khi tổng kiểm duyệt

1. Page không overflow chưa đủ: nút vẫn có thể bị `td overflow:hidden` cắt. Đo bounds trong cell, cuộn tới cột cuối và nhìn ảnh.
2. Đợi font tải xong trước khi đo. Font fallback từng làm một lượt đo tưởng đã pass nhưng font thật làm tràn tiếp.
3. Đợi animation kết thúc trước khi đo drawer; frame giữa chuyển động không phải bằng chứng geometry cuối sai.
4. Kiểm tra vùng cuộn trong container tới cuối, không chỉ ảnh phần đầu hoặc chiều rộng toàn trang.
5. So sánh metric với danh sách/domain, không chỉ xác nhận card có số.
6. Kiểm chứng cùng hồ sơ xuyên role và reload; không dùng hai collections độc lập hoặc bằng chứng chỉ có tên tệp.

## Giới hạn và quyết định còn mở

- Cam kết của người gửi và bằng chứng có thể đối chiếu là bắt buộc; tính xác thực vẫn phải do Admin xét, chưa có xác minh tự động.
- Chấp nhận kháng cáo không tự xóa cảnh cáo hoặc mở khóa. Policy tác động lên penalty vẫn UNKNOWN, cần quyết định sản phẩm riêng.
- Tệp ảnh/PDF lưu local demo, mỗi tệp tối đa 500 KB và tổng 1 MB/hồ sơ; quota trình duyệt có thể hết nếu lưu nhiều hồ sơ. Chưa có server upload hoặc đồng bộ thiết bị.
- Session giới hạn cho tài khoản bị khóa chỉ mô phỏng frontend, không thay thế server authorization.
- Không kiểm chứng browser engines khác Chromium, thiết bị vật lý, screen reader chuyên dụng hay performance production dưới tải.

Fixture `demoReferenceData.js` của người dùng giữ nguyên; không commit/push/merge/deploy.
