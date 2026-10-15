// templates/README.md 의 표를 읽는다.
// 앱(Vite)과 검증 스크립트(Node)가 같은 파서를 쓰도록 평범한 JS로 둔다.

// draft = 시안은 있으나 아직 쓰기 전. ended = 집행을 마친 것.
const STATUS_FROM_KO = { '사용중': 'active', '미사용': 'draft', '운영종료': 'ended' };
export const STATUS_TO_KO = { active: '사용중', draft: '미사용', ended: '운영종료' };
export const STATUS_KO = Object.keys(STATUS_FROM_KO);

/** 표의 한 줄을 셀 배열로. 앞뒤 | 와 공백을 턴다. */
function cells(line) {
  return line.trim().replace(/^\||\|$/g, '').split('|').map(c => c.trim());
}

function isDivider(line) {
  return /^\|?\s*:?-{2,}:?\s*(\|\s*:?-{2,}:?\s*)*\|?$/.test(line.trim());
}

/** `## 제목` 아래 첫 표를 [{헤더: 값}] 으로 읽는다. */
function tableUnder(md, heading) {
  const lines = md.split('\n');
  let i = lines.findIndex(l => l.trim() === heading);
  if (i < 0) return null;

  while (i < lines.length && !lines[i].includes('|')) i++;
  if (i >= lines.length) return null;

  const header = cells(lines[i]);
  if (!isDivider(lines[i + 1] ?? '')) return null;

  const rows = [];
  for (let j = i + 2; j < lines.length; j++) {
    const line = lines[j];
    if (!line.includes('|') || !line.trim()) break;
    const c = cells(line);
    rows.push(Object.fromEntries(header.map((h, k) => [h, c[k] ?? ''])));
  }
  return rows;
}

const clean = v => (v ?? '').trim();
const orUndef = v => (clean(v) === '' || clean(v) === '-' ? undefined : clean(v));

/**
 * @returns {{templates: object[], errors: string[]}}
 */
export function parseTemplatesDoc(md) {
  const errors = [];
  const main = tableUnder(md, '## 시안');
  if (!main) return { templates: [], errors: ['"## 시안" 아래에서 표를 찾지 못했습니다.'] };

  const subjectRows = tableUnder(md, '## 제목 변형') ?? [];
  const subjectsById = new Map();
  subjectRows.forEach((r, i) => {
    const id = clean(r['ID']);
    if (!id) { errors.push(`제목 변형 ${i + 1}번째 줄: ID가 비어 있습니다`); return; }
    if (!subjectsById.has(id)) subjectsById.set(id, []);
    subjectsById.get(id).push({
      key: clean(r['키']),
      text: clean(r['제목']),
      term: orUndef(r['term']),
      // 변형별로 utm_content 를 따로 둘 때. 제목 A/B를 content로 가른 기록을 그대로 살린다.
      content: orUndef(r['content']),
    });
  });

  const templates = main.map(r => {
    const id = clean(r['ID']);
    const statusKo = clean(r['상태']);
    const status = STATUS_FROM_KO[statusKo];
    if (statusKo && !status) {
      errors.push(`${id}: 상태 "${statusKo}" — ${STATUS_KO.map(k => `"${k}"`).join(" / ")} 중 하나여야 합니다`);
    }
    const utm = {};
    for (const key of ['source', 'medium', 'campaign', 'content']) {
      const v = orUndef(r[key]);
      if (v) utm[key] = v;
    }
    return {
      id,
      category: clean(r['분류']),
      group: clean(r['그룹']),
      label: clean(r['이름']),
      name: `${clean(r['그룹'])} ${clean(r['이름'])}`.trim(),
      file: clean(r['파일']),
      status: status ?? 'active',
      variant: orUndef(r['시안']),
      utm: Object.keys(utm).length ? utm : undefined,
      subjects: subjectsById.get(id),
    };
  });

  return { templates, errors };
}
