# TutorNearMe — Full HTML/CSS/JS Demo

Bản demo frontend tĩnh tổng hợp từ toàn bộ yêu cầu đã trao đổi.

## Chạy nhanh

Mở trực tiếp `index.html`, hoặc chạy local server:

```bash
python -m http.server 8080
```

Sau đó truy cập `http://localhost:8080`.

## Flow 1 — Người học / Phụ huynh

Theme: Ivory `#FFFBF5`, Sand `#F3E8D9`, Sage `#84A98C`, Terracotta `#D97757`, Navy `#0F172A`, link blue `#2563EB`. Font Lora + Inter.

Có:
- Tìm kiếm/lọc gia sư
- Featured tutor + tutor cards
- Mini-map
- Hồ sơ gia sư
- Lịch rảnh read-only
- Gửi yêu cầu học
- Theo dõi yêu cầu
- Huỷ yêu cầu
- Đánh giá sau buổi học

## Flow 2 — Gia sư

Theme: Primary `#2563EB`, Surface `#F8FAFC`, Border `#E5E7EB`, Text `#0F172A`, Secondary `#64748B`, Success `#16A34A`, Warning `#F59E0B`, Error `#EF4444`. Font Manrope + Inter.

Có:
- Dashboard
- Yêu cầu học mới
- Lịch rảnh dạng timetable
- Lịch dạy
- 10 tiết, mỗi tiết 45 phút
- Chi tiết môn học
- Đánh dấu buổi học hoàn thành
- Hồ sơ gia sư

### 10 tiết
1. 07:30–08:15
2. 08:15–09:00
3. 09:00–09:45
4. 10:00–10:45
5. 10:45–11:30
6. 13:00–13:45
7. 13:45–14:30
8. 14:30–15:15
9. 15:30–16:15
10. 16:15–17:00

## Flow 3 — Admin

Theme: Gray 50 `#F9FAFB`, Gray 100 `#F3F4F6`, Gray 300 `#D1D5DB`, Gray 600 `#4B5563`, Gray 900 `#111827`, Alert `#EF4444`. Font IBM Plex Sans.

Có:
- Dashboard
- Duyệt hồ sơ gia sư
- Lớp đang diễn ra
- Kiểm duyệt đánh giá
- Báo cáo/khiếu nại
- Ticket/yêu cầu bị treo
- Các màn quản lý dữ liệu dạng table

## Lưu ý

Đây là demo frontend, chưa có backend/database thật. State thay đổi chỉ tồn tại trong phiên trang hiện tại.
