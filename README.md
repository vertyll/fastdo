## Project Assumptions

A web application for managing projects and tasks for specific projects. The application consists of a monorepo 
containing separate back-end and front-end applications.

## Link: https://fastdo.vertyll.dev
## Swagger: https://api.fastdo.vertyll.dev/api#/

## Technology Stack

### Back-end:

- NestJS (Fastify adapter).
- TypeORM.
- PostgreSQL.
- Jest.
- OpenAPI (Swagger).

### Front-end:

- Angular.
- RxJS.
- NGXS.
- Tailwind CSS.

### Authentication:

- JWT authentication – the application uses JWT tokens for user authentication and includes a token refresh mechanism
(http only secure cookie).
- The application allows logging in on multiple devices simultaneously.

### Back-end Core:

- The application includes an exception handling mechanism.
- The application includes a logging mechanism.
- The application is fully translated into English and Polish.
- The application includes an email sending mechanism, separate for dev and prod (strategy pattern).
- The application includes a file handling mechanism (strategy pattern).
- The application includes a recurring task handling mechanism (cron).
- The application uses WebSockets for real-time notifications.
- The application has separate environments for dev and prod.
- The application has a separate configuration file.
- The application includes RBAC (Role Based Access Control).
- The application includes CLS (Continuation Local Storage).
- API documentation is written using OpenAPI (Swagger).
- And many other features that can be found in the application code.

### Front-end Core:

- The application includes a state management system using NGXS.
- The application is fully translated into English and Polish.
- The application includes custom Tailwind CSS theme with dark/light mode support.
- Components are fully reusable, written according to DRY principles and using Atomic Design methodology.
- The application is written according to new Angular standards – including the use of signals.
- And many other features that can be found in the application code.

### Other:

- Turborepo for script automation and monorepo structure management.
- ESLint and Prettier for static code analysis and maintaining consistent code quality.
- Docker for development environment.

> [!NOTE]
>
> During application development, SOLID principles, DRY, composition over inheritance, dependency injection, 
> design patterns, architectural patterns, testing, and other good programming practices were applied.

## Screenshots

![Project View](https://raw.githubusercontent.com/vertyll/fastdo/refs/heads/main/screenshots/screenshot1.png)
![Project View](https://raw.githubusercontent.com/vertyll/fastdo/refs/heads/main/screenshots/screenshot2.png)
![Project View](https://raw.githubusercontent.com/vertyll/fastdo/refs/heads/main/screenshots/screenshot3.png)
![Project View](https://raw.githubusercontent.com/vertyll/fastdo/refs/heads/main/screenshots/screenshot4.png)
![Project View](https://raw.githubusercontent.com/vertyll/fastdo/refs/heads/main/screenshots/screenshot5.png)

## Installation Instructions

1. Download the project to your local environment.
2. Run:
    ```bash
    pnpm install
    # or
    npm install
    ```

> [!IMPORTANT]
>
> At this point, all dependencies needed to run the project will be installed and `.env` files will be created in the 
> back-end structure.
>
> In the created `.env` files, define your own API keys and configuration data.
>
> In the front-end structure, define your API address in the `environment.ts` file.

### If you want to run the project locally:

> [!IMPORTANT]
>
> Check if you have a database running, the project uses `PostgreSQL` database.

Then run:
```bash
pnpm run dev
# or
npm run dev
```

### If you want to run the infrastructure in Docker containers:

> [!IMPORTANT]
>
> Copy the `.env.docker.dev.example` file to `.env` in the main project directory.

Then run:
```bash
docker-compose -f docker-compose.dev.yml --env-file .env up -d
```

> [!NOTE]
>
> By default:
> - The back-end application should be available at [http://localhost:3000](http://localhost:3000).
> - The front-end application should be available at [http://localhost:4200](http://localhost:4200).

Paste the addresses into your web browser.
