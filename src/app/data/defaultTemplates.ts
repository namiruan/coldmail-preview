import doc from '../../../templates/README.md?raw';
// 검증 스크립트(Node)와 같은 파서를 쓰려고 평범한 JS로 둔 모듈이다.
import { parseTemplatesDoc } from './parseTemplatesDoc.js';
import type { Utm } from './utm';

export interface EmailTemplate {
  id: string;
  name: string;
  html: string;
  /** 현재 모든 템플릿이 빈 값이다. 스타일은 html 안의 <style>·인라인으로 들어있다. */
  css: string;
  /** 저장소 기준 경로. "GitHub에서 열기"가 이 파일의 편집 화면을 연다. */
  path: string;
  /** 시안 목록에서 묶이는 단위. 같은 group끼리 한 묶음으로 보인다. */
  group: string;
  /** 묶음 안에서의 이름. 예: "단일홍보 A안" */
  label: string;
  /** manifest가 원본이다. 내보낼 때 HTML의 utm_* 를 이 값으로 맞춘다. 없으면 HTML을 그대로 둔다. */
  utm?: Utm;
  /** 제목 변형. 2개 이상이면 미리보기에 전환 UI가 뜬다. 없으면 HTML의 <title>을 쓴다. */
  subjects?: SubjectVariant[];
  /**
   * 사용 상태. 어느 값이든 utm·subjects 설정은 그대로 남는다.
   *   active = 쓰는 중 · draft = 시안은 있으나 아직 쓰기 전 · paused = 쓰다가 그만둠
   */
  status: TemplateStatus;
}

export type TemplateStatus = 'active' | 'draft' | 'paused';

export interface SubjectVariant {
  /** 변형 식별자. utm_term 기본값으로도 쓰인다. */
  key: string;
  /** 메일 제목 */
  text: string;
  /** utm_term 을 따로 지정할 때. 생략하면 `subj-{key}` */
  term?: string;
  /** 이 변형만 utm_content 를 덮어쓸 때. 제목 A/B를 content로 가르던 방식을 위한 것. */
  content?: string;
}

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
  id: string; name: string; group: string; label: string; file: string;
  status: TemplateStatus; utm?: Utm; subjects?: SubjectVariant[];
}

export const DEFAULT_TEMPLATES: EmailTemplate[] = parsed.templates.map(t => ({
  id: t.id,
  name: t.name,
  html: read(t.file),
  css: '',
  path: `templates/${t.file}`,
  group: t.group,
  label: t.label,
  status: t.status,
  utm: t.utm,
  subjects: t.subjects,
}));

/** 변형의 utm_term 값. 따로 적지 않았으면 key에서 만든다. */
export const subjectTerm = (v: SubjectVariant) => v.term ?? `subj-${v.key}`;
