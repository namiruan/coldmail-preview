# 콜드메일 라이브 테스트 (coldmail-preview)

HTML 이메일 코드를 **메일 클라이언트에서 실제로 보이는 모습**으로 미리보는 도구입니다.
Gmail 스타일 셸 안에 HTML을 렌더링해서, 보내기 전에 레이아웃이 깨지는지 확인합니다.

- 데스크톱 / 모바일 뷰 전환
- 라이트 모드 + **Gmail 자동 다크모드 시뮬레이션** (`color-scheme` 선언이 없는 메일을 Gmail이 반전시키는 동작을 근사)
- `<title>` 태그에서 메일 제목 자동 추출

## 화면

| 경로 | 설명 |
| --- | --- |
| `/` | 템플릿 미리보기 (`EmailPreview`) |
| `/editor` | HTML/CSS 라이브 에디터 (`LiveEditor`, CodeMirror) |

## 실행

```bash
npm install
npm run dev      # http://localhost:5173
```

| 스크립트 | 하는 일 |
| --- | --- |
| `npm run dev` | 개발 서버 |
| `npm run build` | `dist/` 로 프로덕션 빌드 |
| `npm run preview` | 빌드 결과물을 로컬에서 서빙 |
| `npm run typecheck` | `tsc --noEmit` 타입 검사 |

## 구조

```
src/
  main.tsx                     진입점
  app/
    App.tsx                    RouterProvider + Toaster
    routes.tsx                 라우트 정의
    components/
      EmailPreview.tsx         메일 클라이언트 셸 + 렌더링
      LiveEditor.tsx           HTML/CSS 에디터
      ui/                      shadcn/ui 컴포넌트
    data/
      defaultTemplates.ts      기본 템플릿 (여기에 시안을 추가)
  styles/                      Tailwind v4 + 테마 토큰
```

템플릿을 추가하거나 고치려면 `src/app/data/defaultTemplates.ts` 를 편집하고 커밋합니다.

## 이 저장소와 Figma Make

이 코드는 Figma Make에서 한 번 내보낸 뒤로 **git이 유일한 원본(source of truth)** 입니다.

> ⚠️ Figma Make에서 이 프로젝트로 다시 "Push to GitHub" 하지 마세요.
> Make → GitHub 푸시는 단방향이라, git에서 작업한 내용이 **전부 덮어씌워집니다.**
> 앞으로 수정은 이 저장소에서만 합니다.

원본 Figma 파일: [콜드메일 라이브 테스트](https://www.figma.com/design/wzw3fjxEcgbUJTLi38soYr/%EC%BD%9C%EB%93%9C%EB%A9%94%EC%9D%BC-%EB%9D%BC%EC%9D%B4%EB%B8%8C-%ED%85%8C%EC%8A%A4%ED%8A%B8) (참고용 — 코드는 동기화되지 않습니다)

## 기술 스택

React 18 · Vite 6 · TypeScript · Tailwind CSS v4 · shadcn/ui (Radix) · react-router · CodeMirror
