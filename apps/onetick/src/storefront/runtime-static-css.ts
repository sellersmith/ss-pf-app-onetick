// OneTick preview/runtime styling is app-owned and injected once for admin preview plus storefront runtime.
import oneTickStorefrontCss from './runtime/onetick.css?inline'

export const ONETICK_STATIC_CSS_ELEMENT_ID = 'onetick-static-storefront-css'

export function appendOneTickStaticCss(documentRef: Document) {
  if (!documentRef.head || typeof documentRef.createElement !== 'function') return
  if (typeof documentRef.getElementById !== 'function') return
  const existingElement = documentRef.getElementById(ONETICK_STATIC_CSS_ELEMENT_ID)
  if (existingElement) {
    if (existingElement.textContent !== oneTickStorefrontCss) {
      existingElement.textContent = oneTickStorefrontCss
    }
    return
  }

  const element = documentRef.createElement('style')
  element.id = ONETICK_STATIC_CSS_ELEMENT_ID
  element.dataset.onetickRuntimeCss = 'onetick'
  element.textContent = oneTickStorefrontCss
  documentRef.head.appendChild(element)
}
