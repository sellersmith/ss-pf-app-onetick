/**
 * Interceptor interface:
 * - `request` (optional): Modify the request before it is sent.
 * - `response` (optional): Modify the response after it is received.
 */
export interface FetchInterceptor {
  /**
   * request(input, init):
   *   Return a tuple of [newInput, newInit] if you want to change them.
   *   Otherwise, return the original or nothing.
   */
  request?(
    input: RequestInfo,
    init?: RequestInit
  ): void | [RequestInfo, RequestInit] | [RequestInfo] | Promise<void | [RequestInfo, RequestInit] | [RequestInfo]>

  /**
   * response(response):
   *   Return a new or modified Response (or a Promise of one).
   */
  response?: (
    response: Response,
    { input, init }: { input: RequestInfo; init?: RequestInit }
  ) => Response | Promise<Response>
}

/**
 * Basic shape of a Shopify line item in the cart.
 * Expand this with whatever fields you use: variant_id, product_title, etc.
 */
export interface ShopifyLineItem {
  key: string // e.g. "fdb2c96ab7df51234abc..."
  id?: number // variant ID (sometimes shown as "variant_id")
  quantity: number
  title?: string
  // ... more fields
}

/** Basic shape of the entire cart. */
export interface ShopifyCart {
  items: ShopifyLineItem[]
  // ... possibly more fields like total_price, note, etc.
}
