# EO Portal Web

EO 배포를 생성하는 관리자 화면과, 메일 또는 목록에서 배포를 확인하고 다운로드하는 기업 사용자 화면입니다.

## 실행

```bash
npm install
npm run dev
```

브라우저는 `.env`에 지정한 HTTPS API 서버를 직접 호출합니다. `.env.example`을 복사하고 실제 API 주소를 입력합니다.

```bash
cp .env.example .env
```

```text
VITE_API_BASE_URL=https://api.your-domain.com
```

`VITE_API_BASE_URL`은 필수이며 마지막 `/` 없이 입력하는 것을 권장합니다. API 서버는 프론트 Origin을 정확히 허용하고 `Access-Control-Allow-Credentials: true`를 반환해야 합니다. Axios는 모든 요청에 `withCredentials: true`를 적용합니다.

운영 환경도 빌드 시 지정한 `VITE_API_BASE_URL`을 직접 호출합니다. API 서버에서 실제 프론트 Origin에 대한 credential CORS와 쿠키 설정을 맞춰야 합니다.

> `VITE_`로 시작하는 값은 빌드 결과에 포함되어 브라우저에서 확인할 수 있습니다. API 주소처럼 공개되어도 되는 설정만 등록하고, 비밀번호·세션 시크릿·API 키는 프론트 환경변수에 넣지 마세요.

## 사용자 흐름

- `/login`: 쿠키 세션 로그인
- `/company`: 기업 사용자가 받은 EO 배포 목록 확인
- `/company/requests/:publicId`: 메일 링크 진입, EO 내용 확인, 개별 EO 의견 작성·재활성화, S3 다운로드
- `/admin`: 관리자/담당자가 EO 배포 생성 및 보낸 목록 확인
- `/admin/requests`: 관리자 전용 보낸 EO 전체 목록. 관리자 API로 조회하고 관리자 상세로 연결
- `/admin/vehicles`: 입력 차종별 수신 기업 등록·변경·삭제 및 NAS 검색용 별칭 관리
- `/admin/requests/:id`: 패키지 상태, 개별 EO 의견·처리 확정, NAS 검색 결과, 방문·다운로드 이력 확인

관리자가 기존 `/company` 주소로 진입하면 보낸 EO 목록으로 이동합니다. 메일·북마크의 `/company/requests/:publicId` 주소는 요청 ID를 조회한 뒤 관리자 상세로 이동하며, 기업 계정은 기존 기업 화면을 사용합니다.

## 연동 API와 HTTP 메서드

- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/me`
- `GET /api/companies`
- `GET/POST /api/admin/vehicle-companies`
- `PATCH/DELETE /api/admin/vehicle-companies/:id` (`expectedVersion` 필수, DELETE도 JSON 본문 전송)
- `GET/POST /api/admin/vehicle-aliases`
- `DELETE /api/admin/vehicle-aliases/:id` (본문 없음)
- `POST /api/requests`
- `GET /api/admin/requests`
- `GET /api/admin/requests/:id`
- `GET /api/company/requests`
- `GET /api/company/requests/:publicId`
- `POST /api/company/requests/:publicId/download`
- `GET /api/requests/:publicId/items/:itemId/discussion`
- `POST /api/requests/:publicId/items/:itemId/discussion/comments`
- `POST /api/requests/:publicId/items/:itemId/discussion/resolve`
- `POST /api/requests/:publicId/items/:itemId/discussion/reopen`

API 호출은 Axios 기반의 `src/api`, React Query 선언은 `src/queries`, 실제 사용자 흐름과 상태 전환 로직은 `src/hooks`, 화면은 `src/pages`에 분리되어 있습니다. 공통 요청 설정과 응답·오류 처리는 `src/api/client.ts`의 Axios 인터셉터가 담당합니다.

## 차종 설정과 다중 차종 EO 확인 순서

1. 관리자의 **차종 설정 → 차종별 수신 기업**에서 EO에 사용할 입력 차종명과 수신 기업을 등록합니다. 초기 설정은 비어 있으며 NAS 폴더나 별칭으로 자동 생성하지 않습니다. 비활성 기업 설정도 목록에 남지만 배포할 수 없습니다.
2. 입력명과 실제 NAS 차종명이 다를 때만 **NAS 검색용 별칭**을 등록합니다. 이 설정의 기업 코드는 파일 검색 위치입니다. 별칭 대상 폴더의 수신 기업 설정을 입력 별칭이 상속하지 않습니다.
3. 배포 폼에서 EO 한 건에 차종을 하나 이상 추가합니다. 요청은 `vehicles: string[]`만 보내며 정규화 후 중복 차종 및 전체 EO·차종 조합 100개 초과를 막습니다. 차종 하나만 입력할 때도 배열입니다.
4. 서버는 각 차종에 설정된 기업에만 보내며 차종 폴더를 정상 검색했는데 EO가 없을 때만 공통 루트에서 원본을 찾습니다. 차종 폴더 자체가 없거나 검색이 실패하면 오류입니다. 다른 기업에 원본이 있어도 수신 기업을 추가하지 않습니다.
5. 같은 기업에 두 차종을 보내면 생성 결과에 **배포 2건 / 기업 1개**와 차종별 링크·메일 결과·입력 위치(`itemRefs`)가 표시됩니다. 기업 ID나 EO 번호로 합치지 않습니다. ZIP 준비 상태는 상세에서 별도로 확인합니다.
6. 422는 EO 항목·차종 위치별 원인을 표시합니다. 409는 검색 중 설정 변경, 429는 다른 배포 검색 진행 중입니다. 오류 시 입력을 보존하며 자동 재전송하지 않습니다. 201 뒤 메일 실패·생략으로 동일 배포를 다시 만들지 않습니다.
7. 수신 기업 설정의 변경·삭제는 사용자가 조회한 `expectedVersion`으로 요청합니다. 409 시 최신 목록을 읽고 수정 항목을 다시 선택하게 하며 버전만 바꿔 자동 재시도하지 않습니다.
8. 기업별·차종별 `public_id + item_id`로 의견을 독립 관리합니다. 해결 확정은 관리자만, 재활성화는 해당 기업도 가능합니다. 기존 배포·다운로드·날짜·의견 이력은 유지합니다.
9. 기업 상세의 상태 새로고침은 목록 API를 사용해 방문 기록을 추가하지 않습니다. 최근 100건 밖의 오래된 배포는 별도의 상세 다시 불러오기로 갱신하며 이 동작은 방문으로 기록됩니다.

엑셀 동기화·승인 API와 UI는 제거했습니다. 예전 `/admin/carryover` 및 하위 북마크는 차종 설정으로 안내합니다. 과거 `carryover_sync_id`는 상세에 읽기 전용 기록 ID로만 표시하고 제거된 상세 API를 호출하지 않습니다.

서버의 `docs/API_USAGE.md`, `docs/CARRYOVER.md`, `docs/VEHICLE_ROUTING.md`, `docs/VEHICLE_COMPANIES.md`, `docs/EO_DISCUSSIONS.md`, NAS 테스트·배포 문서와 README를 확인한 기준입니다. 실제 NAS 파일 수정, 기업/계정 등록과 서버 배포는 해당 운영 절차를 따릅니다.

`npm test`는 Node 22.18 이상에서 다중 차종 입력·100쌍 제한·중복 정규화·오류 처리를 확인합니다. `npm run build`는 타입 검사와 프로덕션 빌드를 수행합니다.
