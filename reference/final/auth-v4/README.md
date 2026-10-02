# TutorNearMe Auth Pages V4

Prototype auth đã chốt cho TutorNearMe.

## Pages
- `login.html` — một cửa Login chung, không chọn role.
- `register-learner.html` — Register Người học/Phụ huynh.
- `register-tutor.html` — Register Gia sư.

## V4 changes
- Header giữ pattern homepage đã duyệt: bo góc, hover underline, scroll blur/shadow, CTA vàng “Trở thành gia sư”.
- Google/Facebook/Phone xuất hiện ở Login và cả hai Register.
- Register mô phỏng pre-fill dữ liệu provider; người dùng vẫn sửa được.
- Email/SĐT đã verified mất trạng thái verified nếu người dùng sửa.
- Password + Confirm Password luôn bắt buộc cho tài khoản mới.
- Phone auth dùng modal 2 bước giữa màn hình: số điện thoại → OTP. Mã OTP demo cho QA: `123456`.
- Tutor tự nhập địa chỉ, mức phí; môn học có `Cấu trúc dữ liệu và giải thuật` thay cho `Lập trình`; chọn `Khác` mở ô riêng.
- Tutor bắt buộc chọn ít nhất 1 môn và 1 khung giờ thường rảnh.

## Important
Google/Facebook OAuth và OTP trong prototype là mô phỏng UI/flow, chưa gọi provider thật. Khi tích hợp backend, thay mock provider callbacks bằng OAuth/OTP service và giữ nguyên contract pre-fill/verification state.
