# Translations

## Two sources, one catalogue

`BackendCatalogueLoader` merges what the interface owns with what the back end owns:

```typescript
forkJoin({
  ui: this.http.get<Catalogue>(`./i18n/${language}.json`),
  backend: this.http.get<BackendCatalogue>(`${environment.apiUrl}/translations/${language}`),
})
```

The static file carries interface copy no service knows about — button labels, page titles, form captions. The
request carries every key a service can put in a response. Both are needed: without the file the interface loses its
labels, without the request **every** back-end key renders as itself, which the user sees as
`project.invitation.expired` in a toast.

The back end wins on a collision, because it owns the keys it declares. A failed request falls back to an empty
catalogue rather than an error, so a brief `translation-service` outage costs the back-end messages, not the interface.

## Two tracks, and they never mix

| Track           | Response carries         | Rendered by | Language from                 |
|-----------------|--------------------------|-------------|-------------------------------|
| System messages | a key and its parameters | the client  | whatever the client is set to |
| Data labels     | finished text            | the server  | `x-lang` on the request       |

A status or category name is text somebody typed, so it has no key to look up; the server resolves it against
`x-lang` and returns `statusName` ready to render.

> [!WARNING]
> Server-resolved text does not change when the user switches language — it was fetched under the old header. A
> screen showing such text must refetch on `onLangChange`, not merely re-render.

## ICU, single brace

Angular offers two ways to translate and only one can read a catalogue an administrator edits.

| Property                | `@angular/localize`   | `ngx-translate`             |
|-------------------------|-----------------------|-----------------------------|
| Resolved                | at build time         | at run time                 |
| ICU plurals             | built in              | needs a `TranslateCompiler` |
| Changing language       | one bundle per locale | no rebuild                  |
| Catalogue from a server | not possible          | the normal case             |

`@angular/localize` freezes the catalogue into the bundle, so a correction would never reach anybody. `ngx-translate`
is used for that reason alone, and pays for it by having to add ICU back: its default parser substitutes `{{param}}`
and does nothing else, so `ngx-translate-messageformat-compiler` is registered as the `TranslateCompiler`.

**Both catalogues are ICU, single brace.** `{{param}}` is `ngx-translate`'s own syntax and the compiler does not read
it — under ICU `{{count}}` renders as `{5}`, braces included. One dialect across both sources is what keeps that from
becoming a per-key accident.

Counted nouns use a plural, because Polish needs four forms:

```json
"batchDeleteConfirm": "Czy na pewno chcesz usunąć {count, plural, one{# zadanie} few{# zadania} many{# zadań} other{# zadania}}?"
```

## A missing key renders as the key

Not a fallback. A fallback substitutes another language and the reader assumes the text is finished; a bare
`Task.priorityMedium` on screen is visible, greppable and names exactly what has to be added.

Every key referenced in code must exist in one of the two catalogues. Nothing enforces that at build time, so it is
worth checking when adding a screen.

> [!NOTE]
> `environment.availableLanguages` is a constant list, while `GET /translations/languages` answers the same question.
> A language seeded in the back end therefore needs a front-end release to become selectable.
