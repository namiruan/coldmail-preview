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
| `npm run validate` | `templates/README.md` 검증 |

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
목록 순서·묶음·제목·UTM은 모두 `templates/README.md` 이 결정합니다.

## 분류와 그룹

목록은 **분류 → 그룹 → 시안** 세 층으로 보입니다.

| 분류 | 성격 | 제목 A/B | 그룹 |
| --- | --- | --- | --- |
| `콜드메일` | 먼저 보내는 영업 메일 | 대상 | 안면인식서비스 · 퇴직공제 |
| `발신템플릿` | 요청에 응답해 보내는 메일 | 하지 않음 | 홈페이지용 · 인트라넷용 |

분류와 그룹 모두 **이름이 같으면 표에서 떨어져 있어도 한 묶음**이 됩니다.
묶음의 자리는 그 이름이 처음 나온 줄, 묶음 안 순서는 표의 순서를 따릅니다.
그래서 표는 ID 순서를 그대로 두면 됩니다.

## 사용 상태

시안마다 상태를 하나 갖습니다. **어느 상태든 UTM·제목 설정은 그대로 남아서**,
되돌리면 바로 다시 쓸 수 있습니다. 쓰지 않게 된 시안을 지우지 마세요.

| 상태 | 뜻 | 목록 표시 | 목록에서 |
| --- | --- | --- | --- |
| `사용중` | 지금 쓰는 시안 | 채운 초록 원 | 그대로 보임 |
| `미사용` | 시안은 있으나 아직 쓰기 전 | 빈 파란 원 | 그대로 보임 |
| `운영종료` | 집행을 마친 시안 | 회색 네모 | 숨겨짐 — `운영종료 N` 을 눌러야 보임 |

상태는 이름 왼쪽 고정 위치의 도형으로 표시합니다. 색만으로 가르면 색각 이상인
사람이 구분하지 못하므로 **도형도 함께** 다릅니다. 뜻은 목록 맨 아래 범례에
있고, 행에 마우스를 올리면 상태 이름이 뜹니다.

`미사용`·`운영종료` 시안을 열면 본문 위에 안내가 뜹니다. 모르고 발송하는 걸 막습니다.
`기간` 칸을 채우면 그 안내에 집행 기간이 함께 나옵니다 —
`운영종료 시안입니다 (집행 2026-04-07 ~ 2026-06-18).`

> 상태는 문서에 있으니 git에 남고 팀 전체가 같은 값을 봅니다. 반면 `운영종료 N`
> 토글은 **보기 설정이라 브라우저에만 저장**되어 사람마다 따로입니다.

> `templates/README.md` 는 GitHub에서 직접 고치는 문서입니다. 표가 깨지거나
> 파일명·상태 값이 틀려도 빌드는 통과하므로, 배포 전에 `npm run validate` 가
> 돌아갑니다 — 빈 칸, ID 중복, 없는 파일, 표에 없는 html, 상태 값, 제목 변형
> 형식을 확인하고 문제가 있으면 **배포를 막습니다.** 실패하면 라이브는 직전
> 정상 버전 그대로 유지됩니다.

## 제목 A/B 테스트와 UTM

**UTM의 원본은 `templates/README.md` 입니다.** 코드 보기로 내보낼 때 HTML 안의
`utm_*` 를 문서의 값으로 맞춥니다. 이미 `utm_` 을 하나라도 달고 있는 링크만
대상이라, 로고·푸터처럼 추적하지 않는 링크는 건드리지 않습니다.

본문이 같고 **제목만 다른 A/B** 는 파일을 복제하지 말고 `subjects` 에 변형을
추가합니다. 2개 이상이면 **시안 목록에서 선택한 시안 아래에** `제목 A B` 토글이
나타나고, 고른 변형에 맞춰 `<title>` 과 `utm_term` 이 반영된 HTML이 나옵니다.

원본 링크는 행마다 갈립니다 — **본문 행은 `.html`**, **제목 행은 `templates/README.md`**
으로 갑니다. 제목 변형은 본문 파일을 공유하므로, 제목을 고칠 곳은 이 문서입니다.
헤더의 ⚙ 설정 아이콘으로도 바로 열립니다.

`## 시안` 표에 UTM을, `## 제목 변형` 표에 제목을 적습니다.

```
## 시안
| ID | 분류 | 그룹 | 이름 | 파일 | 상태 | 기간 | source | medium | campaign | content |
| 01 | 콜드메일 | 안면인식서비스 | 단일홍보 A안 | 01-face-promo-a.html | 사용중 | - | kbz_mail | email | face_2026 | mail-a |

## 제목 변형
| ID | 키 | 제목 | term | content |
| 01 | a | 첫 번째 제목 | - | - |
| 01 | b | 두 번째 제목 | - | - |
```

두 축은 독립적입니다 — **본문 변형은 `utm_content`**, **제목 변형은 `utm_term`**
(`subj-{키}`, `term` 칸으로 직접 지정 가능). 그래서 어느 쪽이 성과를 냈는지 따로
볼 수 있습니다. 예외로 **`content` 칸을 채운 변형은 그 값으로 `utm_content` 를
덮어쓰고 `utm_term` 을 붙이지 않습니다** — 제목 A/B를 `utm_content` 로 가르던
과거 집행 기록을 그대로 보존하기 위한 것입니다.

UTM 칸이 모두 `-` 인 시안은 HTML을 그대로 내보냅니다. 제목 변형 줄이 없으면
제목을 HTML의 `<title>` 에서 읽고, `<title>` 이 없으면 비워 둡니다.

## 이 저장소와 Figma Make

이 코드는 Figma Make에서 한 번 내보낸 뒤로 **git이 유일한 원본(source of truth)** 입니다.

> ⚠️ Figma Make에서 이 프로젝트로 다시 "Push to GitHub" 하지 마세요.
> Make → GitHub 푸시는 단방향이라, git에서 작업한 내용이 **전부 덮어씌워집니다.**
> 앞으로 수정은 이 저장소에서만 합니다.

원본 Figma 파일: [콜드메일 라이브 테스트](https://www.figma.com/design/wzw3fjxEcgbUJTLi38soYr/%EC%BD%9C%EB%93%9C%EB%A9%94%EC%9D%BC-%EB%9D%BC%EC%9D%B4%EB%B8%8C-%ED%85%8C%EC%8A%A4%ED%8A%B8) (참고용 — 코드는 동기화되지 않습니다)

## 기술 스택

React 18 · Vite 6 · TypeScript · Tailwind CSS v4 · shadcn/ui (Radix) · react-router · CodeMirror
