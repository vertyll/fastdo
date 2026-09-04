# Calling the VEDS API

Five conventions decide whether a new call works.

## A success is the payload

There is no envelope. `GET /projects` answers with the list, not with `{ data: [...] }`; the status is the status and
`Date` is the timestamp. An action with nothing to return answers `204` and no body, which Angular surfaces as `null`.

`GET /auth/session` is the one worth remembering: nobody being signed in is an answer, not a refusal, so it is `204`
rather than `401`. A `401` there would be indistinguishable from the gateway being unreachable, and the application
would sign the person out over a network blip.

## A refusal is an RFC 9457 problem document

Every service answers a failed call the same way, as `application/problem+json`:

```json
{ "type": "urn:veds:error:project.invitation.expired", "title": "Gone", "status": 410,
  "instance": "/projects/0193…/invitations/0194…", "code": "project.invitation.expired", "params": {} }
```

| Member   | What to do with it                                                                   |
|----------|--------------------------------------------------------------------------------------|
| `code`   | The service's catalogue key. `errorKeyOf()` reads it; render it through `translate`  |
| `params` | Interpolation values for that message. `errorParamsOf()` reads it; absent when empty |
| `fields` | Field name to message key, on a validation refusal only. `fieldErrorsOf()` reads it  |
| `detail` | Absent by design — the prose belongs to translation-service, which resolves `code`   |

A request rejected before it reached the application — an unknown path, an unsupported method — is still a problem
document, but carries no `code`: that member names an entry in a service's catalogue, and such a request has none.
Read `status` for those.

## One place reports a failed call

`errorInterceptor` shows the translated `code` bottom right and re-throws, so a caller can still react. Do not add a
second message for the same failure: the interceptor's is the service's own key, which says more than a generic one
written at the call site.

It stays quiet for two failures on purpose — a validation refusal, because the form renders `fields` next to the
inputs the person has to fix, and `401`, because it is answered by signing the person out.

What a component still owns is the **state**: a list that failed to load renders a distinct failed state rather than
an empty one, because "nothing here" and "we could not ask" are different answers to the reader.

## Optimistic concurrency

Anything with a `version` is written back with an `If-Match: W/"<version>"` header; the service refuses to write with
**412** if the record has moved on. `HttpApiService.ifMatch()` builds it.

## Files are references

Uploads go straight to object storage on a signed URL and only the file id reaches the service that owns the record —
see `FileUploadService`. The sequence is ticket → `PUT` to storage → confirm → attach.

Deletion is asynchronous: the record is marked deleted immediately, a sweep removes the object later. A download
ticket for a deleted file is refused with **409**, but a URL handed out earlier keeps working until it expires.

> [!WARNING]
> Unknown fields in a request body are ignored rather than rejected. A misspelled field name returns **200** and
> writes the DTO's default, so a typo looks like a successful no-op. Check the request DTO before inventing a name.
