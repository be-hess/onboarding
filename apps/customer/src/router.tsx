import { createBrowserRouter } from 'react-router-dom'
import {
  StartApplication,
  LicenseDetails,
  BusinessActivities,
  OwnershipStructure,
  BusinessModel,
  DocumentUpload,
  ReviewSubmit,
  ApplicationStatus,
} from './pages'

export const router = createBrowserRouter([
  { path: '/', element: <StartApplication /> },
  { path: '/application/license', element: <LicenseDetails /> },
  { path: '/application/activities', element: <BusinessActivities /> },
  { path: '/application/ownership', element: <OwnershipStructure /> },
  { path: '/application/business-model', element: <BusinessModel /> },
  { path: '/application/documents', element: <DocumentUpload /> },
  { path: '/application/review', element: <ReviewSubmit /> },
  { path: '/application/status', element: <ApplicationStatus /> },
])
