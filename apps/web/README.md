# TutorNearMe Web

Interactive prototype frontend-only dùng React, JavaScript, Vite, React Router, CSS thuần và Lucide Icons. Font Source Sans 3 và Literata được self-host bằng các package Fontsource, gồm glyph Latin và tiếng Việt.

## Chạy local

```sh
npm install
npm run dev
```

Mở URL do Vite in ra terminal. Kiểm tra production build bằng `npm run build`.

## Route trong batch đầu

- `/` chuyển tới `/learner/search`.
- `/learner/search` — tìm và lọc gia sư, xem hồ sơ nhanh, gửi yêu cầu demo.
- `/tutor/dashboard` — xem agenda, xử lý yêu cầu, xem lịch tuần và bật/tắt lịch rảnh demo.
- `/admin/dashboard` — xem bảng vận hành, duyệt hồ sơ và đánh giá demo.

Thanh **Xem giao diện** trên mỗi màn giúp chuyển giữa ba role. Những mục sidebar chưa có route được đánh dấu là thuộc batch tiếp theo.

## Cấu trúc

- `src/components/`: các UI primitive thực sự dùng chung.
- `src/features/learner`, `tutor`, `admin`: từng màn và CSS theo role.
- `src/data/`: mock data tách khỏi JSX.
- `src/styles/`: token, reset, global và tiện ích CSS.
- `src/App.jsx`, `src/main.jsx`: routing và entry point.

State tương tác chỉ tồn tại trong phiên giao diện hiện tại; reload trang đưa dữ liệu về trạng thái demo ban đầu. Không có backend hoặc API.
