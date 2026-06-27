import {
  EAPIAppProxyTypes,
  EPlacementType,
  EProductOffersDirection,
  PRODUCT_OFFER_WARNING_DESCRIPTION_MAPPING,
} from '../../constants'
import { getProductOfferDisplayType, getProductOfferStylingAndAppendToStyle } from '../../helpers/product-offers'
import addEventUpsell from '../../helpers/product-offers/add-event-add-upsell'
import { addEventForQuantitySelector } from '../../helpers/product-offers/add-event-quantity-selector'
import { fetchAppProxyProductsToOffer } from '../../helpers/product-offers/query/fetch-products'
import { fetchProductsInCart } from '../../helpers/product-offers/query/fetch-products-in-cart'
import renderProductOfferBlockHtmlCode, {
  getDefaultProductOfferGridHTML,
  loadingSkeletonGrid,
} from '../../html/product-offers/block'
import renderProductOfferSliderHtmlCode, {
  getDefaultProductOfferSliderHTML,
  loadingSkeletonSlider,
} from '../../html/product-offers/slider'
import type { IProductOfferMetafieldData, IProductOffersStyling } from '../../types'
import { EDevices, getDevice } from '../../utils/get-device'
import observeCartChanges from '../../utils/observe-cart-changes'
import { cachedProductOffersHTML } from './store'

class OnetickProductOffersGroup extends HTMLElement {
  private displayType: any
  private currentDevice: EDevices = EDevices.MOBILE
  private isInitSkeletonLoading: boolean = false
  private productOffersStyling: IProductOffersStyling = {
    di: EProductOffersDirection.HORIZONTAL,
    ipsd: 3,
    ipsm: 1,
    idn: 8,
    cnd: 3,
    cnm: 1,
    isd: 10,
    ism: 10,
    dt: 'slider',
  }

  private container: any
  private slides: any
  private nextButton: any
  private prevButton: any

  private currentIndex: number = 0
  private enableScroll: boolean = true
  private itemsPerSlide: { desktop: number; mobile: number } = { desktop: 4, mobile: 1 }

  private colsPerRow: { desktop: number; mobile: number } = { desktop: 3, mobile: 1 }

  private disconnectVisibleObserver: any
  private disconnectPerformanceObserver: any
  private removeEventListenerOfNavigationButtons: any

  private productOffer: any
  private isCartDrawer: any

  handleShowBannerWarning(message: string) {
    const warningBannerEle = this.parentNode?.querySelector('.onetick-warning-banner') as HTMLElement
    const warningDescription = warningBannerEle?.querySelector('.onetick-warning-description')
    if (!warningBannerEle || !warningDescription) return

    warningBannerEle.style.display = 'block'
    warningDescription.innerHTML = message
  }

  async init() {
    this.displayType = getProductOfferDisplayType()
    this.productOffersStyling = window.__onetick_store__?.productOffersStyling?.[this.displayType] || {}
    this.isCartDrawer = !!this.getAttribute('data-allow-cached')
    const styleWrapperProductOffer = getProductOfferStylingAndAppendToStyle()
    if (this.displayType === 'slider') {
      this.itemsPerSlide = { desktop: this.productOffersStyling.ipsd || 4, mobile: this.productOffersStyling.ipsm || 1 }

      this.innerHTML = this.isCartDrawer
        ? cachedProductOffersHTML.get(this.id) || getDefaultProductOfferSliderHTML(styleWrapperProductOffer)
        : getDefaultProductOfferSliderHTML(styleWrapperProductOffer)

      this.container = this.querySelector('.onetick-slider-items')
      this.slides = this.querySelectorAll('.onetick-offer-container-item')
      this.prevButton = this.querySelector('button.control-prev')
      this.nextButton = this.querySelector('button.control-next')

      this.initSlideshow()
    } else {
      this.colsPerRow = { desktop: this.productOffersStyling.cnd || 3, mobile: this.productOffersStyling.cnm || 1 }
      this.innerHTML = this.isCartDrawer
        ? cachedProductOffersHTML.get(this.id) || getDefaultProductOfferGridHTML(styleWrapperProductOffer)
        : getDefaultProductOfferGridHTML(styleWrapperProductOffer)
    }

    this.currentDevice = getDevice(this.getBoundingClientRect().width)

    const onetickProductOffers = this.querySelector('onetick-product-offers') as HTMLElement
    onetickProductOffers.style.gap = this.currentDevice === EDevices.DESKTOP ? '48px' : '32px'
    this.prevButton && (this.prevButton.style.left = this.currentDevice === EDevices.DESKTOP ? '-28px' : '-16px')
    this.nextButton && (this.nextButton.style.right = this.currentDevice === EDevices.DESKTOP ? '-28px' : '-16px')

    this.style.setProperty(
      '--po-is',
      `${this.currentDevice === EDevices.MOBILE ? this.productOffersStyling.ism : this.productOffersStyling.isd}px`
    )

    this.style.setProperty(
      '--po-ips',
      `${this.currentDevice === EDevices.MOBILE ? this.productOffersStyling.ipsm : this.productOffersStyling.ipsd}`
    )

    this.displayType === 'block'
      && this.style.setProperty(
        '--po-cn',
        `${this.currentDevice === EDevices.MOBILE ? this.productOffersStyling.cnm : this.productOffersStyling.cnd}`
      )

    // Only show skeleton for first loading
    if (!this.isInitSkeletonLoading && !cachedProductOffersHTML.get(this.id)) {
      this.isInitSkeletonLoading = true
      const container = this.querySelector('.onetick-offer-container')
      const itemsPerShow
        = this.displayType === 'slider' ? this.itemsPerSlide[this.currentDevice] : this.colsPerRow[this.currentDevice]

      const parser = new DOMParser()

      const tempDocument = parser.parseFromString(
        this.displayType === 'slider'
          ? loadingSkeletonSlider(itemsPerShow, this.productOffersStyling.di)
          : loadingSkeletonGrid(itemsPerShow, this.productOffersStyling.di),
        'text/html'
      ).body

      tempDocument?.firstChild && container?.append(tempDocument?.firstChild)

      // Hide heading
      const heading = this.querySelector('.onetick-product-offers-title')
      if (heading) {
        ;(heading as HTMLElement).classList.remove('show')
      }
    }

    this.updateListProductRecommendations(false)
  }

  initDevice = () => {
    const device = getDevice(this.getBoundingClientRect().width)
    this.currentDevice = device
  }

  initDataProductOffer = (productOffer: IProductOfferMetafieldData) => {
    const { id, h, pl } = productOffer

    const onetickProductOffer = this.querySelector('onetick-product-offers')
    onetickProductOffer && onetickProductOffer.setAttribute('data-product-offer-id', id)
    onetickProductOffer && onetickProductOffer.setAttribute('data-product-offer-placement', pl)

    const heading = this.querySelector('.onetick-product-offers-title')
    heading && (heading.textContent = h)
  }

  initSlideshow = () => {
    this.initDevice()
    this.initVisibleObservers()
    this.initScrollAction()
    this.handleNavigationButtons()
  }

  connectedCallback() {
    this.disconnectPerformanceObserver = observeCartChanges(() => this.updateListProductRecommendations())
    this.init()
    window.addEventListener('resize', this.onResize.bind(this))
  }

  disconnectedCallback() {
    if (!this) return

    this.disconnectVisibleObserver && this.disconnectVisibleObserver()
    this.disconnectPerformanceObserver && this.disconnectPerformanceObserver()
    this.removeEventListenerOfNavigationButtons && this.removeEventListenerOfNavigationButtons()
    this.nextButton?.removeEventListener('click', this.handleNextNavigationButons.bind(this), { passive: true })
    this.prevButton?.removeEventListener('click', this.handlePrevNavigationButons.bind(this), { passive: true })
    window.removeEventListener('resize', this.onResize.bind(this))
    this.container && this.container.removeEventListener('scroll', this.updateNavigationButtonsState.bind(this))
  }

  onResize(e: Event) {
    const device = getDevice(this.getBoundingClientRect().width)

    if (device !== this.currentDevice) {
      this.currentDevice = device
      this.style.setProperty(
        '--po-is',
        `${device === EDevices.MOBILE ? this.productOffersStyling.ism : this.productOffersStyling.isd}px`
      )

      this.style.setProperty(
        '--po-ips',
        `${device === EDevices.MOBILE ? this.productOffersStyling.ipsm : this.productOffersStyling.ipsd}`
      )

      this.style.setProperty(
        '--po-cn',
        `${device === EDevices.MOBILE ? this.productOffersStyling.cnm : this.productOffersStyling.cnd}`
      )

      this.slides?.length
        && this.slides.forEach((slide: HTMLElement) =>
          slide.style.setProperty('width', `calc(100% / ${this.itemsPerSlide[device]})`)
        )
    }
  }

  addEventToNumberQuantity() {
    const addEvent = (element: HTMLElement) => {
      const btnIncrement = element.querySelector('.qty-btn.qty-add')
      const btnDecrement = element.querySelector('.qty-btn.qty-rem')
      const inputNumberQuantity = element.querySelector('.onetick-quantity-selector') as HTMLInputElement

      const changeNumberQuantity = (number: number) => {
        const newValue = parseInt(inputNumberQuantity.value) + number
        const min = parseInt(inputNumberQuantity.min) || 0
        const max = parseInt(inputNumberQuantity.max) || Infinity

        if (newValue >= min && newValue <= max) {
          inputNumberQuantity.value = newValue.toString()
        }
      }

      const handleIncrement = () => changeNumberQuantity(1)
      const handleDecrement = () => changeNumberQuantity(-1)

      btnIncrement?.addEventListener('click', handleIncrement)
      btnDecrement?.addEventListener('click', handleDecrement)
    }
    const listProductOffer = Array.from(this.querySelectorAll('.onetick-offer-container-item')) as HTMLElement[]
    listProductOffer.forEach(addEvent)
  }

  classLayoutSelectInput(number: string) {
    const mappingDirection = {
      [EProductOffersDirection.HORIZONTAL]: {
        [EDevices.MOBILE]: () => (+number > 1 ? 'onetick-flex-direction-column' : ''),
        [EDevices.DESKTOP]: () => (+number > 2 ? 'onetick-flex-direction-column' : ''),
      },
      [EProductOffersDirection.VERTICAL]: {
        [EDevices.MOBILE]: () => (+number > 1 ? 'onetick-flex-direction-column' : ''),
        [EDevices.DESKTOP]: () => (+number > 4 ? 'onetick-flex-direction-column' : ''),
      },
    }
    return mappingDirection[this.productOffersStyling.di][this.currentDevice]()
  }

  async updateListProductRecommendations(allowLoadingSpinner = true) {
    if (!this) return
    // Initialize the product offers when they are empty, as there were no recommended products in earlier fetched time.
    if (this?.innerHTML === '') {
      return this.init()
    }

    allowLoadingSpinner && !this.classList.contains('loading') && this.classList.add('loading')

    const masterProductId = this.getAttribute('data-trigger-product-id')
    const placement = masterProductId ? EPlacementType.PRODUCT_PAGE : EPlacementType.CART
    const { allProductIds: allCartProductIds, productFromOneTickIds } = await fetchProductsInCart(false)
    const triggerProducts = masterProductId ? [masterProductId] : allCartProductIds
    const response = await fetchAppProxyProductsToOffer(
      triggerProducts,
      placement,
      EAPIAppProxyTypes.GET_PRODUCTS_TO_OFFER_LIVE_VIEW
    )

    // No product offer match condition
    if (response?.message || !response?.productOffer) {
      this.removeSkeleton()
      this.innerHTML = ''
      // Remove cached html when no product offer match condition
      cachedProductOffersHTML.set(this.id, '')
      this.handleShowBannerWarning(
        PRODUCT_OFFER_WARNING_DESCRIPTION_MAPPING[response.message] || 'No product offer match with conditions'
      )
      return
    }

    // Hide in cart drawer
    if (this.isCartDrawer && response.productOffer.hc) {
      this.removeSkeleton()
      this.innerHTML = ''
    }

    const { productOffer, productsToOffer } = response
    this.productOffer = productOffer
    this.initDataProductOffer(productOffer)
    const { ec, l, max } = productOffer

    // Filter the products that already added from product offers
    const filteredProductsNotAddedFromOneTick = [
      ...new Map(productsToOffer.map(item => [item.id, item])).values(),
    ].filter(p => !productFromOneTickIds.includes(p.id))

    const filteredProductsNotInCart = ec
      ? filteredProductsNotAddedFromOneTick.filter(p => !allCartProductIds.includes(p.id))
      : filteredProductsNotAddedFromOneTick

    const displayProducts = filteredProductsNotInCart
      .slice(0, this.productOffersStyling.idn || (l ? max : 250))
      .sort((a, b) => (b.availableForSale === a.availableForSale ? 0 : a.availableForSale ? -1 : 1))

    if (!displayProducts.length) {
      return (this.innerHTML = '')
    }

    const slideToShowInDevice = this.itemsPerSlide[this.currentDevice]
    // Inject offered products into the container
    if (this.displayType === 'slider') {
      const html = displayProducts.reduce(
        (acc, cur) =>
          acc
          + renderProductOfferSliderHtmlCode(
            cur,
            slideToShowInDevice,
            this.productOffer,
            this.productOffersStyling.di,
            this.classLayoutSelectInput(
              this.style.getPropertyValue('--po-ips') !== 'undefined'
                ? this.style.getPropertyValue('--po-ips')
                : this.style.getPropertyValue('--po-cn')
            )
          ),
        ''
      )

      const onetickRecommendSliderItems = this.querySelector('.onetick-slider-items')

      // If no product offer match condition, remove the html
      if (!html) {
        this.innerHTML = ''
        return
      }
      if (onetickRecommendSliderItems) {
        onetickRecommendSliderItems.innerHTML = html
        this.addEventToNumberQuantity()
        addEventUpsell()
        addEventForQuantitySelector(onetickRecommendSliderItems)
      }

      // Update navigation buttons state and new slide items
      this.slides = this.querySelectorAll('.onetick-offer-container-item')
      this.initSlideshow()
    } else {
      const html = displayProducts.reduce(
        (acc, cur) =>
          acc
          + renderProductOfferBlockHtmlCode(
            cur,
            this.productOffer,
            this.productOffersStyling.di,
            this.classLayoutSelectInput(
              this.style.getPropertyValue('--po-ips') !== 'undefined'
                ? this.style.getPropertyValue('--po-ips')
                : this.style.getPropertyValue('--po-cn')
            )
          ),
        ''
      )

      const onetickRecommendBlockItems = this.querySelector('.onetick-grid-items')

      // If no product offer match condition, remove the html
      if (!html) {
        this.innerHTML = ''
        return
      }
      if (onetickRecommendBlockItems) {
        onetickRecommendBlockItems.innerHTML = html
        addEventUpsell()
        addEventForQuantitySelector(onetickRecommendBlockItems)
        this.addEventToNumberQuantity()
      }
    }

    // Remove loading skeleton
    this.removeSkeleton()

    // Show heading
    const heading = this.querySelector('.onetick-product-offers-title')
    if (heading) {
      ;(heading as HTMLElement).classList.add('show')
    }

    // Cached the html of Product offers for widget in Cart drawer
    if (this.isCartDrawer && this.id) {
      cachedProductOffersHTML.set(this.id, this.innerHTML)
    }
  }

  removeSkeleton = () => {
    this.querySelector(
      this.displayType === 'slider' ? '.onetick-slider-items-loading' : '.onetick-grid-items-loading'
    )?.remove()

    this.classList.remove('loading')
  }

  initVisibleObservers = () => {
    this.disconnectVisibleObserver && this.disconnectVisibleObserver()
    const observer = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach(entry => this.updateVisibleClasses(entry))
      },
      {
        root: this.container,
        threshold: 0.01,
      }
    )
    // Watch all the slides.
    this.slides.forEach((slide: HTMLElement) => observer.observe(slide))

    this.disconnectVisibleObserver = () => {
      observer.disconnect()
    }
  }

  updateNavigationButtonsState = () => {
    if (this.container.scrollLeft > 0) {
      this.prevButton.style.display = 'flex'
    } else {
      this.prevButton.style.display = 'none'
    }

    const maxScrollValue = this.container.scrollWidth - this.container.clientWidth - 1

    if (this.container.scrollLeft >= maxScrollValue) {
      this.nextButton.style.display = 'none'
    } else {
      this.nextButton.style.display = 'flex'
    }
  }

  updateVisibleClasses(entry: IntersectionObserverEntry) {
    const slide = entry.target

    if (entry.isIntersecting) {
      slide.classList.add('is-visible')
    } else {
      slide.classList.remove('is-visible')
    }
  }

  initScrollAction = () => {
    this.container.addEventListener('scroll', this.updateNavigationButtonsState.bind(this))
    this.slides.forEach((element: HTMLElement, index: number) => {
      if (index % this.itemsPerSlide[this.currentDevice] === 0) {
        element.style.scrollSnapStop = 'always'
      } else {
        element.style.scrollSnapStop = ''
      }
    })
  }

  handleNavigationButtons = () => {
    if (this.nextButton && this.prevButton) {
      this.updateNavigationButtonsState()
      this.removeEventListenerOfNavigationButtons && this.removeEventListenerOfNavigationButtons()
      this.nextButton.addEventListener('click', this.handleNextNavigationButons.bind(this), { passive: true })
      this.prevButton.addEventListener('click', this.handlePrevNavigationButons.bind(this), { passive: true })

      this.removeEventListenerOfNavigationButtons = () => {
        this.nextButton.removeEventListener('click', this.handleNextNavigationButons.bind(this), { passive: true })
        this.prevButton.removeEventListener('click', this.handlePrevNavigationButons.bind(this), { passive: true })
      }
    }
  }

  handleNextNavigationButons = async (event: MouseEvent) => {
    if (!this.enableScroll) return
    this.enableScroll = false

    const slidesLength = this.slides.length
    const limitIndexMax = slidesLength - this.itemsPerSlide[this.currentDevice]

    // Reset current index as first visible item
    this.currentIndex
      = Array.from(this.slides).findIndex(slide => (slide as Element).classList.contains('is-visible')) || 0

    let nextSlide = this.currentIndex + this.itemsPerSlide[this.currentDevice]
    if (nextSlide > limitIndexMax) {
      nextSlide = limitIndexMax
    }

    this.currentIndex = nextSlide
    await this.goToSlide(nextSlide)
    this.enableScroll = true
  }

  handlePrevNavigationButons = async (event: MouseEvent) => {
    if (!this.enableScroll) return
    this.enableScroll = false

    // Reset current index as first visible item
    this.currentIndex
      = Array.from(this.slides).findIndex(slide => (slide as Element).classList.contains('is-visible')) || 0

    let prevSlide = this.currentIndex - this.itemsPerSlide[this.currentDevice]

    if (prevSlide < 0) {
      prevSlide = 0
    }

    this.currentIndex = prevSlide
    await this.goToSlide(prevSlide)
    this.enableScroll = true
  }

  goToSlide = async (index: number) => {
    const { top, left } = this.getScrollOffset(index)

    this.updateNavigationButtonsState()
    return this.smoothScroll(top, left)
  }

  smoothScroll = (top: number, left: number) => {
    return new Promise(resolve => {
      const container = this.container
      const tolerance = 1 // Adjust this value if necessary

      container.scroll({
        top: top,
        left: left,
        behavior: 'smooth',
      })

      function checkScroll() {
        const scrollTop = container.scrollTop
        const scrollLeft = container.scrollLeft

        if (Math.abs(scrollTop - top) <= tolerance && Math.abs(scrollLeft - left) <= tolerance) {
          resolve(true)
        } else {
          requestAnimationFrame(checkScroll)
        }
      }

      checkScroll()
    })
  }

  getScrollOffset = (index: number) => {
    const currentSlide = this.slides[index] as HTMLElement
    let top = currentSlide?.offsetTop || 0
    let left = currentSlide?.offsetLeft || 0

    // NOTE: Because Safari uses the 2-value syntax
    function minmax(value: number, min: number, max: number) {
      value = Math.min(max, value)
      value = Math.max(min, value)
      return value
    }

    // Keep offsets within the scrollable area.
    top = minmax(top, 0, this.container.scrollHeight)
    left = minmax(left, 0, this.container.scrollWidth)

    return { top, left }
  }
}

customElements.get('onetick-product-offers-group')
  || customElements.define('onetick-product-offers-group', OnetickProductOffersGroup)
