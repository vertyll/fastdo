# Architecture

## One address

The front end talks to exactly one host: the VEDS **api-gateway**. Services are never called directly, so the browser
needs no knowledge of how the back end is split up, and the gateway stays the only place where authorization, CORS and
session handling live.

| Concern               | Served from                                                                |
|-----------------------|----------------------------------------------------------------------------|
| Sign-in and session   | api-gateway (`/auth/authorize`, `/auth/callback`, `/auth/session`)         |
| Accounts and roles    | iam-service (`/auth/**`, `/users/**`, `/roles/**`)                         |
| Projects              | project-service (`/projects/**`, `/project-types/**`, `/project-roles/**`) |
| Tasks and comments    | task-service (`/tasks/**`)                                                 |
| Notifications         | notification-service (`/notifications/**`, `/ws/notifications`)            |
| Files                 | file-service (`/files/**`)                                                 |
| Translation catalogue | translation-service (`/translations/**`)                                   |

A component that reaches a service port directly works locally and breaks in the cluster, where only the gateway is
exposed. `environment.apiUrl` is the single place that address appears.

## How the application is laid out

| Layer                                | Holds                                                                                 |
|--------------------------------------|---------------------------------------------------------------------------------------|
| `<feature>/<feature>.page.component` | A routed screen. Owns its filters and table configuration.                            |
| `<feature>/data-access`              | `*.api.service` (HTTP only), `*.service` (orchestration), `*.state.service` (signals) |
| `<feature>/defs`                     | The types that feature exchanges with the back end                                    |
| `shared/components`                  | Atoms, molecules and organisms, consumed by every feature                             |

State is held in signals on the feature's state service; NGXS carries the cross-cutting slices that outlive a screen.

## Permissions decide what renders

Every list row and detail payload carries the caller's effective permissions, resolved by the owning service. The
front end never derives them from a role name.

```typescript
visible: (row) => row.permissions?.includes(ProjectRolePermissionEnum.EDIT_PROJECT)
```

> [!WARNING]
> A row mapping that rebuilds the object field by field must copy `permissions` through. Dropping it makes every
> action silently disappear rather than fail — the guard reads as "no data" instead of "wrong shape".
