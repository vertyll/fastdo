# The shared table

`TableComponent` renders every list in the application. Three of its rules look like defects until you know why they
are there.

## A clamped cell does not overflow

When a column sets `maxChars`, the cell's `max-width` becomes `${maxChars}ch`, so the text always fits horizontally
and DOM overflow measurement reports nothing. The text is still cut by `line-clamp`, so the "show more" toggle is
decided by the character count. Measuring is only correct for columns without `maxChars`, and never while the cell is
expanded — an expanded cell has no clamp to overflow.

## Infinite scroll must ignore its first sighting

The observer watches the last row. When the first page fits inside the container that row is visible immediately, so
an unguarded observer emits `loadMore` right after the initial load and silently doubles the page size. The first
emission is suppressed until the user has scrolled at least once.

## The scroll listener is not redundant with the observer

When the first page fits, the last row stays permanently visible and `IntersectionObserver` never fires again after
that suppressed emission. Watching `scroll` is what still reaches page two.

## Actions are gated, not decorative

An action with no `visible` predicate is shown to everybody, including users whose request will be refused with 403.
Gate destructive actions on the permission the service actually checks:

```typescript
visible: () => this.taskPermissions().includes(ProjectRolePermissionEnum.MANAGE_TASKS)
```
