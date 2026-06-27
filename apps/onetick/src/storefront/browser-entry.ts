// OneTick storefront runtime runs from the generated theme asset and must fail open on merchant storefronts.
import './runtime/onetick'
import { installOneTickStorefrontRuntime } from './runtime-installer'
import { appendOneTickStaticCss } from './runtime-static-css'

declare global {
  interface Window {
    __onetick_runtime_uninstall__?: () => void
    __pagefly_onetick_asset_marker__?: {
      marker: string
      loadedAt: string
      scriptSrc?: string
      hasGroupCheckboxesAtEntry: boolean
    }
  }
}

export { installOneTickStorefrontRuntime }

if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  const marker = {
    marker: 'pagefly-onetick-runtime-20260612-boundary',
    loadedAt: new Date().toISOString(),
    scriptSrc: document.currentScript instanceof HTMLScriptElement ? document.currentScript.src : undefined,
    hasGroupCheckboxesAtEntry: Boolean(window.customElements?.get('onetick-group-checkboxes')),
  }
  window.__pagefly_onetick_asset_marker__ = marker

  appendOneTickStaticCss(document)
  window.__onetick_runtime_uninstall__ = window.__onetick_runtime_uninstall__ || (() => {})
}
