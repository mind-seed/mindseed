# TypeScript Code Convention

### 1. 명명 규칙 (Naming Conventions)

---

| 대상 | 규칙 | 예시 |
| --- | --- | --- |
| **Class, Interface, Type** | `PascalCase` | `UserService`, `UserPayload` |
| **Variable, Function, Instance** | `camelCase` | `isLoggedIn`, `getUserData()` |
| **Constant (Read-only)** | `UPPER_SNAKE_CASE` | `MAX_LIMIT`, `API_ENDPOINT` |
| **Enum** | `PascalCase` | `enum UserRole { Admin, Guest }` |
| **File Name** | `kebab-case` | `auth-middleware.ts` |
- **Boolean**: 변수명 앞에 `is`, `has`, `can`, `should` 등의 접두사를 사용합니다.


### 2. 타입 시스템 (Type System)

---

**2.1 명시적 타입 선언**

- 타입 추론이 명확한 경우(단순 할당 등) 생략 가능하지만, 함수의 반환 타입은 항상 명시한다.
- `any` 사용을 금지하고 불가피한 경우 `unknown`을 사용한다.

**2.2 Interface vs Type**

- 객체의 구조 정의에는 **`interface`**를 사용한다.
- 객체 정의를 제외한 모든 타입 관련 선언에는 `type`을 사용한다.
