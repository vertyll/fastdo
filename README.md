## Project Overview 

A web application for managing projects and tasks for specific projects. The application consists of a monorepo containing separate backend and frontend applications.

## Link: https://fastdo.vertyll.usermd.net/
## Swagger: https://api.fastdo.vertyll.usermd.net/api#/ 

## Technology Stack

### Backend:
- NestJS
- Fastify
- TypeORM
- PostgreSQL
- Jest
- OpenAPI (Swagger)

### Frontend:
- Angular
- RxJS
- NGXS
- Tailwind CSS

### Authentication:
- JWT authentication - the application uses JWT tokens for user authentication and includes a token refresh mechanism
- the application allows logging in on multiple devices simultaneously

### Backend Core:
- the application includes an exception handling mechanism
- the application includes a logging mechanism
- the application is fully translated into English and Polish
- the application includes an email sending mechanism, separate for dev and prod (strategy pattern)
- the application includes a file handling mechanism (strategy pattern)
- the application includes a recurring task handling mechanism (cron)
- the application has separate environments for dev and prod
- the application has a separate configuration file
- the application includes RBAC (Role Based Access Control)
- the application includes CLS (Continuation Local Storage)
- API documentation is written using OpenAPI (Swagger)
- and many other features that can be found in the application code

### Frontend Core:
- the application includes a state management system using NGXS
- the application is fully translated into English and Polish
- the application includes custom Tailwind CSS theme with dark/light mode support
- components are fully reusable, written according to DRY principles and using Atomic Design methodology
- the application is written according to new Angular standards - including the use of signals
- and many other features that can be found in the application code

### Other:
- Turborepo for script automation and monorepo structure management
- ESLint and Dprint for static code analysis and maintaining consistent code quality
- Docker for development environment

**During application development, SOLID principles, DRY, composition over inheritance, dependency injection, design patterns, architectural patterns, testing, and other good programming practices were applied.**

## Screenshots

![Project View](https://raw.githubusercontent.com/vertyll/fastdo/refs/heads/main/screenshots/Screenshot%202025-02-09%20at%2012-49-54%20Rejestracja.png)
![Project View](https://raw.githubusercontent.com/vertyll/fastdo/refs/heads/main/screenshots/Screenshot%202025-02-09%20at%2012-52-27%20Projekty.png)
![Project View](https://raw.githubusercontent.com/vertyll/fastdo/refs/heads/main/screenshots/Screenshot%202025-02-09%20at%2012-52-38%20Zadania.png)
![Project View](https://raw.githubusercontent.com/vertyll/fastdo/refs/heads/main/screenshots/Screenshot%202025-02-09%20at%2012-54-46%20Profil%20u%C5%BCytkownika.png)
![Project View](https://raw.githubusercontent.com/vertyll/fastdo/refs/heads/main/screenshots/Screenshot%202025-02-09%20at%2012-56-38%20Zadania.png)
![Project View](https://raw.githubusercontent.com/vertyll/fastdo/refs/heads/main/screenshots/Screenshot%202025-02-09%20at%2012-57-08%20Zadania.png)

## Installation Instructions

- Download the project to your local environment
- run:

```bash
pnpm install
# or
npm install
```

> **Note:** at this point, all dependencies needed to run the project will be installed and .env files will be created in the backend structure
- In the created .env files, define your own API keys and configuration data.
- In the frontend structure, define your API address in the `environment.ts` file

`If you want to run the project locally:`

- Check if you have a database running, the project uses `PostgreSQL` database
- run:

```bash
pnpm run dev
# or
npm run dev
```

`If you want to run the project in Docker containers:`
- copy the `.env.docker.dev.example` file to `.env` in the main project directory
- run:

```bash
docker-compose -f docker-compose.dev.yml --env-file .env up -d
```

By default, if you use one of the above paths:
- the backend application should be available at [http://localhost:3000](http://localhost:3000)
- the frontend application should be available at [http://localhost:4200](http://localhost:4200)

Paste the addresses into your web browser.
