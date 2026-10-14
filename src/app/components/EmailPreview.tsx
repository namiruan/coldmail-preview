import { useState, useCallback, useEffect, useMemo, Fragment } from 'react';
import { useNavigate } from 'react-router';
import {
  Monitor, Smartphone, Copy, Check, Mail,
  ChevronDown, ChevronLeft, ChevronUp, ChevronRight, Star,
  MoreHorizontal, Code, X, Sun, Moon, AlertTriangle, Code2, FileCode2, Settings,
} from 'lucide-react';
import { toast } from 'sonner';
import { DEFAULT_TEMPLATES } from '../data/defaultTemplates';
import { blobUrl, DOC_PATH } from '../data/repo';
import { subjectTerm } from '../data/defaultTemplates';
import { applyUtm } from '../data/utm';

type DeviceMode = 'desktop' | 'mobile';

const EMAIL_META = {
  from: '김반장 <ecard@kbz.co.kr>',
  fromShort: '김반장',
  fromInitial: '김',
  to: '담당자님',
  date: '2026년 3월 30일 (월) 오전 10:24',
};

/**
 * 상태별 표시 규칙. 운영종료는 끝난 것이라 목록에서 숨기지만,
 * 미사용은 띄우기 전에 검토할 대상이라 그대로 보여준다.
 */
const STATUS_UI = {
  active: null,
  draft: {
    label: '미사용',
    hidden: false,
    dim: 0.75,
    tone: (d: boolean) => ({ bg: d ? '#2a3340' : '#eff6ff', fg: d ? '#93c5fd' : '#1d4ed8', border: d ? '#3a4a5e' : '#bfdbfe' }),
    notice: '내용을 확인한 뒤 문서에서 상태를 "사용중"으로 바꾸세요.',
  },
  ended: {
    label: '운영종료',
    hidden: true,
    dim: 0.45,
    tone: (d: boolean) => ({ bg: d ? '#3a2a2a' : '#fef2f2', fg: d ? '#fca5a5' : '#b91c1c', border: d ? '#5a3a3a' : '#fecaca' }),
    notice: '설정은 그대로 남아 있지만 집행이 끝난 시안이니 발송 전에 확인하세요.',
  },
} as const;

function getSubject(html: string): string {
  const match = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  return match ? match[1].trim() : '콜드메일 시안';
}

/** 라이트 모드 – 원본 그대로 */
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

/** 템플릿 HTML에 color-scheme: light only 선언이 는지 확인 */
function hasColorSchemeFix(html: string): boolean {
  return /color-scheme/i.test(html) && /light[\s]+only/i.test(html);
}

/* ── Info Banner ── */
function DarkModeBanner({ isDark, isFixed }: { isDark: boolean; isFixed: boolean }) {
  if (!isDark) return null;

  if (isFixed) {
    return (
      <div className="fixed bottom-0 left-0 right-0 z-40 flex justify-center px-4 py-3 pointer-events-none">
        <div className="flex items-start gap-3 px-4 py-3 rounded-xl max-w-2xl w-full pointer-events-auto"
          style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)', backdropFilter: 'blur(8px)' }}>
          <Check className="w-4 h-4 mt-0.5 shrink-0 text-green-400" />
          <div className="text-sm leading-relaxed" style={{ color: '#bbf7d0' }}>
            <span className="font-semibold">color-scheme: light only 적용됨</span>
            <span className="opacity-80"> — Gmail이 자동 색상 변환을 건너뜁니다. 원본 색상이 다크모드에서도 그대로 유지되는 모습입니다.</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 flex justify-center px-4 py-3 pointer-events-none">
      <div className="flex items-start gap-3 px-4 py-3 rounded-xl max-w-2xl w-full pointer-events-auto"
        style={{ background: 'rgba(251,191,36,0.12)', border: '1px solid rgba(251,191,36,0.3)', backdropFilter: 'blur(8px)' }}>
        <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0 text-yellow-400" />
        <div className="text-sm leading-relaxed" style={{ color: '#fde68a' }}>
          <span className="font-semibold">Gmail 자동 색상 변환 시뮬레이션</span>
          <span className="opacity-80"> — Gmail은 </span>
          <code className="bg-yellow-900/40 px-1 rounded text-xs">color-scheme</code>
          <span className="opacity-80"> 선언이 없는 이메일을 다크모드에서 자동으로 색상 반전합니다. 원본 색상을 유지하려면 이메일 </span>
          <code className="bg-yellow-900/40 px-1 rounded text-xs">&lt;head&gt;</code>
          <span className="opacity-80">에 아래 두 줄을 추가하세요.</span>
          <pre className="mt-2 px-3 py-2 rounded-lg text-xs font-mono leading-relaxed"
            style={{ background: 'rgba(0,0,0,0.3)', color: '#fef9c3' }}>
{`<meta name="color-scheme" content="light only">
<meta name="supported-color-schemes" content="light only">`}
          </pre>
        </div>
      </div>
    </div>
  );
}

/* ── Code Modal ── */
function CodeModal({
  templateName,
  fullHtml,
  onClose,
}: {
  templateName: string;
  fullHtml: string;
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(fullHtml);
      setCopied(true);
      toast.success('코드가 클립보드에 복사되었습니다!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('복사에 실패했습니다.');
    }
  }, [fullHtml]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.55)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl mx-4 flex flex-col overflow-hidden" style={{ maxHeight: '85vh' }}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 shrink-0">
          <div className="flex items-center gap-2">
            <Code className="w-5 h-5 text-gray-500" />
            <span className="font-semibold text-gray-800">{templateName} — 전체 코드</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                copied ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? '복사됨' : '코드 복사'}
            </button>
            <button onClick={onClose} className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-auto bg-[#1e1e2e] p-5">
          <pre className="text-[13px] text-[#cdd6f4] font-mono leading-relaxed whitespace-pre-wrap break-all">{fullHtml}</pre>
        </div>
        <div className="px-5 py-3 bg-gray-50 border-t border-gray-200 flex items-center justify-between shrink-0">
          <span className="text-xs text-gray-400">{fullHtml.length.toLocaleString()} 자</span>
          <button onClick={onClose} className="text-sm text-gray-500 hover:text-gray-700 transition-colors">닫기</button>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   Main Component
══════════════════════════════════════════ */
export function EmailPreview() {
  const templates = DEFAULT_TEMPLATES;
  const navigate = useNavigate();
  const [activeId, setActiveId] = useState(templates[0]?.id ?? '01');
  const [device, setDevice] = useState<DeviceMode>('desktop');
  const [darkMode, setDarkMode] = useState(false);
  const [codeModalOpen, setCodeModalOpen] = useState(false);

  const [showPaused, setShowPaused] = useState<boolean>(() => {
    try { return localStorage.getItem('coldmail:showPaused') === '1'; } catch { return false; }
  });
  useEffect(() => {
    try { localStorage.setItem('coldmail:showPaused', showPaused ? '1' : '0'); } catch { /* 저장 못 해도 동작에는 지장 없다 */ }
  }, [showPaused]);

  const pausedCount = useMemo(
    () => templates.filter(t => STATUS_UI[t.status]?.hidden).length,
    [templates],
  );

  /**
   * 분류 → 그룹 → 시안 세 층으로 묶는다.
   * 이름이 같으면 표에서 떨어져 있어도 한 묶음으로 본다. 붙어 있는 줄만
   * 묶으면 ID 순서상 사이에 다른 것이 끼었을 때 같은 이름이 둘로 갈린다.
   * 자리는 처음 나온 위치, 안쪽 순서는 표의 순서를 따른다.
   */
  const sections = useMemo(() => {
    type Group = { name: string; items: typeof templates };
    type Section = { name: string; groups: Group[] };
    const out: Section[] = [];
    const byCat = new Map<string, Section>();
    const byGroup = new Map<string, Group>();
    const visible = templates.filter(
      t => showPaused || !STATUS_UI[t.status]?.hidden || t.id === activeId,
    );
    for (const t of visible) {
      let sec = byCat.get(t.category);
      if (!sec) {
        sec = { name: t.category, groups: [] };
        byCat.set(t.category, sec);
        out.push(sec);
      }
      const key = `${t.category}\u0000${t.group}`;
      let g = byGroup.get(key);
      if (!g) {
        g = { name: t.group, items: [] };
        byGroup.set(key, g);
        sec.groups.push(g);
      }
      g.items.push(t);
    }
    return out;
  }, [templates, showPaused, activeId]);

  const [subjectKey, setSubjectKey] = useState<string | null>(null);
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const toggleGroup = useCallback((name: string) => {
    setCollapsed(prev => {
      const next = new Set(prev);
      next.has(name) ? next.delete(name) : next.add(name);
      return next;
    });
  }, []);

  const current = templates.find(t => t.id === activeId) ?? templates[0];
  const currentIndex = templates.findIndex(t => t.id === activeId);
  // 제목은 manifest가 원본이다. subjects가 없으면 예전처럼 <title>에서 읽는다.
  const variants = current.subjects ?? [];
  const variant = variants.find(v => v.key === subjectKey) ?? variants[0];
  const subject = variant?.text ?? getSubject(current.html);

  // 내보내는 HTML: 선택한 변형의 제목과 UTM을 반영한다.
  const exportHtml = useMemo(() => {
    let html = current.html;
    if (variant) {
      const title = variant.text.replace(/[<>]/g, '');
      if (/<title[^>]*>[^<]*<\/title>/i.test(html)) {
        html = html.replace(/<title([^>]*)>[^<]*<\/title>/i, `<title$1>${title}</title>`);
      } else {
        // <title>이 없는 템플릿도 있다. 그대로 두면 메일 제목이 비므로 head에 넣어 준다.
        html = html.replace(/<\/head>/i, `  <title>${title}</title>\n</head>`);
      }
    }
    if (!current.utm) return applyUtm(html, undefined);
    if (!variant) return applyUtm(html, current.utm);
    return applyUtm(html, {
      ...current.utm,
      ...(variants.length > 1 && !variant.content ? { term: subjectTerm(variant) } : {}),
      ...(variant.content ? { content: variant.content } : {}),
    });
  }, [current, variant, variants.length]);
  useEffect(() => { setSubjectKey(null); }, [activeId]);

  useEffect(() => {
    const g = templates.find(t => t.id === activeId)?.group;
    if (g) setCollapsed(prev => (prev.has(g) ? new Set([...prev].filter(x => x !== g)) : prev));
  }, [activeId, templates]);

  const lightHtml = buildLightHtml(current.html, current.css);

  const isFixed = hasColorSchemeFix(current.html);
  const iframeDoc = !darkMode
    ? lightHtml
    : isFixed
      ? buildFixedDarkHtml(current.html, current.css)
      : buildGmailAutoDarkHtml(current.html, current.css);
  const isDark = darkMode;

  const goPrev = () => {
    if (currentIndex > 0) setActiveId(templates[currentIndex - 1].id);
  };
  const goNext = () => {
    if (currentIndex < templates.length - 1) setActiveId(templates[currentIndex + 1].id);
  };

  /* ── 사이드 패널 색상 ── */
  const sideBg     = isDark ? '#16161a' : '#ffffff';
  const sideBorder = isDark ? '#2a2a2e' : '#e5e7eb';
  const sideHover  = isDark ? '#22222a' : '#f3f4f6';
  const sideActive = isDark ? '#1e2d40' : '#eff6ff';
  const sideActiveBorder = isDark ? '#3b82f6' : '#3b82f6';

  return (
    <div className={`flex flex-col h-screen transition-colors ${isDark ? 'bg-[#111113]' : 'bg-[#f1f3f4]'}`}>
      {/* ── Top Bar ── */}
      <header className={`border-b px-5 py-3 flex items-center justify-between shrink-0 transition-colors ${isDark ? 'bg-[#1f1f21] border-[#333]' : 'bg-white border-gray-200'}`}>
        {/* Logo */}
        <div className="flex items-center gap-3">
          <Mail className="w-5 h-5 text-blue-500" />
          <span className={`font-semibold text-base ${isDark ? 'text-gray-100' : 'text-gray-800'}`}>
            콜드메일 시안 미리보기
          </span>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          {/* Device toggle */}
          <div className={`flex items-center rounded-lg p-1 gap-1 ${isDark ? 'bg-[#2a2a2e]' : 'bg-gray-100'}`}>
            {([
              { value: 'desktop', icon: <Monitor className="w-4 h-4" />, label: 'PC' },
              { value: 'mobile',  icon: <Smartphone className="w-4 h-4" />, label: '모바일' },
            ] as const).map(opt => (
              <button
                key={opt.value}
                onClick={() => setDevice(opt.value)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition-all ${
                  device === opt.value
                    ? isDark ? 'bg-[#3a3a3e] text-white shadow-sm font-medium' : 'bg-white text-gray-900 shadow-sm font-medium'
                    : isDark ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {opt.icon}<span>{opt.label}</span>
              </button>
            ))}
          </div>

          {/* Light / Dark toggle */}
          <div className={`flex items-center rounded-lg p-1 gap-1 ${isDark ? 'bg-[#2a2a2e]' : 'bg-gray-100'}`}>
            <button
              onClick={() => setDarkMode(false)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition-all ${
                !darkMode
                  ? 'bg-white text-gray-900 shadow-sm font-medium'
                  : isDark ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Sun className="w-4 h-4" /><span>라이트</span>
            </button>
            <button
              onClick={() => setDarkMode(true)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition-all ${
                darkMode
                  ? 'bg-[#3a3a3e] text-white shadow-sm font-medium'
                  : isDark ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Moon className="w-4 h-4" /><span>다크</span>
            </button>
          </div>

          {/* 시안 관리 문서 — 그룹·상태·UTM·제목이 전부 여기서 결정된다 */}
          <a
            href={blobUrl(DOC_PATH)}
            target="_blank"
            rel="noopener noreferrer"
            title="시안 관리 문서 열기 — 그룹·사용 상태·UTM·제목을 여기서 고칩니다"
            aria-label="시안 관리 문서를 GitHub에서 열기"
            className={`flex items-center justify-center w-9 h-9 rounded-lg transition-colors ${
              isDark ? 'text-gray-400 hover:text-gray-200 hover:bg-[#2a2a2e]'
                     : 'text-gray-500 hover:text-gray-800 hover:bg-gray-200'
            }`}
          >
            <Settings className="w-4 h-4" />
          </a>

          {/* Code button */}
          <button
            onClick={() => setCodeModalOpen(true)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              isDark ? 'bg-[#3a3a3e] text-gray-200 hover:bg-[#4a4a4e]' : 'bg-gray-800 text-white hover:bg-gray-900'
            }`}
          >
            <Code className="w-4 h-4" />코드 보기
          </button>

          {/* Live editor button */}
          <button
            onClick={() => navigate('/editor')}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors text-white"
            style={{ background: '#03c75a' }}
            onMouseEnter={e => e.currentTarget.style.background = '#02b34e'}
            onMouseLeave={e => e.currentTarget.style.background = '#03c75a'}
          >
            <Code2 className="w-4 h-4" />라이브 에디터
          </button>
        </div>
      </header>

      {/* ── Body: Sidebar + Preview ── */}
      <div className="flex flex-1 overflow-hidden">

        {/* ── Left Sidebar: Template List ── */}
        <aside
          className="flex flex-col shrink-0 transition-colors"
          style={{
            width: 200,
            background: sideBg,
            borderRight: `1px solid ${sideBorder}`,
          }}
        >
          {/* 섹션 제목 */}
          <div className="px-4 pt-4 pb-2 flex items-center gap-2">
            <span
              className="text-xs font-semibold tracking-wider uppercase"
              style={{ color: isDark ? '#555' : '#9ca3af' }}
            >
              시안 목록
            </span>
            {pausedCount > 0 && (
              <button
                onClick={() => setShowPaused(v => !v)}
                aria-pressed={showPaused}
                title={showPaused ? '운영종료 시안 숨기기' : `운영종료 시안 ${pausedCount}개 보기`}
                className="ml-auto px-1.5 py-0.5 rounded text-[10px] transition-colors"
                style={{
                  background: showPaused ? (isDark ? '#3a2a2a' : '#fee2e2') : 'transparent',
                  color: showPaused
                    ? isDark ? '#fca5a5' : '#b91c1c'
                    : isDark ? '#555' : '#9ca3af',
                  border: `1px solid ${showPaused ? 'transparent' : (isDark ? '#2a2a2e' : '#e5e7eb')}`,
                }}
              >
                운영종료 {pausedCount}
              </button>
            )}
          </div>

          {/* 위 화살표 */}
          <div className="px-3 pb-1">
            <button
              onClick={goPrev}
              disabled={currentIndex === 0}
              className="w-full flex items-center justify-center py-1.5 rounded-md transition-all"
              style={{
                background: currentIndex === 0
                  ? 'transparent'
                  : isDark ? '#2a2a2e' : '#f3f4f6',
                color: currentIndex === 0
                  ? isDark ? '#333' : '#d1d5db'
                  : isDark ? '#aaa' : '#6b7280',
                cursor: currentIndex === 0 ? 'default' : 'pointer',
              }}
              title="이전 시안"
            >
              <ChevronUp className="w-4 h-4" />
            </button>
          </div>

          {/* Template List — group별로 묶고, 그룹 제목을 눌러 접는다 */}
          <div className="flex-1 overflow-y-auto flex flex-col">
            {sections.map((sec) => (
              <div key={sec.name}>
                {/* 대분류 — 콜드메일 / 발신템플릿 */}
                <div
                  className="px-3 pt-3 pb-1 text-[10px] font-bold tracking-widest uppercase"
                  style={{ color: isDark ? '#4b5563' : '#cbd5e1' }}
                >
                  {sec.name}
                </div>
                {sec.groups.map((g) => {
              const isCollapsed = collapsed.has(g.name);
              return (
                <div key={g.name}>
                  <button
                    onClick={() => toggleGroup(g.name)}
                    className="w-full flex items-center gap-1.5 px-3 py-2 transition-colors"
                    style={{ color: isDark ? '#6b7280' : '#9ca3af' }}
                    onMouseEnter={e => { e.currentTarget.style.background = sideHover; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                    aria-expanded={!isCollapsed}
                    title={isCollapsed ? `${g.name} 펼치기` : `${g.name} 접기`}
                  >
                    <ChevronDown
                      className="w-3 h-3 shrink-0 transition-transform"
                      style={{ transform: isCollapsed ? 'rotate(-90deg)' : 'none' }}
                    />
                    <span className="text-[11px] font-semibold tracking-wide truncate">{g.name}</span>
                    <span className="ml-auto text-[10px] tabular-nums opacity-60">{g.items.length}</span>
                  </button>

                  {!isCollapsed && g.items.map((t) => {
                    const isActive = t.id === activeId;
                    return (
                      <Fragment key={t.id}>
                      <div
                        className="group relative w-full transition-colors"
                        style={{
                          borderLeft: isActive ? `2px solid ${sideActiveBorder}` : '2px solid transparent',
                          background: isActive ? sideActive : 'transparent',
                          // 아이콘 뒤를 덮어 긴 이름과 겹쳐 보이지 않게 한다
                          ['--row-bg' as string]: isActive ? sideActive : sideBg,
                        } as React.CSSProperties}
                        onMouseEnter={e => {
                          if (isActive) return;
                          e.currentTarget.style.background = sideHover;
                          e.currentTarget.style.setProperty('--row-bg', sideHover);
                        }}
                        onMouseLeave={e => {
                          if (isActive) return;
                          e.currentTarget.style.background = 'transparent';
                          e.currentTarget.style.setProperty('--row-bg', sideBg);
                        }}
                      >
                        <button
                          onClick={() => setActiveId(t.id)}
                          className="w-full text-left pl-7 pr-4 py-2 transition-colors"
                          style={{
                            color: isActive
                              ? isDark ? '#93c5fd' : '#1d4ed8'
                              : isDark ? '#888' : '#374151',
                            fontWeight: isActive ? 600 : 400,
                          }}
                        >
                          <span className="text-xs" style={{ opacity: STATUS_UI[t.status]?.dim ?? 1 }}>
                            {t.label}
                          </span>
                          {STATUS_UI[t.status] && (
                            <span
                              className="ml-1.5 px-1 py-px rounded text-[9px] align-middle"
                              style={{
                                background: STATUS_UI[t.status]!.tone(isDark).bg,
                                color: STATUS_UI[t.status]!.tone(isDark).fg,
                              }}
                            >
                              {STATUS_UI[t.status]!.label}
                            </span>
                          )}
                        </button>
                        {/* 원본 소스 — 레이아웃을 차지하지 않도록 겹쳐 둔다. */}
                        <a
                          href={blobUrl(t.path)}
                          target="_blank"
                          rel="noopener noreferrer"
                          title={`GitHub에서 원본 열기 — ${t.path}`}
                          aria-label={`${t.name} 원본 소스를 GitHub에서 열기`}
                          className="group/link absolute right-0 top-0 bottom-0 px-2 flex items-center opacity-0 transition-opacity group-hover:opacity-100 focus:opacity-100 focus:outline-none"
                          style={{ background: 'var(--row-bg)', color: isDark ? '#93c5fd' : '#1d4ed8' }}
                        >
                          <FileCode2 className="w-3.5 h-3.5 opacity-55 transition-opacity group-hover/link:opacity-100" />
                        </a>
                      </div>

                      {/* 제목 변형 — 선택된 시안에, 변형이 2개 이상일 때만 */}
                      {isActive && (t.subjects?.length ?? 0) > 1 && (
                        <div
                          className="group/sub relative w-full flex items-center gap-1 pl-7 pr-8 py-1.5"
                          style={{ background: isDark ? '#15202e' : '#f8fbff', ['--row-bg' as string]: isDark ? '#15202e' : '#f8fbff' } as React.CSSProperties}
                        >
                          <span className="text-[11px] shrink-0" style={{ color: isDark ? '#6b7280' : '#9ca3af' }}>제목</span>
                          {t.subjects!.map(v => {
                            const on = v.key === variant?.key;
                            return (
                              <button
                                key={v.key}
                                onClick={() => setSubjectKey(v.key)}
                                title={v.text}
                                aria-pressed={on}
                                className="px-2 py-0.5 rounded text-[11px] font-medium transition-all"
                                style={{
                                  background: on ? (isDark ? '#2d4a6b' : '#dbeafe') : 'transparent',
                                  color: on
                                    ? isDark ? '#bfdbfe' : '#1d4ed8'
                                    : isDark ? '#6b7280' : '#9ca3af',
                                }}
                              >
                                {v.key.toUpperCase()}
                              </button>
                            );
                          })}
                          <a
                            href={blobUrl(DOC_PATH)}
                            target="_blank"
                            rel="noopener noreferrer"
                            title={`GitHub에서 제목 원본 열기 — ${DOC_PATH}`}
                            aria-label={`${t.name} 제목 변형을 GitHub에서 열기`}
                            className="group/link absolute right-0 top-0 bottom-0 px-2 flex items-center opacity-0 transition-opacity group-hover/sub:opacity-100 focus:opacity-100 focus:outline-none"
                            style={{ background: 'var(--row-bg)', color: isDark ? '#93c5fd' : '#1d4ed8' }}
                          >
                            <FileCode2 className="w-3.5 h-3.5 opacity-55 transition-opacity group-hover/link:opacity-100" />
                          </a>
                        </div>
                      )}
                      </Fragment>
                    );
                  })}
                </div>
              );
                })}
              </div>
            ))}
          </div>

          {/* 아래 화살표 */}
          <div className="px-3 pt-1 pb-3">
            <button
              onClick={goNext}
              disabled={currentIndex === templates.length - 1}
              className="w-full flex items-center justify-center py-1.5 rounded-md transition-all"
              style={{
                background: currentIndex === templates.length - 1
                  ? 'transparent'
                  : isDark ? '#2a2a2e' : '#f3f4f6',
                color: currentIndex === templates.length - 1
                  ? isDark ? '#333' : '#d1d5db'
                  : isDark ? '#aaa' : '#6b7280',
                cursor: currentIndex === templates.length - 1 ? 'default' : 'pointer',
              }}
              title="다음 시안"
            >
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>

          {/* 현재 위치 표시 */}
          <div
            className="px-4 py-3 text-[11px] text-center"
            style={{
              borderTop: `1px solid ${sideBorder}`,
              color: isDark ? '#444' : '#9ca3af',
            }}
          >
            {currentIndex + 1} / {templates.length}
          </div>
        </aside>

        {/* ── Preview Area ── */}
        <main
          className="flex-1 overflow-auto flex flex-col items-center py-8 px-6"
          style={{ background: isDark ? '#07070a' : '#f1f3f4' }}
        >
          {STATUS_UI[current.status] && (
            <div
              className="w-full max-w-[900px] mb-4 px-4 py-2.5 rounded-lg flex items-center gap-2 text-sm"
              style={{
                background: STATUS_UI[current.status]!.tone(isDark).bg,
                color: STATUS_UI[current.status]!.tone(isDark).fg,
                border: `1px solid ${STATUS_UI[current.status]!.tone(isDark).border}`,
              }}
              role="status"
            >
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>
                <strong>{STATUS_UI[current.status]!.label} 시안</strong>입니다.{' '}
                {STATUS_UI[current.status]!.notice}
              </span>
            </div>
          )}

          {device === 'desktop' ? (
            <DesktopEmailClient subject={subject} iframeDoc={iframeDoc} isDark={isDark} />
          ) : (
            <MobileEmailClient subject={subject} iframeDoc={iframeDoc} isDark={isDark} />
          )}
        </main>
      </div>

      {/* Code Modal */}
      {codeModalOpen && (
        <CodeModal templateName={current.name} fullHtml={buildLightHtml(exportHtml, current.css)} onClose={() => setCodeModalOpen(false)} />
      )}

      {/* Dark Mode Banner – fixed bottom */}
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