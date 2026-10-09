# Calling the VEDS API

Five conventions decide whether a new call works.

## A success is the payload

There is no envelope. `GET /projects` answers with the list, not with `{ data: [...] }`; the status is the status and
`Date` is the timestamp. An action with nothing to return answers `204` and no body, which Angular surfaces as `null`.

`GET /auth/session` is the one worth remembering: nobody being signed in is an answer, not a refusal, so it is `204`
rather than `401`. A `401` there would be indistinguishable from the gateway being unreachable, and the application
would sign the person out over a network blip.

## A refusal is an RFC 9457 problem document

Every service answers a failed call with an RFC 9457 problem document carrying a message key, and `errorInterceptor`
reports it once: [Error handling](mechanisms/error-handling.md).

## Optimistic concurrency

An edit carries the version it was based on, and a stale one is refused: [Optimistic
concurrency](mechanisms/optimistic-concurrency.md).

## Files are references

A file is a stored id exchanged for a signed link when it is needed: [File references](mechanisms/file-references.md).
