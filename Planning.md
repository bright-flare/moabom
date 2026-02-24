# Planning.md — MOABOM 실행 계획

## 0) 프로젝트 개요
**프로젝트명:** moabom  
**목표:** 텔레그램 구직 요약을 웹 대시보드에서 탐색·관리할 수 있게 만들기  
**1차 배포:** Vercel  
**우선 사용자:** 밝은불꽃(본인 운영 + 공유 목적)

---

## 1) 제품 요구사항 (MVP)

### 필수 기능
1. 구직 공고 목록 보기
   - 플랫폼(사람인/잡코리아/고용24)
   - 제목
   - 링크
   - 수집 시각
2. 필터
   - 플랫폼별
   - 날짜(오늘/최근 3일)
   - 상태(전체/북마크/제외)
3. 상태 변경
   - 북마크 토글
   - 제외 토글
   - 메모 작성(짧은 텍스트)
4. 요약 카드
   - 총 공고 수
   - 플랫폼별 개수
   - 북마크 수

### 있으면 좋은 기능 (MVP+)
- 중복 공고 감지(제목+도메인+핵심 파라미터)
- 링크 유효성 체크 배지
- "오늘 지원 후보" 태그

---

## 2) 정보 구조 / 데이터 모델

### 테이블: jobs
- id (string, pk)
- source (enum: saramin, jobkorea, work24)
- title (string)
- url (string)
- collectedAt (datetime)
- status (enum: normal, bookmarked, hidden)
- note (text, nullable)
- hash (string, dedupe key)
- createdAt / updatedAt

### dedupe 전략
- hash = normalize(title) + hostname(url) + path(url) + 주요 query(wantedAuthNo/rec_idx/GI_Read id)
- 동일 hash면 최신 것 1건 유지

---

## 3) 기술 설계

### 초기 스택
- Next.js + TypeScript + Tailwind
- 저장소: 로컬 JSON 파일(`data/jobs.json`)로 시작
- API Route:
  - GET /api/jobs
  - PATCH /api/jobs/:id (status, note)
  - POST /api/jobs/import (크롤러 결과 반영)

### 2차 전환(선택)
- Supabase PostgreSQL로 이전
- 인증(개인용/팀 공유용) 추가

---

## 4) 구현 단계

## Phase 1 — 부트스트랩
- [ ] Next.js 프로젝트 생성
- [ ] Tailwind 설정
- [ ] 기본 레이아웃(헤더/필터/목록)
- [ ] 샘플 데이터 로드

## Phase 2 — 핵심 기능
- [ ] 목록 + 정렬(최신순)
- [ ] 필터(플랫폼/날짜/상태)
- [ ] 북마크/제외 토글
- [ ] 메모 입력/수정

## Phase 3 — 데이터 연동
- [ ] 현재 job-digest 출력을 JSON으로 저장하는 export 스크립트
- [ ] import API 연결
- [ ] dedupe 로직 적용

## Phase 4 — 품질/배포
- [ ] empty/error/loading 상태 UI
- [ ] 모바일 UX 점검
- [ ] Vercel 환경변수 설정
- [ ] Vercel 프로덕션 배포

---

## 5) 일정 제안 (4일 플랜)

### Day 1
- 프로젝트 생성, 기본 UI, 샘플 목록

### Day 2
- 필터 + 상태 변경 + 메모

### Day 3
- job-digest 연동 + dedupe

### Day 4
- 다듬기 + Vercel 배포 + 실제 사용 점검

---

## 6) 리스크 & 대응

1. 크롤링 결과 변동(사이트 DOM 변경)
- 대응: 수집 로직/대시보드 로직 분리, 입력 포맷(JSON) 고정

2. 링크 깨짐/추적 파라미터 과다
- 대응: URL 정규화, 필수 파라미터만 유지

3. 중복 항목 과다
- 대응: hash dedupe + 플랫폼별 상세 ID 우선

4. Vercel에서 파일쓰기 제약
- 대응: 읽기 전용은 가능, 쓰기는 Supabase/외부 DB로 전환

---

## 7) 완료 정의 (Definition of Done)
- [ ] 웹에서 오늘 공고를 플랫폼별로 빠르게 확인 가능
- [ ] 북마크/제외/메모가 저장되고 새로고침 후 유지
- [ ] job-digest 데이터가 자동/수동으로 대시보드에 반영
- [ ] Vercel URL에서 실제 사용 가능

---

## 8) 즉시 다음 액션
1. Next.js 앱 생성 (`moabom` 내부)
2. 샘플 데이터 30개로 목록/필터 UI 완성
3. API Route 최소 2개(GET/PATCH) 구현
4. 첫 Vercel Preview 배포
