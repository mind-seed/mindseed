# Mindseed

Mindseed 프로젝트의 Monorepo 입니다.

## Stack

- Monorepo 구현: [pnpm workspace](https://pnpm.io/workspaces) (프로젝트의 복잡성이 커질 경우, [Turborepo](https://turbo.build/repo) 등의 task runner 도입도 생각중입니다.)
- Frontend / Backend 공통: [TypeScript](https://www.typescriptlang.org/) ~5.9
- Frontend: [React](https://react.dev/) 19 + [Vite](https://vite.dev/) 7
- Backend: [NestJS](https://nestjs.com/) 11

## Apps / Packages

- `apps/frontend-user`: 일반 사용자용 web application
- `apps/backend`: backend server
- `packages/api-types`: frontend / backend 간의 shared API types
