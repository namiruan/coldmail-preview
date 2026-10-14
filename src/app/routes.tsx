import { createBrowserRouter } from 'react-router';
import { EmailPreview } from './components/EmailPreview';
import { LiveEditor } from './components/LiveEditor';

// vite의 base와 맞춘다. '/coldmail-preview/' → '/coldmail-preview'
const basename = import.meta.env.BASE_URL.replace(/\/$/, '');

export const router = createBrowserRouter([
  {
    path: '/',
    Component: EmailPreview,
  },
  {
    path: '/editor',
    Component: LiveEditor,
  },
], { basename });
