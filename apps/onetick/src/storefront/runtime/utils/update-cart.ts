/* eslint-disable max-lines */
import morphdom from 'morphdom'
import { EHtmlSelectors, EPubSubEvents } from '../constants'
import { publish } from './pubsub'
import { windowFunctionCustom } from './windowFunction'

// Dawn, Craft, Taste, Refresh, Sense
function handleFreeShopifyTheme(addedItemRes: any): void {
  fetch('/?sections=cart-notification-product,cart-notification-button,cart-drawer,cart-icon-bubble')
    .then(response => response.json())
    .then(sections => {
      addedItemRes.sections = sections
      const hasCartItems = addedItemRes?.items && addedItemRes.items.length > 0

      const cartDrawer = document.querySelector('cart-drawer') || document.querySelector('cart-notification')
      if (cartDrawer && window.location.pathname !== '/cart' && hasCartItems) {
        cartDrawer.classList.remove('is-empty')
        if (typeof (cartDrawer as any).renderContents === 'function') {
          ;(cartDrawer as any).renderContents(addedItemRes)
        }
      }

      typeof window.publish === 'function'
        && window.publish(EPubSubEvents.CART_UPDATE, {
          cartData: addedItemRes,
        })
    })
    .catch(error => console.error('Error fetching sections:', error))
}

// Impact 3.0.0
function handleImpactTheme(cart: any) {
  fetch('/?section_id=cart-drawer')
    .then(d => d.text())
    .then(text => {
      const parser = new DOMParser()
      const sectionInnerHTML = parser.parseFromString(text, 'text/html')
      const cartFormInnerHTML = sectionInnerHTML.getElementById('cart-drawer')?.innerHTML

      // Update the cart-drawer inner HTML
      ;(document.getElementById('cart-drawer') as HTMLElement).innerHTML = cartFormInnerHTML || ''

      // Click the element with aria-controls="cart-drawer"
      ;(document.querySelector('[aria-controls="cart-drawer"]') as HTMLElement)?.click()

      // Update the cart count and set opacity
      const cartCountElement: HTMLElement | null = document.querySelector('.header__cart-count .count-bubble')
      if (cartCountElement) {
        cartCountElement.innerHTML = cart.item_count
        cartCountElement.style.opacity = '1'
      }
    })
    .catch(error => console.error('Failed to update cart Impact Theme', error))
}

// Athens 1.6.1
function handleAthensTheme(cart: any) {
  fetch('/cart?view=mini-cart')
    .then(d => d.text())
    .then(text => {
      const parser = new DOMParser()
      const sectionInnerHTML = parser.parseFromString(text, 'text/html')
      const cartFormInnerHTML = sectionInnerHTML.getElementById('HeaderMiniCart')

      // Update the HeaderMiniCart inner HTML
      const headerMiniCart = document.getElementById('HeaderMiniCart')
      headerMiniCart && cartFormInnerHTML && (headerMiniCart.innerHTML = cartFormInnerHTML.innerHTML)

      // Update the cart link quantity or append it if it doesn't exist
      const cartLinkQuantity = document.querySelector('.head-slot-cart-link .head-slot-cart-link-quantity')
      if (cartLinkQuantity) {
        cartLinkQuantity.innerHTML = cart.item_count
      } else {
        const cartLink = document.querySelector('.head-slot-cart-link')
        const span = document.createElement('span')
        span.className = 'head-slot-cart-link-quantity'
        span.textContent = cart.item_count
        cartLink && cartLink.appendChild(span)
      }

      // Click the cart link
      ;(document.querySelector('a.head-slot-nav-link.head-slot-cart-link') as HTMLElement).click()
    })
    .catch(error => console.error('Failed to update cart Athens Theme', error))
}

// Flow
function handleFlowTheme(cart: any) {
  window.wetheme.updateCartDrawer(cart)
  window.wetheme.toggleRightDrawer('cart', true, { cart })
}

// Gecko theme
function handleGeckoTheme(addedItemRes: any) {
  window.geckoShopify.onCartUpdate(1, 1, addedItemRes.id)
}

// Alto theme
function handleAltoTheme() {
  window.cart.getCart()
}

// Debutify theme
function handleDebutifyTheme() {
  window.theme.ajaxCart.update()
}

// Avone theme
function handleAvoneTheme() {
  window.CartJS.getCart()
}

// Showtime theme
function handleShowtimeTheme(cart: any) {
  window.Shopify.updateQuickCart(cart)
}

// Rebranding theme
function handleRebrandingTheme(cart: any) {
  const _config = {
    cartCountSelector: '.cartCountSelector',
    cartTotalSelector: '.cartTotalSelector',
  }

  const ajaxLoadPage = (url: string): void => {
    fetch(url)
      .then(response => response.text())
      .then(data => {
        const parser = new DOMParser()
        const doc = parser.parseFromString(data, 'text/html')
        const newContent = doc.querySelector('#cart-dropdown-span')?.innerHTML
        if (newContent) {
          document.querySelector('#cart-dropdown-span')!.innerHTML = newContent
        }
      })
      .catch(error => console.error('Failed to update cart dropdown', error))
  }

  const cartCountElement = document.querySelector(_config.cartCountSelector)
  const cartTotalElement = document.querySelector(_config.cartTotalSelector)

  if (cartCountElement) {
    const value = cartCountElement.innerHTML || '0'
    cartCountElement.innerHTML = value.replace(/[0-9]+/, cart.item_count.toString())
    cartCountElement.classList.remove('hidden')
    if (cartTotalElement) {
      cartTotalElement.innerHTML = window.Shopify.formatMoney(cart.total_price, window.theme.moneyFormat).replace(
        /((\,00)|(\.00))$/g,
        ''
      )
    }
  }

  ajaxLoadPage('/cart?view=mini-cart') // Ensure the URL is passed correctly
}

// Envy theme
function handleEnvyTheme(cart: any) {
  window.wetheme.updateCartDrawer(cart)
  window.wetheme.drawer.slideouts.right.open()
}

// Marker theme
function handleMarkerTheme(): void {
  window.theme.cart.fetchTotals()
  window.theme.cart.updateAllHtml()
}

// Express theme
function handleExpressTheme(addedItemRes: any) {
  window.carts.forEach(function (e: any) {
    e.onCartUpdated(addedItemRes.id)
  })
}

//Impulse
function handleImpulseTheme() {
  document.dispatchEvent(new CustomEvent('ajaxProduct:added'))
  document.dispatchEvent(new CustomEvent('cart:build'))
}

function handleFocalTheme(cart: any): void {
  document.documentElement.dispatchEvent(
    new CustomEvent('cart:refresh', {
      bubbles: true,
    })
  )

  const miniCart = document.getElementById('mini-cart') as HTMLDetailsElement
  if (miniCart) {
    miniCart.open = true
  }

  const cartCountElement = document.querySelector('cart-count') as HTMLElement
  if (cartCountElement) {
    cartCountElement.innerText = cart.item_count.toString()
  }
}

// Modular theme
function handleModularTheme() {
  window.cart.getCart()
}

// Foodie theme
function handleFoodieTheme(cart: any) {
  let config = document.getElementById('cart-config')
  if (!config) return false
  config = JSON.parse(config.innerHTML || '{}')
  window.WAU.AjaxCart.updateView(config, cart)
}

//Warehouse theme
function handleWarehouseTheme(addedItemRes: any) {
  document.dispatchEvent(
    new CustomEvent('product:added', {
      bubbles: !0,
      detail: {
        variant: addedItemRes.variant_id,
        quantity: 1,
      },
    })
  )
}

// Lammer theme
function handleLammerTheme(addedItemRes: any): void {
  const htmlVariant = addedItemRes.variant_title !== null ? `<i>(${addedItemRes.variant_title})</i>` : ''
  const styleCart = document.querySelector('.js-mini-cart')?.getAttribute('data-cartmini')

  if (styleCart !== 'true') {
    const htmlAlert = `
      <div class="media mt-2 alert--cart">
        <a class="mr-3" href="/cart">
          <img class="lazyload" data-src="${addedItemRes.image}">
        </a>
        <div class="media-body align-self-center">
          <p class="m-0 font-weight-bold">${addedItemRes.product_title} x ${addedItemRes.quantity}</p>
          ${htmlVariant}
        </div>
      </div>
    `
    window.theme.alert.new(window.theme.strings.addToCartSuccess, htmlAlert, 3000, 'notice')
  }

  window.theme.miniCart.updateElements()
  window.theme.miniCart.generateCart()
}

//Furns - Furniture Shopify theme
function handleFurnTheme(addedItemRes: any, cart: any) {
  window.Shopify.onItemAdded(addedItemRes)
  window.Shopify.onCartUpdate(cart)
  // Ensure jQuery is loaded and properly typed
  const jQuery = window.jQuery
  if (jQuery) {
    jQuery('#modalAddToCart').modal('toggle')
  }

  const popupImageElement = document.querySelector('.popupimage') as HTMLImageElement
  if (popupImageElement) {
    popupImageElement.src = addedItemRes.image
  }
}

// Turbo theme
function handleTurboTheme(cart: any) {
  if (window.refreshCart) {
    window.refreshCart(cart)
  }

  if (document.querySelector('#header')?.matches(':visible')) {
    document.querySelector('#header .cart-container')?.classList.add('active_link')
  } else if (document.querySelector('.sticky_nav--stick')) {
    document.querySelector('.sticky_nav .cart-container')?.classList.add('active_link')
  } else {
    document.querySelector('.top-bar .cart-container')?.classList.add('active_link')
  }

  // Block scrolling on mobile
  if (window.PXUTheme.media_queries.medium.matches) {
    const cartContainer = document.querySelector('.active_link')?.parentElement
    if (cartContainer) {
      document.body.classList.add('blocked-scroll')
    } else {
      document.body.classList.add('blocked-scroll')
    }

    // Scroll to the top of the page unless the header is fixed
    const header = document.getElementById('header')
    if (header && header.classList.contains('mobile_nav-fixed--false')) {
      window.scroll({ top: 0, left: 0, behavior: 'smooth' })
    }
  }
}

// Emerge Shopify theme
function handleEmergeTheme(cart: any): void {
  fetch('/?snippets_id=cart')
    .then(response => response.text())
    .then(text => {
      const parser = new DOMParser()
      const sectionInnerHTML = parser.parseFromString(text, 'text/html')
      const checkCart = sectionInnerHTML.querySelector('[data-active="cart"]')

      if (checkCart) {
        const cartFormInnerHTML = checkCart.innerHTML
        const activeCart = document.querySelector('[data-active="cart"]')
        if (activeCart) {
          activeCart.innerHTML = cartFormInnerHTML
        }

        const headerCartLink = document.querySelector('.header--cart-link')
        if (headerCartLink) {
          headerCartLink.setAttribute('data-has-items', 'true')
        }

        const externalTotalItems = document.querySelector('.cart--external--total-items')
        if (externalTotalItems) {
          externalTotalItems.textContent = cart.item_count.toString()
        }

        const externalTotalPrice = document.querySelector('.cart--external--total-price')
        if (externalTotalPrice) {
          const totalPrice = document.querySelector('.cart--total--price.money')
          if (totalPrice) {
            externalTotalPrice.textContent = totalPrice.textContent
          }
        }

        const cartToggleLink = document.querySelector('a.header--cart-toggle')
        if (cartToggleLink) {
          ;(cartToggleLink as HTMLElement).click()
        }
      }
    })
    .catch(e => console.error('Error:', e))
}

// Minimog theme
function handleMinimogTheme(cart: any, addedItemRes: any) {
  window.Shopify.onItemAdded(addedItemRes)
  window.Shopify.onCartUpdate(cart)
}

// Province theme
function handleProvinceTheme(cart: any): void {
  const countHtml = document.createElement('span')
  countHtml.classList.add('item-count', 'inline-block', 'text-center')

  const cartElement = document.querySelector('.cart')
  if (cartElement) {
    cartElement.appendChild(countHtml)
    countHtml.innerHTML = cart.item_count.toString()
  }
}

//Motion theme
function handleMotionTheme(cart: any) {
  document.dispatchEvent(
    new CustomEvent('ajaxProduct:added', {
      detail: {
        product: cart,
      },
    })
  )
}

//Ella theme
function handleEllaTheme(): void {
  setTimeout(() => {
    const renderSidebar = document.querySelector('#cart-icon-bubble') as HTMLElement
    if (renderSidebar) {
      renderSidebar.click()
    }
  }, 400)
}

// Be Yours Theme
function handleBeYoursTheme(addedItemRes: any): void {
  fetch('/?sections=mini-cart,cart-icon-bubble')
    .then(response => response.json())
    .then(sections => {
      const miniCart = document.querySelector('mini-cart') as any
      if (miniCart && typeof miniCart.renderContents === 'function') {
        addedItemRes.sections = sections
        miniCart.renderContents(addedItemRes)
      }
    })
    .catch(error => console.error('Error fetching sections:', error))
}

// Quark Theme
function handleQuarkTheme(cart: any): void {
  document.documentElement.dispatchEvent(
    new CustomEvent('cart:refresh', {
      bubbles: true,
      detail: {
        cart: cart,
        openMiniCart: window.themeVariables.settings.cartType === 'drawer' && !document.querySelector('.drawer'),
      },
    })
  )

  const cartIcon = document.querySelectorAll('.header__icon-wrapper[aria-label="Cart"]')[0] as HTMLElement
  if (cartIcon) {
    cartIcon.click()
  }
}

// Launch Theme
function handleLaunchTheme(cart: any): void {
  const headerCartCountElements = document.querySelectorAll('.header-cart-count')

  headerCartCountElements.forEach(element => {
    element.textContent = cart.item_count.toString()
    element.classList.add('active')
  })
}

// Stockholm Theme
function handleStockholmTheme(cart: any): void {
  fetch('/?snippets_id=cart-notification')
    .then(response => response.text())
    .then(text => {
      const parser = new DOMParser()
      const sectionInnerHTML = parser.parseFromString(text, 'text/html')
      const cartNotification = sectionInnerHTML.getElementById('cart-notification')
      const totalPriceElement = sectionInnerHTML.querySelector('#cart-notification .totals__subtotal-value')

      if (cartNotification && totalPriceElement) {
        const cartFormInnerHTML = cartNotification.innerHTML

        const cartNotificationElement = document.getElementById('cart-notification')
        if (cartNotificationElement) {
          cartNotificationElement.innerHTML = cartFormInnerHTML
        }

        const cartDrawer = document.querySelector('cart-drawer')
        const cartDrawerItems = document.querySelector('cart-drawer-items')
        if (cartDrawer) {
          cartDrawer.classList.remove('is-empty')
        }
        if (cartDrawerItems) {
          cartDrawerItems.classList.remove('is-empty')
        }

        const cartIconBubble = document.querySelector('#cart-icon-bubble')
        if (cartIconBubble) {
          const cartCountBubble = cartIconBubble.querySelector('.cart-count-bubble')
          if (!cartCountBubble) {
            const cartNumber = document.createElement('div')
            cartNumber.className = 'cart-count-bubble'
            cartNumber.innerHTML = `
              <span aria-hidden="true">${cart.item_count}</span>
              <span class="visually-hidden">${cart.item_count} items</span>
            `
            cartIconBubble.appendChild(cartNumber)
          } else {
            cartCountBubble.querySelectorAll('span[aria-hidden="true"]').forEach(count => {
              count.textContent = cart.item_count.toString()
            })
          }
          ;(cartIconBubble as HTMLElement).click()
        }

        const cartNotificationOverlay = document.getElementById('cart-notification-Overlay')
        if (cartNotificationOverlay) {
          cartNotificationOverlay.addEventListener('click', () => {
            if (cartDrawer) {
              cartDrawer.classList.remove('active')
            }
            document.body.classList.remove('overflow-hidden')
          })
        }
      }
    })
    .catch(error => console.error('Error fetching cart notification:', error))
}

// Empire theme
function handleEmpireTheme(cart: any): void {
  const countEvent = new CustomEvent('cartcount:update', {
    detail: cart,
  })
  window.dispatchEvent(countEvent)
}

// Handmade theme
function handleHandmadeTheme(addedItemRes: any, cart: any): void {
  fetch('/?sections=cart-notification-product,cart-notification-button,cart-icon-bubble')
    .then(response => response.json())
    .then(sections => {
      addedItemRes.sections = sections

      const cartDrawer = document.querySelector('cart-notification') as any
      if (cartDrawer && typeof cartDrawer.renderContents === 'function') {
        cartDrawer.renderContents(addedItemRes)
      }

      const countInCart = document.querySelector('.cart-notification__count-value')
      if (countInCart) {
        countInCart.innerHTML = cart.item_count.toString()
      }

      const totalPrice = document.querySelector('.totals__subtotal-value')
      if (totalPrice) {
        totalPrice.innerHTML = `${(cart.total_price / 100).toFixed(2)} ${cart.currency}`
      }
    })
    .catch(error => console.error('Error fetching sections:', error))
}

// Canopy theme
function handleCanopyTheme(): void {
  ;(document.querySelector('cart-drawer') as any)?.refreshCartDrawer()
  ;(document.querySelector('cart-items') as any)?.refreshCartItems()
}

// Speedfly theme
function handleSpeedflyTheme(cart: any): void {
  const miniCart = document.querySelector('mini-cart') as any
  if (miniCart && typeof miniCart.generateDom === 'function') {
    miniCart.generateDom(cart)
  }
}

//Broadcast theme
function handleBroadcastTheme() {
  ;(document.querySelector('cart-items') as any)?.getCart()
}

// Debut theme
let debutStore: any = null
function handleThemeDebut(addedItemRes: any) {
  if (!debutStore) {
    debutStore = new window.theme.Product()
  }
  debutStore._setupCartPopup(addedItemRes)
}

// Venue theme
function handleThemeVenue(addedItemRes: any) {
  window.theme.cart.store.getState().add(addedItemRes)
}

// Parallax theme
function handleThemeParallax(cart: any) {
  window.refreshCart && window.refreshCart(cart)
}

// Current Site theme
function handleThemeCurrentSite() {
  window.ajaxCart.init({
    formSelector: '.add-to-cart__form',
    cartContainer: '#CartContainer',
    addToCartSelector: '.add-to-cart',
    enableQtySelectors: true,
    moneyFormat: window.theme.strings.moneyFormat,
  })
}

// Exclusive theme
function handleThemeExclusive(): void {
  const event = new CustomEvent('added.ajaxProduct', {
    bubbles: true,
    cancelable: true,
  })
  document.body.dispatchEvent(event)
}

// Theme Editions
function handleThemeEditions(cart: any) {
  const cartAmountWrap = document.querySelector('[data-header-cart-count]')
  if (cartAmountWrap) {
    cartAmountWrap.innerHTML = `(${cart.item_count})`
  }
}

function handleThemePacific(cart: any) {
  window.$('.cart-item-count').html(cart.item_count)
  window.$('.header-tools-cart').addClass('cart-has-content')
}

function handleThemeStartup(cart: any) {
  document.dispatchEvent(
    new CustomEvent('cart:count', {
      detail: {
        count: cart.item_count,
      },
    })
  )
}

function handleThemeReach(cart: any) {
  document.querySelectorAll('[data-cart-count]').forEach(el => (el.innerHTML = cart.item_count))
}

function handleThemeVogue(cart: any) {
  document.querySelectorAll('[data-cart-count]').forEach(el => (el.innerHTML = cart.item_count))
}

function handleGroupThoughtThemePartner(cart: any) {
  document.dispatchEvent(new CustomEvent('theme:cart:change', { detail: { cart: cart } }))
  document.querySelector('[data-drawer="drawer-cart"]')?.dispatchEvent(new CustomEvent('theme:drawer:open'))
}

// Timber theme
function handleTimberTheme(cart: any) {
  window.ajaxCart.cartUpdateCallback(cart)
}

// Blum theme
function handleBlumTheme(res: any) {
  typeof window.SHTHelper.forceUpdateCartStatus === 'function' && window.SHTHelper.forceUpdateCartStatus(res)
}

const listQueryRefreshCart = windowFunctionCustom().LIST_QUERY_REFRESH_CART
  ? windowFunctionCustom().LIST_QUERY_REFRESH_CART(EHtmlSelectors.SELECTOR_REPLACE)
  : EHtmlSelectors.SELECTOR_REPLACE

// Helper function to get the old elements from the DOM
function getOldElements(): Element[] {
  return Array.from(document.querySelectorAll(listQueryRefreshCart))
}

// Helper function to reload the page
function reloadPage(): void {
  window.location.reload()
}

// Helper function to fetch new HTML and extract target elements
function fetchNewElements(): Promise<Element[]> {
  const url = `${window.location.pathname}${window.location.search}`
  return fetch(url)
    .then(response => response.text())
    .then((text: string) => {
      const parser = new DOMParser()
      const newDoc = parser.parseFromString(text, 'text/html')
      return Array.from(newDoc.querySelectorAll(listQueryRefreshCart))
    })
}

// Helper function to update an element using morphdom
function updateElement(oldEl: Element, newEl: Element): void {
  morphdom(oldEl, newEl, {
    onBeforeElUpdated: (fromEl: any, toEl: any): boolean => {
      // Function to sanitize outerHTML by removing class attributes
      function sanitizeOuterHTML(html: string): string {
        // Create a temporary div to hold the HTML
        const tempDiv = document.createElement('div')
        tempDiv.innerHTML = html

        // Remove class attributes from all elements inside the div
        tempDiv.querySelectorAll('*').forEach(el => el.removeAttribute('class'))

        // Return sanitized HTML as a string
        return tempDiv.innerHTML
      }

      // Get the sanitized outerHTML for both elements
      const sanitizedFromHTML = sanitizeOuterHTML(fromEl.outerHTML)
      const sanitizedToHTML = sanitizeOuterHTML(toEl.outerHTML)
      // Compare sanitized outerHTMLs (ignoring class attributes)
      return sanitizedFromHTML !== sanitizedToHTML
    },
    onBeforeNodeDiscarded: (node: Node): boolean => true,
    onBeforeNodeAdded: (node: Node): Node => {
      if (windowFunctionCustom().ADD_NODE_CUSTOMIZE) {
        return windowFunctionCustom().ADD_NODE_CUSTOMIZE(node)
      }
      return node
    },
  })
}

// Helper function to trigger clicks on cart links if not on the cart page
function clickCartLinks(): void {
  const cartLinks: Element[] = Array.from(document.querySelectorAll('a[href="/cart"]'))
  cartLinks.forEach(link => {
    if (!window.location.pathname.includes('/cart')) {
      ;(link as HTMLAnchorElement).click()
    }
  })
}

// Other theme
function handleFallBackUpdateWithHtml() {
  try {
    const oldElements = getOldElements()

    if (oldElements.length === 0) {
      reloadPage()
    } else {
      fetchNewElements()
        .then(newElements => {
          // Clone new elements to prevent mutations
          const clonedNewElements = newElements.map(el => el.cloneNode(true) as Element)

          // If the number of elements mismatches, reload the page
          if (oldElements.length !== clonedNewElements.length) {
            reloadPage()
            return
          }

          // Update each old element with the corresponding new element
          oldElements.forEach((oldEl, index) => {
            updateElement(oldEl, clonedNewElements[index])
          })

          // Trigger clicks on cart links if necessary
          !windowFunctionCustom().DONT_CLICK_CART_ICON_WHEN_UPDATE && clickCartLinks()
        })
        .catch(error => console.error('Failed to update cart Impact Theme', error))
    }
  } catch (error) {
    console.error(error)
  }
}

// If theme is not included in this list,
// Custom function updateCart to window.__onetick_store__.handleUpdateCartAfterATC
export default function handleUpdateCart(addedItemRes: any, cart: any) {
  try {
    if (typeof window.__onetick_store__?.handleUpdateCartAfterATC === 'function') {
      return window.__onetick_store__.handleUpdateCartAfterATC(addedItemRes, cart)
    }

    const themeName = window.Shopify.theme.name
    if (windowFunctionCustom().USING_FALLBACK_REFRESH_CART) {
      handleFallBackUpdateWithHtml()
      return
    }

    publish(EPubSubEvents.CART_UPDATE, cart)

    switch (true) {
      case /Impact/i.test(themeName):
        handleImpactTheme(cart)
        break
      case /Athens/i.test(themeName):
        handleAthensTheme(cart)
        break
      case /Alto/i.test(themeName):
        handleAltoTheme()
        break
      case /Debutify/i.test(themeName):
        handleDebutifyTheme()
        break
      case /Avone/i.test(themeName):
        handleAvoneTheme()
        break
      case /Gecko|Kalles/i.test(themeName):
        handleGeckoTheme(addedItemRes)
        break
      case /Rebranding/i.test(themeName):
        handleRebrandingTheme(cart)
        break
      case /Flow/i.test(themeName):
        handleFlowTheme(cart)
        break
      case /Showtime/i.test(themeName):
        handleShowtimeTheme(cart)
        break
      case /Envy/i.test(themeName):
        handleEnvyTheme(cart)
        break
      case /Marker/i.test(themeName):
        handleMarkerTheme()
        break
      case /Express/i.test(themeName):
        handleExpressTheme(addedItemRes)
        break
      case /Impulse/i.test(themeName):
        handleImpulseTheme()
        break
      case /Focal/i.test(themeName):
        handleFocalTheme(cart)
        break
      case /Modular/i.test(themeName):
        handleModularTheme()
        break
      case /Foodie/i.test(themeName):
        handleFoodieTheme(cart)
        break
      case /Warehouse/i.test(themeName):
        handleWarehouseTheme(addedItemRes)
        break
      case /Lammer/i.test(themeName):
        handleLammerTheme(addedItemRes)
        break
      case /Minimog/i.test(themeName):
        handleMinimogTheme(cart, addedItemRes)
        break
      case /Furns - Furniture Shopify/i.test(themeName):
        handleFurnTheme(addedItemRes, cart)
        break
      case /Quark/i.test(themeName):
        handleQuarkTheme(cart)
        break
      case /Launch/i.test(themeName):
        handleLaunchTheme(cart)
        break
      case /Stockholm/i.test(themeName):
        handleStockholmTheme(cart)
        break
      case /Dawn|Craft|Taste|Refresh|Sense|Origin|Spotlight|Crave|Publisher|Colorblock|Studio|Ride/i.test(themeName):
        handleFreeShopifyTheme(addedItemRes)
        break
      case /Providence/i.test(themeName):
        handleProvinceTheme(cart)
      case /Motion/i.test(themeName):
        handleMotionTheme(cart)
        break
      case /Ella/i.test(themeName):
        handleEllaTheme()
        break
      case /Be Yours/i.test(themeName):
        handleBeYoursTheme(addedItemRes)
        break
      case /Handmade/i.test(themeName):
        handleHandmadeTheme(addedItemRes, cart)
        break
      case /Empire/i.test(themeName):
        handleEmpireTheme(cart)
        break
      case /Speedfly/i.test(themeName):
        handleSpeedflyTheme(cart)
        break
      case /Canopy/i.test(themeName):
        handleCanopyTheme()
        break
      case /Turbo/i.test(themeName):
        handleTurboTheme(cart)
        break
      case /Emerge/i.test(themeName):
        handleEmergeTheme(cart)
        break
      case /Broadcast/i.test(themeName):
        handleBroadcastTheme()
        break
      case /Debut/i.test(themeName):
        handleThemeDebut(addedItemRes)
        break
      case /Venue/i.test(themeName):
        handleThemeVenue(cart)
        break
      case /Parallax/i.test(themeName):
        handleThemeParallax(cart)
        break
      case /Current Site|CurrentSite/i.test(themeName):
        handleThemeCurrentSite()
        break
      case /Exclusive/i.test(themeName):
        handleThemeExclusive()
        break
      case /Editions/i.test(themeName):
        handleThemeEditions(cart)
        break
      case /Pacific/i.test(themeName):
        handleThemePacific(cart)
        break
      case /Startup/i.test(themeName):
        handleThemeStartup(cart)
        break
      case /Reach/i.test(themeName):
        handleThemeReach(cart)
        break
      case /Vogue/i.test(themeName):
        handleThemeVogue(cart)
        break
      case /Pipeline|Story/i.test(themeName):
        handleGroupThoughtThemePartner(cart)
        break
      case /Timber/i.test(themeName):
        handleTimberTheme(cart)
        break
      case /Blum/i.test(themeName):
        handleBlumTheme(addedItemRes)
        break
      default:
        handleFallBackUpdateWithHtml()
        break
    }
  } catch (error) {
    console.error('[OneTick]', error)
  }
}
