# TutorNearMe — Learner / Parent Homepage V2

Bản V2 được dựng lại từ homepage gốc của nhóm N07 với các nguyên tắc:

- Header giữ nguyên markup và visual từ `tutornearme-homepage-v3_fix`.
- Phần body được viết lại cho đúng vai trò Người học / Phụ huynh.
- Không còn section “Trở thành gia sư” trong nội dung homepage; nút trên header được giữ nguyên và mô phỏng dẫn sang luồng Tutor riêng.
- Visual direction tươi sáng lấy cảm hứng từ nhịp màu của trang VUS Young Leaders: blue / red / yellow / cyan / white, nhưng không sao chép nội dung hay asset của VUS.
- Heading dùng nhiều treatment khác nhau (kicker, pill label, outline label, numbered heading, centered heading), tránh lặp highlight + underline xuyên suốt.
- Logic core bám đề tài N07: Subject + Location + Availability + Fee → Tutor comparison → Request flow.

## File
- `index.html`: giao diện hoàn chỉnh.
- `styles.css` + `theme.css`: giữ nguyên từ homepage gốc để bảo toàn header.
- `v2.css`: design system và layout mới, scope trong `.v2-main` / `.v2-footer`.
- `script.js`: filter, sort, save, map demo, modal và mobile navigation.

## Màu chủ đạo V2
- Blue: `#1346A0`
- Deep blue: `#0A2E73`
- Red: `#E82D3F`
- Yellow: `#FFD33D`
- Cyan: `#22BCEB`
- Light blue: `#EAF6FF`
- Cream: `#FFF8E8`

## Handoff cho Codex
Ưu tiên route sau khi React hóa:
- `/` → homepage này
- `/learner/search`
- `/tutors/:id`
- `/requests/new`
- `/requests`
- `/login`
- `/register`

Dữ liệu hiện chỉ là mock để đánh giá UI/UX.
