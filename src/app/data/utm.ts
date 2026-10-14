export interface Utm {
  source?: string;
  medium?: string;
  campaign?: string;
  /** 본문 변형 구분. 예: mail-a / mail-b */
  content?: string;
  /** 제목 변형 구분. 예: subj-a / subj-b */
  term?: string;
}

/**
 * 이미 utm_* 를 하나라도 달고 있는 링크만 다시 쓴다.
 * 추적 대상이 아닌 링크(로고·푸터 등)를 건드리지 않기 위한 규칙이다.
 * 새로 추적하려는 링크는 utm_ 파라미터를 하나라도 적어두면 나머지는 여기서 맞춘다.
 */
const HAS_UTM = /[?&]utm_[a-z]+=/i;

function rewriteHref(rawHref: string, utm: Utm): string {
  if (!HAS_UTM.test(rawHref)) return rawHref;

  const qi = rawHref.indexOf('?');
  if (qi < 0) return rawHref;

  // 속성 안에서 &amp; 로 쓰인 경우 원래 표기를 유지한다.
  const usedEntity = rawHref.includes('&amp;');
  const sep = usedEntity ? '&amp;' : '&';

  const base = rawHref.slice(0, qi);
  let rest = rawHref.slice(qi + 1);
  const hi = rest.indexOf('#');
  const hash = hi < 0 ? '' : rest.slice(hi);
  if (hi >= 0) rest = rest.slice(0, hi);

  // URL 객체를 거치면 경로가 정규화되어(kbz.co.kr? → kbz.co.kr/?) 원문이 바뀐다.
  // utm_* 외의 파라미터와 순서를 그대로 두기 위해 쿼리만 직접 다룬다.
  const wanted = new Map<string, string | null>(
    Object.entries(utm).map(([k, v]) => [`utm_${k}`, v || null]),
  );

  const kept: string[] = [];
  const seen = new Set<string>();
  for (const part of rest.split(usedEntity ? /&amp;|&/ : '&')) {
    if (!part) continue;
    const eq = part.indexOf('=');
    const key = eq < 0 ? part : part.slice(0, eq);
    if (!wanted.has(key)) { kept.push(part); continue; }
    seen.add(key);
    const value = wanted.get(key);
    if (value) kept.push(`${key}=${encodeURIComponent(value)}`);
  }
  for (const [key, value] of wanted) {
    if (value && !seen.has(key)) kept.push(`${key}=${encodeURIComponent(value)}`);
  }

  return kept.length ? `${base}?${kept.join(sep)}${hash}` : `${base}${hash}`;
}

/**
 * HTML 안 모든 href의 utm_* 를 manifest 값으로 맞춘다.
 * utm이 없으면 원문을 그대로 돌려준다 — 아직 옮기지 않은 템플릿은 건드리지 않는다.
 */
export function applyUtm(html: string, utm?: Utm): string {
  if (!utm) return html;
  return html.replace(/href="(https?:\/\/[^"]*)"/gi, (_m, href: string) =>
    `href="${rewriteHref(href, utm)}"`);
}
