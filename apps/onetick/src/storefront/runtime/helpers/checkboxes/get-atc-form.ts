import { EHtmlSelectors } from '../../constants'

export const getAddToCartForms = (element: HTMLElement) => {
  const closestSession = element.closest(EHtmlSelectors.SECTION)
  if (!closestSession) return []

  return Array.from(closestSession.querySelectorAll('form[action*="/cart/add"]'))
}
