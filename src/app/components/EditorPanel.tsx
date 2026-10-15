import { useMemo, useCallback, useState } from 'react';

const NAVER_GREEN = '#03c75a';
import { Copy, Check, RotateCcw, GitBranch } from 'lucide-react';
import { toast } from 'sonner';
import CodeMirror from '@uiw/react-codemirror';
import { html as htmlLang } from '@codemirror/lang-html';
import { linter, lintGutter, type Diagnostic } from '@codemirror/lint';
import { EditorView, drawSelection, highlightActiveLine } from '@codemirror/view';

const VOID_ELEMENTS = new Set([
  'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input',
  'link', 'meta', 'param', 'source', 'track', 'wbr',
]);

const KNOWN_TAGS = new Set([
  'html', 'head', 'body', 'div', 'span', 'p', 'a', 'img', 'table', 'tr',
  'td', 'th', 'thead', 'tbody', 'tfoot', 'ul', 'ol', 'li', 'h1', 'h2',
  'h3', 'h4', 'h5', 'h6', 'strong', 'em', 'b', 'i', 'u', 's', 'br',
  'hr', 'input', 'textarea', 'button', 'form', 'label', 'select', 'option',
  'header', 'footer', 'main', 'nav', 'section', 'article', 'aside',
  'figure', 'figcaption', 'blockquote', 'pre', 'code', 'style', 'script',
  'link', 'meta', 'title', 'base', 'noscript', 'template', 'slot',
  'col', 'colgroup', 'caption', 'center', 'font', 'small', 'sup', 'sub',
  'iframe', 'embed', 'object', 'video', 'audio', 'source', 'track',
  'svg', 'path', 'circle', 'rect', 'line', 'polyline', 'polygon', 'text',
  'g', 'defs', 'use', 'clippath', 'mask', 'pattern', 'symbol',
  'details', 'summary', 'dialog', 'picture', 'map', 'area', 'canvas',
  'abbr', 'address', 'cite', 'data', 'del', 'dfn', 'ins', 'kbd', 'mark',
  'meter', 'output', 'progress', 'q', 'ruby', 'rp', 'rt', 'samp', 'time',
  'var', 'wbr', 'datalist', 'fieldset', 'legend', 'optgroup', 'search',
  'bdi', 'bdo', 'dl', 'dt', 'dd',
]);

// ── CSS 공식 명세(CSS2.1 + CSS3/4) 전체 속성 목록 ──────────────────────────
// 출처: MDN Web Docs / W3C CSS Property Index
// 벤더 프리픽스(-webkit-/-moz-/-ms-/-o-/mso-) 및 CSS 변수(--*)는 별도 로직으로 허용
const KNOWN_CSS_PROPS = new Set([
  // ─ Box Model ─
  'box-sizing','margin','margin-top','margin-right','margin-bottom','margin-left',
  'margin-block','margin-block-start','margin-block-end',
  'margin-inline','margin-inline-start','margin-inline-end',
  'padding','padding-top','padding-right','padding-bottom','padding-left',
  'padding-block','padding-block-start','padding-block-end',
  'padding-inline','padding-inline-start','padding-inline-end',
  'width','min-width','max-width','height','min-height','max-height',
  'block-size','min-block-size','max-block-size',
  'inline-size','min-inline-size','max-inline-size',
  // ─ Border ─
  'border','border-top','border-right','border-bottom','border-left',
  'border-width','border-top-width','border-right-width','border-bottom-width','border-left-width',
  'border-style','border-top-style','border-right-style','border-bottom-style','border-left-width',
  'border-left-style',
  'border-color','border-top-color','border-right-color','border-bottom-color','border-left-color',
  'border-radius','border-top-left-radius','border-top-right-radius',
  'border-bottom-left-radius','border-bottom-right-radius',
  'border-start-start-radius','border-start-end-radius',
  'border-end-start-radius','border-end-end-radius',
  'border-image','border-image-source','border-image-slice','border-image-width',
  'border-image-outset','border-image-repeat',
  'border-collapse','border-spacing',
  'border-block','border-block-start','border-block-end',
  'border-block-color','border-block-style','border-block-width',
  'border-block-start-color','border-block-start-style','border-block-start-width',
  'border-block-end-color','border-block-end-style','border-block-end-width',
  'border-inline','border-inline-start','border-inline-end',
  'border-inline-color','border-inline-style','border-inline-width',
  'border-inline-start-color','border-inline-start-style','border-inline-start-width',
  'border-inline-end-color','border-inline-end-style','border-inline-end-width',
  // ─ Display / Overflow ─
  'display','visibility','overflow','overflow-x','overflow-y',
  'overflow-block','overflow-inline','overflow-anchor','overflow-clip-margin','overflow-wrap',
  'clip','clip-path','clip-rule',
  'object-fit','object-position','aspect-ratio','contain','isolation','resize',
  // ─ Positioning ─
  'position','top','right','bottom','left','z-index','float','clear',
  'inset','inset-block','inset-block-start','inset-block-end',
  'inset-inline','inset-inline-start','inset-inline-end',
  // ─ Flexbox ─
  'flex','flex-direction','flex-wrap','flex-flow',
  'flex-grow','flex-shrink','flex-basis',
  'align-items','align-self','align-content',
  'justify-content','justify-items','justify-self',
  'order','gap','row-gap','column-gap',
  'place-items','place-self','place-content',
  // ─ Grid ─
  'grid','grid-template','grid-template-columns','grid-template-rows','grid-template-areas',
  'grid-auto-columns','grid-auto-rows','grid-auto-flow',
  'grid-column','grid-column-start','grid-column-end',
  'grid-row','grid-row-start','grid-row-end','grid-area',
  // ─ Columns ─
  'columns','column-count','column-fill','column-gap','column-rule',
  'column-rule-color','column-rule-style','column-rule-width',
  'column-span','column-width',
  // ─ Typography ─
  'color','font','font-family','font-size','font-weight','font-style',
  'font-variant','font-variant-caps','font-variant-numeric','font-variant-ligatures',
  'font-variant-alternates','font-variant-east-asian','font-variant-position',
  'font-stretch','font-synthesis','font-kerning','font-feature-settings',
  'font-size-adjust','font-optical-sizing','font-variation-settings','font-language-override',
  'line-height','line-break','line-clamp',
  'letter-spacing','text-align','text-align-last',
  'text-decoration','text-decoration-color','text-decoration-line',
  'text-decoration-style','text-decoration-thickness','text-decoration-skip-ink',
  'text-underline-offset','text-underline-position',
  'text-transform','text-indent','text-shadow','text-overflow',
  'text-rendering','text-emphasis','text-emphasis-color',
  'text-emphasis-position','text-emphasis-style',
  'text-justify','text-orientation','text-combine-upright','text-wrap',
  'white-space','word-break','word-spacing','word-wrap',
  'vertical-align','direction','unicode-bidi','writing-mode',
  'hanging-punctuation','hyphens','tab-size','quotes',
  'orphans','widows','caption-side','empty-cells',
  'dominant-baseline','text-anchor',
  // ─ Background ─
  'background','background-color','background-image',
  'background-repeat','background-size','background-position',
  'background-position-x','background-position-y',
  'background-attachment','background-clip','background-origin','background-blend-mode',
  // ─ Visual Effects ─
  'opacity','filter','backdrop-filter','mix-blend-mode',
  'box-shadow','outline','outline-color','outline-width','outline-style','outline-offset',
  'cursor','pointer-events','user-select','appearance','caret-color',
  'image-rendering','image-orientation',
  'shape-outside','shape-image-threshold','shape-margin','shape-rendering',
  // ─ Transform & Animation ─
  'transform','transform-origin','transform-style','transform-box',
  'perspective','perspective-origin','backface-visibility',
  'translate','rotate','scale',
  'transition','transition-property','transition-duration',
  'transition-timing-function','transition-delay',
  'animation','animation-name','animation-duration','animation-timing-function',
  'animation-delay','animation-iteration-count','animation-direction',
  'animation-fill-mode','animation-play-state','animation-timeline',
  'will-change','offset','offset-path','offset-distance','offset-rotate',
  // ─ Table ─
  'table-layout',
  // ─ List ─
  'list-style','list-style-type','list-style-image','list-style-position',
  // ─ Scroll ─
  'scroll-behavior','scroll-snap-type','scroll-snap-align','scroll-snap-stop',
  'scroll-margin','scroll-margin-top','scroll-margin-right','scroll-margin-bottom','scroll-margin-left',
  'scroll-margin-block','scroll-margin-block-start','scroll-margin-block-end',
  'scroll-margin-inline','scroll-margin-inline-start','scroll-margin-inline-end',
  'scroll-padding','scroll-padding-top','scroll-padding-right','scroll-padding-bottom','scroll-padding-left',
  'scroll-padding-block','scroll-padding-block-start','scroll-padding-block-end',
  'scroll-padding-inline','scroll-padding-inline-start','scroll-padding-inline-end',
  'overscroll-behavior','overscroll-behavior-x','overscroll-behavior-y',
  'overscroll-behavior-block','overscroll-behavior-inline',
  // ─ Counter / Content ─
  'counter-increment','counter-reset','counter-set','content','all',
  // ─ Print / Break ─
  'page-break-before','page-break-after','page-break-inside',
  'break-before','break-after','break-inside',
  // ─ SVG ─
  'fill','fill-opacity','fill-rule','stroke','stroke-width',
  'stroke-dasharray','stroke-dashoffset','stroke-linecap','stroke-linejoin',
  'stroke-miterlimit','stroke-opacity','vector-effect','paint-order',
  'marker','marker-start','marker-mid','marker-end',
  'stop-color','stop-opacity','flood-color','flood-opacity','lighting-color',
  'color-interpolation','color-interpolation-filters','color-rendering',
  'enable-background','glyph-orientation-horizontal','glyph-orientation-vertical',
  // ─ Masking ─
  'mask','mask-image','mask-mode','mask-repeat','mask-position',
  'mask-clip','mask-origin','mask-size','mask-composite','mask-type',
  // ─ Pointer / Touch ─
  'touch-action',
]);

// CSS 속성 허용 여부: 벤더 프리픽스·mso-·CSS 변수는 무조건 허용
function isValidCssProp(prop: string): boolean {
  if (!prop) return true;
  // CSS 사용자 정의 속성 (--foo)
  if (prop.startsWith('--')) return true;
  // 벤더 프리픽스
  if (
    prop.startsWith('-webkit-') ||
    prop.startsWith('-moz-') ||
    prop.startsWith('-ms-') ||
    prop.startsWith('-o-') ||
    prop.startsWith('mso-') ||      // Microsoft Outlook
    prop.startsWith('-epub-') ||
    prop.startsWith('-apple-')
  ) return true;
  return KNOWN_CSS_PROPS.has(prop);
}

/* ── HTML Linter ── */
function createHtmlLinter() {
  return linter((view): Diagnostic[] => {
    const code = view.state.doc.toString();
    const diagnostics: Diagnostic[] = [];
    const stack: Array<{ tag: string; from: number; to: number }> = [];
    const tagRegex = /<(\/?)([a-zA-Z][a-zA-Z0-9-]*)([^>]*?)(\/?)>/gs;
    let match: RegExpExecArray | null;

    // 문자 위치 → 줄 번호
    const getLine = (pos: number) => code.slice(0, pos).split('\n').length;

    while ((match = tagRegex.exec(code)) !== null) {
      const [fullMatch, closing, rawTag, attrs, selfClose] = match;
      const tag = rawTag.toLowerCase();
      const from = match.index;
      const to = from + fullMatch.length;

      // 알 수 없는 태그
      if (!KNOWN_TAGS.has(tag)) {
        diagnostics.push({
          from, to, severity: 'error',
          message: `알 수 없는 태그: <${tag}> — 오탈자를 확인하세요.`,
        });
      }

      // 닫힌 태그 검증
      if (closing === '/') {
        if (!VOID_ELEMENTS.has(tag)) {
          let foundIdx = -1;
          for (let i = stack.length - 1; i >= 0; i--) {
            if (stack[i].tag === tag) { foundIdx = i; break; }
          }
          if (foundIdx === -1) {
            diagnostics.push({
              from, to, severity: 'warning',
              message: `</${tag}>에 대응하는 여는 태그가 없습니다.`,
            });
          } else {
            // 잘못 중첩된 태그들: 해당 여는 태그 위치부터 현재 닫힘 태그 직전까지 범위 표시
            for (let i = stack.length - 1; i > foundIdx; i--) {
              const unc = stack[i];
              if (!['html', 'head', 'body'].includes(unc.tag)) {
                const openLine = getLine(unc.from);
                const closeLine = getLine(from);
                diagnostics.push({
                  from: unc.from,
                  to: to, // ← 잘못된 닫힘 태그 끝까지 영역 표시
                  severity: 'warning',
                  message: `<${unc.tag}>(${openLine}번째 줄)가 닫히지 않은 채 </${tag}>(${closeLine}번째 줄)를 만났습니다 — ${openLine}~${closeLine}번째 줄 영역 영향`,
                });
              }
            }
            stack.splice(foundIdx);
          }
        }
      } else if (selfClose !== '/' && !VOID_ELEMENTS.has(tag)) {
        stack.push({ tag, from, to });
      }

      // alt 누락
      if (tag === 'img' && !/\balt\s*=/.test(attrs)) {
        diagnostics.push({ from, to, severity: 'info', message: '<img>에 alt 속성이 없습니다.' });
      }

      // style 속성 내 CSS 속성명 오타 감지
      const styleMatch = attrs.match(/style\s*=\s*["']([^"']*)["']/);
      if (styleMatch) {
        const styleValue = styleMatch[1];
        const styleValueStart = code.indexOf(styleMatch[1], from);
        const declarations = styleValue.split(';');
        let offset = 0;
        for (const decl of declarations) {
          const trimmed = decl.trim();
          if (!trimmed) { offset += decl.length + 1; continue; }

          const colonIdx = trimmed.indexOf(':');
          if (colonIdx === -1) {
            const declStart = styleValueStart + styleValue.indexOf(trimmed, offset - decl.length + (decl.length - decl.trimStart().length));
            diagnostics.push({
              from: Math.max(from, declStart),
              to: Math.min(to, declStart + trimmed.length),
              severity: 'error',
              message: `CSS 형식 오류: "${trimmed}" — 속성:값 형식이어야 합니다.`,
            });
          } else {
            const propName = trimmed.slice(0, colonIdx).trim().toLowerCase();
            if (propName && !isValidCssProp(propName)) {
              const searchFrom = offset > 0 ? offset - 1 : 0;
              const declPosInStyle = styleValue.indexOf(decl.trimStart(), searchFrom);
              const propStart = styleValueStart + declPosInStyle + (decl.trimStart().indexOf(propName));
              diagnostics.push({
                from: Math.max(from, propStart),
                to: Math.max(from, propStart) + propName.length,
                severity: 'error',
                message: `알 수 없는 CSS 속성: "${propName}" — 오탈자를 확인하세요.`,
              });
            }
          }
          offset += decl.length + 1;
        }
      }
    }

    // 끝까지 닫히지 않은 태그: 여는 태그부터 문서 끝까지 영역 표시
    const docEnd = code.length;
    const totalLines = getLine(docEnd);
    for (const unc of stack) {
      if (!['html', 'head', 'body'].includes(unc.tag)) {
        const openLine = getLine(unc.from);
        diagnostics.push({
          from: unc.from,
          to: docEnd, // ← 문서 끝까지 영역 표시
          severity: 'warning',
          message: `<${unc.tag}>(${openLine}번째 줄)가 닫히지 않았습니다 — ${openLine}~${totalLines}번째 줄(문서 끝)까지 영향`,
        });
      }
    }

    return diagnostics;
  });
}

/* ── Diagnostic summary bar ── */
function DiagnosticBar({ code }: { code: string }) {
  const counts = useMemo(() => {
    let errors = 0, warnings = 0, infos = 0;
    const tagRegex = /<(\/?)([a-zA-Z][a-zA-Z0-9-]*)([^>]*?)(\/?)>/gs;
    const stack: string[] = [];
    let m: RegExpExecArray | null;

    while ((m = tagRegex.exec(code)) !== null) {
      const [, closing, rawTag, attrs] = m;
      const tag = rawTag.toLowerCase();
      if (!KNOWN_TAGS.has(tag)) errors++;
      if (tag === 'img' && !/\balt\s*=/.test(attrs)) infos++;
      const styleMatch = attrs.match(/style\s*=\s*["']([^"']*)["']/);
      if (styleMatch) {
        const declarations = styleMatch[1].split(';');
        for (const decl of declarations) {
          const trimmed = decl.trim();
          if (!trimmed) continue;
          const colonIdx = trimmed.indexOf(':');
          if (colonIdx === -1) { errors++; continue; }
          const propName = trimmed.slice(0, colonIdx).trim().toLowerCase();
          if (propName && !isValidCssProp(propName)) errors++;
        }
      }
      if (closing === '/') {
        const idx = stack.lastIndexOf(tag);
        if (idx === -1 && !VOID_ELEMENTS.has(tag)) warnings++;
        else if (idx !== -1) { warnings += stack.length - 1 - idx; stack.splice(idx); }
      } else if (!VOID_ELEMENTS.has(tag)) {
        stack.push(tag);
      }
    }
    warnings += stack.filter(t => !['html', 'head', 'body'].includes(t)).length;
    return { errors, warnings, infos };
  }, [code]);

  return (
    <div className="flex items-center gap-3 text-[10px]">
      {counts.errors > 0 && (
        <span className="flex items-center gap-1" style={{ color: '#f85149' }}>
          <span className="w-2 h-2 rounded-full inline-block" style={{ background: '#f85149' }} />
          오류 {counts.errors}
        </span>
      )}
      {counts.warnings > 0 && (
        <span className="flex items-center gap-1" style={{ color: '#e3b341' }}>
          <span className="w-2 h-2 rounded-full inline-block" style={{ background: '#e3b341' }} />
          경고 {counts.warnings}
        </span>
      )}
      {counts.infos > 0 && (
        <span className="flex items-center gap-1" style={{ color: '#58a6ff' }}>
          <span className="w-2 h-2 rounded-full inline-block" style={{ background: '#58a6ff' }} />
          정보 {counts.infos}
        </span>
      )}
      {counts.errors === 0 && counts.warnings === 0 && counts.infos === 0 && (
        <span className="flex items-center gap-1" style={{ color: NAVER_GREEN }}>
          <span className="w-2 h-2 rounded-full inline-block" style={{ background: NAVER_GREEN }} />
          문제 없음
        </span>
      )}
    </div>
  );
}

/* ── CodeMirror 통합 테마 ──
   .tok-* 클래스를 직접 오버라이드해 syntaxHighlighting 비활성화 없이도
   최소 컬러만 남기고 오류 밑줄을 확실히 표시합니다.
*/
const editorTheme = EditorView.theme({
  /* 베이스 */
  '&': { backgroundColor: '#0d1117', color: '#c9d1d9', height: '100%', fontSize: '13px' },
  '&.cm-focused': { outline: 'none' },
  '.cm-scroller': { backgroundColor: '#0d1117', fontFamily: '"Fira Code","JetBrains Mono",Consolas,monospace' },
  '.cm-content': { caretColor: '#58a6ff', padding: '12px 0' },
  '.cm-gutters': { backgroundColor: '#0d1117', borderRight: '1px solid #21262d', color: '#484f58' },
  '.cm-lineNumbers .cm-gutterElement': { paddingRight: '16px', paddingLeft: '8px' },
  '.cm-activeLine': { backgroundColor: '#161b22' },
  '.cm-activeLineGutter': { backgroundColor: '#161b22' },
  '.cm-selectionBackground': { backgroundColor: '#3b5070 !important' },
  '&.cm-focused .cm-selectionBackground': { backgroundColor: '#264f78 !important' },
  '.cm-cursor,.cm-dropCursor': { borderLeftColor: '#58a6ff' },
  '.cm-matchingBracket': { backgroundColor: '#264f78', outline: 'none' },

  /* ── 문법 강조: 태그명·문자열 2가지만, 나머지는 기본색으로 통일 ── */
  '.tok-tagName':                     { color: '#79c0ff !important' },
  '.tok-typeName':                    { color: '#79c0ff !important' },
  '.tok-string':                      { color: '#a5d6ff !important' },
  '.tok-attributeValue':              { color: '#a5d6ff !important' },
  '.tok-comment':                     { color: '#484f58 !important', fontStyle: 'italic' },
  /* 나머지 모두 기본색으로 덮어쓰기 */
  '.tok-attributeName':               { color: '#c9d1d9 !important' },
  '.tok-angleBracket':                { color: '#c9d1d9 !important' },
  '.tok-operator':                    { color: '#c9d1d9 !important' },
  '.tok-punctuation':                 { color: '#c9d1d9 !important' },
  '.tok-meta':                        { color: '#c9d1d9 !important' },
  '.tok-keyword':                     { color: '#c9d1d9 !important' },
  '.tok-propertyName':                { color: '#c9d1d9 !important' },
  '.tok-number':                      { color: '#c9d1d9 !important' },
  '.tok-unit':                        { color: '#c9d1d9 !important' },
  '.tok-color':                       { color: '#c9d1d9 !important' },
  '.tok-variableName':                { color: '#c9d1d9 !important' },
  '.tok-name':                        { color: '#c9d1d9 !important' },
  '.tok-docComment':                  { color: '#484f58 !important', fontStyle: 'italic' },

  /* ── 오류/경고 밑줄 ── */
  '.cm-lintRange-error':   { backgroundImage: 'none !important', borderBottom: '2px solid #f85149' },
  '.cm-lintRange-warning': { backgroundImage: 'none !important', borderBottom: '2px solid #e3b341' },
  '.cm-lintRange-info':    { backgroundImage: 'none !important', borderBottom: '1px dashed #58a6ff' },

  /* lint gutter */
  '.cm-gutter-lint .cm-gutterElement': { paddingTop: '2px' },
  '.cm-lint-marker-error':   { color: '#f85149' },
  '.cm-lint-marker-warning': { color: '#e3b341' },
  '.cm-lint-marker-info':    { color: '#58a6ff' },

  /* tooltip */
  '.cm-tooltip': {
    backgroundColor: '#1c2128', border: '1px solid #30363d',
    borderRadius: '6px', color: '#e6edf3', fontSize: '12px',
  },
  '.cm-tooltip-lint': {
    backgroundColor: '#1c2128', border: '1px solid #30363d', borderRadius: '6px',
  },
  '.cm-diagnostic-error':   { borderLeft: '3px solid #f85149 !important', paddingLeft: '6px' },
  '.cm-diagnostic-warning': { borderLeft: '3px solid #e3b341 !important', paddingLeft: '6px' },
  '.cm-diagnostic-info':    { borderLeft: '3px solid #58a6ff !important', paddingLeft: '6px' },
}, { dark: true });


/**
 * 미리보기 오른쪽에 붙는 코드 편집 패널.
 * 예전에는 /editor 라는 별도 화면이라 시안 목록이 보이지 않았다.
 */
export function EditorPanel({
  code, onChange, onReset, onCommit, fileName, dirty,
}: {
  code: string;
  onChange: (v: string) => void;
  onReset: () => void;
  onCommit: () => void;
  fileName: string;
  dirty: boolean;
}) {
  const [copied, setCopied] = useState(false);
  const extensions = useMemo(() => [
    htmlLang(),
    createHtmlLinter(),
    lintGutter(),
    editorTheme,
    drawSelection(),
    highlightActiveLine(),
    EditorView.lineWrapping,
  ], []);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      toast.success('코드가 복사되었습니다!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('복사에 실패했습니다.');
    }
  }, [code]);

  const btn = 'flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs transition-colors';
  return (
    <div className="flex flex-col h-full" style={{ background: '#0d1117' }}>
      <div
        className="flex items-center gap-1.5 px-3 py-2 shrink-0"
        style={{ borderBottom: '1px solid #21262d' }}
      >
        <span className="text-[11px] font-mono truncate" style={{ color: '#8b949e' }}>
          {fileName}
        </span>
        {dirty && (
          <span className="text-[10px] px-1 rounded" style={{ background: '#3a2a1a', color: '#e3b341' }}>
            수정됨
          </span>
        )}
        <div className="flex-1" />
        <button onClick={onReset} disabled={!dirty} title="원본 코드로 되돌리기"
          className={btn} style={{ color: dirty ? '#8b949e' : '#30363d' }}>
          <RotateCcw className="w-3.5 h-3.5" />초기화
        </button>
        <button onClick={handleCopy} title="메일에 붙여 넣을 코드를 복사합니다 — 보이는 코드가 곧 발송 코드입니다" className={btn} style={{ color: '#8b949e' }}>
          {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          {copied ? '복사됨' : '복사'}
        </button>
        <button onClick={onCommit} className={btn}
          title="코드를 복사하고 GitHub에서 이 파일을 엽니다"
          style={{ background: '#238636', color: '#fff' }}>
          <GitBranch className="w-3.5 h-3.5" />커밋
        </button>
      </div>

      <div className="flex-1 overflow-hidden">
        <CodeMirror
          value={code}
          onChange={onChange}
          extensions={extensions}
          theme="dark"
          basicSetup={{
            lineNumbers: true,
            highlightActiveLine: false,
            highlightActiveLineGutter: true,
            foldGutter: true,
            autocompletion: true,
            bracketMatching: true,
            closeBrackets: true,
            indentOnInput: true,
            tabSize: 2,
            drawSelection: false,
          }}
          style={{ height: '100%' }}
        />
      </div>

      <DiagnosticBar code={code} />
    </div>
  );
}
