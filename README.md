# Tech Blog

Next.js 15 기반 개인 기술 블로그입니다.

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS v4
- **Database**: Prisma 6 + MySQL 8.0
- **Auth**: NextAuth.js v5 (GitHub OAuth)
- **Editor**: CodeMirror 6 (Markdown)
- **Rendering**: react-markdown + rehype-highlight + remark-gfm
- **Deploy**: Docker (standalone) + Nginx / Vercel

## Features

- Markdown 기반 블로그 글 작성/편집
- 카테고리 및 태그 분류
- GitHub OAuth 관리자 인증
- 이미지 업로드 및 프록시
- RSS Feed (`/feed.xml`)
- 반응형 디자인 + 다크모드
- TOC(목차) 자동 생성

## Getting Started

### Prerequisites

- Node.js 20+
- MySQL 8.0

### Installation

```bash
npm install
npx prisma generate
```

### Environment Variables

`.env.production.example`을 참고하여 `.env` 파일을 생성합니다.

```bash
cp .env.production.example .env
# .env 파일을 편집하여 실제 값 입력
```

### Development

```bash
npm run dev
```

[http://localhost:3000](http://localhost:3000)에서 확인할 수 있습니다.

## Deployment

### Docker

```bash
docker compose -f docker-compose.prod.yml up -d
```

### Vercel

`main` 브랜치에 push하면 자동 배포됩니다.

## Project Structure

```
src/
├── app/
│   ├── admin/          # 관리자 페이지 (글 작성/편집, 카테고리 관리)
│   ├── api/            # API Routes (posts, categories, upload, auth)
│   ├── categories/     # 카테고리별 글 목록
│   ├── posts/          # 블로그 글 상세
│   ├── layout.tsx      # Root layout
│   └── page.tsx        # 메인 페이지
├── components/         # 공통 컴포넌트
├── lib/                # Prisma client, auth 설정
└── types/              # TypeScript 타입 정의
```
