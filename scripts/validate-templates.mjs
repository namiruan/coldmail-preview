// templates/README.md 는 사람이 GitHub에서 직접 고치는 문서다. 표가 깨지거나
// 파일명·상태 값이 틀려도 빌드는 통과하므로, 배포 전에 여기서 막는다.
import { readFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseTemplatesDoc, STATUS_TO_KO } from '../src/app/data/parseTemplatesDoc.js';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DIR = join(ROOT, 'templates');
const DOC = join(DIR, 'README.md');

const errors = [];
const fail = (where, msg) => errors.push(`${where}: ${msg}`);

let md;
try {
  md = readFileSync(DOC, 'utf8');
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
const seenIds = new Set();
const usedFiles = new Set();

for (const t of templates) {
  const where = `${t.id || '(ID 없음)'} ${t.name}`.trim();
  for (const [key, ko] of [['id', 'ID'], ['category', '분류'], ['group', '그룹'], ['label', '이름'], ['file', '파일']]) {
    if (!t[key]) fail(where, `"${ko}" 칸이 비어 있습니다`);
  }
  if (t.id) {
    if (seenIds.has(t.id)) fail(where, `ID "${t.id}" 가 중복입니다`);
    seenIds.add(t.id);
  }
  if (t.file) {
    usedFiles.add(t.file);
    if (!htmlFiles.includes(t.file)) fail(where, `templates/${t.file} 파일이 없습니다`);
  }
  if (t.period && !/^\d{4}-\d{2}-\d{2} ~ \d{4}-\d{2}-\d{2}$/.test(t.period)) {
    fail(where, `기간 "${t.period}" — "2026-04-07 ~ 2026-06-18" 형식으로 적습니다`);
  }
  if (t.subjects) {
    const keys = new Set();
    t.subjects.forEach((v, j) => {
      if (!v.key) fail(where, `제목 변형 ${j + 1}번째: "키" 가 비어 있습니다`);
      else if (keys.has(v.key)) fail(where, `제목 변형의 키 "${v.key}" 가 중복입니다`);
      else keys.add(v.key);
      if (!v.text) fail(where, `제목 변형 "${v.key}": "제목" 이 비어 있습니다`);
    });
  }
}

for (const f of htmlFiles) {
  if (!usedFiles.has(f)) fail('(고아 파일)', `templates/${f} 이 "## 시안" 표에 없습니다`);
}

// 표에만 있고 실제 시안이 없는 제목 변형
const subjectIds = new Set();
for (const line of md.split('\n')) {
  const m = line.match(/^\|\s*(\d{2})\s*\|\s*\w+\s*\|/);
  if (m) subjectIds.add(m[1]);
}
for (const id of subjectIds) {
  if (!seenIds.has(id)) fail('(제목 변형)', `ID "${id}" 는 "## 시안" 표에 없습니다`);
}

if (errors.length) {
  console.error(`✗ 시안 문서 검증 실패 — ${errors.length}건\n`);
  for (const e of errors) console.error(`  ${e}`);
  console.error('\n  templates/README.md 를 고치고 다시 커밋하세요.');
  process.exit(1);
}
const counts = Object.entries(STATUS_TO_KO)
  .map(([k, ko]) => `${ko} ${templates.filter(t => t.status === k).length}`)
  .join(' · ');
const cats = [...new Set(templates.map(t => t.category))];
console.log(`✓ 시안 문서 정상 — ${templates.length}개 (${counts})`);
// 오타로 분류가 하나 더 생기면 여기서 눈에 띈다.
console.log(`  분류: ${cats.map(c => `${c} ${templates.filter(t => t.category === c).length}`).join(' · ')}`);
