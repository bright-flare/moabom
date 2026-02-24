# MOABOM

구직 공고(사람인/잡코리아/고용24)를 대시보드에서 필터/북마크/메모로 관리하는 Next.js 앱.

## Local

```bash
npm install
npm run dev
```

## Runtime Data Strategy

- **Vercel/Production:** Supabase 사용 (영구 저장)
- **Local fallback:** `data/jobs.json` 파일 사용

앱은 다음 순서로 저장소를 선택한다:
1. `SUPABASE_URL` + `SUPABASE_*_KEY`가 있으면 Supabase
2. 없으면 `data/jobs.json`

## Supabase Setup

1. Supabase 프로젝트 생성
2. SQL Editor에서 `supabase-schema.sql` 실행
3. Vercel 환경변수 설정
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`

## Import Pipeline

수집 스크립트에서 대시보드로 반영:

```bash
python3 /workspace/job-digest/export_to_dashboard.py
```

- Supabase env가 있으면 `jobs` 테이블에 upsert
- 없으면 `data/jobs.json` 갱신

## Build Check

```bash
npm run lint
npm run build
```

## Deploy

```bash
npx vercel login
npx vercel --prod --yes
```
