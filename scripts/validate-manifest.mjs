// manifest.json은 사람이 GitHub에서 직접 고친다. 문법 오류는 빌드가 잡지만
// 파일명 오타나 status 오타는 빌드를 통과한 뒤 런타임에 터지거나 조용히
// 의도와 반대로 동작한다. 배포 전에 여기서 막는다.
import { readFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DIR = join(ROOT, 'templates');
const MANIFEST = join(DIR, 'manifest.json');

const REQUIRED = ['id', 'name', 'group', 'label', 'file', 'status'];
const STATUSES = ['active', 'paused'];
const UTM_KEYS = ['source', 'medium', 'campaign', 'content', 'term'];

const errors = [];
const fail = (where, msg) => errors.push(`${where}: ${msg}`);

let manifest;
try {
  manifest = JSON.parse(readFileSync(MANIFEST, 'utf8'));
} catch (e) {
  console.error(`✗ templates/manifest.json 을 읽을 수 없습니다 — ${e.message}`);
  process.exit(1);
}
if (!Array.isArray(manifest)) {
  console.error('✗ manifest.json 의 최상위는 배열이어야 합니다.');
  process.exit(1);
}

const htmlFiles = readdirSync(DIR).filter(f => f.endsWith('.html'));
const seenIds = new Set();
const usedFiles = new Set();

manifest.forEach((t, i) => {
  const where = `[${i}] ${t?.id ?? '(id 없음)'} ${t?.name ?? ''}`.trim();

  for (const key of REQUIRED) {
    if (typeof t?.[key] !== 'string' || !t[key]) fail(where, `"${key}" 가 없거나 비어 있습니다`);
  }
  if (t?.id) {
    if (seenIds.has(t.id)) fail(where, `id "${t.id}" 가 중복입니다`);
    seenIds.add(t.id);
  }
  if (t?.status && !STATUSES.includes(t.status)) {
    fail(where, `status "${t.status}" — ${STATUSES.map(s => `"${s}"`).join(' 또는 ')} 만 됩니다`);
  }
  if (t?.file) {
    usedFiles.add(t.file);
    if (!htmlFiles.includes(t.file)) fail(where, `templates/${t.file} 파일이 없습니다`);
  }
  if (t?.utm !== undefined) {
    if (typeof t.utm !== 'object' || t.utm === null || Array.isArray(t.utm)) {
      fail(where, 'utm 은 객체여야 합니다');
    } else {
      for (const [k, v] of Object.entries(t.utm)) {
        if (!UTM_KEYS.includes(k)) fail(where, `utm.${k} — 쓸 수 있는 키는 ${UTM_KEYS.join(', ')} 입니다`);
        else if (typeof v !== 'string' || !v) fail(where, `utm.${k} 가 비어 있습니다`);
      }
    }
  }
  if (t?.subjects !== undefined) {
    if (!Array.isArray(t.subjects) || t.subjects.length === 0) {
      fail(where, 'subjects 는 비어 있지 않은 배열이어야 합니다');
    } else {
      const keys = new Set();
      t.subjects.forEach((v, j) => {
        if (typeof v?.key !== 'string' || !v.key) fail(where, `subjects[${j}].key 가 없습니다`);
        else if (keys.has(v.key)) fail(where, `subjects 의 key "${v.key}" 가 중복입니다`);
        else keys.add(v.key);
        if (typeof v?.text !== 'string' || !v.text) fail(where, `subjects[${j}].text 가 없습니다`);
      });
    }
  }
});

for (const f of htmlFiles) {
  if (!usedFiles.has(f)) fail('(고아 파일)', `templates/${f} 이 manifest에 없습니다`);
}

if (errors.length) {
  console.error(`✗ manifest 검증 실패 — ${errors.length}건\n`);
  for (const e of errors) console.error(`  ${e}`);
  console.error('\n  templates/manifest.json 을 고치고 다시 커밋하세요.');
  process.exit(1);
}
console.log(`✓ manifest 정상 — 시안 ${manifest.length}개 (사용중 ${manifest.filter(t => t.status === 'active').length} · 중단 ${manifest.filter(t => t.status === 'paused').length})`);
