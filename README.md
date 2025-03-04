## Założenia projektu 

Aplikacja internetowa słuząca do zarządzania projektami i zadaniami do danego projektu. Aplikacja składa się z monorepo, w którym mamy do dyspozycji oddzielny back-end jak i front-end.

## Link: https://fastdo.vertyll.usermd.net/
## Swagger: https://api.fastdo.vertyll.usermd.net/api#/ 

## Stos technologiczny

### Back-end:
- NestJS
- Fastify
- TypeORM
- PostgreSQL
- Jest
- OpenAPI (Swagger)

### Front-end:
- Angular
- RxJS
- NGXS
- Tailwind CSS

### Uwierzytelnianie:
- uwierzytelnianie za pomocą JWT - aplikacja korzysta z tokenów JWT do uwierzytelniania użytkowników i posiada mechanizm odświeżania tokenów
- aplikacja pozwala na logowanie na wiele urządzeń jednocześnie

### Core back-end:
- aplikacja posiada mechanizm obsługi wyjątków
- aplikacja posiada mechanizm logowania
- aplikacja jest w pełni przetłumaczona na język angielski i polski
- aplikacja posiada mechanizm wysyłania maili, osobno dla dev i prod (wzorzec strategii)
- aplikacja posiada mechanizm obsługi plików (wzorzec strategii)
- aplikacja posiada mechanizm obsługi zadań cyklicznych (cron)
- aplikacja posiada wydzielone środowiska dla dev i prod
- aplikacja posiada wydzielony plik konfiguracyjny
- aplikacja posiada RBAC (Role Based Access Control)
- aplikacja posiada CLS (Continuation Local Storage)
- napisano dokumentację API za pomocą OpenAPI (Swagger)
- i wiele innych funkcjonalności, które można znaleźć w kodzie aplikacji

### Core front-end:
- aplikacja posiada system zarządzania stanem za pomocą NGXS
- aplikacja jest w pełni przetłumaczona na język angielski i polski
- komponenty są w pełni re-używalne, były pisane zgodnie z zasadami DRY oraz użyto metodologii Atomic Design
- aplikacja pisana zgodnie z nowymi standardami Angulara - użyto m.in. sygnały
- i wiele innych funkcjonalności, które można znaleźć w kodzie aplikacji

### Inne:
- Turborepo w celu automatyzacji skryptów i zarządzania strukturą monorepo
- ESLint i Dprint do statycznej analizy kodu i utrzymania jednolitej jakości kodu
- Docker dla środowiska deweloperskiego

**Podczas pisania aplikacji stosowano zasady SOLID, DRY, composition over inheritance, dependency injection, wzorce projektowe, wzorce architektoniczne, pisano testy oraz przyjęto inne dobre praktyki programistyczne.**

## Zdjęcia poglądowe

![Widok projektu](https://raw.githubusercontent.com/vertyll/fastdo/refs/heads/main/screenshots/Screenshot%202025-02-09%20at%2012-49-54%20Rejestracja.png)
![Widok projektu](https://raw.githubusercontent.com/vertyll/fastdo/refs/heads/main/screenshots/Screenshot%202025-02-09%20at%2012-52-27%20Projekty.png)
![Widok projektu](https://raw.githubusercontent.com/vertyll/fastdo/refs/heads/main/screenshots/Screenshot%202025-02-09%20at%2012-52-38%20Zadania.png)
![Widok projektu](https://raw.githubusercontent.com/vertyll/fastdo/refs/heads/main/screenshots/Screenshot%202025-02-09%20at%2012-54-46%20Profil%20u%C5%BCytkownika.png)
![Widok projektu](https://raw.githubusercontent.com/vertyll/fastdo/refs/heads/main/screenshots/Screenshot%202025-02-09%20at%2012-56-38%20Zadania.png)
![Widok projektu](https://raw.githubusercontent.com/vertyll/fastdo/refs/heads/main/screenshots/Screenshot%202025-02-09%20at%2012-57-08%20Zadania.png)

## Instrukcja instalacji projektu

- Pobieramy projekt na lokalne środowisko
- wykonujemy:

```bash
pnpm install
# or
npm install
```

> **Uwaga:** w tym momencie zainstalują się wszystkie zalezności potrzebne do uruchomienia projektu oraz stworzą się dla nas pliki .env w strukturze back-endu
- W utworzonych plikach .env definiujemy swoje własne klucze API i dane konfiguracyjne.
- W strukturze front-endu definiujemy adres naszego API w pliku `enviroment.ts`

`Jeżeli chcemy uruchomić projekt lokalnie, to:`

- Sprawdzamy czy mamy uruchomioną bazę danych, projekt korzysta z bazy danych `PostgreSQL`
- wykonujemy:

```bash
pnpm run dev
# or
npm run dev
```

`Jeżeli chcemy uruchomić projekt w kontenerach Docker, to:`
- kopiujemy plik `.env.docker.example` do `.env` w głównym katalogu projektu
- wykonujemy:

```bash
docker-compose -f docker-compose.dev.yml --env-file .env up -d
```

Domyśnie, jeżeli użyjemy jednej z powyższych ścieżek, to:
- aplikacja back-endowa powinna być dostępna na adresie [http://localhost:3000](http://localhost:3000)
- aplikacja front-endowa powinna być dostępna na adresie [http://localhost:4200](http://localhost:4200)

Adresy wklejamy do przeglądarki internetowej.
