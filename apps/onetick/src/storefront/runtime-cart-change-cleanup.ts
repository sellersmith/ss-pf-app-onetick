// OneTick storefront runtime runs from the generated theme asset and must fail open on merchant storefronts.
import {
  isCartPlacementAddonWithoutMatchingTrigger,
  isProductDetailAddonForRemovedTrigger,
  type OneTickCartLineItem,
} from './runtime-cart-line-properties'

const CART_UPDATE_PATH = '/cart/update.js'

type OneTickFetch = (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>

interface OneTickCartChangePayload {
  items?: OneTickCartLineItem[]
  items_removed?: OneTickCartLineItem[]
}

export interface CleanupOneTickAddonsAfterCartChangeOptions {
  windowRef: Window
  response: Response
  originalFetch: OneTickFetch
  requestInit?: RequestInit
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

function findCartPlacementAddonKeysWithoutMatchingTrigger(cartItems: OneTickCartLineItem[]): string[] {
  return cartItems.flatMap(addOn =>
    addOn.key && isCartPlacementAddonWithoutMatchingTrigger(addOn, cartItems) ? [addOn.key] : []
  )
}

// Cart placement add-ons do not have one fixed trigger line. After any cart change, re-evaluate all
// remaining lines and remove add-ons whose trigger condition no longer matches the cart.
function findProductDetailAddonKeysForRemovedTrigger(
  cartItems: OneTickCartLineItem[],
  removedItem: OneTickCartLineItem
): string[] {
  return cartItems.flatMap(item =>
    item.key && isProductDetailAddonForRemovedTrigger(item, removedItem) ? [item.key] : []
  )
}

async function runCartRefreshHook(windowRef: Window, updatedCart: unknown) {
  const handleUpdateCartAfterATC = windowRef.__onetick_store__?.handleUpdateCartAfterATC
  if (typeof handleUpdateCartAfterATC !== 'function') return

  try {
    await handleUpdateCartAfterATC({}, updatedCart)
  } catch {
    // Theme refresh hooks are merchant custom code. Never block Shopify's cart-change response.
  }
}

function createMergedResponse(response: Response, payload: unknown, updatedCart: unknown): Response {
  if (typeof Response === 'undefined' || !updatedCart || typeof updatedCart !== 'object') return response

  return new Response(JSON.stringify({ ...(payload as object), ...(updatedCart as object) }), {
    status: response.status,
    statusText: response.statusText,
    headers: response.headers ? new Headers(response.headers) : undefined,
  })
}

function getContentType(headers: RequestInit['headers']): string {
  if (!headers) return ''

  if (typeof Headers !== 'undefined' && headers instanceof Headers) {
    return headers.get('Content-Type') || headers.get('content-type') || ''
  }

  if (Array.isArray(headers)) {
    return headers.find(([key]) => key.toLowerCase() === 'content-type')?.[1] || ''
  }

  return Object.entries(headers).find(([key]) => key.toLowerCase() === 'content-type')?.[1]?.toString() || ''
}

function parseRequestBodyPassthrough(init?: RequestInit): Record<string, unknown> {
  if (!init?.body) return {}

  const contentType = getContentType(init.headers)
  let body: Record<string, unknown> = {}

  try {
    if (typeof init.body === 'string') {
      if (contentType.includes('application/x-www-form-urlencoded')) {
        body = Object.fromEntries(new URLSearchParams(init.body).entries())
      } else {
        body = JSON.parse(init.body)
      }
    } else if (typeof FormData !== 'undefined' && init.body instanceof FormData) {
      body = Object.fromEntries(init.body.entries())
    } else if (typeof URLSearchParams !== 'undefined' && init.body instanceof URLSearchParams) {
      body = Object.fromEntries(init.body.entries())
    }
  } catch {
    return {}
  }

  delete body.id
  delete body.line
  delete body.quantity
  delete body.updates
  return body
}

export async function cleanupOneTickAddonsAfterCartChange(
  options: CleanupOneTickAddonsAfterCartChangeOptions
): Promise<Response> {
  const { windowRef, response, originalFetch, requestInit } = options
  if (!response.ok) return response

  try {
    const payload = (await readJsonResponse(response)) as OneTickCartChangePayload | null
    const removedItem = payload?.items_removed?.[0]
    const items = payload?.items || []
    if (!removedItem || !items.length) return response

    const addOnKeysToRemove = [
      ...new Set([
        ...findProductDetailAddonKeysForRemovedTrigger(items, removedItem),
        ...findCartPlacementAddonKeysWithoutMatchingTrigger(items),
      ]),
    ]
    if (!addOnKeysToRemove.length) return response

    // Preserve unrelated cart/change parameters while issuing the follow-up cart/update.js cleanup.
    const updates = addOnKeysToRemove.reduce<Record<string, 0>>((acc, key) => {
      acc[key] = 0
      return acc
    }, {})
    const updateResponse = await originalFetch.call(windowRef, CART_UPDATE_PATH, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        updates,
        ...parseRequestBodyPassthrough(requestInit),
      }),
    })
    const updatedCart = await readJsonResponse(updateResponse)

    await runCartRefreshHook(windowRef, updatedCart)
    return createMergedResponse(response, payload, updatedCart)
  } catch {
    return response
  }
}
