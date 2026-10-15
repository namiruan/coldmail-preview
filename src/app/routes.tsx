import { createBrowserRouter } from 'react-router';
import { EmailPreview } from './components/EmailPreview';

// vite의 base와 맞춘다. '/coldmail-preview/' → '/coldmail-preview'
const basename = import.meta.env.BASE_URL.replace(/\/$/, '');

export const router = createBrowserRouter([
  {
    path: '/',
    Component: EmailPreview,
  },
  {
    // 예전 에디터 전용 화면. 지금은 같은 화면에서 패널만 열어 준다.
    path: '/editor',
    element: <EmailPreview initialEditorOpen />,
  },
], { basename });
