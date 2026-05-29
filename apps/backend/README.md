# Mindseed - backend

## Project setup

```shell
$ pnpm install
```

## Compile and run the project

`api-types` package에 수정사항이 발생했을 경우, 선행 빌드가 필요합니다.

``` shell
$ pnpm --filter=api-types build
```

```shell
# development
$ pnpm start

# watch mode
$ pnpm start:dev

# production mode
$ pnpm start:prod
```

## Run tests

```shell
# unit tests
$ pnpm test
```

