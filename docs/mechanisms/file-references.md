# File references

How files are uploaded, stored and shown when the front-end holds only an id.

Uploads go straight to object storage on a signed URL and only the file id reaches the service that owns the record —
see `FileUploadService`. The sequence is ticket → `PUT` to storage → confirm → attach.

Deletion is asynchronous: the record is marked deleted immediately, a sweep removes the object later. A download
ticket for a deleted file is refused with **409**, but a URL handed out earlier keeps working until it expires.

> [!WARNING]
>
> Unknown fields in a request body are ignored rather than rejected. A misspelled field name returns **200** and
> writes the DTO's default, so a typo looks like a successful no-op. Check the request DTO before inventing a name.
