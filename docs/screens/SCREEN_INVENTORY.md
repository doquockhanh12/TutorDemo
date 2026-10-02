# Screen Inventory

> **Auth implementation note:** L01, T01 and A01 all use the same shared `/login` route. There are no role-specific login pages. L02 uses `/register`; T02 uses `/tutor/register`. These pages simulate authentication in local frontend state only.

Mục tiêu của file này là ngăn AI tự đoán thiếu/đúp màn hình. ID màn hình giữ ổn định dù tên route có thể thay đổi.

## Learner / Parent

| ID | Screen | MVP |
|---|---|---|
| L01 | Login (shared route `/login`) | Yes |
| L02 | Register | Yes |
| L03 | Tutor Search / Discovery | Yes |
| L04 | Tutor Search Filters | Yes, có thể nằm trong L03 |
| L05 | Tutor Profile Detail | Yes |
| L06 | Create Tutoring Request | Yes |
| L07 | Request Confirmation | Yes |
| L08 | My Requests | Yes |
| L09 | Request Detail / Status | Yes |
| L10 | Lesson / Confirmed Schedule Detail | Yes |
| L11 | Submit Tutor Review | Yes |
| L12 | Learner Account/Profile | Recommended |

## Tutor

| ID | Screen | MVP |
|---|---|---|
| T01 | Login (shared route `/login`) | Yes |
| T02 | Register / Tutor Onboarding | Yes |
| T03 | Tutor Dashboard | Yes |
| T04 | Edit Tutor Profile | Yes |
| T05 | Subject Settings | Yes |
| T06 | Pricing Settings | Yes |
| T07 | Teaching Location Settings | Yes |
| T08 | Availability Calendar | Yes |
| T09 | Incoming Requests | Yes |
| T10 | Request Detail | Yes |
| T11 | Accept / Reject State | Yes |
| T12 | Confirmed Schedule / Lessons | Yes |
| T13 | Lesson Detail | Yes |
| T14 | Mark Lesson Completed | Yes |

## Admin

| ID | Screen | MVP |
|---|---|---|
| A01 | Admin Login (shared route `/login`) | Yes |
| A02 | Dashboard | Yes |
| A03 | User List | Yes |
| A04 | User Detail / Account Status | Yes |
| A05 | Tutor List | Yes |
| A06 | Tutor Detail / Status | Yes |
| A07 | Subject Management | Yes |
| A08 | Review Management | Yes |
| A09 | Account Issues / Suspended Requests | Yes |
| A10 | Issue Detail | Yes |
| A11 | Location Management | Recommended/Core-support |
| A12 | Reports / Complaints | Later / Figma reference |
| A13 | System Settings | Later |
| A14 | Logs / Permissions | Later |

## Optional extension screens

- Map discovery.
- Chat.
- Learning package management.
- Student-card verification.
- Distance-based matching explanation/result.
