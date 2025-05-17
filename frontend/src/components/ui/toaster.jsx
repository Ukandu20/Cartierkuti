// src/components/ui/toaster.jsx
'use client'

import { createToaster } from '@chakra-ui/react'

// Create toast system with configuration
const toastSystem = createToaster({
  placement: 'bottom-end',
  pauseOnPageIdle: true,
})

// Export the toast trigger function
export const toaster = toastSystem.toast

// Export the visual container component
export const Toaster = () => (
  <toastSystem.ToastContainer
    insetInline={{ mdDown: '4' }}
  />
)