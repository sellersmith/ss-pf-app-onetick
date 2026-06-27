import { windowFunctionCustom } from '../../windowFunction'
import { CART_API_URL } from '../constant'
import { type FetchInterceptor } from '../interceptorTypes'
import { parseRequestBody } from '../parseRequestBody'
import { handleCartChange, setCartFormsLoading } from '../removeAddOnProduct'

/**
 * Intercepts fetch responses and processes changes to the cart.
 *
 * @type {FetchInterceptor}
 */
export const cartChangeInterceptor: FetchInterceptor = {
  async request(input, init = {}) {
    if (input.toString().includes(CART_API_URL.cartChange)) {
      setCartFormsLoading(true)
    }
    return [input, init]
  },

  /**
   * Handles the response from the fetch request.
   *
   * @param {Response} response - The response object from the fetch request.
   * @returns {Promise<Response>} - The original response or a modified response.
   */
  async response(response, { input, init }) {
    if (windowFunctionCustom().HANDLE_REMOVE_CART_ITEMS) {
      windowFunctionCustom().HANDLE_REMOVE_CART_ITEMS(response, handleCartChange)
    }
    if (response.url.includes(CART_API_URL.cartChange)) {
      const clonedResponse = response.clone()

      try {
        //Fallback to the window object if the response is not JSON
        // Check if the window object has a custom function to get the removed add-on product
        if (windowFunctionCustom().GET_REMOVE_ADD_ON_PRODUCT) {
          windowFunctionCustom().GET_REMOVE_ADD_ON_PRODUCT(handleCartChange, setCartFormsLoading)
        } else {
          const jsonData = await clonedResponse.json()
          const { items_removed, items } = jsonData
          const parseBody = await parseRequestBody(input, init)

          if (parseBody && typeof parseBody === 'object') {
            // remove filed unnecessary in body
            delete parseBody.quantity
            delete parseBody.line
            delete parseBody.id
          }

          // Check if there are items removed from the cart
          if (items_removed && items_removed.length && items_removed[0]) {
            // Reconstruct headers to preserve content-type, etc.
            const newHeaders = new Headers(clonedResponse.headers)

            // Handle the cart change
            const dataNewUpdate = await handleCartChange(items_removed[0], items, parseBody)

            // Create a new response with the updated data
            const newResponse = new Response(JSON.stringify({ ...jsonData, ...dataNewUpdate }), {
              status: clonedResponse.status,
              statusText: clonedResponse.statusText,
              headers: newHeaders,
            })
            // Return the newly created response (instead of the original one)
            return newResponse
          }
        }
      } catch (err) {
        setCartFormsLoading(false)
        console.error('[LoggerInterceptor] Error reading response:', err)
      } finally {
        setCartFormsLoading(false)
      }
    }
    // Return the original response
    return response
  },
}
