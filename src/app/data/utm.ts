/**
 * 문서(templates/README.md)에 적는 UTM 값.
 * 실제 링크는 templates/*.html 안에 이미 적혀 있고, 이 타입은 문서에 적힌
 * 값과 파일 안 링크가 어긋나지 않는지 검증(scripts/validate-templates.mjs)하는
 * 데 쓴다. 코드가 링크를 다시 쓰지는 않는다 — 파일이 곧 발송물이다.
 */
export interface Utm {
  source?: string;
  medium?: string;
  campaign?: string;
  /** 변형 구분. 예: mail-a / mail-b */
  content?: string;
}
