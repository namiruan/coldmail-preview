import { Toaster as Sonner, type ToasterProps } from 'sonner';

/**
 * 토스트 — components/molecules/toast.md
 * 우상단, 상태별 surface-*-subtle 배경 + border-*-subtle + text-*.
 * 디자인 시스템에 다크 테마가 없으므로 라이트로 고정한다.
 */
const Toaster = (props: ToasterProps) => (
  <Sonner
    theme="light"
    richColors
    position="top-right"
    offset={{ top: 'calc(var(--height-topnav) + var(--space-gap-2xl))', right: 'var(--space-gap-2xl)' }}
    className="toaster"
    style={
      {
        '--width': '360px',
        '--border-radius': 'var(--radius-lg)',
        '--normal-bg': 'var(--color-surface-brand-subtle)',
        '--normal-text': 'var(--color-text-brand)',
        '--normal-border': 'var(--color-border-brand-subtle)',
        '--info-bg': 'var(--color-surface-info-subtle)',
        '--info-text': 'var(--color-text-info)',
        '--info-border': 'var(--color-border-info-subtle)',
        '--success-bg': 'var(--color-surface-success-subtle)',
        '--success-text': 'var(--color-text-success)',
        '--success-border': 'var(--color-border-success-subtle)',
        '--error-bg': 'var(--color-surface-error-subtle)',
        '--error-text': 'var(--color-text-error)',
        '--error-border': 'var(--color-border-error-subtle)',
      } as React.CSSProperties
    }
    toastOptions={{ className: 'kbz-toast' }}
    {...props}
  />
);

export { Toaster };
