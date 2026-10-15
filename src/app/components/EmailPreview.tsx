import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router';
import {
  Monitor, Smartphone, Check, Mail,
  ChevronDown, ChevronLeft, ChevronUp, Star,
  MoreHorizontal, Sun, Moon, AlertTriangle, Code2, FileCode2, Settings,
} from 'lucide-react';
import { toast } from 'sonner';
import { DEFAULT_TEMPLATES, type TemplateStatus } from '../data/defaultTemplates';
import { blobUrl, DOC_PATH } from '../data/repo';
import { variantKind } from '../data/variantKind.js';
import { EditorPanel } from './EditorPanel';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { editUrl } from '../data/repo';

type DeviceMode = 'desktop' | 'mobile';

const EMAIL_META = {
  from: '김반장 <ecard@kbz.co.kr>',
  fromShort: '김반장',
  fromInitial: '김',
  to: '담당자님',
  date: '2026년 3월 30일 (월) 오전 10:24',
};

const STATUS_LABEL = { active: '사용중', draft: '미사용', ended: '운영종료' } as const;

/**
 * 상태별로 본문 위에 뜨는 안내. 목록에서 보이고 안 보이고는 범례의 필터가 정한다.
 * tone 은 Banner 의 디자인 시스템 변형 이름이다.
 */
const STATUS_UI = {
  active: null,
  draft: {
    label: '미사용',
    tone: '',               /* banner 기본값 = info */
    notice: '내용을 확인한 뒤 문서에서 상태를 "사용중"으로 바꾸세요.',
  },
  ended: {
    label: '운영종료',
    tone: 'caution',
    notice: '설정은 그대로 남아 있지만 집행이 끝난 시안이니 발송 전에 확인하세요.',
  },
} as const;

/* ══════════════════════════════════════════
   디자인 시스템 컴포넌트
   클래스는 src/styles/kbz/components.css — 스펙 문서에서 그대로 받아온다.
══════════════════════════════════════════ */

/**
 * Segment (components/atoms/segment.md)
 * 선택 칸을 따라 미끄러지는 배경은 JS가 위치·폭을 재서 옮긴다.
 */
function Segment<T extends string>({
  options, value, onChange, label,
}: {
  options: { value: T; icon?: React.ReactNode; label: string; title?: string }[];
  value: T;
  onChange: (v: T) => void;
  /** 스크린리더용 그룹 이름 */
  label: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [slider, setSlider] = useState({ x: 0, w: 0 });

  useEffect(() => {
    const el = ref.current?.querySelector<HTMLElement>('[data-on="true"]');
    if (el) setSlider({ x: el.offsetLeft, w: el.offsetWidth });
  }, [value, options.length]);

  return (
    <div ref={ref} className="segment" role="group" aria-label={label}>
      <span
        className="segment__slider"
        style={{ transform: `translateX(${slider.x}px)`, width: slider.w }}
      />
      {options.map(o => {
        const on = o.value === value;
        return (
          <button
            key={o.value}
            data-on={on}
            onClick={() => onChange(o.value)}
            title={o.title}
            aria-pressed={on}
            className={`segment__item${on ? ' segment__item--selected' : ''}`}
          >
            {o.icon}
            <span>{o.label}</span>
          </button>
        );
      })}
    </div>
  );
}

/**
 * Banner (components/molecules/banner.md)
 * tone 이 빈 문자열이면 기본값(info).
 */
function Banner({
  tone, icon, children, className = '',
}: {
  tone?: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`banner${tone ? ` banner--${tone}` : ''} ${className}`} role="status">
      <span className="banner__icon icon--md">{icon}</span>
      <div className="banner__body">{children}</div>
    </div>
  );
}

/**
 * 목록에서 선택된 항목 아래에 붙는 시안 전환 줄.
 * A·B는 동시에 고를 수 없는 선택지라 Segment 를 쓴다 — 머리말의 PC/모바일과 같은 컨트롤이다.
 *
 * 라벨은 **무엇으로 갈리는지**를 직접 말한다 — `제목 A` / `전체 A`.
 * 따로 "시안"이라고 적어 두면 한 줄에 같은 말이 두 번 있는 셈이고,
 * 정작 궁금한 "무엇이 다른가"는 어디에도 없었다.
 */
function VariantRow({
  kind, options, selected, onSelect, href, hrefTitle, hrefLabel,
}: {
  /** 무엇으로 갈리는지 — '제목' 또는 '전체' */
  kind: string;
  /** key는 선택 식별용, label은 화면에 찍히는 글자(A·B)다. */
  options: { key: string; label?: string; title?: string }[];
  selected: string;
  onSelect: (key: string) => void;
  href: string;
  hrefTitle: string;
  hrefLabel: string;
}) {
  return (
    <div className="rail__variants">
      <Segment
        label={`${kind} 변형 전환`}
        value={selected}
        onChange={onSelect}
        options={options.map(o => ({
          value: o.key,
          label: `${kind} ${(o.label ?? o.key).toUpperCase()}`,
          title: o.title,
        }))}
      />
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        title={hrefTitle}
        aria-label={hrefLabel}
        className="rail__source"
      >
        <FileCode2 className="ico-sm" />
      </a>
    </div>
  );
}

function getSubject(html: string): string {
  const match = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  return match ? match[1].trim() : '콜드메일 시안';
}

/**
 * 미리보기 iframe 전용 래퍼. srcDoc 은 완전한 문서를 요구한다.
 * 내보내는 코드에는 쓰지 않는다 — 템플릿이 이미 완전한 문서라 두 겹이 된다.
 */
function buildLightHtml(html: string, css: string): string {
  return `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>${css}</style>
</head>
<body style="margin:0;padding:0;">${html}</body>
</html>`;
}

/**
 * Gmail 자동 다크모드 시뮬레이션
 * Gmail은 color-scheme 선언이 없는 이메일에 대해 자동으로 색상을 반전합니다.
 * CSS filter: invert(1) hue-rotate(180deg) 로 근사 시뮬레이션합니다.
 */
function buildGmailAutoDarkHtml(html: string, css: string): string {
  return `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    html, body { margin: 0; padding: 0; background: #1f1f1f; }
    /* Gmail 자동 반전 시뮬레이션 */
    body > * { filter: invert(1) hue-rotate(180deg); }
    /* 이미지/영상은 다시 재반전 (원본 유지) */
    img, video, svg { filter: invert(1) hue-rotate(180deg); }
    ${css}
  </style>
</head>
<body style="margin:0;padding:0;background:#1f1f1f;">${html}</body>
</html>`;
}

/**
 * color-scheme: light only 적용 시 — Gmail이 변환을 건너뜀
 * 어두운 이메일 클라이언트 프레임 안에서 원본 색상 그대로 렌더링
 */
function buildFixedDarkHtml(html: string, css: string): string {
  return `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="light only">
  <meta name="supported-color-schemes" content="light only">
  <style>
    :root, html, body { color-scheme: light only !important; }
    ${css}
  </style>
</head>
<body style="margin:0;padding:0;">${html}</body>
</html>`;
}

/** 템플릿 HTML에 color-scheme: light only 선언이 있는지 확인 */
function hasColorSchemeFix(html: string): boolean {
  return /color-scheme/i.test(html) && /light[\s]+only/i.test(html);
}

/* ── 화면 아래 고정 안내 ── */
function DarkModeBanner({ isDark, isFixed }: { isDark: boolean; isFixed: boolean }) {
  if (!isDark) return null;

  if (isFixed) {
    return (
      <div className="app__footnote">
        <Banner tone="success" icon={<Check />}>
          <p className="banner__title">color-scheme: light only 적용됨</p>
          <p className="banner__message">
            Gmail이 자동 색상 변환을 건너뜁니다. 원본 색상이 다크모드에서도 그대로 유지되는 모습입니다.
          </p>
        </Banner>
      </div>
    );
  }

  return (
    <div className="app__footnote">
      <Banner tone="caution" icon={<AlertTriangle />}>
        <p className="banner__title">Gmail 자동 색상 변환 시뮬레이션</p>
        <p className="banner__message">
          Gmail은 <code>color-scheme</code> 선언이 없는 이메일을 다크모드에서 자동으로 색상 반전합니다.
          원본 색상을 유지하려면 이메일 <code>&lt;head&gt;</code>에 아래 두 줄을 추가하세요.
        </p>
        <pre>
{`<meta name="color-scheme" content="light only">
<meta name="supported-color-schemes" content="light only">`}
        </pre>
      </Banner>
    </div>
  );
}

/* ══════════════════════════════════════════
   Main Component
══════════════════════════════════════════ */
export function EmailPreview({ initialEditorOpen = false }: { initialEditorOpen?: boolean } = {}) {
  const templates = DEFAULT_TEMPLATES;
  const navigate = useNavigate();
  // A/B 묶음은 id를 공유하므로 선택 상태는 줄마다 고유한 key로 잡는다.
  const [activeKey, setActiveKey] = useState(templates[0]?.key ?? '01');
  const [device, setDevice] = useState<DeviceMode>('desktop');
  const [darkMode, setDarkMode] = useState(false);

  /**
   * 목록에서 감춘 상태들. 범례가 곧 필터라 여기 하나로 모은다.
   * 기본값은 운영종료만 감춤 — 끝난 시안이 목록의 절반을 먹지 않게.
   */
  const [hidden, setHidden] = useState<Set<TemplateStatus>>(() => {
    try {
      const saved = localStorage.getItem('coldmail:hidden');
      if (saved !== null) return new Set(saved ? saved.split(',') as TemplateStatus[] : []);
    } catch { /* 못 읽어도 기본값으로 돈다 */ }
    return new Set<TemplateStatus>(['ended']);
  });
  useEffect(() => {
    try { localStorage.setItem('coldmail:hidden', [...hidden].join(',')); } catch { /* 저장 못 해도 동작에는 지장 없다 */ }
  }, [hidden]);
  const toggleStatus = useCallback((k: TemplateStatus) => {
    setHidden(prev => {
      const next = new Set(prev);
      if (next.has(k)) next.delete(k); else next.add(k);
      return next;
    });
  }, []);

  /** 범례에 적는 상태별 개수 — 감춰도 몇 개가 있는지는 보인다 */
  const counts = useMemo(() => {
    const out = { active: 0, draft: 0, ended: 0 } as Record<TemplateStatus, number>;
    for (const t of templates) out[t.status] += 1;
    return out;
  }, [templates]);

  /**
   * 분류 → 그룹 → 항목 → 시안 으로 묶는다.
   * 같은 group·label 의 시안은 한 항목으로 합쳐 토글로 전환한다.
   * 이름이 같으면 표에서 떨어져 있어도 한 묶음으로 본다. 자리는 처음 나온
   * 위치, 안쪽 순서는 표의 순서를 따른다.
   */
  const sections = useMemo(() => {
    type Entry = { label: string; variants: typeof templates };
    type Group = { name: string; entries: Entry[] };
    type Section = { name: string; groups: Group[] };
    const out: Section[] = [];
    const byCat = new Map<string, Section>();
    const byGroup = new Map<string, Group>();
    const byEntry = new Map<string, Entry>();
    const visible = templates.filter(
      t => !hidden.has(t.status) || t.key === activeKey,
    );
    for (const t of visible) {
      let sec = byCat.get(t.category);
      if (!sec) {
        sec = { name: t.category, groups: [] };
        byCat.set(t.category, sec);
        out.push(sec);
      }
      const gKey = `${t.category}\u0000${t.group}`;
      let g = byGroup.get(gKey);
      if (!g) {
        g = { name: t.group, entries: [] };
        byGroup.set(gKey, g);
        sec.groups.push(g);
      }
      const eKey = `${gKey}\u0000${t.label}`;
      let e = byEntry.get(eKey);
      if (!e) {
        e = { label: t.label, variants: [] };
        byEntry.set(eKey, e);
        g.entries.push(e);
      }
      e.variants.push(t);
    }
    return out;
  }, [templates, hidden, activeKey]);

  const [editorOpen, setEditorOpen] = useState(initialEditorOpen);
  /** 편집 중인 코드. null이면 파일 원본 그대로. */
  const [draft, setDraft] = useState<string | null>(null);
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const toggleGroup = useCallback((name: string) => {
    setCollapsed(prev => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name); else next.add(name);
      return next;
    });
  }, []);

  const current = templates.find(t => t.key === activeKey) ?? templates[0];
  const sourceHtml = draft ?? current.html;
  const subject = getSubject(sourceHtml);

  const currentIndex = templates.findIndex(t => t.key === activeKey);

  /** 시안을 바꾸면 편집 중이던 내용은 그 시안의 것이 아니므로 버린다. */
  useEffect(() => { setDraft(null); }, [activeKey]);

  useEffect(() => {
    const g = templates.find(t => t.key === activeKey)?.group;
    if (g) setCollapsed(prev => (prev.has(g) ? new Set([...prev].filter(x => x !== g)) : prev));
  }, [activeKey, templates]);

  const lightHtml = buildLightHtml(sourceHtml, current.css);

  const isFixed = hasColorSchemeFix(sourceHtml);
  const iframeDoc = !darkMode
    ? lightHtml
    : isFixed
      ? buildFixedDarkHtml(sourceHtml, current.css)
      : buildGmailAutoDarkHtml(sourceHtml, current.css);
  /* 네이버 메일 미리보기에만 넘기는 값. 앱 화면은 디자인 시스템에 다크 테마가
     없으므로 항상 밝은 면을 쓴다. */
  const isDark = darkMode;

  const goPrev = () => {
    if (currentIndex > 0) setActiveKey(templates[currentIndex - 1].key);
  };
  const goNext = () => {
    if (currentIndex < templates.length - 1) setActiveKey(templates[currentIndex + 1].key);
  };

  /** 미리보기 무대 — 상태 안내 + 메일 클라이언트 창. 에디터 유무와 무관하게 같다. */
  const stage = (
    <>
      {STATUS_UI[current.status] && (
        <Banner
          tone={STATUS_UI[current.status]!.tone}
          icon={<AlertTriangle />}
          className="stage__notice"
        >
          <p className="banner__message">
            <strong>{STATUS_UI[current.status]!.label} 시안</strong>입니다.{' '}
            {STATUS_UI[current.status]!.notice}
          </p>
        </Banner>
      )}

      {device === 'desktop' ? (
        <DesktopEmailClient subject={subject} iframeDoc={iframeDoc} isDark={isDark} />
      ) : (
        <MobileEmailClient subject={subject} iframeDoc={iframeDoc} isDark={isDark} />
      )}
    </>
  );

  return (
    <div className="app">
      {/* ── Top Bar ── */}
      <header className="app__header">
        <div className="app__brand">
          <Mail className="ico-md" />
          <span className="app__title">콜드메일 시안 미리보기</span>
        </div>

        <div className="app__tools">
          <Segment<DeviceMode>
            label="미리보기 기기"
            value={device}
            onChange={setDevice}
            options={[
              { value: 'desktop', icon: <Monitor className="ico-sm" />, label: 'PC' },
              { value: 'mobile',  icon: <Smartphone className="ico-sm" />, label: '모바일' },
            ]}
          />

          <Segment
            label="메일 클라이언트 색 모드"
            value={darkMode ? 'dark' : 'light'}
            onChange={v => setDarkMode(v === 'dark')}
            options={[
              { value: 'light', icon: <Sun className="ico-sm" />, label: '라이트' },
              { value: 'dark',  icon: <Moon className="ico-sm" />, label: '다크' },
            ]}
          />

          {/* 시안 관리 문서 — 그룹·상태·UTM이 여기서 결정된다.
              결정이 아니라 참고 문서로 가는 길이라 Icon Button(중립, hover tint만).
              머리말에서 면을 가진 것은 라이브 에디터 하나뿐이다. */}
          <a
            href={blobUrl(DOC_PATH)}
            target="_blank"
            rel="noopener noreferrer"
            title="시안 관리 문서 열기 — 그룹·사용 상태·UTM을 여기서 고칩니다"
            aria-label="시안 관리 문서를 GitHub에서 열기"
            className="icon-on--md app__icon-link"
          >
            <Settings />
          </a>

          {/* 코드를 고치는 것이 이 화면의 핵심 작업이라 primary */}
          <button
            onClick={() => setEditorOpen(v => !v)}
            aria-pressed={editorOpen}
            title={editorOpen ? '에디터 닫기' : '오른쪽에 코드 에디터 열기'}
            className={`btn btn--primary btn--sm text-button-sm${editorOpen ? ' btn--solid' : ''}`}
          >
            <Code2 className="ico-sm" />라이브 에디터
          </button>
        </div>
      </header>

      {/* ── Body: Sidebar + Preview ── */}
      <div className="flex flex-1 overflow-hidden">

        {/* ── Left Sidebar: Template List ── */}
        <aside className="rail">
          {/* Template List — group별로 묶고, 그룹 제목을 눌러 접는다 */}
          <div className="rail__list">
            {sections.map(sec => (
              <div key={sec.name} className="rail__block">
                {/* 대분류 — 콜드메일 / 발신템플릿. 구역이므로 위에 선을 긋는다 */}
                <div className="rail__section">{sec.name}</div>

                {sec.groups.map(g => {
                  const isCollapsed = collapsed.has(g.name);
                  return (
                    /* 묶음 사이는 선으로 가른다 — 면은 선택에만 남긴다 */
                    <div key={g.name} className="rail__fold">
                      <button
                        onClick={() => toggleGroup(g.name)}
                        className="rail__group"
                        aria-expanded={!isCollapsed}
                        title={isCollapsed ? `${g.name} 펼치기` : `${g.name} 접기`}
                      >
                        <span aria-hidden className="rail__group-toggle">
                          <ChevronDown
                            className={`ico-badge rail__chevron${isCollapsed ? ' rail__chevron--collapsed' : ''}`}
                          />
                        </span>
                        <span className="rail__group-name">{g.name}</span>
                        <span className="rail__group-count badge badge--brand badge--pill badge--line">
                          {g.entries.length}
                        </span>
                      </button>

                      {!isCollapsed && g.entries.map(entry => {
                        // 선택된 시안이 이 항목 안에 있으면 그걸, 아니면 첫 시안을 대표로 쓴다
                        const shown = entry.variants.find(v => v.key === activeKey) ?? entry.variants[0];
                        const isActive = entry.variants.some(v => v.key === activeKey);
                        const hasVariants = entry.variants.length > 1;
                        return (
                          <div className="rail__entry" key={`${entry.label}-${entry.variants[0].key}`}>
                            <div className={`rail__item${isActive ? ' rail__item--on' : ''}`}>
                              <button
                                onClick={() => setActiveKey(shown.key)}
                                title={`${entry.label} — ${STATUS_LABEL[shown.status]}`}
                                className="rail__item-btn"
                              >
                                {/* 상태 표시 — 자리를 고정해 이름 길이와 무관하게 세로로 정렬된다 */}
                                <span aria-hidden className={`rail__state rail__state--${shown.status}`} />
                                <span className="rail__item-name">{entry.label}</span>
                                <span className="sr-only">{STATUS_LABEL[shown.status]}</span>
                              </button>
                              {/* 원본 소스 — 레이아웃을 차지하지 않도록 겹쳐 둔다.
                                  A/B가 있으면 이 줄은 묶음 이름일 뿐 가리키는 파일이
                                  하나가 아니다. 그때는 어느 시안인지 고른 뒤, 아래
                                  시안 줄에서 그 파일로 간다. */}
                              {!hasVariants && (
                                <a
                                  href={blobUrl(shown.path)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  title={`GitHub에서 원본 열기 — ${shown.path}`}
                                  aria-label={`${shown.name} 원본 소스를 GitHub에서 열기`}
                                  className="rail__source"
                                >
                                  <FileCode2 className="ico-sm" />
                                </a>
                              )}
                            </div>

                            {/* 시안 A/B — 제목만 다른 A/B도 파일이 따로이므로 원본은 해당 .html 로 간다 */}
                            {isActive && hasVariants && (
                              <VariantRow
                                kind={variantKind(entry.variants.map(v => v.html))}
                                options={entry.variants.map(v => ({ key: v.key, label: v.variant, title: v.name }))}
                                selected={shown.key}
                                onSelect={key => {
                                  const next = entry.variants.find(v => v.key === key);
                                  if (next) setActiveKey(next.key);
                                }}
                                href={blobUrl(shown.path)}
                                hrefTitle={`GitHub에서 본문 원본 열기 — ${shown.path}`}
                                hrefLabel={`${shown.name} 본문 원본을 GitHub에서 열기`}
                              />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>

          {/* 범례가 곧 필터다 — 도형의 뜻을 적어 두는 자리와 켜고 끄는 자리가 같다 */}
          <div className="rail__foot">
            {(['active', 'draft', 'ended'] as const).map(k => {
              const on = !hidden.has(k);
              return (
                <button
                  key={k}
                  onClick={() => toggleStatus(k)}
                  aria-pressed={on}
                  title={on ? `${STATUS_LABEL[k]} 시안 숨기기` : `${STATUS_LABEL[k]} 시안 ${counts[k]}개 보기`}
                  className={`tag rail__filter${on ? ' tag--selected' : ''}`}
                >
                  <span aria-hidden className={`rail__state rail__state--${k}`} />
                  {STATUS_LABEL[k]}
                  <span className="rail__filter-count">{counts[k]}</span>
                </button>
              );
            })}
          </div>

          {/* 이동 — 화살표 둘과 현재 위치를 한 줄에 모은다. 셋 다 "목록에서 어디쯤인가"를
              말하는 것이라 따로 두면 레일 아래가 세 줄이 된다. */}
          <div className="rail__pager">
            <button onClick={goPrev} disabled={currentIndex === 0} className="rail__step" title="이전 시안">
              <ChevronUp className="ico-sm" />
            </button>
            <span className="rail__position">{currentIndex + 1} / {templates.length}</span>
            <button
              onClick={goNext}
              disabled={currentIndex === templates.length - 1}
              className="rail__step"
              title="다음 시안"
            >
              <ChevronDown className="ico-sm" />
            </button>
          </div>
        </aside>

        {/* ── Preview Area ── */}
        {editorOpen ? (
          <PanelGroup direction="horizontal" className="flex-1 overflow-hidden">
            <Panel defaultSize={58} minSize={30}>
              <div className="stage h-full">{stage}</div>
            </Panel>
            <PanelResizeHandle className="app__split-handle" />
            <Panel defaultSize={42} minSize={25}>
              <EditorPanel
                code={sourceHtml}
                onChange={setDraft}
                onReset={() => setDraft(null)}
                onCommit={async () => {
                  try {
                    await navigator.clipboard.writeText(sourceHtml);
                    toast.success('코드를 복사했습니다. GitHub 편집기에서 전체 선택 후 붙여넣고 커밋하세요.');
                  } catch {
                    toast.error('복사에 실패했습니다. 에디터에서 직접 복사해 주세요.');
                  }
                  window.open(editUrl(current.path), '_blank', 'noopener,noreferrer');
                }}
                fileName={current.path}
                dirty={draft !== null}
              />
            </Panel>
          </PanelGroup>
        ) : (
          <main className="stage">{stage}</main>
        )}
      </div>

      <DarkModeBanner isDark={isDark} isFixed={isFixed} />
    </div>
  );
}

/* ══════════════════════════════════════════
   Desktop – 네이버메일 스타일
══════════════════════════════════════════ */
function DesktopEmailClient({ subject, iframeDoc, isDark }: { subject: string; iframeDoc: string; isDark: boolean }) {
  const [starred, setStarred] = useState(false);

  const NAVER_GREEN = '#03c75a';
  const NAVER_BLUE  = isDark ? '#60a5fa' : '#1a56db';

  const bg          = isDark ? '#212126' : '#ffffff';
  const bgPage      = isDark ? '#171719' : '#f5f5f5';
  const bgSide      = isDark ? '#1b1b1f' : '#ffffff';
  const bgHeader    = isDark ? '#1f1f23' : '#ffffff';
  const border      = isDark ? '#32323a' : '#e0e0e0';
  const borderLight = isDark ? '#2a2a32' : '#f0f0f0';
  const tp          = isDark ? '#e4e4e4' : '#222';
  const ts          = isDark ? '#888'    : '#666';
  const hov         = isDark ? '#2a2a2e' : '#f7f7f7';
  const activeFolder= isDark ? '#1a2535' : '#e8f3ff';

  type FolderItem = {
    id: string; label: string; count?: number | string;
    active?: boolean; level?: number; expandable?: boolean;
    extra?: string; countBlue?: boolean;
  };
  const folders: FolderItem[] = [
    { id: 'all',       label: '전체메일',             extra: '정리하기', level: 0 },
    { id: 'inbox',     label: '받은메일함',            count: 859, active: true, level: 0 },
    { id: 'sent',      label: '보낸메일함',            level: 0 },
    { id: 'read',      label: '수신확인',              level: 0 },
    { id: 'draft',     label: '임시보관함',            level: 0 },
    { id: 'self',      label: '내게쓴메일함',          expandable: true, level: 0 },
    { id: 'self1',     label: '새 메일함',             count: 1,   level: 1 },
    { id: 'self2',     label: '새 메일함 (2)',          level: 1 },
    { id: 'smart',     label: '스마트메일함',           expandable: true, level: 0 },
    { id: 'promo',     label: '프로모션',              count: '999+', level: 1, countBlue: true },
    { id: 'bill',      label: '청구·결제',             count: 224, level: 1 },
    { id: 'care',      label: '카레',                  count: 148, level: 1 },
    { id: 'myfolder',  label: '내 메일함',             expandable: true, level: 0 },
    { id: 'google',    label: '구글(지메일&구글앱스)',  level: 1 },
    { id: 'work',      label: '업무메일',              level: 1 },
    { id: 'spam',      label: '스팸메일함',             count: 14,  level: 0 },
  ];

  return (
    <div
      className="w-full max-w-5xl rounded-xl overflow-hidden"
      style={{
        border: `1px solid ${isDark ? '#3a3a44' : border}`,
        boxShadow: isDark
          ? '0 8px 48px 0 rgba(0,0,0,0.72), 0 2px 12px 0 rgba(0,0,0,0.5)'
          : '0 4px 32px 0 rgba(0,0,0,0.13)',
      }}
    >
      {/* ── 브라우저 chrome ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', background: isDark ? '#2c2c32' : '#ebebeb', borderBottom: `1px solid ${border}` }}>
        <div style={{ display: 'flex', gap: 6 }}>
          <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#ff5f57' }} />
          <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#ffbd2e' }} />
          <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#28c840' }} />
        </div>
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '3px 12px', borderRadius: 6, background: bg, border: `1px solid ${border}`, maxWidth: 280, width: '100%' }}>
            <svg viewBox="0 0 24 24" style={{ width: 12, height: 12, fill: 'none', stroke: ts, strokeWidth: 2, flexShrink: 0 }}><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            <span style={{ fontSize: 12, color: ts }}>mail.naver.com</span>
          </div>
        </div>
      </div>

      {/* ── 네이버메일 UI ── */}
      <div style={{ height: '75vh', display: 'flex', flexDirection: 'column', background: bgPage }}>

        {/* 상단 헤더: N메일 + 아이콘 + 유저 */}
        <div style={{ height: 46, flexShrink: 0, background: bgHeader, borderBottom: `1px solid ${border}`, display: 'flex', alignItems: 'center', padding: '0 12px', gap: 8 }}>
          {/* N 메일 로고 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, width: 182, flexShrink: 0 }}>
            <div style={{ width: 25, height: 25, background: NAVER_GREEN, borderRadius: 5, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span style={{ color: 'white', fontWeight: 900, fontSize: 14, fontFamily: 'Arial Black, sans-serif', lineHeight: 1 }}>N</span>
            </div>
            <span style={{ fontWeight: 700, fontSize: 15, color: tp, letterSpacing: '-0.3px' }}>메일</span>
          </div>
          {/* 중앙 아이콘 툴바 */}
          <div style={{ flex: 1, display: 'flex', justifyContent: 'center', gap: 2 }}>
            {[
              { d: 'M20 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2zm0 4-8 5-8-5', title: '받은메일' },
              { d: 'M21 15H3M21 9H3M21 12H8', title: '메일함' },
              { d: 'M11 17H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5m-3 4v5m0 0-3-3m3 3 3-3', title: '보낸메일' },
              { d: 'M9 11l3 3L22 4M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11', title: '수신확인' },
              { d: 'M12 20h9M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z', title: '설정' },
              { d: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z', title: '통계' },
              { d: 'M5 5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16l-7-3.5L5 21V5z', title: '북마크' },
              { d: 'M4 6h16M4 12h16M4 18h16', title: '더보기' },
            ].map((icon, i) => (
              <button key={i} title={icon.title} style={{ width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 4, color: NAVER_GREEN, background: 'transparent', border: 'none', cursor: 'pointer' }}>
                <svg viewBox="0 0 24 24" style={{ width: 16, height: 16, fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' }}>
                  <path d={icon.d} />
                </svg>
              </button>
            ))}
          </div>
          {/* 우측: 유저·알림 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 12, color: ts, padding: '2px 6px', border: `1px solid ${border}`, borderRadius: 3 }}>
              <div style={{ width: 18, height: 18, borderRadius: '50%', background: isDark ? '#333' : '#ddd', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, color: ts }}>A</div>
              <span>ABC</span>
              <ChevronDown style={{ width: 11, height: 11 }} />
            </div>
            <button style={{ width: 28, height: 28, background: 'transparent', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: ts }}>
              <svg viewBox="0 0 24 24" style={{ width: 16, height: 16, fill: 'none', stroke: 'currentColor', strokeWidth: 2 }}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            </button>
            <button style={{ width: 28, height: 28, background: 'transparent', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: ts, position: 'relative' }}>
              <svg viewBox="0 0 24 24" style={{ width: 16, height: 16, fill: 'none', stroke: 'currentColor', strokeWidth: 2 }}><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
              <span style={{ position: 'absolute', top: 3, right: 3, background: '#e53e3e', color: 'white', fontSize: 7, borderRadius: 10, padding: '1px 3px', lineHeight: 1 }}>21</span>
            </button>
            <button style={{ width: 28, height: 28, background: 'transparent', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: ts }}>
              <svg viewBox="0 0 24 24" style={{ width: 15, height: 15, fill: 'currentColor' }}>
                {([[3,3],[10,3],[17,3],[3,10],[10,10],[17,10],[3,17],[10,17],[17,17]] as [number,number][]).map(([x,y],i) => (
                  <rect key={i} x={x} y={y} width="4" height="4" rx="1"/>
                ))}
              </svg>
            </button>
          </div>
        </div>

        {/* 바디: 사이드바 + 메일 뷰 */}
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

          {/* ── 사이드바 ── */}
          <div style={{ width: 182, flexShrink: 0, background: bgSide, borderRight: `1px solid ${border}`, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
            {/* 메일쓰기 + 내게쓰기 */}
            <div style={{ padding: '10px 10px 6px', display: 'flex', gap: 5 }}>
              <button style={{ flex: 1, background: NAVER_GREEN, color: 'white', border: 'none', borderRadius: 4, padding: '7px 0', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                메일 쓰기
              </button>
              <button style={{ flex: 1, background: 'transparent', color: ts, border: `1px solid ${border}`, borderRadius: 4, padding: '7px 0', fontSize: 12, cursor: 'pointer' }}>
                내게 쓰기
              </button>
            </div>
            {/* 퀵 통계 */}
            <div style={{ display: 'flex', padding: '4px 4px 8px', borderBottom: `1px solid ${borderLight}` }}>
              {[
                { top: '999+', sub: '안읽음', blue: true },
                { top: '☆', sub: '중요', blue: false },
                { top: '📎', sub: '첨부', blue: false },
                { top: 'TO', sub: 'TO', blue: false },
              ].map((s, i) => (
                <div key={i} style={{ flex: 1, textAlign: 'center', cursor: 'pointer', padding: '2px 0' }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: s.blue ? NAVER_BLUE : ts }}>{s.top}</div>
                  <div style={{ fontSize: 9, color: ts, marginTop: 1 }}>{s.sub}</div>
                </div>
              ))}
            </div>
            {/* 폴더 목록 */}
            <div style={{ flex: 1 }}>
              {folders.map((f) => {
                const isActive = !!f.active;
                const lvl = f.level ?? 0;
                return (
                  <div
                    key={f.id}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 4,
                      padding: lvl === 1 ? '4px 10px 4px 22px' : '5px 10px',
                      background: isActive ? activeFolder : 'transparent',
                      cursor: 'pointer',
                      fontSize: lvl === 1 ? 11 : 12,
                      color: isActive ? NAVER_BLUE : lvl === 1 ? ts : tp,
                      fontWeight: isActive ? 700 : 400,
                    }}
                    onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = hov; }}
                    onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
                  >
                    {lvl === 0 && (
                      <svg viewBox="0 0 16 16" style={{ width: 13, height: 13, flexShrink: 0, fill: isActive ? NAVER_BLUE : ts }}>
                        <path d="M1 3.5A1.5 1.5 0 0 1 2.5 2h2.764c.958 0 1.76.56 2.311 1.184C8.985 3.648 9.48 4 10 4h3.5A1.5 1.5 0 0 1 15 5.5v7a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 1 12.5v-9z"/>
                      </svg>
                    )}
                    {lvl === 1 && <span style={{ color: ts, fontSize: 10, opacity: 0.45, marginRight: 1 }}>└</span>}
                    <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.label}</span>
                    {f.extra && <span style={{ fontSize: 10, color: NAVER_BLUE, cursor: 'pointer' }}>{f.extra}</span>}
                    {f.count != null && (
                      <span style={{ fontSize: 10, fontWeight: 700, flexShrink: 0, color: f.countBlue ? NAVER_BLUE : isActive ? NAVER_BLUE : ts }}>
                        {f.count}
                      </span>
                    )}
                    {f.expandable && <ChevronDown style={{ width: 11, height: 11, color: ts, flexShrink: 0 }} />}
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── 메일 본문 영역 ── */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            {/* 브레드크럼 */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 14px', background: bg, borderBottom: `1px solid ${border}`, flexShrink: 0 }}>
              <ChevronLeft style={{ width: 14, height: 14, color: ts, flexShrink: 0 }} />
              <span style={{ fontSize: 13, color: ts }}>받은메일함</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: NAVER_BLUE }}>859</span>
              <span style={{ fontSize: 12, color: ts }}>/ 1753</span>
              <button style={{ fontSize: 12, color: ts, background: 'none', border: 'none', cursor: 'pointer', padding: '0 2px' }}>안읽음</button>
              <button style={{ fontSize: 12, color: ts, background: 'none', border: 'none', cursor: 'pointer', padding: '0 2px' }}>삭제</button>
              <div style={{ flex: 1 }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '4px 8px', border: `1px solid ${border}`, borderRadius: 3, background: bgPage, minWidth: 120 }}>
                <svg viewBox="0 0 24 24" style={{ width: 12, height: 12, fill: 'none', stroke: ts, strokeWidth: 2, flexShrink: 0 }}><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                <span style={{ fontSize: 12, color: ts }}>메일 검색</span>
              </div>
              <button style={{ fontSize: 12, color: ts, border: `1px solid ${border}`, borderRadius: 3, padding: '4px 8px', background: 'transparent', cursor: 'pointer', flexShrink: 0 }}>상세</button>
            </div>
            {/* 액션 툴바 */}
            <div style={{ display: 'flex', alignItems: 'center', padding: '5px 14px', background: bg, borderBottom: `1px solid ${border}`, flexShrink: 0 }}>
              {['답장', '전체답장', '전달', '삭제', '스팸신고', '안읽음'].map((btn) => (
                <button
                  key={btn}
                  style={{ fontSize: 12, color: tp, background: 'transparent', border: 'none', padding: '4px 9px', cursor: 'pointer', borderRight: `1px solid ${border}` }}
                  onMouseEnter={e => (e.currentTarget.style.color = NAVER_GREEN)}
                  onMouseLeave={e => (e.currentTarget.style.color = tp)}
                >
                  {btn}
                </button>
              ))}
              {['이동 ▾', '더보기 ▾'].map(btn => (
                <button
                  key={btn}
                  style={{ fontSize: 12, color: tp, background: 'transparent', border: 'none', padding: '4px 9px', cursor: 'pointer' }}
                  onMouseEnter={e => (e.currentTarget.style.color = NAVER_GREEN)}
                  onMouseLeave={e => (e.currentTarget.style.color = tp)}
                >
                  {btn}
                </button>
              ))}
              <div style={{ flex: 1 }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: 2, color: ts, fontSize: 12 }}>
                <span>목록</span>
                <ChevronUp style={{ width: 13, height: 13 }} />
                <ChevronDown style={{ width: 13, height: 13 }} />
              </div>
            </div>
            {/* 메일 콘텐츠 */}
            <div style={{ flex: 1, overflow: 'auto', background: bgPage, padding: 12 }}>
              <div style={{ background: bg, borderRadius: 3, overflow: 'hidden', border: `1px solid ${borderLight}` }}>
                {/* 제목 줄 */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', borderBottom: `1px solid ${border}` }}>
                  <button
                    onClick={() => setStarred(s => !s)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: starred ? '#f59e0b' : ts, flexShrink: 0 }}
                  >
                    <Star style={{ width: 15, height: 15 }} className={starred ? 'fill-yellow-400' : ''} />
                  </button>
                  <h2 style={{ flex: 1, fontSize: 15, color: tp, margin: 0, fontWeight: 600 }}>{subject}</h2>
                  <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                    <button style={{ fontSize: 12, color: ts, background: 'none', border: 'none', cursor: 'pointer' }}>인쇄</button>
                    <button style={{ fontSize: 12, color: ts, background: 'none', border: 'none', cursor: 'pointer' }}>번역</button>
                  </div>
                </div>
                {/* 발신자·수신자·날짜 */}
                <div style={{ padding: '8px 16px 10px', borderBottom: `1px solid ${border}`, display: 'flex', flexDirection: 'column', gap: 5 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13 }}>
                    <span style={{ color: ts, width: 56, flexShrink: 0 }}>보낸사람</span>
                    <span style={{ padding: '2px 8px', background: bgPage, border: `1px solid ${border}`, borderRadius: 2, fontSize: 12, color: tp }}>
                      {EMAIL_META.fromShort} &lt;{EMAIL_META.from.match(/<(.+)>/)?.[1]}&gt;
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13 }}>
                    <span style={{ color: ts, width: 56, flexShrink: 0 }}>받는사람</span>
                    <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                      {['miso@naver.com', 'miso@gmail.com'].map(addr => (
                        <span key={addr} style={{ padding: '2px 8px', background: bgPage, border: `1px solid ${border}`, borderRadius: 2, fontSize: 12, color: tp }}>{addr}</span>
                      ))}
                    </div>
                  </div>
                  <div style={{ fontSize: 12, color: ts, paddingLeft: 66 }}>{EMAIL_META.date}</div>
                </div>
                {/* 본문 iframe */}
                <iframe
                  key={iframeDoc}
                  srcDoc={iframeDoc}
                  title="이메일 미리보기"
                  className="w-full border-0"
                  style={{ minHeight: '400px', display: 'block' }}
                  onLoad={e => {
                    try {
                      const h = e.currentTarget.contentDocument?.body?.scrollHeight;
                      if (h) e.currentTarget.style.height = h + 'px';
                    } catch {}
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   Mobile – 네이버메일 앱 스타일
══════════════════════════════════════════ */
function MobileEmailClient({ subject, iframeDoc, isDark }: { subject: string; iframeDoc: string; isDark: boolean }) {
  const [starred, setStarred] = useState(false);
  const NAVER_GREEN = '#03c75a';

  const phoneBg     = isDark ? '#1c1c1e' : '#ffffff';
  const phoneBgSub  = isDark ? '#171719' : '#f5f5f5';
  const phoneBorder = isDark ? '#2e2e32' : '#e8e8e8';
  const statusText  = isDark ? '#ffffff' : '#1f2937';
  const tp          = isDark ? '#e4e4e4' : '#111';
  const ts          = isDark ? '#888'    : '#666';
  const homeBar     = isDark ? '#3a3a3c' : '#d1d5db';
  const navBg       = isDark ? '#1f1f23' : '#ffffff';
  const tagBg       = isDark ? '#2a2a2e' : '#f0f0f0';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div
        style={{
          width: 375,
          borderRadius: '3rem',
          border: `10px solid ${isDark ? '#2e2e2e' : '#1a1a1a'}`,
          outline: isDark ? '1px solid #3a3a44' : 'none',
          boxShadow: isDark
            ? '0 0 0 1px rgba(255,255,255,0.07), 0 8px 48px 0 rgba(0,0,0,0.72), 0 2px 12px 0 rgba(0,0,0,0.5)'
            : '0 8px 40px 0 rgba(0,0,0,0.22)',
          overflow: 'hidden',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Dynamic Island */}
        <div style={{
          position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', zIndex: 10,
          width: 120, height: 34, background: isDark ? '#0a0a0a' : '#000', borderRadius: '0 0 20px 20px',
        }} />

        {/* 상태바 */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '30px 20px 6px', background: navBg, color: statusText }}>
          <span style={{ fontSize: 13, fontWeight: 600 }}>9:41</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <svg viewBox="0 0 17 12" style={{ width: 16, height: 11, fill: statusText }}>
              <rect x="0" y="5" width="3" height="7" rx="0.5" opacity="0.4"/>
              <rect x="4.5" y="3.5" width="3" height="8.5" rx="0.5" opacity="0.6"/>
              <rect x="9" y="1.5" width="3" height="10.5" rx="0.5" opacity="0.8"/>
              <rect x="13.5" y="0" width="3" height="12" rx="0.5"/>
            </svg>
            <svg viewBox="0 0 16 12" style={{ width: 15, height: 11, fill: statusText }}>
              <path d="M8 9.5a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3z"/>
              <path d="M3.5 6.5C4.9 5.1 6.3 4.4 8 4.4s3.1.7 4.5 2.1l1.4-1.4A8.3 8.3 0 0 0 8 3C5.7 3 3.7 3.8 2.1 5.1L3.5 6.5z" opacity="0.7"/>
              <path d="M0.7 3.8A11.3 11.3 0 0 1 8 1a11.3 11.3 0 0 1 7.3 2.8L14 5.1A9.5 9.5 0 0 0 8 2.5 9.5 9.5 0 0 0 2 5.1L0.7 3.8z" opacity="0.4"/>
            </svg>
            <svg viewBox="0 0 25 12" style={{ width: 24, height: 12, fill: statusText }}>
              <rect x="0" y="1" width="21" height="10" rx="3" stroke={statusText} strokeWidth="1" fill="none"/>
              <rect x="1.5" y="2.5" width="17" height="7" rx="2" fill={statusText}/>
              <path d="M22.5 4.5v3c.8-.3 1.5-1 1.5-1.5s-.7-1.2-1.5-1.5z"/>
            </svg>
          </div>
        </div>

        {/* ── 앱 내비바 ── */}
        <div style={{ display: 'flex', alignItems: 'center', padding: '4px 8px 8px', background: navBg, borderBottom: `1px solid ${phoneBorder}` }}>
          <button style={{ display: 'flex', alignItems: 'center', gap: 2, background: 'none', border: 'none', cursor: 'pointer', padding: '4px 4px 4px 0', color: NAVER_GREEN }}>
            <ChevronLeft style={{ width: 20, height: 20 }} />
            <span style={{ fontSize: 13 }}>받은메일함</span>
          </button>
          <div style={{ flex: 1 }} />
          {[
            <svg key="reply" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 19, height: 19 }}><polyline points="9 17 4 12 9 7"/><path d="M20 18v-2a4 4 0 0 0-4-4H4"/></svg>,
            <svg key="trash" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 19, height: 19 }}><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>,
            <MoreHorizontal key="more" style={{ width: 19, height: 19 }} />,
          ].map((icon, i) => (
            <button key={i} style={{ width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: 'none', cursor: 'pointer', color: NAVER_GREEN }}>
              {icon}
            </button>
          ))}
        </div>

        {/* ── 메일 상세 ── */}
        <div style={{ flex: 1, overflowY: 'auto', background: phoneBgSub, display: 'flex', flexDirection: 'column', maxHeight: 590 }}>

          {/* 제목 + 별표 */}
          <div style={{ padding: '14px 16px 10px', background: phoneBg, borderBottom: `1px solid ${phoneBorder}`, display: 'flex', alignItems: 'flex-start', gap: 8 }}>
            <span style={{ flex: 1, fontSize: 15, color: tp, fontWeight: 600, lineHeight: 1.4 }}>{subject}</span>
            <button
              onClick={() => setStarred(s => !s)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, flexShrink: 0, color: starred ? '#f59e0b' : ts, marginTop: 2 }}
            >
              <Star style={{ width: 17, height: 17 }} className={starred ? 'fill-yellow-400' : ''} />
            </button>
          </div>

          {/* 발신자 행 */}
          <div style={{ padding: '10px 16px 12px', background: phoneBg, borderBottom: `1px solid ${phoneBorder}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 38, height: 38, borderRadius: '50%', background: NAVER_GREEN, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span style={{ color: 'white', fontSize: 15, fontWeight: 700 }}>{EMAIL_META.fromInitial}</span>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 5 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: tp }}>{EMAIL_META.fromShort}</span>
                  <span style={{ fontSize: 10, color: ts, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
                    &lt;{EMAIL_META.from.match(/<(.+)>/)?.[1]}&gt;
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 3, marginTop: 2 }}>
                  <span style={{ fontSize: 11, color: ts }}>나에게</span>
                  <ChevronDown style={{ width: 12, height: 12, color: ts }} />
                </div>
              </div>
              <div style={{ flexShrink: 0 }}>
                <span style={{ fontSize: 10, color: ts }}>오전 10:24</span>
              </div>
            </div>
            {/* 받는사람 태그 */}
            <div style={{ display: 'flex', gap: 5, marginTop: 8, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 10, color: ts, padding: '2px 7px', background: tagBg, borderRadius: 3 }}>받는사람</span>
              <span style={{ fontSize: 10, color: tp, padding: '2px 7px', background: tagBg, borderRadius: 3 }}>miso@naver.com</span>
            </div>
          </div>

          {/* 본문 iframe */}
          <div style={{ background: phoneBg }}>
            <iframe
              key={iframeDoc}
              srcDoc={iframeDoc}
              title="모바일 이메일 미리보기"
              style={{ width: '100%', minHeight: 380, border: 'none', display: 'block' }}
              onLoad={e => {
                try {
                  const h = e.currentTarget.contentDocument?.body?.scrollHeight;
                  if (h) e.currentTarget.style.height = h + 'px';
                } catch {}
              }}
            />
          </div>
        </div>

        {/* ── 하단 탭바 ── */}
        <div style={{ display: 'flex', alignItems: 'center', background: navBg, borderTop: `1px solid ${phoneBorder}`, padding: '6px 0 2px' }}>
          {[
            { icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" style={{ width: 22, height: 22 }}><path d="M20 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2zm0 4-8 5-8-5"/></svg>, label: '메일함', active: true },
            { icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" style={{ width: 22, height: 22 }}><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>, label: '메일목록', active: false },
            { icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" style={{ width: 22, height: 22 }}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>, label: '메일쓰기', active: false },
            { icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" style={{ width: 22, height: 22 }}><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>, label: '알림', active: false },
            { icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" style={{ width: 22, height: 22 }}><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>, label: 'MY', active: false },
          ].map((tab) => (
            <button key={tab.label} style={{
              flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
              background: 'none', border: 'none', cursor: 'pointer', padding: '4px 0',
              color: tab.active ? NAVER_GREEN : ts,
            }}>
              {tab.icon}
              <span style={{ fontSize: 9, fontWeight: tab.active ? 600 : 400 }}>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* 홈 인디케이터 */}
        <div style={{ display: 'flex', justifyContent: 'center', padding: '6px 0 10px', background: navBg }}>
          <div style={{ width: 96, height: 4, borderRadius: 2, background: homeBar }} />
        </div>
      </div>

      <p style={{ marginTop: 14, fontSize: 11, color: isDark ? '#6b7280' : '#9ca3af' }}>
        네이버메일 앱 미리보기 (375px)
      </p>
    </div>
  );
}