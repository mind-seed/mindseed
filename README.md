# Mindseed

Mindseed 프로젝트의 Monorepo 입니다.

## 개발 문서

- [코드 컨벤션](./docs/code-convention.md)
- [Git 컨벤션](./docs/git-conventions.md)
- [초기 기능 구현 워크플로우](./docs/workflow.md)

## Stack

- Package manager: pnpm
- Monorepo 구현: [pnpm workspace](https://pnpm.io/workspaces) (프로젝트의 복잡성이 커질 경우, [Turborepo](https://turbo.build/repo) 등의 task runner 도입도 생각중입니다.)
- Frontend / Backend 공통: [TypeScript](https://www.typescriptlang.org/) ~5.9
- Frontend: [React](https://react.dev/) 19 + [Vite](https://vite.dev/) 7
- Backend: [NestJS](https://nestjs.com/) 11

## Apps / Packages

- `apps/frontend-user`: 일반 사용자용 web application
- `apps/backend`: backend server
- `packages/api-types`: frontend / backend 간의 shared API types

## Development

각 애플리케이션/패키지별 개발은 해당 디렉토리의 README 파일을 참조해주세요.

### Initialization

``` shell
# package installation
# also sets up git hooks
$ pnpm install
```

### Code formatting

Git hook에 따라 unformatted 파일이 존재할 경우 커밋이 진행되지 않습니다.

``` shell
# check only
$ pnpm --workspace-root format:check

# actually writes formatted files
$ pnpm --workspace-root format:write
```
