import { createBrowserRouter } from 'react-router';
import { EmailPreview } from './components/EmailPreview';
import { LiveEditor } from './components/LiveEditor';

export const router = createBrowserRouter([
  {
    path: '/',
    Component: EmailPreview,
  },
  {
    path: '/editor',
    Component: LiveEditor,
  },
]);