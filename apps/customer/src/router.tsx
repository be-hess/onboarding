import { createBrowserRouter } from 'react-router-dom'
import {
  StartApplication,
  BusinessDetails,
  Shareholders,
  DocumentUpload,
  ReviewSubmit,
  ApplicationStatus,
} from './pages'

export const router = createBrowserRouter([
  { path: '/', element: <StartApplication /> },
  { path: '/application/business', element: <BusinessDetails /> },
  { path: '/application/shareholders', element: <Shareholders /> },
  { path: '/application/documents', element: <DocumentUpload /> },
  { path: '/application/review', element: <ReviewSubmit /> },
  { path: '/application/status', element: <ApplicationStatus /> },
])
