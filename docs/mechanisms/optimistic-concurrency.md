# Optimistic concurrency

How an edit made on stale data is refused instead of silently overwriting someone else's change.

Anything with a `version` is written back with an `If-Match: W/"<version>"` header; the service refuses to write with
**412** if the record has moved on. `HttpApiService.ifMatch()` builds it.
