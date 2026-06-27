/* eslint-disable max-len */
/* eslint-disable no-useless-constructor */
import {
  CHECKBOX_WARNING_DESCRIPTION_MAPPING,
  CHECKBOX_WARNING_PRIORITIES,
  ECheckboxWarning,
  EHtmlSelectors,
  EOneTickOrderPropertyKeys,
  EPlacementType,
  EPubSubEvents,
  ETriggerProductsType,
} from '../../constants'
import { getAddToCartForms } from '../../helpers/checkboxes/get-atc-form'
import {
  filterCheckboxForMasterProduct,
  filterCheckboxTriggerByVariants,
  sortCheckboxes,
} from '../../helpers/checkboxes/sort-and-match-condition'
import { getOneTickOrderProperties } from '../../helpers/handle-onetick-order-properites'
import { fetchProductsInCart } from '../../helpers/product-offers/query/fetch-products-in-cart'
import { renderCheckboxContainerHtmlCode } from '../../html/checkbox-container'
import { renderCheckboxSkeleton } from '../../html/checkbox/checkbox-skeleton'
import { VariantChangeListener } from '../../modules/variant-change-listener'
import { handleRemoveElement } from '../../utils/handle-remove-element'
import observeCartChanges, { lastFetchedCartProducts } from '../../utils/observe-cart-changes'
import { publish, subscribe } from '../../utils/pubsub'

const {
  ALL_PRODUCTS,
  PRODUCT_COLLECTIONS,
  PRODUCT_TAGS,
  PRODUCT_TYPES,
  PRODUCT_VERDORS,
  SPECIFIC_PRODUCTS,
  SPECIFIC_VARIANTS,
} = ETriggerProductsType

export class OnetickGroupCheckboxes extends HTMLElement {
  private warningBannerEle: HTMLElement | null | undefined
  private warningDescription: HTMLElement | null | undefined
  private isCheckboxesGroupInCartDrawer: boolean | undefined

  private bannerWarningKey: string | undefined | null
  private nameCheckboxDraftOnly: string | undefined
  private currentMasterProductId: string | undefined | null
  private currentMasterProductTitle: string | undefined | null
  private disconnectPerformanceObserver: any
  private listenerVariantChange: VariantChangeListener | undefined

  constructor() {
    super()
  }

  isContainProductAddedByCheckboxInCart(onetickCheckbox: any, allProductProperties: any[]) {
    return allProductProperties.some(properties => {
      const otProperties = getOneTickOrderProperties(properties)
      return onetickCheckbox.id === otProperties?.[EOneTickOrderPropertyKeys.ONETICK_WIDGET_ID_FLAG]
    })
  }

  isCheckboxMatchWithCondition(onetickCheckbox: any, allProducts: any, allProductProperties: any) {
    try {
      const { tpt, tp, hcd, exc, up, etp, ett } = onetickCheckbox

      const listCondition: any = {
        [PRODUCT_COLLECTIONS]: 'collections',
        [PRODUCT_TAGS]: 'tags',
        [PRODUCT_VERDORS]: 'vendor',
        [PRODUCT_TYPES]: 'productType',
        [SPECIFIC_PRODUCTS]: 'id',
        [SPECIFIC_VARIANTS]: 'variant_id',
      }

      if (ett && etp) {
        const fieldFilterExcluded: any = listCondition[ett] || ''

        if (fieldFilterExcluded) {
          // Check if the checkbox trigger product excluded
          for (const product of allProducts) {
            if (Array.isArray(product[fieldFilterExcluded])) {
              if (product[fieldFilterExcluded].some((element: any) => etp.includes(element.toString()))) {
                return false
              }
            } else {
              if (etp.includes(product[fieldFilterExcluded].toString())) {
                return false
              }
            }
          }
        }
      }

      // Hide in card drawer
      if (this.isCheckboxesGroupInCartDrawer && hcd) return false

      // Do not show the checkbox if the add-on has already been added to the cart
      if (this.isContainProductAddedByCheckboxInCart(onetickCheckbox, allProductProperties)) return false

      if (tpt === ALL_PRODUCTS || !tpt) {
        //check is exclude checkbox in cart
        return !exc || !allProducts.some((e: any) => e.id === up)
      }

      const checkboxTriggerProductType = tpt
      const checkboxTriggerProduct = tp

      if (!checkboxTriggerProduct) return false
      // Check if the checkbox trigger product type is specific variants
      if (checkboxTriggerProductType === SPECIFIC_VARIANTS) {
        return (
          lastFetchedCartProducts?.items?.length
          && lastFetchedCartProducts.items.some((item: any) => checkboxTriggerProduct.includes(`${item?.id}`))
        )
      }

      const fieldFilter = listCondition[checkboxTriggerProductType] || ''

      if (!fieldFilter) return false

      for (const product of allProducts) {
        if (Array.isArray(product[fieldFilter])) {
          if (product[fieldFilter].some((element: any) => checkboxTriggerProduct.includes(element.toString()))) {
            if (!exc || product.id !== up) return true
          }
        } else {
          if (checkboxTriggerProduct.includes(product[fieldFilter].toString())) {
            if (!exc || product.id !== up) return true
          }
        }
      }
      return false
    } catch (error) {
      console.error(error)
    }
  }

  async renderCheckboxWithCondition(listCheckboxes: any) {
    try {
      const { allProducts, allProductProperties } = await fetchProductsInCart()
      const { sortOptionCart } = window.__onetick_store__
      const { cso, cco } = sortOptionCart

      const listCheckboxesMatched = []
      if (allProducts.length === 0) {
        if (this.isCheckboxesGroupInCartDrawer) {
          this.innerHTML = ''
          return
        }
        this.handleAddBannerWarning(ECheckboxWarning.CART_EMPTY)
        return this.handleShowBannerWarningByPriority()
      }

      for (const element of listCheckboxes) {
        if (this.isCheckboxMatchWithCondition(element, allProducts, allProductProperties)) {
          listCheckboxesMatched.push(element)
        }
      }

      if (listCheckboxesMatched.length === 0) {
        if (this.isCheckboxesGroupInCartDrawer) {
          this.innerHTML = ''
          return
        }
        if (this.warningBannerEle && this.warningDescription) {
          this.warningBannerEle.style.display = 'block'
          this.warningDescription.innerHTML
            = CHECKBOX_WARNING_DESCRIPTION_MAPPING[ECheckboxWarning.NO_CHECKBOXES_APPLIED]
        }
      }

      const sortedCheckboxesData = sortCheckboxes(listCheckboxesMatched, { so: cso, co: cco })

      const html = sortedCheckboxesData
        .map((checkboxData: any) =>
          renderCheckboxContainerHtmlCode(
            checkboxData,
            this.currentMasterProductId || '',
            this.currentMasterProductTitle || '',
            this.isCheckboxesGroupInCartDrawer
          )
        )
        .join('')

      this.innerHTML = html
    } catch (error) {
      console.error(error)
    }
  }

  handleShowBannerWarningByPriority() {
    if (this.bannerWarningKey) {
      if (this.warningBannerEle && this.warningDescription) {
        this.warningBannerEle.style.display = 'block'
        if (this.bannerWarningKey === ECheckboxWarning.ONE_CHECKBOX_AND_DRAFT) {
          this.warningDescription.innerHTML = CHECKBOX_WARNING_DESCRIPTION_MAPPING[this.bannerWarningKey](
            this.nameCheckboxDraftOnly
          )
        } else {
          this.warningDescription.innerHTML = CHECKBOX_WARNING_DESCRIPTION_MAPPING[this.bannerWarningKey]
        }
      }

      // Only remove the element when it is in the cart or when there is no trigger condition based on the variant, as it might not meet the condition from the start
      const { activeCheckboxes, isCartPage } = window.__onetick_store__ || {}
      const filteredCheckboxTriggerByVariants = filterCheckboxTriggerByVariants(activeCheckboxes || [])
      const shouldRemoveElement
        = !filteredCheckboxTriggerByVariants.length || isCartPage || this.isCheckboxesGroupInCartDrawer
      return handleRemoveElement(this, CHECKBOX_WARNING_DESCRIPTION_MAPPING[this.bannerWarningKey], shouldRemoveElement)
    }
  }

  handleAddBannerWarning(textKey: ECheckboxWarning) {
    if (
      !this.bannerWarningKey
      || CHECKBOX_WARNING_PRIORITIES[textKey] < CHECKBOX_WARNING_PRIORITIES[this.bannerWarningKey]
    ) {
      this.bannerWarningKey = textKey
    }
  }

  handleCheckboxInProductDetails() {
    // Remove container if no checkbox is applied to master product
    const closestSection = this.closest(EHtmlSelectors.SECTION)
    if (!closestSection) return handleRemoveElement(this, `Checkbox group is not in Section with product details`)

    const atcForms = getAddToCartForms(this)
    if (!atcForms.length) {
      this.handleAddBannerWarning(ECheckboxWarning.CHECKBOX_OUTSIDE_PRODUCT_DETAILS_AND_CART)
    }

    const closestOnetickCheckboxesGroup = closestSection.querySelector('onetick-group-checkboxes')

    // Remove checkboxes groups when current group is not the closestOnetickCheckboxesGroup
    // to prevent multiple checkboxes groups in same Product Details

    if (!this.isSameNode(closestOnetickCheckboxesGroup)) {
      this.handleAddBannerWarning(ECheckboxWarning.MORE_THAN_ONE_BLOCK_IN_PRODUCT_DETAILS)
    }

    const { activeCheckboxesProductDetail, activeCheckboxesCart, draftCheckboxes } = window.__onetick_store__

    if (
      activeCheckboxesProductDetail
      && !activeCheckboxesProductDetail.length
      && !draftCheckboxes.find((e: any) => !(e.tpl === EPlacementType.CART))
    ) {
      if (activeCheckboxesCart && activeCheckboxesCart.length === 1) {
        this.handleAddBannerWarning(ECheckboxWarning.ONE_CHECKBOX_FOR_CART_IN_PRODUCT_DETAILS)
      } else if (activeCheckboxesCart && activeCheckboxesCart.length > 1) {
        this.handleAddBannerWarning(ECheckboxWarning.NO_CHECKBOX_FOR_PRODUCT_DETAILS)
      }
    }

    this.handleShowBannerWarningByPriority()
  }

  handleCheckboxInCartAndCartDrawer() {
    const { activeCheckboxesCart } = window.__onetick_store__

    if (!this.isCheckboxesGroupInCartDrawer) {
      const closestOnetickCheckboxesGroup = document.querySelectorAll(
        'onetick-group-checkboxes'
      ) as NodeListOf<HTMLElement>

      const firstOnetickCheckboxesGroup = Array.from(closestOnetickCheckboxesGroup).find(elm => {
        return !elm.hasAttribute('data-drawer-cart') && !elm.getAttribute('data-target-product')
      })

      if (firstOnetickCheckboxesGroup && !this.isSameNode(firstOnetickCheckboxesGroup)) {
        this.handleAddBannerWarning(ECheckboxWarning.MORE_THAN_ONE_BLOCK_IN_CART_PAGE)
      }

      const { activeCheckboxesProductDetail, activeCheckboxesCart, draftCheckboxes } = window.__onetick_store__

      if (
        activeCheckboxesCart
        && !activeCheckboxesCart.length
        && !draftCheckboxes.find((e: any) => e.tpl === EPlacementType.CART)
      ) {
        if (activeCheckboxesProductDetail && activeCheckboxesProductDetail.length === 1) {
          this.handleAddBannerWarning(ECheckboxWarning.ONE_CHECKBOX_FOR_PRODUCT_DETAILS_IN_CART)
        } else if (activeCheckboxesProductDetail && activeCheckboxesProductDetail.length > 1) {
          this.handleAddBannerWarning(ECheckboxWarning.NO_CHECKBOX_FOR_PRODUCT_CART)
        }
      }
    }

    this.handleShowBannerWarningByPriority()
    this.renderCheckboxWithCondition(activeCheckboxesCart)
  }

  handleAddBannerWhenCheckboxDraft(activeCheckboxes: any, draftCheckboxes: any) {
    if (!activeCheckboxes.length && draftCheckboxes.length) {
      if (draftCheckboxes.length === 1) {
        this.handleAddBannerWarning(ECheckboxWarning.ONE_CHECKBOX_AND_DRAFT)
        this.nameCheckboxDraftOnly = draftCheckboxes[0].t
      } else {
        this.handleAddBannerWarning(ECheckboxWarning.ALL_CHECKBOXES_ARE_DRAFT)
      }
    }
  }

  init(isUpdate: boolean) {
    try {
      this.isCheckboxesGroupInCartDrawer = this.getAttribute('data-drawer-cart') === 'true'
      this.warningBannerEle = this.parentNode?.querySelector('.onetick-checkboxes-warning-banner')
      this.warningDescription = this.warningBannerEle?.querySelector('.onetick-warning-description') as HTMLElement

      const { isCartPage, activeCheckboxesProductDetail, draftCheckboxes, activeCheckboxesCart }
        = window.__onetick_store__

      if (this.currentMasterProductId) {
        this.handleAddBannerWhenCheckboxDraft(
          activeCheckboxesProductDetail,
          draftCheckboxes.filter((e: any) => !(e.tpl === EPlacementType.CART))
        )

        if (!this.querySelectorAll('onetick-checkbox').length && activeCheckboxesProductDetail.length > 0) {
          this.handleAddBannerWarning(ECheckboxWarning.NO_CHECKBOXES_APPLIED)
        }
        !isUpdate && this.handleCheckboxInProductDetails()

        // Add event to form for tracking added upsell
      } else if (isCartPage || this.isCheckboxesGroupInCartDrawer) {
        !isUpdate && (this.innerHTML = renderCheckboxSkeleton(this.isCheckboxesGroupInCartDrawer))
        this.handleAddBannerWhenCheckboxDraft(
          activeCheckboxesCart,
          draftCheckboxes.filter((e: any) => e.tpl === EPlacementType.CART)
        )

        this.handleCheckboxInCartAndCartDrawer()
      } else {
        this.handleAddBannerWarning(ECheckboxWarning.CHECKBOX_OUTSIDE_PRODUCT_DETAILS_AND_CART)
        this.handleShowBannerWarningByPriority()
      }

      subscribe(EPubSubEvents.SELECTED_VARIANT_CHANGE, ({ selectedVariantId }: { selectedVariantId: string }) => {
        this.updateDataVariantId(selectedVariantId)
      })
    } catch (error) {
      console.error(error)
    }
  }

  updateDataVariantId(variantId: string = '') {
    const selectedVariantValue = variantId || this.listenerVariantChange?.getSelectedVariant()?.value || ''
    if (selectedVariantValue) {
      this.setAttribute('data-variant-id', selectedVariantValue)
    }
  }

  createAndUpdateListCheckbox(isUpdate: boolean = false) {
    this.updateDataVariantId()

    this.bannerWarningKey = null
    this.warningBannerEle && (this.warningBannerEle.style.display = 'none')
    this.fetchAndRenderRemoteData().then(() => {
      this.init(isUpdate)
    })
  }

  connectedCallback() {
    this.listenerVariantChange = new VariantChangeListener(this)
    this.disconnectPerformanceObserver = observeCartChanges(() => this.createAndUpdateListCheckbox(true))
    this.createAndUpdateListCheckbox()
  }

  disconnectedCallback() {
    if (!this) return

    this.disconnectPerformanceObserver && this.disconnectPerformanceObserver()
  }

  async filterConditionAndSortCheckboxes(activeCheckboxes: any, sortOption: any, currentMasterProductId: string) {
    const appliedCheckboxesForMasterProduct = await filterCheckboxForMasterProduct(
      activeCheckboxes,
      currentMasterProductId,
      this.listenerVariantChange
    )
    const sortedCheckboxesData = sortCheckboxes(appliedCheckboxesForMasterProduct, sortOption)

    const html = sortedCheckboxesData
      .map((checkboxData: any) =>
        renderCheckboxContainerHtmlCode(
          checkboxData,
          currentMasterProductId,
          this.currentMasterProductTitle || '',
          this.isCheckboxesGroupInCartDrawer
        )
      )
      .join('')

    this.innerHTML = html
  }

  async fetchMoreCheckbox() {
    // If using new liquid theme code, ignore this function
    // ONLY fetch checkboxes data when using new liquid theme code or store has more than PAGINATE_PRODUCTS_PER_PAGE products
    const isUseOnetickThemeCode = this.getAttribute('data-onetick-theme-code')

    // If store has more than PAGINATE_PRODUCTS_PER_PAGE products, fetch products from the next page
    const isRequiredFetchAddon = this.getAttribute('data-onetick-require-fetch')

    if (!isRequiredFetchAddon && !isUseOnetickThemeCode) return
  }

  async fetchAndRenderRemoteData() {
    try {
      await this.fetchMoreCheckbox()
      /*
       * Because limitation of Shopify Liquid, we cannot access the section.settings through app block
       * But we can access by using snippet, so that, I created a new element
       * with class .onetick-master-product to display the masterProductId
       *
       * For vintage theme code, we still able to access the section.settings
       */
      const elementStoreMasterProductId = this.parentElement?.querySelector('.onetick-master-product')

      // Assuming 'this' is an HTMLElement and elementStoreMasterProductId is an HTMLElement or null/undefined
      const sourceElement = elementStoreMasterProductId || this
      this.currentMasterProductId = sourceElement.getAttribute('data-target-product')
      this.currentMasterProductTitle = sourceElement.getAttribute('data-target-product-title')

      if (!this.currentMasterProductId) return

      this.setAttribute('data-target-product', this.currentMasterProductId)

      const { activeCheckboxesProductDetail, sortOption } = window.__onetick_store__
      const checkboxTriggerByVariants = filterCheckboxTriggerByVariants(activeCheckboxesProductDetail)

      await this.filterConditionAndSortCheckboxes(
        activeCheckboxesProductDetail,
        sortOption,
        this.currentMasterProductId
      )

      const isCheckboxTriggerByVariants = !!checkboxTriggerByVariants?.length

      // Function to handle when the checkbox is triggered by variants
      const handleCheckboxTrigger = () => {
        publish(EPubSubEvents.REMOVE_DATA_INPUT_FORM)
        this.createAndUpdateListCheckbox()
      }

      // Determine the callback function to use based on the isCheckboxTriggerByVariants condition
      const callBackListener = isCheckboxTriggerByVariants ? handleCheckboxTrigger : this.updateDataVariantId

      if (this.listenerVariantChange) {
        this.listenerVariantChange.listen(callBackListener)
      }
    } catch (error) {
      console.error(error)
    }
  }
  catch(e: any) {
    console.error(e?.message || e)
  }
}
