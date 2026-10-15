/*
 * 김반장 3.0 디자인 시스템을 이 저장소로 들여온다.
 *
 *   node scripts/sync-kbz.mjs                     # GitHub main 에서 받는다
 *   node scripts/sync-kbz.mjs ../kbz_3.0_ui_stytem  # 로컬 체크아웃에서 받는다
 *
 * 받아오는 것:
 *   tokens.css          — 토큰 번들을 그대로. 이 저장소에서 고치지 않는다.
 *   components.css      — 쓰는 컴포넌트의 CSS만, 각 스펙 문서의 ```css 블록에서 뽑는다.
 *
 * 원본은 디자인 시스템 저장소다. 색·간격·크기를 여기서 새로 정하지 말고
 * 토큰을 쓰고, 토큰에 없으면 디자인 시스템에 요청한다.
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'src/styles/kbz');
const REPO = 'namiruan/kbz_3.0_ui_stytem';
const RAW = `https://raw.githubusercontent.com/${REPO}/main`;

/** 이 앱이 실제로 쓰는 컴포넌트만 가져온다. 늘어나면 여기에 적는다. */
const COMPONENTS = [
  'design-system/components/atoms/button.md',
  'design-system/components/atoms/badge.md',
  'design-system/components/atoms/segment.md',
  'design-system/components/molecules/banner.md',
];

const local = process.argv[2] ? resolve(process.argv[2]) : null;

async function read(path) {
  if (local) return readFileSync(join(local, path), 'utf8');
  const res = await fetch(`${RAW}/${path}`);
  if (!res.ok) throw new Error(`${path} — HTTP ${res.status}`);
  return res.text();
}

/** 스펙 문서에서 ```css 펜스 안의 내용만 꺼낸다. */
function cssBlocks(md, where) {
  const out = [];
  const re = /^```css\n([\s\S]*?)^```$/gm;
  let m;
  while ((m = re.exec(md)) !== null) out.push(m[1].trimEnd());
  if (!out.length) throw new Error(`${where} 에 \`\`\`css 블록이 없습니다`);
  return out.join('\n\n');
}

const origin = local ? `로컬 ${local}` : `${REPO}@main`;
const header = (what) => `/*
 * ${what}
 * ─────────────────────────────────────────────
 * 자동 생성 — 직접 고치지 마세요.
 * 원본: ${REPO}
 * 받은 곳: ${origin}
 * 다시 받기: node scripts/sync-kbz.mjs
 */

`;

mkdirSync(OUT, { recursive: true });

const tokens = await read('tokens.css');
writeFileSync(join(OUT, 'tokens.css'), header('김반장 3.0 — 디자인 토큰 (원본 그대로)') + tokens);
console.log(`✓ tokens.css — ${tokens.split('\n').length}줄`);

const parts = [];
for (const path of COMPONENTS) {
  const css = cssBlocks(await read(path), path);
  parts.push(`/* ══ ${path} ══ */\n${css}`);
  console.log(`✓ ${path} — ${css.split('\n').length}줄`);
}
writeFileSync(
  join(OUT, 'components.css'),
  header('김반장 3.0 — 쓰는 컴포넌트 CSS (스펙 문서에서 추출)') + parts.join('\n\n') + '\n',
);
console.log(`\n받은 곳: ${origin}`);
