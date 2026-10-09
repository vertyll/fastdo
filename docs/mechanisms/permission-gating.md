# Permission gating

How the front-end decides which actions to offer without knowing what a role means.

Every list row and detail payload carries the caller's effective permissions, resolved by the owning service. The
front end never derives them from a role name.

```typescript
visible: (row) => row.permissions?.includes(ProjectRolePermissionEnum.EDIT_PROJECT)
```

> [!WARNING]
>
> A row mapping that rebuilds the object field by field must copy `permissions` through. Dropping it makes every
> action silently disappear rather than fail — the guard reads as "no data" instead of "wrong shape".
