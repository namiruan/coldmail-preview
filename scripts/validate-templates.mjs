// templates/README.md 는 사람이 GitHub에서 직접 고치는 문서다. 표가 깨지거나
// 파일명·상태 값이 틀려도 빌드는 통과하므로, 배포 전에 여기서 막는다.
import { readFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseTemplatesDoc, STATUS_TO_KO } from '../src/app/data/parseTemplatesDoc.js';
import { variantKind } from '../src/app/data/variantKind.js';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DIR = join(ROOT, 'templates');

const errors = [];
const fail = (where, msg) => errors.push(`${where}: ${msg}`);

let md;
try {
  md = readFileSync(join(DIR, 'README.md'), 'utf8');
} catch (e) {
  console.error(`✗ templates/README.md 를 읽을 수 없습니다 — ${e.message}`);
  process.exit(1);
}

const { templates, errors: parseErrors } = parseTemplatesDoc(md);
errors.push(...parseErrors);
if (!templates.length) {
  console.error('✗ "## 시안" 표에서 시안을 하나도 읽지 못했습니다. 표 형식을 확인하세요.');
  process.exit(1);
}

const htmlFiles = readdirSync(DIR).filter(f => f.endsWith('.html'));
const seen = new Set();
const usedFiles = new Set();

for (const t of templates) {
  const where = `${t.id || '(ID 없음)'} ${t.name}`.trim();

  for (const [key, ko] of [['id', 'ID'], ['category', '분류'], ['group', '그룹'], ['label', '이름'], ['file', '파일']]) {
    if (!t[key]) fail(where, `"${ko}" 칸이 비어 있습니다`);
  }

  // A/B 묶음은 ID를 공유한다. 시안 키까지 합쳐야 고유하다.
  if (t.id) {
    const key = `${t.id}\u0000${t.variant ?? ''}`;
    if (seen.has(key)) {
      fail(where, t.variant
        ? `ID "${t.id}" 의 시안 "${t.variant}" 가 중복입니다`
        : `ID "${t.id}" 가 중복입니다 (A/B면 "시안" 칸을 채웁니다)`);
    }
    seen.add(key);
  }

  if (t.file) {
    usedFiles.add(t.file);
    if (!htmlFiles.includes(t.file)) fail(where, `templates/${t.file} 파일이 없습니다`);
  }

  // 문서가 두 겹이면 메일 클라이언트마다 어느 <head>를 살릴지 갈려 렌더가 달라진다.
  // 브라우저는 너그러워 미리보기만으로는 드러나지 않으므로 여기서 막는다.
  if (t.file && htmlFiles.includes(t.file)) {
    const html = readFileSync(join(DIR, t.file), 'utf8');
    for (const [re, ko] of [[/<!DOCTYPE/gi, 'DOCTYPE'], [/<html[\s>]/gi, '<html>'], [/<body[\s>]/gi, '<body>']]) {
      const n = (html.match(re) || []).length;
      if (n > 1) fail(where, `${t.file}: ${ko} 가 ${n}개입니다 — 문서는 한 겹이어야 합니다`);
    }
  }
}

// 같은 그룹·이름은 한 항목으로 묶여 "시안 A B" 토글이 된다.
const entries = new Map();
for (const t of templates) {
  const key = `${t.category}\u0000${t.group}\u0000${t.label}`;
  if (!entries.has(key)) entries.set(key, []);
  entries.get(key).push(t);
}
for (const [, group] of entries) {
  if (group.length < 2) continue;
  const where = `${group[0].group} / ${group[0].label}`;
  const keys = group.map(t => t.variant);
  if (keys.some(k => !k)) {
    fail(where, `시안이 ${group.length}개인데 "시안" 칸이 비어 있습니다 (A·B 처럼 적습니다)`);
  }
  const statuses = [...new Set(group.map(t => t.status))];
  if (statuses.length > 1) {
    fail(where, `시안끼리 상태가 다릅니다 (${statuses.map(x => STATUS_TO_KO[x]).join(', ')}) — 같은 항목은 상태를 맞춥니다`);
  }
}

// 문서에 적은 UTM은 파일 안 링크와 같아야 한다. 어긋나면 어느 쪽이 맞는지 알 수 없다.
for (const t of templates) {
  if (!t.utm || !t.file || !htmlFiles.includes(t.file)) continue;
  const html = readFileSync(join(DIR, t.file), 'utf8');
  const where = `${t.id} ${t.label}`;
  for (const [k, v] of Object.entries(t.utm)) {
    const found = [...new Set([...html.matchAll(new RegExp(`utm_${k}=([^&"']*)`, 'g'))].map(m => m[1]))];
    if (!found.length) fail(where, `${t.file} 에 utm_${k} 가 없는데 문서에는 "${v}" 로 적혀 있습니다`);
    else if (found.length > 1 || found[0] !== v) {
      fail(where, `utm_${k}: 문서 "${v}" ↔ 파일 "${found.join(', ')}" — 값이 다릅니다 (링크마다 갈리면 문서는 "-" 로 비웁니다)`);
    }
  }
}

for (const f of htmlFiles) {
  if (!usedFiles.has(f)) fail('(고아 파일)', `templates/${f} 이 "## 시안" 표에 없습니다`);
}

if (errors.length) {
  console.error(`✗ 시안 문서 검증 실패 — ${errors.length}건\n`);
  for (const e of errors) console.error(`  ${e}`);
  console.error('\n  templates/README.md 를 고치고 다시 커밋하세요.');
  process.exit(1);
}

// A/B 묶음의 본문이 같은지 알린다. 제목만 다른 A/B에서 한쪽만 고치면 여기서 드러난다.
// 본문이 다른 A/B(예: 단일홍보)는 원래 다르므로 막지 않고 알리기만 한다.
const abNotes = [];
for (const [, group] of entries) {
  if (group.length < 2 || !group.every(t => htmlFiles.includes(t.file))) continue;
  const kind = variantKind(group.map(t => readFileSync(join(DIR, t.file), 'utf8')));
  abNotes.push(`${group[0].label} ${kind === '제목' ? '제목만 다름' : '본문도 다름'}`);
}

const counts = Object.entries(STATUS_TO_KO)
  .map(([k, ko]) => `${ko} ${templates.filter(t => t.status === k).length}`)
  .join(' · ');
const cats = [...new Set(templates.map(t => t.category))];
console.log(`✓ 시안 문서 정상 — ${templates.length}개 (${counts})`);
console.log(`  분류: ${cats.map(c => `${c} ${templates.filter(t => t.category === c).length}`).join(' · ')}`);
if (abNotes.length) console.log(`  A/B: ${abNotes.join(' · ')}`);
