# Glossary

Every term the documentation uses without defining it on the spot, and where it is explained. The specifications behind
them are in [STANDARDS.md](STANDARDS.md).

| Term | Meaning | Explained in |
|---|---|---|
| BFF (token handler) | The VEDS gateway signs the user in and keeps the tokens; this front-end never holds one. | [Authentication](docs/authentication.md) |
| Data-access layer | A feature's `*.api.service` (HTTP), `*.service` (orchestration) and `*.state.service` (signals). | [Architecture: How the application is laid out](docs/architecture.md#how-the-application-is-laid-out) |
| Effective permissions | What the caller may do with one row, resolved by the owning service and sent with it. | [Architecture: Permissions decide what renders](docs/architecture.md#permissions-decide-what-renders) |
| ETag | The version of a resource; an edit sends it back in `If-Match` and is refused if it is stale. | [Calling the VEDS API: Optimistic concurrency](docs/veds-api.md#optimistic-concurrency) |
| File reference | A file id the back-end stores, exchanged for a signed link when it is needed. | [Calling the VEDS API: Files are references](docs/veds-api.md#files-are-references) |
| Gateway | The VEDS `api-gateway`, the only address the front-end talks to. | [Architecture: One address](docs/architecture.md#one-address) |
| Message key | A key the back-end sends instead of a sentence, rendered here from the translation catalog. | [Translations: Two sources, one catalog](docs/translations.md#two-sources-one-catalog) |
| NGXS | The store holding the cross-cutting state that outlives a screen. | [Architecture: How the application is laid out](docs/architecture.md#how-the-application-is-laid-out) |
| Problem document | The JSON body of every refusal from the VEDS API. | [Calling the VEDS API: A refusal is an RFC 9457 problem document](docs/veds-api.md#a-refusal-is-an-rfc-9457-problem-document) |
| Shared table | `TableComponent`, used by every list, with gated actions and infinite scroll. | [The shared table](docs/shared-table.md) |
| Two tracks | Text the server resolves and keys the front-end renders; they never mix. | [Translations: Two tracks, and they never mix](docs/translations.md#two-tracks-and-they-never-mix) |
