import { createBrowserRouter } from 'react-router-dom'
import {
  StartApplication,
  FindBusiness,
  BusinessQuestions,
  WhoNeedsAccess,
  ApplicationTracker,
  Activate,
} from './pages'

export const router = createBrowserRouter([
  { path: '/', element: <StartApplication /> },
  { path: '/application/find-business', element: <FindBusiness /> },
  { path: '/application/business-questions', element: <BusinessQuestions /> },
  { path: '/application/who-needs-access', element: <WhoNeedsAccess /> },
  { path: '/application/tracker', element: <ApplicationTracker /> },
  { path: '/application/activate', element: <Activate /> },
])
