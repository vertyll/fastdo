# Calling the VEDS API

Four conventions decide whether a new call works.

## The envelope

Every response is `{ data, message, timestamp }`. `message` is a translation key, not a sentence — render it through
`translate`, never directly.

## Errors carry a key and parameters

A failed call returns a code rather than prose:

```json
{ "data": { "code": "project.invitation.expired", "params": {} }, "message": "project.invitation.expired" }
```

`errorKeyOf()` extracts it and the catalogue renders it. Validation failures carry a field map instead, so the form
can attach each message to its control.

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
