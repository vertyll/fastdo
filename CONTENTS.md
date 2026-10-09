# Contents

Every document in this repository, the module it belongs to, and what it covers. Terms are defined in
[GLOSSARY.md](GLOSSARY.md), and the specifications behind them are in [STANDARDS.md](STANDARDS.md).

## Start here

| Document                  | Module | Kind              | Covers                                                         |
|---------------------------|--------|-------------------|----------------------------------------------------------------|
| [fastdo](README.md)       | —      | repository README | What the repository is, its stack and where to start.          |
| [Glossary](GLOSSARY.md)   | —      | reference         | Every term the docs use, and where it is explained.            |
| [Standards](STANDARDS.md) | —      | reference         | The RFCs and specifications the code implements or depends on. |

## Overview

| Document                                       | Module | Kind     | Covers                                                                                   |
|------------------------------------------------|--------|----------|------------------------------------------------------------------------------------------|
| [Development Setup](docs/development-setup.md) | —      | overview | Installing, running against a local VEDS, and building.                                  |
| [Architecture](docs/architecture.md)           | —      | overview | The one address, and how features are laid out.                                          |
| [Authentication](docs/authentication.md)       | —      | overview | The BFF token handler.                                                                   |
| [Calling the VEDS API](docs/veds-api.md)       | —      | overview | What a successful call returns, and where each other convention of the API is described. |

## Mechanisms

| Document                                                            | Module | Kind      | Covers                                                                                               |
|---------------------------------------------------------------------|--------|-----------|------------------------------------------------------------------------------------------------------|
| [Translations](docs/mechanisms/translations.md)                     | —      | mechanism | The two catalogs and ICU plurals.                                                                    |
| [The shared table](docs/mechanisms/shared-table.md)                 | —      | mechanism | The rules in `TableComponent` and how actions are gated.                                             |
| [Error handling](docs/mechanisms/error-handling.md)                 | —      | mechanism | What the VEDS API answers when it refuses a call, and where the front-end turns that into a message. |
| [File references](docs/mechanisms/file-references.md)               | —      | mechanism | How files are uploaded, stored and shown when the front-end holds only an id.                        |
| [Optimistic concurrency](docs/mechanisms/optimistic-concurrency.md) | —      | mechanism | How an edit made on stale data is refused instead of silently overwriting someone else's change.     |
| [Permission gating](docs/mechanisms/permission-gating.md)           | —      | mechanism | How the front-end decides which actions to offer without knowing what a role means.                  |

## Applications

| Document                            | Module     | Kind          | Covers                          |
|-------------------------------------|------------|---------------|---------------------------------|
| [frontend](apps/frontend/README.md) | `frontend` | module README | The FastDo Angular application. |
