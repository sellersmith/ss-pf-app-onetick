// OneTick storefront runtime runs from the generated theme asset and must fail open on merchant storefronts.
import {
  appendSelectedOneTickAddonsToFormData,
  appendSelectedOneTickAddonsToJsonItems,
  appendSelectedOneTickAddonsToUrlSearchParams,
} from './runtime-core'
import { cleanupOneTickAddonsAfterCartChange } from './runtime-cart-change-cleanup'

type OneTickAddonRoot = Parameters<typeof appendSelectedOneTickAddonsToJsonItems>[2]

export interface InstallOneTickCartFetchInterceptorOptions {
  windowRef?: Window
  root?: OneTickAddonRoot
}

const CART_ADD_PATH = '/cart/add'
const CART_CHANGE_PATH = '/cart/change'
const CART_JSON_PATH = '/cart.js'

function isCartAddRequest(input: RequestInfo | URL): boolean {
  return getRequestUrl(input).includes(CART_ADD_PATH)
}

function isCartChangeRequest(input: RequestInfo | URL): boolean {
  return getRequestUrl(input).includes(CART_CHANGE_PATH)
}

function getRequestUrl(input: RequestInfo | URL): string {
  const url =
    typeof input === 'string'
      ? input
      : input instanceof URL
        ? input.pathname
        : typeof input === 'object' && 'url' in input
          ? input.url
          : ''

  return url
}

function getContentType(headers: RequestInit['headers']): string {
  if (!headers) return ''

  if (typeof Headers !== 'undefined' && headers instanceof Headers) {
    return headers.get('Content-Type') || headers.get('content-type') || ''
  }

  if (Array.isArray(headers)) {
    return headers.find(([key]) => key.toLowerCase() === 'content-type')?.[1] || ''
  }

  return (
    Object.entries(headers).find(([key]) => key.toLowerCase() === 'content-type')?.[1]?.toString() || ''
  )
}

function valuePointsToCheckout(value: unknown): boolean {
  return typeof value === 'string' && value.toLowerCase().includes('/checkout')
}

function hasCheckoutBypassHint(data: Record<string, unknown>): boolean {
  return (
    valuePointsToCheckout(data.return_to) ||
    valuePointsToCheckout(data.return_url) ||
    valuePointsToCheckout(data.returnTo) ||
    valuePointsToCheckout(data.returnUrl) ||
    data.checkout === true ||
    data.checkout === 'true'
  )
}

// Accelerated checkout handoffs are intentionally fail-open. If a submit hints at checkout, leave the
// request untouched because Shopify owns that flow before OneTick can safely mutate cart lines.
function appendAddonsToJsonBody(bodyText: string, root: OneTickAddonRoot): string {
  try {
    const body = JSON.parse(bodyText)
    if (body && typeof body === 'object' && hasCheckoutBypassHint(body)) return bodyText

    const items = body?.items
    const variantId = items?.[0]?.id ? String(items[0].id) : ''

    if (!variantId || !Array.isArray(items)) return bodyText

    appendSelectedOneTickAddonsToJsonItems(variantId, items, root)
    return JSON.stringify(body)
  } catch {
    return bodyText
  }
}

function appendAddonsToCartBody(body: BodyInit | null | undefined, contentType: string, root: OneTickAddonRoot) {
  if (!body) return body

  if (typeof body === 'string') {
    if (contentType.includes('application/x-www-form-urlencoded')) {
      const params = new URLSearchParams(body)
      if (hasCheckoutBypassHint(Object.fromEntries(params.entries()))) return body

      appendSelectedOneTickAddonsToUrlSearchParams(params.get('id') || '', params, root)
      return params.toString()
    }

    return appendAddonsToJsonBody(body, root)
  }

  if (typeof FormData !== 'undefined' && body instanceof FormData) {
    if (hasCheckoutBypassHint(Object.fromEntries(body.entries()))) return body

    appendSelectedOneTickAddonsToFormData(String(body.get('id') || ''), body, root)
    return body
  }

  if (typeof URLSearchParams !== 'undefined' && body instanceof URLSearchParams) {
    if (hasCheckoutBypassHint(Object.fromEntries(body.entries()))) return body

    appendSelectedOneTickAddonsToUrlSearchParams(body.get('id') || '', body, root)
    return body
  }

  return body
}

async function readJsonResponse(response: Response): Promise<unknown | null> {
  try {
    const responseWithBody = typeof response.clone === 'function' ? response.clone() : response
    if (typeof responseWithBody.json !== 'function') return null

    return responseWithBody.json()
  } catch {
    return null
  }
}

async function runCustomCartUpdateHook(windowRef: Window, response: Response) {
  const handleUpdateCartAfterATC = windowRef.__onetick_store__?.handleUpdateCartAfterATC
  if (!response.ok || typeof handleUpdateCartAfterATC !== 'function') return

  try {
    const addedItem = await readJsonResponse(response)
    if (!addedItem) return

    const cartResponse = await windowRef.fetch(CART_JSON_PATH)
    const cart = await readJsonResponse(cartResponse)
    await handleUpdateCartAfterATC(addedItem, cart)
  } catch {
    // OneTick cart drawer refresh is best-effort. Never block Shopify's add-to-cart response.
  }
}

export function prepareOneTickCartFetchRequest(
  input: RequestInfo | URL,
  init: RequestInit | undefined,
  root: OneTickAddonRoot
): [RequestInfo | URL, RequestInit | undefined] {
  if (!isCartAddRequest(input) || !init?.body) return [input, init]

  return [
    input,
    {
      ...init,
      body: appendAddonsToCartBody(init.body, getContentType(init.headers), root),
    },
  ]
}

/** Installs the storefront fetch interceptor for cart add/change while preserving Shopify's response path. */
export function installOneTickCartFetchInterceptor(options: InstallOneTickCartFetchInterceptorOptions = {}) {
  const windowRef = options.windowRef || window
  const root = options.root || windowRef.document
  const originalFetch = windowRef.fetch

  windowRef.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    const isCartAdd = isCartAddRequest(input)
    const isCartChange = isCartChangeRequest(input)
    const [nextInput, nextInit] = prepareOneTickCartFetchRequest(input, init, root)
    const response = await originalFetch.call(windowRef, nextInput, nextInit)
    if (isCartAdd && !(nextInit as any)?.__onetickHandlesCartUpdate) {
      await runCustomCartUpdateHook(windowRef, response)
    }
    if (isCartChange) {
      return cleanupOneTickAddonsAfterCartChange({
        windowRef,
        response,
        originalFetch,
        requestInit: nextInit,
      })
    }

    return response
  }

  return function uninstall() {
    windowRef.fetch = originalFetch
  }
}
