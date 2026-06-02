/// <reference types="vite/client" />

import type { useToast as _useToast } from '@nuxt/ui/composables'

declare global {
  const useToast: typeof _useToast
}

export {}
