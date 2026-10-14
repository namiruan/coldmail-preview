import { useState, useCallback, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router';
import {
  Monitor, Smartphone, Copy, Check, Code2, GitBranch,
  ChevronDown, ChevronUp, ChevronLeft, MoreHorizontal,
  Sun, Moon, RotateCcw, GripVertical, Star,
} from 'lucide-react';
import { toast } from 'sonner';
import { DEFAULT_TEMPLATES } from '../data/defaultTemplates';
import { editUrl } from '../data/repo';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import CodeMirror from '@uiw/react-codemirror';
import { html as htmlLang } from '@codemirror/lang-html';
import { linter, lintGutter, type Diagnostic } from '@codemirror/lint';
import { EditorView, drawSelection, highlightActiveLine } from '@codemirror/view';

type DeviceMode = 'desktop' | 'mobile';

const EMAIL_META = {
  from: '김반장 <ecard@kbz.co.kr>',
  fromShort: '김반장',
  fromInitial: '김',
  to: '담당자님',
  date: '2026년 3월 30일 (월) 오전 10:24',
};

const NAVER_GREEN = '#03c75a';


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

function getSubject(html: string): string {
  const match = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  return match ? match[1].trim() : '이메일 미리보기';
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

/* ── Desktop preview ── */
function DesktopPreview({ subject, srcDoc, isDark }: { subject: string; srcDoc: string; isDark: boolean }) {
  const [starred, setStarred] = useState(false);

  const NAVER_GREEN_D = '#03c75a';
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

  type FolderItem = { id: string; label: string; count?: number | string; active?: boolean; level?: number; expandable?: boolean; extra?: string; countBlue?: boolean; };
  const folders: FolderItem[] = [
    { id: 'all',      label: '전체메일',            extra: '정리하기', level: 0 },
    { id: 'inbox',    label: '받은메일함',           count: 859, active: true, level: 0 },
    { id: 'sent',     label: '보낸메일함',           level: 0 },
    { id: 'read',     label: '수신확인',             level: 0 },
    { id: 'draft',    label: '임시보관함',           level: 0 },
    { id: 'self',     label: '내게쓴메일함',         expandable: true, level: 0 },
    { id: 'self1',    label: '새 메일함',            count: 1, level: 1 },
    { id: 'self2',    label: '새 메일함 (2)',         level: 1 },
    { id: 'smart',    label: '스마트메일함',          expandable: true, level: 0 },
    { id: 'promo',    label: '프로모션',             count: '999+', level: 1, countBlue: true },
    { id: 'bill',     label: '청구·결제',            count: 224, level: 1 },
    { id: 'myfolder', label: '내 메일함',            expandable: true, level: 0 },
    { id: 'work',     label: '업무메일',             level: 1 },
    { id: 'spam',     label: '스팸메일함',            count: 14, level: 0 },
  ];

  return (
    <div className="w-full rounded-xl overflow-hidden"
      style={{ border: `1px solid ${isDark ? '#3a3a44' : border}`, boxShadow: isDark ? '0 8px 48px 0 rgba(0,0,0,0.72), 0 2px 12px 0 rgba(0,0,0,0.5)' : '0 4px 32px 0 rgba(0,0,0,0.13)' }}>
      {/* 브라우저 chrome */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', background: isDark ? '#2c2c32' : '#ebebeb', borderBottom: `1px solid ${border}` }}>
        <div style={{ display: 'flex', gap: 6 }}>
          <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#ff5f57' }} />
          <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#ffbd2e' }} />
          <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#28c840' }} />
        </div>
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '3px 12px', borderRadius: 6, background: bg, border: `1px solid ${border}`, maxWidth: 260, width: '100%' }}>
            <svg viewBox="0 0 24 24" style={{ width: 12, height: 12, fill: 'none', stroke: ts, strokeWidth: 2, flexShrink: 0 }}><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            <span style={{ fontSize: 12, color: ts }}>mail.naver.com</span>
          </div>
        </div>
      </div>

      {/* 네이버메일 UI */}
      <div style={{ height: '65vh', display: 'flex', flexDirection: 'column', background: bgPage }}>
        {/* 상단 헤더 */}
        <div style={{ height: 46, flexShrink: 0, background: bgHeader, borderBottom: `1px solid ${border}`, display: 'flex', alignItems: 'center', padding: '0 12px', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, width: 182, flexShrink: 0 }}>
            <div style={{ width: 25, height: 25, background: NAVER_GREEN_D, borderRadius: 5, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span style={{ color: 'white', fontWeight: 900, fontSize: 14, fontFamily: 'Arial Black, sans-serif', lineHeight: 1 }}>N</span>
            </div>
            <span style={{ fontWeight: 700, fontSize: 15, color: tp, letterSpacing: '-0.3px' }}>메일</span>
          </div>
          <div style={{ flex: 1, display: 'flex', justifyContent: 'center', gap: 2 }}>
            {[
              { d: 'M20 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2zm0 4-8 5-8-5', title: '받은메일' },
              { d: 'M21 15H3M21 9H3M21 12H8', title: '메일함' },
              { d: 'M9 11l3 3L22 4M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11', title: '수신확인' },
              { d: 'M12 20h9M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z', title: '설정' },
              { d: 'M5 5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16l-7-3.5L5 21V5z', title: '북마크' },
              { d: 'M4 6h16M4 12h16M4 18h16', title: '더보기' },
            ].map((icon, i) => (
              <button key={i} title={icon.title} style={{ width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 4, color: NAVER_GREEN_D, background: 'transparent', border: 'none', cursor: 'pointer' }}>
                <svg viewBox="0 0 24 24" style={{ width: 16, height: 16, fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' }}><path d={icon.d} /></svg>
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 12, color: ts, padding: '2px 6px', border: `1px solid ${border}`, borderRadius: 3 }}>
              <div style={{ width: 18, height: 18, borderRadius: '50%', background: isDark ? '#333' : '#ddd', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, color: ts }}>A</div>
              <span>ABC</span><ChevronDown style={{ width: 11, height: 11 }} />
            </div>
            <button style={{ width: 28, height: 28, background: 'transparent', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: ts, position: 'relative' }}>
              <svg viewBox="0 0 24 24" style={{ width: 16, height: 16, fill: 'none', stroke: 'currentColor', strokeWidth: 2 }}><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
              <span style={{ position: 'absolute', top: 3, right: 3, background: '#e53e3e', color: 'white', fontSize: 7, borderRadius: 10, padding: '1px 3px', lineHeight: 1 }}>21</span>
            </button>
          </div>
        </div>

        {/* 바디: 사이드바 + 메일 뷰 */}
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          {/* 사이드바 */}
          <div style={{ width: 182, flexShrink: 0, background: bgSide, borderRight: `1px solid ${border}`, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
            <div style={{ padding: '10px 10px 6px', display: 'flex', gap: 5 }}>
              <button style={{ flex: 1, background: NAVER_GREEN_D, color: 'white', border: 'none', borderRadius: 4, padding: '7px 0', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>메일 쓰기</button>
              <button style={{ flex: 1, background: 'transparent', color: ts, border: `1px solid ${border}`, borderRadius: 4, padding: '7px 0', fontSize: 12, cursor: 'pointer' }}>내게 쓰기</button>
            </div>
            <div style={{ display: 'flex', padding: '4px 4px 8px', borderBottom: `1px solid ${borderLight}` }}>
              {[{ top: '999+', sub: '안읽음', blue: true }, { top: '☆', sub: '중요', blue: false }, { top: '📎', sub: '첨부', blue: false }, { top: 'TO', sub: 'TO', blue: false }].map((s, i) => (
                <div key={i} style={{ flex: 1, textAlign: 'center', cursor: 'pointer', padding: '2px 0' }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: s.blue ? NAVER_BLUE : ts }}>{s.top}</div>
                  <div style={{ fontSize: 9, color: ts, marginTop: 1 }}>{s.sub}</div>
                </div>
              ))}
            </div>
            <div style={{ flex: 1 }}>
              {folders.map((f) => {
                const isActive = !!f.active;
                const lvl = f.level ?? 0;
                return (
                  <div key={f.id} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: lvl === 1 ? '4px 10px 4px 22px' : '5px 10px', background: isActive ? activeFolder : 'transparent', cursor: 'pointer', fontSize: lvl === 1 ? 11 : 12, color: isActive ? NAVER_BLUE : lvl === 1 ? ts : tp, fontWeight: isActive ? 700 : 400 }}
                    onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = hov; }}
                    onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}>
                    {lvl === 0 && <svg viewBox="0 0 16 16" style={{ width: 13, height: 13, flexShrink: 0, fill: isActive ? NAVER_BLUE : ts }}><path d="M1 3.5A1.5 1.5 0 0 1 2.5 2h2.764c.958 0 1.76.56 2.311 1.184C8.985 3.648 9.48 4 10 4h3.5A1.5 1.5 0 0 1 15 5.5v7a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 1 12.5v-9z"/></svg>}
                    {lvl === 1 && <span style={{ color: ts, fontSize: 10, opacity: 0.45, marginRight: 1 }}>└</span>}
                    <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.label}</span>
                    {f.extra && <span style={{ fontSize: 10, color: NAVER_BLUE, cursor: 'pointer' }}>{f.extra}</span>}
                    {f.count != null && <span style={{ fontSize: 10, fontWeight: 700, flexShrink: 0, color: f.countBlue ? NAVER_BLUE : isActive ? NAVER_BLUE : ts }}>{f.count}</span>}
                    {f.expandable && <ChevronDown style={{ width: 11, height: 11, color: ts, flexShrink: 0 }} />}
                  </div>
                );
              })}
            </div>
          </div>

          {/* 메일 본문 영역 */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            {/* 브레드크럼 */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 14px', background: bg, borderBottom: `1px solid ${border}`, flexShrink: 0 }}>
              <ChevronLeft style={{ width: 14, height: 14, color: ts, flexShrink: 0 }} />
              <span style={{ fontSize: 13, color: ts }}>받은메일함</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: NAVER_BLUE }}>859</span>
              <span style={{ fontSize: 12, color: ts }}>/ 1753</span>
              <div style={{ flex: 1 }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '4px 8px', border: `1px solid ${border}`, borderRadius: 3, background: bgPage, minWidth: 100 }}>
                <svg viewBox="0 0 24 24" style={{ width: 12, height: 12, fill: 'none', stroke: ts, strokeWidth: 2, flexShrink: 0 }}><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                <span style={{ fontSize: 12, color: ts }}>메일 검색</span>
              </div>
            </div>
            {/* 액션 툴바 */}
            <div style={{ display: 'flex', alignItems: 'center', padding: '5px 14px', background: bg, borderBottom: `1px solid ${border}`, flexShrink: 0 }}>
              {['답장', '전체답장', '전달', '삭제', '스팸신고', '안읽음'].map((btn) => (
                <button key={btn} style={{ fontSize: 12, color: tp, background: 'transparent', border: 'none', padding: '4px 9px', cursor: 'pointer', borderRight: `1px solid ${border}` }}
                  onMouseEnter={e => (e.currentTarget.style.color = NAVER_GREEN_D)}
                  onMouseLeave={e => (e.currentTarget.style.color = tp)}>{btn}</button>
              ))}
              {['이동 ▾', '더보기 ▾'].map(btn => (
                <button key={btn} style={{ fontSize: 12, color: tp, background: 'transparent', border: 'none', padding: '4px 9px', cursor: 'pointer' }}
                  onMouseEnter={e => (e.currentTarget.style.color = NAVER_GREEN_D)}
                  onMouseLeave={e => (e.currentTarget.style.color = tp)}>{btn}</button>
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
                  <button onClick={() => setStarred(s => !s)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: starred ? '#f59e0b' : ts, flexShrink: 0 }}>
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
                    <span style={{ padding: '2px 8px', background: bgPage, border: `1px solid ${border}`, borderRadius: 2, fontSize: 12, color: tp }}>namiruan@naver.com</span>
                  </div>
                  <div style={{ fontSize: 12, color: ts, paddingLeft: 66 }}>{EMAIL_META.date}</div>
                </div>
                {/* 본문 iframe */}
                <iframe key={srcDoc} srcDoc={srcDoc} title="라이브 미리보기" className="w-full border-0"
                  style={{ minHeight: 300, display: 'block' }}
                  onLoad={e => { try { const h = e.currentTarget.contentDocument?.body?.scrollHeight; if (h) e.currentTarget.style.height = h + 'px'; } catch {} }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Mobile preview ── */
function MobilePreview({ subject, srcDoc, isDark }: { subject: string; srcDoc: string; isDark: boolean }) {
  const [starred, setStarred] = useState(false);
  const NAVER_GREEN_M = '#03c75a';

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
      <div style={{
        width: 375, borderRadius: '3rem',
        border: `10px solid ${isDark ? '#2e2e2e' : '#1a1a1a'}`,
        outline: isDark ? '1px solid #3a3a44' : 'none',
        boxShadow: isDark
          ? '0 0 0 1px rgba(255,255,255,0.07), 0 8px 48px 0 rgba(0,0,0,0.72), 0 2px 12px 0 rgba(0,0,0,0.5)'
          : '0 8px 40px 0 rgba(0,0,0,0.22)',
        overflow: 'hidden', position: 'relative', display: 'flex', flexDirection: 'column',
      }}>
        {/* Dynamic Island */}
        <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', zIndex: 10, width: 120, height: 34, background: isDark ? '#0a0a0a' : '#000', borderRadius: '0 0 20px 20px' }} />

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

        {/* 앱 내비바 */}
        <div style={{ display: 'flex', alignItems: 'center', padding: '4px 8px 8px', background: navBg, borderBottom: `1px solid ${phoneBorder}` }}>
          <button style={{ display: 'flex', alignItems: 'center', gap: 2, background: 'none', border: 'none', cursor: 'pointer', padding: '4px 4px 4px 0', color: NAVER_GREEN_M }}>
            <ChevronLeft style={{ width: 20, height: 20 }} />
            <span style={{ fontSize: 13 }}>받은메일함</span>
          </button>
          <div style={{ flex: 1 }} />
          {[
            <svg key="reply" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 19, height: 19 }}><polyline points="9 17 4 12 9 7"/><path d="M20 18v-2a4 4 0 0 0-4-4H4"/></svg>,
            <svg key="trash" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 19, height: 19 }}><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>,
            <MoreHorizontal key="more" style={{ width: 19, height: 19 }} />,
          ].map((icon, i) => (
            <button key={i} style={{ width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: 'none', cursor: 'pointer', color: NAVER_GREEN_M }}>{icon}</button>
          ))}
        </div>

        {/* 메일 상세 */}
        <div style={{ flex: 1, overflowY: 'auto', background: phoneBgSub, display: 'flex', flexDirection: 'column', maxHeight: 590 }}>
          {/* 제목 + 별표 */}
          <div style={{ padding: '14px 16px 10px', background: phoneBg, borderBottom: `1px solid ${phoneBorder}`, display: 'flex', alignItems: 'flex-start', gap: 8 }}>
            <span style={{ flex: 1, fontSize: 15, color: tp, fontWeight: 600, lineHeight: 1.4 }}>{subject}</span>
            <button onClick={() => setStarred(s => !s)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, flexShrink: 0, color: starred ? '#f59e0b' : ts, marginTop: 2 }}>
              <Star style={{ width: 17, height: 17 }} className={starred ? 'fill-yellow-400' : ''} />
            </button>
          </div>
          {/* 발신자 행 */}
          <div style={{ padding: '10px 16px 12px', background: phoneBg, borderBottom: `1px solid ${phoneBorder}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 38, height: 38, borderRadius: '50%', background: NAVER_GREEN_M, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span style={{ color: 'white', fontSize: 15, fontWeight: 700 }}>{EMAIL_META.fromInitial}</span>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 5 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: tp }}>{EMAIL_META.fromShort}</span>
                  <span style={{ fontSize: 10, color: ts, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>&lt;{EMAIL_META.from.match(/<(.+)>/)?.[1]}&gt;</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 3, marginTop: 2 }}>
                  <span style={{ fontSize: 11, color: ts }}>나에게</span>
                  <ChevronDown style={{ width: 12, height: 12, color: ts }} />
                </div>
              </div>
              <span style={{ fontSize: 10, color: ts, flexShrink: 0 }}>오전 10:24</span>
            </div>
            <div style={{ display: 'flex', gap: 5, marginTop: 8, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 10, color: ts, padding: '2px 7px', background: tagBg, borderRadius: 3 }}>받는사람</span>
              <span style={{ fontSize: 10, color: tp, padding: '2px 7px', background: tagBg, borderRadius: 3 }}>namiruan@naver.com</span>
            </div>
          </div>
          {/* 본문 iframe */}
          <div style={{ background: phoneBg }}>
            <iframe key={srcDoc} srcDoc={srcDoc} title="모바일 라이브 미리보기"
              style={{ width: '100%', minHeight: 380, border: 'none', display: 'block' }}
              onLoad={e => { try { const h = e.currentTarget.contentDocument?.body?.scrollHeight; if (h) e.currentTarget.style.height = h + 'px'; } catch {} }}
            />
          </div>
        </div>

        {/* 하단 탭바 */}
        <div style={{ display: 'flex', alignItems: 'center', background: navBg, borderTop: `1px solid ${phoneBorder}`, padding: '6px 0 2px' }}>
          {[
            { icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" style={{ width: 22, height: 22 }}><path d="M20 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2zm0 4-8 5-8-5"/></svg>, label: '메일함', active: true },
            { icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" style={{ width: 22, height: 22 }}><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>, label: '메일목록', active: false },
            { icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" style={{ width: 22, height: 22 }}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>, label: '메일쓰기', active: false },
            { icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" style={{ width: 22, height: 22 }}><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>, label: '알림', active: false },
            { icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" style={{ width: 22, height: 22 }}><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>, label: 'MY', active: false },
          ].map((tab) => (
            <button key={tab.label} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, background: 'none', border: 'none', cursor: 'pointer', padding: '4px 0', color: tab.active ? NAVER_GREEN_M : ts }}>
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
      <p style={{ marginTop: 14, fontSize: 11, color: isDark ? '#6b7280' : '#9ca3af' }}>네이버메일 앱 미리보기 (375px)</p>
    </div>
  );
}

/* ══════════════════════════════════════════
   Main LiveEditor
══════════════════════════════════════════ */
export function LiveEditor() {
  const navigate = useNavigate();

  const [activeId, setActiveId] = useState(DEFAULT_TEMPLATES[0]?.id ?? '01');
  const [code, setCode] = useState(DEFAULT_TEMPLATES[0]?.html ?? '');
  const [device, setDevice] = useState<DeviceMode>('desktop');
  const [previewDark, setPreviewDark] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const isDark = previewDark;
  const subject = getSubject(code);

  const extensions = useMemo(() => [
    htmlLang(),
    createHtmlLinter(),
    lintGutter(),
    editorTheme,
    drawSelection(),
    highlightActiveLine(),
    EditorView.lineWrapping,
  ], []);

  const loadTemplate = useCallback((id: string) => {
    const t = DEFAULT_TEMPLATES.find(t => t.id === id);
    if (t) { setCode(t.html); setActiveId(id); }
    setShowDropdown(false);
  }, []);

  const resetCode = useCallback(() => {
    const t = DEFAULT_TEMPLATES.find(t => t.id === activeId);
    if (t) setCode(t.html);
    toast.success('원본 코드로 초기화했습니다.');
  }, [activeId]);

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

  // 편집본을 클립보드에 담고, 해당 템플릿의 원본 파일 편집 화면을 연다.
  // GitHub이 로그인·권한을 처리한다 — 쓰기 권한이 없으면 fork 후 변경 제안으로 안내된다.
  const handleCommit = useCallback(async () => {
    const t = DEFAULT_TEMPLATES.find(t => t.id === activeId);
    if (!t) return;
    const url = editUrl(t.path);
    try {
      await navigator.clipboard.writeText(code);
      toast.success('코드를 복사했습니다. GitHub 편집기에서 전체 선택 후 붙여넣고 커밋하세요.');
    } catch {
      toast.error('복사에 실패했습니다. 에디터에서 직접 복사해 주세요.');
    }
    window.open(url, '_blank', 'noopener,noreferrer');
  }, [activeId, code]);

  useEffect(() => {
    if (!showDropdown) return;
    const handler = () => setShowDropdown(false);
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, [showDropdown]);

  const tabBg       = 'bg-[#222226]';
  const tabActive   = 'bg-[#333338] text-white';
  const tabInactive = 'text-gray-400 hover:text-gray-200';
  const btnBase     = 'bg-[#2a2a2e] text-gray-300 hover:bg-[#38383e]';

  return (
    <div className="flex flex-col h-screen bg-[#0d1117]">
      {/* ── Header ── */}
      <header className="border-b border-[#2e2e32] px-4 py-2.5 flex items-center gap-3 shrink-0 bg-[#161618]">
        {/* 타이틀 + 미리보기 돌아가기 */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-1 text-gray-400 hover:text-gray-200 transition-colors"
            title="미리보기로 돌아가기"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <Code2 className="w-5 h-5" style={{ color: NAVER_GREEN }} />
          <span className="font-semibold text-sm text-gray-100">라이브 에디터</span>
          <div className="w-px h-4 bg-gray-600 mx-1" />
          <button
            onClick={() => navigate('/')}
            className="text-xs text-gray-400 hover:text-gray-200 transition-colors hover:underline"
          >
            미리보기로 돌아가기
          </button>
        </div>

        <div className="flex-1" />

        {/* Template loader — 선택된 시안 이름 표시 */}
        <div className="relative">
          <button onClick={e => { e.stopPropagation(); setShowDropdown(v => !v); }}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-all ${btnBase}`}>
            <span className="text-gray-400 text-xs">시안</span>
            <span className="text-gray-100 font-medium">
              {DEFAULT_TEMPLATES.find(t => t.id === activeId)?.name ?? '선택'}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
          </button>
          {showDropdown && (
            <div className="absolute right-0 top-full mt-1 rounded-xl shadow-xl z-50 py-1 min-w-[160px] bg-[#222226] border border-[#333]"
              onClick={e => e.stopPropagation()}>
              {DEFAULT_TEMPLATES.map(t => (
                <button key={t.id} onClick={() => loadTemplate(t.id)}
                  className={`w-full text-left px-4 py-2 text-sm transition-colors flex items-center justify-between ${
                    activeId === t.id ? 'text-green-400 bg-[#1a2e1a]' : 'text-gray-300 hover:bg-[#2a2a2e]'
                  }`}>
                  <span>{t.name}</span>
                  {activeId === t.id && <Check className="w-3 h-3 shrink-0" />}
                </button>
              ))}
            </div>
          )}
        </div>

        <button onClick={resetCode}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-all ${btnBase}`}
          title="원본으로 초기화">
          <RotateCcw className="w-3.5 h-3.5" />초기화
        </button>

        {/* Device toggle */}
        <div className={`flex items-center rounded-lg p-1 gap-1 ${tabBg}`}>
          {([
            { value: 'desktop', icon: <Monitor className="w-4 h-4" />, label: 'PC' },
            { value: 'mobile',  icon: <Smartphone className="w-4 h-4" />, label: '모바일' },
          ] as const).map(opt => (
            <button key={opt.value} onClick={() => setDevice(opt.value)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition-all font-medium ${device === opt.value ? tabActive : tabInactive}`}>
              {opt.icon}<span>{opt.label}</span>
            </button>
          ))}
        </div>

        {/* 미리보기 다크 토글 */}
        <div className={`flex items-center rounded-lg p-1 gap-1 ${tabBg}`}>
          <button onClick={() => setPreviewDark(false)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition-all ${!previewDark ? tabActive : tabInactive}`}>
            <Sun className="w-4 h-4" /><span>라이트</span>
          </button>
          <button onClick={() => setPreviewDark(true)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition-all ${previewDark ? tabActive : tabInactive}`}>
            <Moon className="w-4 h-4" /><span>다크</span>
          </button>
        </div>

        {/* GitHub에 반영 — 복사 + 원본 파일 편집 화면 열기 */}
        <button onClick={handleCommit}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all ${btnBase}`}
          title="코드를 복사하고 GitHub에서 이 템플릿의 원본 파일을 엽니다">
          <GitBranch className="w-4 h-4" />
          GitHub에서 커밋
        </button>

        {/* Copy */}
        <button onClick={handleCopy}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            copied ? 'bg-green-600 text-white' : 'text-white hover:opacity-90'
          }`}
          style={{ background: copied ? undefined : NAVER_GREEN }}>
          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          {copied ? '복사됨' : '코드 복사'}
        </button>
      </header>

      {/* ── Resizable Body ── */}
      <PanelGroup direction="horizontal" className="flex-1 overflow-hidden">
        {/* ── Left: Code Editor ── */}
        <Panel defaultSize={50} minSize={20} maxSize={80}>
          <div className="flex flex-col h-full">
            {/* Editor sub-header */}
            <div className="flex items-center justify-between px-4 py-2 shrink-0"
              style={{ background: '#161b22', borderBottom: '1px solid #21262d' }}>
              <div className="flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
                  <div className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]" />
                  <div className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
                </div>
                <span className="text-xs ml-1" style={{ color: '#8b949e' }}>email.html</span>
              </div>
              <div className="flex items-center gap-4">
                <DiagnosticBar code={code} />
                <span className="text-[10px]" style={{ color: '#484f58' }}>
                  {code.split('\n').length}줄 · {code.length.toLocaleString()}자
                </span>
              </div>
            </div>

            {/* CodeMirror */}
            <div className="flex-1 overflow-hidden" style={{ background: '#0d1117' }}>
              <CodeMirror
                value={code}
                onChange={setCode}
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
          </div>
        </Panel>

        {/* ── Resize Handle ── */}
        <PanelResizeHandle className="group relative flex items-center justify-center w-1.5 transition-colors"
          style={{ background: '#21262d' }}>
          <div className="absolute flex items-center justify-center w-5 h-8 rounded z-10 opacity-0 group-hover:opacity-100 group-data-[resize-handle-active]:opacity-100 transition-opacity"
            style={{ background: '#30363d' }}>
            <GripVertical className="w-3 h-3" style={{ color: '#8b949e' }} />
          </div>
          <div className="w-full h-full group-hover:opacity-100 group-data-[resize-handle-active]:opacity-100 opacity-0 transition-opacity"
            style={{ background: NAVER_GREEN, width: 2 }} />
        </PanelResizeHandle>

        {/* ── Right: Preview ── */}
        <Panel defaultSize={50} minSize={20} maxSize={80}>
          <div className={`h-full overflow-auto flex flex-col items-center py-6 px-6 ${isDark ? 'bg-[#07070a]' : 'bg-[#f1f3f4]'}`}>
            {device === 'desktop' ? (
              <DesktopPreview subject={subject} srcDoc={code} isDark={isDark} />
            ) : (
              <MobilePreview subject={subject} srcDoc={code} isDark={isDark} />
            )}
          </div>
        </Panel>
      </PanelGroup>

      {/* ── Status bar ── */}
      <div className="shrink-0 flex items-center justify-between px-4 py-1.5 text-[10px]"
        style={{ background: '#161b22', borderTop: '1px solid #21262d', color: '#8b949e' }}>
        <div className="flex items-center gap-4">
          <span>HTML</span>
          <span>UTF-8</span>
          <span style={{ color: NAVER_GREEN }}>● 실시간 반영 중</span>
        </div>
        <div className="flex items-center gap-4">
          <span>좌우 패널 드래그로 크기 조절</span>
        </div>
      </div>
    </div>
  );
}