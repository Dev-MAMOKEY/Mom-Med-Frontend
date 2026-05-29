# 엄마약 (Mom's Med) — Frontend

부모 복약 안전 관리 서비스의 Expo (React Native + Web) 클라이언트.
**자녀가 부모님 약장·기저질환·알레르기를 등록**하고 DUR/NB 기반 BLOCK 시연이 가능합니다.

> 스택: Expo SDK 55 · React Native 0.81 · React 19 · TypeScript · NativeWind · Zustand · TanStack Query

---

## 빠른 시작

### 사전 요구사항
- Node.js 20+
- pnpm (또는 npx로 자동 설치 가능)
- **백엔드가 떠 있어야 함** — backend 레포의 `docker compose up -d --build` 먼저 실행

### 1. 의존성 설치
```bash
pnpm install
```

### 2. 환경 변수 작성
```bash
cp .env.example .env
```
대부분의 값은 기본값 그대로 OK. 백엔드 위치만 확인:
```env
EXPO_PUBLIC_API_BASE_URL=http://127.0.0.1:8080
```
> Windows에서 `localhost`가 IPv6(`::1`)로 해석되어 도커 백엔드에 안 닿는 이슈가 있어 `127.0.0.1`을 권장합니다.

### 3. 웹에서 띄우기 (시연용)
```bash
pnpm web
# 또는
npx expo start --web --port 19006
```
브라우저: **http://localhost:19006**

### 4. 모바일에서 띄우기 (선택)
```bash
pnpm start
```
QR 코드 스캔으로 Expo Go 앱에서 실행.

---

## 시연 시나리오 — BLOCK 모달

1. 로그인 → **자녀로 들어가기** → **어머니** 카드 탭
2. **약장** 탭 → **메트포르민** 카드 1개 보임 (백엔드 시드)
3. **+ 약 추가** → 카메라 권한 거부해도 OK → **직접 입력**
4. 검색바에 **"이오헥솔"** → 검색 결과 탭
5. **이 약 추가하기** 클릭
6. 🚫 **빨간 BLOCK 모달** 등장 — 식약처 고시 20110188 (메트포르민 + 이오헥솔 병용금기)

> BLOCK이 안 뜨면? → 백엔드의 DUR ETL이 아직 안 됐을 가능성. backend README의 DUR 적재 섹션 참조.

---

## 테스트

```bash
pnpm test            # Jest 단위·통합 테스트 1회 실행
pnpm test:watch      # 파일 변경 감시
```

현재 103 tests / 24 suites 모두 통과.

---

## 주요 폴더 구조

```
frontend/
├── app/                      # 화면 (expo-router file-based routing)
│   ├── (auth)/               # 로그인·역할선택
│   ├── (caregiver)/          # 자녀 시점 — 부모님 목록·약장·알림·질병
│   ├── (parent)/             # 부모 시점 (placeholder)
│   └── (modals)/             # 약 추가·약 상세·일정 등록 등 모달
├── components/
│   ├── primitives/           # Button·Input·BottomSheet·Modal 등
│   ├── domain/               # 도메인 UI (PillImage·ScheduleSheet 등)
│   └── (기타 공용 컴포넌트)
├── api/                      # 백엔드 호출 + BE↔FE 어댑터
├── hooks/                    # TanStack Query hooks
├── stores/                   # Zustand 전역 상태
├── mocks/                    # USE_MOCK=true일 때의 가짜 응답
├── utils/                    # 순수 유틸 (날짜·시간·강도 한국어 매핑 등)
└── __tests__/                # Jest 테스트
```

---

## Mock 모드 — 백엔드 없이 UI만

`.env`에 `EXPO_PUBLIC_USE_MOCK=true`로 두면 모든 API 호출이 `mocks/` 폴더의 가짜 응답으로 동작. 백엔드 미설치 환경에서 UI만 보고 싶을 때 유용.

---

## 자주 쓰는 명령

```bash
pnpm install                       # 의존성 설치
pnpm web                           # 웹 dev server (포트 19006)
pnpm start                         # Expo dev server (모바일 QR)
pnpm test                          # Jest 1회 실행
pnpm test:watch                    # Jest 감시 모드
```

---

## 문제 해결

| 증상 | 해결 |
|---|---|
| `BLOCK` 모달 안 뜸 | 백엔드 DUR 데이터 미적재. backend README의 DUR 적재 단계 진행 |
| API 호출 타임아웃 (Windows) | `.env`의 `EXPO_PUBLIC_API_BASE_URL`을 `127.0.0.1`로 변경 후 dev server 재시작 |
| 포트 19006 충돌 | `expo start --web --port 19007` 같은 다른 포트 사용 |
| `.env` 변경 반영 안 됨 | Expo dev server 재시작 필요 (Ctrl+C 후 다시 `pnpm web`) |

---

## 백엔드 연동 가이드

- 모든 API 호출은 `api/client.ts`의 `apiCall()` 함수를 거침
- BE↔FE 형태 변환(camelCase ↔ snake_case 등)은 `api/adapters.ts`
- BE 응답의 `RsData<T>` 구조는 자동 unwrap (`{ success, code, data }` → `data`)
- 409 BLOCK 응답은 `SafetyBlockError`로 변환되어 throw

자세한 내용은 [api/client.ts](./api/client.ts) 주석 참조.
