import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createHashRouter, RouterProvider } from 'react-router-dom'
import './index.css'
import { Layout } from './components/Layout'
import { Dashboard } from './pages/Dashboard'
import { LessonPage } from './pages/LessonPage'
import { InterviewPage } from './pages/InterviewPage'
import { GlossaryPage } from './pages/GlossaryPage'
import { NotFound } from './pages/NotFound'

// Hash routing keeps the static build deployable on any file host (GitHub Pages, S3) without rewrites.
const router = createHashRouter([
  {
    element: <Layout />,
    children: [
      { path: '/', element: <Dashboard /> },
      { path: '/learn/:moduleId/:slug', element: <LessonPage /> },
      { path: '/interview', element: <InterviewPage /> },
      { path: '/glossary', element: <GlossaryPage /> },
      { path: '*', element: <NotFound /> },
    ],
  },
])

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
