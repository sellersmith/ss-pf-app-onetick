import { addCartManual } from '../../helpers/checkboxes/add-checkboxes-product-detail'
import { windowFunctionCustom } from '../windowFunction'
import { createFetchProxy } from './createFetchProxy'
import { cartChangeInterceptor } from './interceptors/cartChangeInterceptor'
import { checkboxesATCInterceptor } from './interceptors/checkboxesATCInterceptor'

const interceptors: any[] = []

!windowFunctionCustom().USAGE_REMOVE_ADD_ONE_WITH_ACTION && interceptors.push(cartChangeInterceptor)
windowFunctionCustom().ADD_ADDON_PRODUCT_FROM_CHECKBOXES
  ? windowFunctionCustom().ADD_ADDON_PRODUCT_FROM_CHECKBOXES(addCartManual)
  : interceptors.push(checkboxesATCInterceptor)

export const applyProxyForFetchApi = () => {
  // Create a fetch function that uses the above interceptors
  const myProxiedFetch = createFetchProxy(interceptors)

  // Optionally overwrite the global fetch
  window.fetch = myProxiedFetch

  // Backup reset the interceptor when myProxiedFetch be overwrite
  if (typeof windowFunctionCustom().RESET_INTERCEPTOR_FETCH_API === 'function') {
    windowFunctionCustom().RESET_INTERCEPTOR_FETCH_API(myProxiedFetch)
  }
}
