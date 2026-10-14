# 콜드메일 라이브 테스트 (coldmail-preview)

**▶ https://namiruan.github.io/coldmail-preview/**

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

## 배포

`main`에 푸시하면 `.github/workflows/deploy.yml`이 typecheck → build → GitHub Pages 배포를 자동으로 수행합니다. 따로 할 일은 없습니다.

Pages는 `https://<user>.github.io/<repo>/` 하위 경로로 서빙되므로 빌드 시 `VITE_BASE`를 넘깁니다. 라우터도 `import.meta.env.BASE_URL`에서 basename을 읽어 맞춥니다. 로컬 `npm run dev`는 루트(`/`) 기준이라 신경 쓸 필요가 없습니다.

`createBrowserRouter`를 쓰기 때문에 `/editor`로 직접 들어가거나 새로고침하면 Pages가 404를 반환합니다. 워크플로가 `index.html`을 `404.html`로 복사해 두어, 그 안의 클라이언트 라우터가 경로를 처리합니다.

> ⚠️ 이 저장소는 **public**입니다. `src/app/data/defaultTemplates.ts`의 템플릿 내용(가격 포함)은 빌드된 JS 번들에 그대로 들어가며, 배포된 사이트에서 누구나 읽을 수 있습니다.

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

템플릿을 추가하거나 고치려면 `templates/` 의 `.html` 파일을 편집하고 커밋합니다.
목록 순서·묶음·제목·UTM은 모두 `templates/manifest.json` 이 결정합니다.

## 제목 A/B 테스트와 UTM

**UTM의 원본은 `manifest.json` 입니다.** 코드 보기로 내보낼 때 HTML 안의
`utm_*` 를 manifest 값으로 맞춥니다. 이미 `utm_` 을 하나라도 달고 있는 링크만
대상이라, 로고·푸터처럼 추적하지 않는 링크는 건드리지 않습니다.

본문이 같고 **제목만 다른 A/B** 는 파일을 복제하지 말고 `subjects` 에 변형을
추가합니다. 2개 이상이면 미리보기 상단에 `제목 A B` 전환이 나타나고, 고른
변형에 맞춰 `<title>` 과 `utm_term` 이 반영된 HTML이 나옵니다.

```json
{
  "id": "01",
  "group": "안면인식서비스", "label": "단일홍보 A안",
  "file": "01-face-promo-a.html",
  "utm": { "source": "kbz_mail", "medium": "email",
           "campaign": "face_2026", "content": "mail-a" },
  "subjects": [
    { "key": "a", "text": "첫 번째 제목" },
    { "key": "b", "text": "두 번째 제목" }
  ]
}
```

두 축은 독립적입니다 — **본문 변형은 `utm_content`**, **제목 변형은 `utm_term`**
(`subj-{key}`, `term` 으로 직접 지정 가능). 그래서 어느 쪽이 성과를 냈는지 따로
볼 수 있습니다.

`utm` 이 없는 템플릿은 HTML을 그대로 내보냅니다. `subjects` 가 없으면 제목을
HTML의 `<title>` 에서 읽습니다.

## 이 저장소와 Figma Make

이 코드는 Figma Make에서 한 번 내보낸 뒤로 **git이 유일한 원본(source of truth)** 입니다.

> ⚠️ Figma Make에서 이 프로젝트로 다시 "Push to GitHub" 하지 마세요.
> Make → GitHub 푸시는 단방향이라, git에서 작업한 내용이 **전부 덮어씌워집니다.**
> 앞으로 수정은 이 저장소에서만 합니다.

원본 Figma 파일: [콜드메일 라이브 테스트](https://www.figma.com/design/wzw3fjxEcgbUJTLi38soYr/%EC%BD%9C%EB%93%9C%EB%A9%94%EC%9D%BC-%EB%9D%BC%EC%9D%B4%EB%B8%8C-%ED%85%8C%EC%8A%A4%ED%8A%B8) (참고용 — 코드는 동기화되지 않습니다)

## 기술 스택

React 18 · Vite 6 · TypeScript · Tailwind CSS v4 · shadcn/ui (Radix) · react-router · CodeMirror
