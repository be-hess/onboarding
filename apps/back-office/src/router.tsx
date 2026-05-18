import { createBrowserRouter } from 'react-router-dom'
import { CaseQueue, CaseDetail, AuditLog } from './pages'

export const router = createBrowserRouter([
  { path: '/', element: <CaseQueue /> },
  { path: '/cases/:id', element: <CaseDetail /> },
  { path: '/cases/:id/audit', element: <AuditLog /> },
])
