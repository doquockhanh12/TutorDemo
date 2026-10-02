# Architecture – Suggested Project Shape

## Mục tiêu

Tách giao diện theo 3 role nhưng không tạo 3 codebase độc lập.

```text
apps/web
  shared design system + routes
  features/learner
  features/tutor
  features/admin

apps/api
  domain modules

database
  schema/migrations/seeds
```

## Frontend

- App shell và auth/router ở `src/app`.
- Shared UI primitives ở `src/components`.
- Design tokens/theme ở `src/design-system`.
- Business UI theo role ở `src/features/*`.
- API clients ở `src/services`.

## Backend

Module theo domain:

- auth
- users
- tutors
- subjects
- locations
- availability
- tutoring-requests
- sessions
- reviews
- admin

Không gom toàn bộ nghiệp vụ vào một controller/service duy nhất.

## API boundary

Frontend không truy cập database trực tiếp. Mọi dữ liệu role-based phải đi qua API + authorization.
