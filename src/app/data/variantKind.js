// 검증 스크립트(Node)와 앱이 같은 기준을 쓰도록 평범한 JS로 둔 모듈이다.

/**
 * 제목과 UTM을 뺀 본문. 두 시안의 이 값이 같으면 제목만 다른 A/B다.
 * 공백 차이는 무시한다 — 들여쓰기만 다른 것을 "본문이 다르다"고 하면 안 된다.
 */
export function bodyOf(html) {
  return html
    .replace(/<title[^>]*>[^<]*<\/title>/gi, '')
    .replace(/utm_[a-z]+=[^&"']*/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * 묶음의 시안들이 무엇으로 갈리는지.
 *   '제목' — 제목(과 UTM)만 다르다
 *   '전체' — 본문도 다르다
 */
export function variantKind(htmls) {
  return new Set(htmls.map(bodyOf)).size === 1 ? '제목' : '전체';
}
