import manifest from '../../../templates/manifest.json';

export interface EmailTemplate {
  id: string;
  name: string;
  html: string;
  /** 현재 모든 템플릿이 빈 값이다. 스타일은 html 안의 <style>·인라인으로 들어있다. */
  css: string;
  /** 저장소 기준 경로. "GitHub에서 열기"가 이 파일의 편집 화면을 연다. */
  path: string;
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

export const DEFAULT_TEMPLATES: EmailTemplate[] = manifest.map(t => ({
  id: t.id,
  name: t.name,
  html: read(t.file),
  css: '',
  path: `templates/${t.file}`,
}));
