# Routing & Role Boundaries

Đây là routing draft, có thể điều chỉnh sau khi chọn framework.

## Public / Learner

- `/login`
- `/register`
- `/tutors`
- `/tutors/:id`
- `/requests/new`
- `/requests`
- `/requests/:id`
- `/lessons/:id`
- `/reviews/new`

## Tutor

- `/tutor/dashboard`
- `/tutor/profile`
- `/tutor/subjects`
- `/tutor/pricing`
- `/tutor/locations`
- `/tutor/availability`
- `/tutor/requests`
- `/tutor/requests/:id`
- `/tutor/lessons`
- `/tutor/lessons/:id`

## Admin

- `/admin/login`
- `/admin/dashboard`
- `/admin/users`
- `/admin/users/:id`
- `/admin/tutors`
- `/admin/tutors/:id`
- `/admin/subjects`
- `/admin/reviews`
- `/admin/issues`
- `/admin/issues/:id`
- `/admin/locations`

Guard routes bằng role/permission; đừng chỉ ẩn menu ở frontend.
