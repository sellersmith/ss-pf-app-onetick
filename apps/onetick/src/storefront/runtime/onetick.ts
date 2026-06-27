/* eslint-disable @typescript-eslint/no-unused-vars */
import './components/checkboxes/OnetickCheckbox'
import './components/checkboxes/OnetickDataAddonProducts'
import './components/checkboxes/OnetickDataTriggerProducts'
import { OnetickGroupCheckboxes } from './components/checkboxes/OnetickGroupCheckboxes'
import './components/checkboxes/OnetickPopup'
import './components/checkboxes/OnetickTextContainer'
import './components/checkboxes/OnetickVariantSelector'
import './components/free-shipping/OnetickFreeShippingBar'
import './components/product-offers/OnetickOfferTitle'
import './components/product-offers/OnetickOfferVariantSelector'
import './components/product-offers/OnetickProductOffersGroup'
import { hasProductOfferForCartDrawer } from './helpers/product-offers'
import fetchAddOnVariantCheckbox from './helpers/product-offers/query/fetch-addonvariant-checkbox'
import {
  handleInjectCheckboxesInputToATCForm,
  handleObserveCartDrawerUpdate,
  handleObserveCartDrawerUpdateWithCheckbox,
} from './helpers/progress-bar'
import { trackingUserBehaviors } from './helpers/tracking-user-behaviors'
import { applySelectedVariantProxy } from './modules/apply-selected-variant-proxy'
import { ObserverCartChangesAndRemoveAddOnProduct } from './modules/observe-cart-changes-and-remove-add-on'
import { applyProxyForFetchApi } from './utils/interceptorFetchApi'
import { publish, subscribe } from './utils/pubsub'
import { windowFunctionCustom } from './utils/windowFunction'
import { bootstrapOnetickStore } from './utils/bootstrap-store'

;(async function () {
  try {
    bootstrapOnetickStore()
    window.__onetick_store__ = window.__onetick_store__ || {}
    window.__onetick_store__['pubsub'] = { subscribe, publish }
    fetchAddOnVariantCheckbox()
      .then(() => {
        if (window.__onetick_store__?.addonVariants) {
          // This web-component needs window.__onetick_store__ to show the checkboxes
          // Otherwise it will remove the checkboxes
          customElements.get('onetick-group-checkboxes')
            || customElements.define('onetick-group-checkboxes', OnetickGroupCheckboxes)
        }
      })
      .catch(error => {
        console.error('[OneTick] Error when fetching addon variant checkbox', error)
      })

  } catch (error) {
    console.error('[OneTick] Error occurs in OneTick Theme App Extension:', error)
  }

  window.addEventListener('load', async () => {
    try {
      if (!window.__onetick_store__) throw new Error('window.__onetick_store__ is undefined.')

      trackingUserBehaviors()

      applySelectedVariantProxy()
      applyProxyForFetchApi()

      if (hasProductOfferForCartDrawer()) {
        handleObserveCartDrawerUpdate()
      }

      if (window.__onetick_store__?.activeCheckboxesCart?.length) {
        handleObserveCartDrawerUpdateWithCheckbox()
      }

      if (window.__onetick_store__?.activeCheckboxesProductDetail?.length) {
        handleInjectCheckboxesInputToATCForm()
      }

      const { activeCheckboxes, draftCheckboxes } = window?.__onetick_store__
      // check old user has problem remove add on product
      const isUserHasRemoveAddOnProduct
        = activeCheckboxes
        && draftCheckboxes
        && [...activeCheckboxes, ...draftCheckboxes].some(checkbox => typeof checkbox?.rwtc === 'boolean')

      isUserHasRemoveAddOnProduct
        && windowFunctionCustom().USAGE_REMOVE_ADD_ONE_WITH_ACTION
        && new ObserverCartChangesAndRemoveAddOnProduct()
    } catch (error) {
      console.error('[OneTick] Error occurs in OneTick Theme App Extension:', { error })
    }
  })
})()
