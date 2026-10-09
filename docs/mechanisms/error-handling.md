# Error handling

What the VEDS API answers when it refuses a call, and where the front-end turns that into a message.

Every service answers a failed call the same way, as `application/problem+json`:

```json
{ "type": "urn:veds:error:project.invitation.expired", "title": "Gone", "status": 410,
  "instance": "/projects/0193…/invitations/0194…", "code": "project.invitation.expired", "params": {} }
```

| Member   | What to do with it                                                                   |
|----------|--------------------------------------------------------------------------------------|
| `code`   | The service's catalog key. `errorKeyOf()` reads it; render it through `translate`    |
| `params` | Interpolation values for that message. `errorParamsOf()` reads it; absent when empty |
| `fields` | Field name to message key, on a validation refusal only. `fieldErrorsOf()` reads it  |
| `detail` | Absent by design — the prose belongs to translation-service, which resolves `code`   |

A request rejected before it reached the application — an unknown path, an unsupported method — is still a problem
document, but carries no `code`: that member names an entry in a service's catalog, and such a request has none.
Read `status` for those.

## One place reports a failed call

`errorInterceptor` shows the translated `code` bottom right and re-throws, so a caller can still react. Do not add a
second message for the same failure: the interceptor's is the service's own key, which says more than a generic one
written at the call site.

It stays quiet for two failures on purpose — a validation refusal, because the form renders `fields` next to the
inputs the person has to fix, and `401`, because it is answered by signing the person out.

What a component still owns is the **state**: a list that failed to load renders a distinct failed state rather than
an empty one, because "nothing here" and "we could not ask" are different answers to the reader.
