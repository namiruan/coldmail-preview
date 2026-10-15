import doc from '../../../templates/README.md?raw';
// 검증 스크립트(Node)와 같은 파서를 쓰려고 평범한 JS로 둔 모듈이다.
import { parseTemplatesDoc } from './parseTemplatesDoc.js';
import type { Utm } from './utm';

export interface EmailTemplate {
  /** 캠페인 번호. A/B 묶음은 같은 값을 공유한다 — 선택 상태의 키로는 쓸 수 없다. */
  id: string;
  /** 줄마다 고유한 선택 키. id + 시안(08a, 08b, 01 …) — 파일명 앞머리와 같다. */
  key: string;
  name: string;
  html: string;
  /** 현재 모든 템플릿이 빈 값이다. 스타일은 html 안의 <style>·인라인으로 들어있다. */
  css: string;
  /** 저장소 기준 경로. "GitHub에서 열기"가 이 파일의 편집 화면을 연다. */
  path: string;
  /**
   * 대분류. 콜드메일은 먼저 보내는 영업 메일이라 제목 A/B 대상이고,
   * 발신템플릿은 요청에 응답해 보내는 메일이라 테스트하지 않는다.
   */
  category: string;
  /** 시안 목록에서 묶이는 단위. 같은 group끼리 한 묶음으로 보인다. */
  group: string;
  /** 묶음 안에서의 이름. 예: "단일홍보" */
  label: string;
  /**
   * 본문이 다른 A/B의 키. 같은 group·label의 시안끼리 한 항목으로 묶이고
   * 목록에서 `시안 A B` 토글로 전환된다. 변형이 없으면 undefined.
   */
  variant?: string;
  /** manifest가 원본이다. 내보낼 때 HTML의 utm_* 를 이 값으로 맞춘다. 없으면 HTML을 그대로 둔다. */
  utm?: Utm;
  /**
   * 사용 상태. 어느 값이든 utm 설정은 그대로 남는다.
   *   active = 쓰는 중 · draft = 시안은 있으나 아직 쓰기 전 · ended = 집행을 마침
   */
  status: TemplateStatus;
}

export type TemplateStatus = 'active' | 'draft' | 'ended';


/**
 * templates/*.html 을 빌드 시점에 문자열로 가져온다.
 * eager라 번들에 포함되므로 정적 호스팅(GitHub Pages)에서도 fetch 없이 동작한다.
 */
const files = import.meta.glob('../../../templates/*.html', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;

function read(file: string): string {
  const key = `../../../templates/${file}`;
  const html = files[key];
  if (html === undefined) {
    throw new Error(
      `템플릿 파일을 찾을 수 없습니다: templates/${file}\n` +
      `manifest.json과 실제 파일명이 어긋났는지 확인하세요.`,
    );
  }
  return html;
}

const parsed = parseTemplatesDoc(doc) as { templates: RawTemplate[]; errors: string[] };
if (parsed.errors.length) {
  // 배포 전 npm run validate 가 막지만, 로컬 편집 중에는 바로 보이게 한다.
  console.error('templates/README.md 를 읽는 중 문제:\n  ' + parsed.errors.join('\n  '));
}

interface RawTemplate {
  id: string; name: string; category: string; group: string; label: string; file: string;
  status: TemplateStatus; variant?: string; utm?: Utm;
}

export const DEFAULT_TEMPLATES: EmailTemplate[] = parsed.templates.map(t => ({
  id: t.id,
  key: t.id + (t.variant ? t.variant.toLowerCase() : ''),
  name: t.name,
  html: read(t.file),
  css: '',
  path: `templates/${t.file}`,
  category: t.category,
  group: t.group,
  label: t.label,
  status: t.status,
  variant: t.variant,
  utm: t.utm,
}));

