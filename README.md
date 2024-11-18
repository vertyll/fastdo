## Założenia projektu 

Aplikacja internetowa słuząca do zarządzania projektami i zadaniami do danego projektu. Aplikacja składa się z monorepo, w którym mamy do dyspozycji oddzielny back-end jak i front-end.

## Link: https://fastdo.vertyll.usermd.net/

## Stos technologiczny

### Front-end:
- Angular
- RxJS
- Tailwind CSS

### Back-end:
- NestJS
- Fastify
- TypeORM
- PostgreSQL
- Jest

### Uwierzytelnianie:
- uwierzytelnianie za pomocą JWT

### Inne:
- Turborepo w celu automatyzacji skryptów i zarządzania strukturą monorepo
- ESLint i Dprint do statycznej analizy kodu i utrzymania jednolitej jakości kodu

## Zdjęcia poglądowe

![Widok projektu](https://raw.githubusercontent.com/vertyll/fastdo/refs/heads/main/screenshots/1.png)
![Widok projektu](https://raw.githubusercontent.com/vertyll/fastdo/refs/heads/main/screenshots/2.png)
![Widok projektu](https://raw.githubusercontent.com/vertyll/fastdo/refs/heads/main/screenshots/3.png)
![Widok projektu](https://raw.githubusercontent.com/vertyll/fastdo/refs/heads/main/screenshots/4.png)
![Widok projektu](https://raw.githubusercontent.com/vertyll/fastdo/refs/heads/main/screenshots/5.png)

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
- Sprawdzamy czy mamy uruchomioną bazę danych lub uruchamiamy ją za pomocą Dockera, projekt krzysta z bazy danych `PostgreSQL`
- wykonujemy:

```bash
pnpm run dev
# or
npm run dev
```

Domyśnie, jeżeli użyjemy jednej z powyższej komendy:
- aplikacja back-endowa powinna być dostępna na adresie [http://localhost:3000](http://localhost:3000)
- aplikacja front-endowa powinna być dostępna na adresie [http://localhost:4200](http://localhost:4200)

Adresy wklejamy do przeglądarki internetowej.
