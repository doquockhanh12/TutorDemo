# Data Model – Domain Draft

## Entities nêu trực tiếp trong đề tài

### User
Tài khoản chung; role xác định learner/parent, tutor hoặc admin.

### TutorProfile
Thông tin công khai/chuyên môn của gia sư.

### Subject
Môn học mà gia sư có thể dạy và learner có thể tìm kiếm.

### Location
Khu vực dạy/học, phục vụ filter và hyperlocal matching.

### Availability
Các khung giờ gia sư khai báo rảnh.

### TutoringRequest
Yêu cầu học gửi từ learner tới tutor, có trạng thái xử lý.

### Review
Đánh giá sau buổi học.

## Entity khuyến nghị bổ sung khi triển khai

Các entity dưới đây **không nằm trong danh sách dữ liệu chính của sheet**, nhưng giúp biểu diễn requirement rõ hơn.

### TutoringSession / Lesson
Đại diện lịch đã xác nhận và trạng thái buổi học; cần cho yêu cầu “trạng thái buổi học” và hành động “đánh dấu hoàn thành”.

### TutorSubject
Quan hệ nhiều-nhiều giữa TutorProfile và Subject nếu một tutor dạy nhiều môn.

### TutorLocation
Quan hệ tutor – khu vực dạy nếu một tutor nhận nhiều khu vực.

## Optional entities

- ChatConversation / ChatMessage.
- LearningPackage.
- TutorVerification.
- Notification.
