import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { ApplicationProvider } from './store'
import { router } from './router'
import '@wio/design-system/src/styles/wio.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ApplicationProvider>
      <RouterProvider router={router} />
    </ApplicationProvider>
  </StrictMode>,
)
