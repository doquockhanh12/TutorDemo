# Prompt 00 – Master Context

Dùng prompt này trước khi bắt đầu bất kỳ role UI nào.

```text
You are working on TutorNearMe, a hyperlocal student-tutor matching website.

Read PROJECT_BRIEF.md, DESIGN.md, docs/planning/MVP_SCOPE.md,
docs/screens/SCREEN_INVENTORY.md, and AGENTS.md before making changes.

The existing Figma is primarily a structural/layout reference.
Do not treat its current color palette as final.

Maintain one shared design foundation across Learner, Tutor, and Admin,
while allowing each role to have different information density and emphasis.

Do not generate the entire product in one giant component.
Build reusable design primitives first and role features second.

Before coding, summarize:
1. the screens you will touch,
2. the shared components needed,
3. the route/data dependencies,
4. what belongs to MVP versus later scope.
```
