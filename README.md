# EO Portal Web

EO 배포를 생성하는 관리자 화면과, 메일 또는 목록에서 배포를 확인하고 다운로드하는 기업 사용자 화면입니다.

## 실행

```bash
npm install
npm run dev
```

브라우저는 `.env`에 지정한 HTTPS API 서버를 직접 호출합니다. 다른 API 서버를 사용할 때는 다음 값을 변경합니다.

```text
VITE_API_BASE_URL=https://api.example.com
```

API 서버는 프론트 Origin을 정확히 허용하고 `Access-Control-Allow-Credentials: true`를 반환해야 합니다. Axios는 모든 요청에 `withCredentials: true`를 적용합니다.

운영 환경도 빌드 시 지정한 `VITE_API_BASE_URL`을 직접 호출합니다. API 서버에서 실제 프론트 Origin에 대한 credential CORS와 쿠키 설정을 맞춰야 합니다.

## 사용자 흐름

- `/login`: 쿠키 세션 로그인
- `/company`: 기업 사용자가 받은 EO 배포 목록 확인
- `/company/requests/:publicId`: 메일 링크 진입, EO 내용 확인, S3 다운로드
- `/admin`: 관리자/담당자가 EO 배포 생성 및 보낸 목록 확인
- `/admin/requests/:id`: 패키지 상태, NAS 검색 결과, 방문·다운로드 이력 확인

## 연동 API와 HTTP 메서드

- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/me`
- `GET /api/companies`
- `POST /api/requests`
- `GET /api/admin/requests`
- `GET /api/admin/requests/:id`
- `GET /api/company/requests`
- `GET /api/company/requests/:publicId`
- `POST /api/company/requests/:publicId/download`

API 호출은 Axios 기반의 `src/api`, React Query 선언은 `src/queries`, 실제 사용자 흐름과 상태 전환 로직은 `src/hooks`, 화면은 `src/pages`에 분리되어 있습니다. 공통 요청 설정과 응답·오류 처리는 `src/api/client.ts`의 Axios 인터셉터가 담당합니다.
