import { EOneTickOrdersProperties } from '../../../constants'
import {
  addCartManual,
  handleAddCheckboxesATCDataByFormData,
  handleAddCheckboxesATCDataByJSON,
  handleAddCheckboxesATCDataByParams,
  isRequestFromOldVersionCustomCodeForATC,
} from '../../../helpers/checkboxes/add-checkboxes-product-detail'
import { windowFunctionCustom } from '../../windowFunction'
import { CART_API_URL } from '../constant'
import { type FetchInterceptor } from '../interceptorTypes'
import { parseRequestBody } from '../parseRequestBody'

/**
 * @author Sona
 *
 * @description
 * This function is used to handle ATC checkboxes on the product details.
 * The steps are carried out in the following order:
 *    1. Check the /cart/add requests.
 *    2. Verify the variant ID inside the body.
 *    3. Check all checkboxes that match the corresponding trigger variant ID and product ID.
 *    4. Add the selected addon products to the body.
 *    5. Proceed with the request as usual with the updated body.
 */
export const checkboxesATCInterceptor: FetchInterceptor = {
  async request(input, init) {
    try {
      if (!windowFunctionCustom().ADD_ADDON_PRODUCT_FROM_CHECKBOXES_WITH_RESPONSE) {
        if (typeof input !== 'string') return [input, init || {}]

        // Handle for add to cart request
        if (input.includes(CART_API_URL.cartAdd) && init && init.body) {
          const contentType = (init.headers as Record<string, string>)?.['Content-Type']
          if (contentType?.includes('application/x-www-form-urlencoded') && typeof init.body === 'string') {
            const params = new URLSearchParams(init.body)
            const variantId = params.get('id')
            init.body = handleAddCheckboxesATCDataByParams(variantId || '', params)
          } else if (typeof init.body === 'string') {
            // Handle for add to cart request by JSON
            const body = await parseRequestBody(input, init)
            // Check if the request is from the old version of custom code for ATC
            // If it is, we will not add checkboxes to the cart
            const isOldRequest = isRequestFromOldVersionCustomCodeForATC(body?.items)

            if (Array.isArray(body?.items) && body.items.length) {
              const variantId = body.items[0].id
              const items = body.items
              body.items = isOldRequest ? [] : handleAddCheckboxesATCDataByJSON(variantId, items)
              init.body = JSON.stringify(body)
            }
          } else if (init.body instanceof FormData) {
            // Handle for add to cart request by FormData
            const formData = init.body
            const variantId = formData.get('id') as string
            const urlSearchParams = new URLSearchParams(formData as any)

            if (!urlSearchParams.toString().includes(EOneTickOrdersProperties.ONETICK_CHECKBOX_ID_FLAG)) {
              init.body = handleAddCheckboxesATCDataByFormData(variantId, formData)
            }
          }
        }
      }
    } catch (err) {
      console.error('[checkboxesATCInterceptor] Error reading request:', err)
    }

    return [input, init || {}]
  },

  async response(response) {
    if (windowFunctionCustom().ADD_ADDON_PRODUCT_FROM_CHECKBOXES_WITH_RESPONSE) {
      try {
        if (response.url.includes(CART_API_URL.cartAdd)) {
          const clonedResponse = response.clone()
          const jsonData = await clonedResponse.json()
          if (jsonData) {
            const { variant_id, items } = jsonData
            if (items && items.length && items[0].properties?.__onetick_properties) {
              return response
            }
            await addCartManual(variant_id)
          }
        }
      } catch (error) {
        console.error('[checkboxesATCInterceptor] Error reading response:', error)
      }
    }
    return response
  },
}
