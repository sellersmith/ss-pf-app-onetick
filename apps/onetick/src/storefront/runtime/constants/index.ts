/* eslint-disable max-len */
/**
 * @deprecated
 * Use EOneTickOrdersProperties instead
 */
export enum EOneTickOrdersProperties {
  ONETICK_CHECKBOX_ID_FLAG = '__onetick_checkbox_id',
  ONETICK_PRODUCT_OFFER_ID_FLAG = '__onetick_product_offer_id',
  ONETICK_MASTER_PRODUCT_ID = '__onetick_master_product_id',
  ONETICK_VARIANT_PRODUCT_ID = '__onetick_variant_product_id',
  ONETICK_CHECKBOX_PLACEMENT = '__onetick_checkbox_placement',
  ONETICK_PRODUCT_OFFER_PLACEMENT = '__onetick_product_offer_placement',
  ONETICK_CHECKBOX_DATA = '__onetick_checkbox_data',
  ONETICK_CHECKBOX_CAN_REMOVE_WHEN_TRIGGER_REMOVE = '__onetick_checkbox_can_remove_when_trigger_remove',
}

export enum EOneTickOrderPropertyKeys {
  ONETICK_PROPERTIES = '__onetick_properties',

  ONETICK_WIDGET_TYPE_FLAG = '__onetick_widget_type',
  ONETICK_WIDGET_ID_FLAG = '__onetick_widget_id',
  ONETICK_WIDGET_PLACEMENT = '__onetick_widget_placement',
  ONETICK_MASTER_PRODUCT_ID = '__onetick_master_product_id',
  ONETICK_VARIANT_PRODUCT_ID = '__onetick_variant_product_id',
  ONETICK_MASTER_VARIANT_ID = '__onetick_master_variant_id',

  ONETICK_CHECKBOX_DATA = '__onetick_checkbox_data',
  ONETICK_CHECKBOX_CAN_REMOVE_WHEN_TRIGGER_REMOVE = '__onetick_checkbox_can_remove_when_trigger_remove',

  // Display for user
  ONETICK_MASTER_PRODUCT_TITLE = '__trigger_product',
  ONETICK_MASTER_VARIANT_TITLE = '__trigger_variant',
}

export const ARRAY_SEPARATOR = '; '
export const ALL_PRODUCTS = 'all-products'

export const PAGINATE_PRODUCTS_PER_PAGE = 300

export const PORTALS_CONTAINER_ID = 'OnetickPortalsContainer'

export const SESSION_KEYS = { BEHAVIORS: 'onetick_session_behaviors' }

export enum ECheckboxSortOptions {
  LAST_CREATED_ASC = 'LAST_CREATED_ASC', // Oldest to newest
  LAST_CREATED_DESC = 'LAST_CREATED_DESC', // Newest to oldest
  UPSELL_PRODUCT_PRICE_ASC = 'UPSELL_PRODUCT_PRICE_ASC', // Lowest to highest
  UPSELL_PRODUCT_PRICE_DESC = 'UPSELL_PRODUCT_PRICE_DESC', // Highest to lowest
  MANUALLY = 'MANUALLY',
}

export enum EHtmlSelectors {
  ATC_BUTTON = 'form[action*="/cart/add"] button[type="submit"], form[action*="/cart/add"] button[name="add"], form[action*="/cart/add"] button[class="product-buy-buttons--cta"]',
  SECTION = '.shopify-section, div[data-pf-type="ProductBox"], product-info',
  CART_DRAWER = 'cart-drawer,#CartPopup,.cart-drawer,sht-cart-drwr,.cart__drawer,.drawer--cart,div[id="CartDrawer"],#CartDrawer,.quick-cart,sidebar-drawer,.mfp-cart-draw,.mini-cart,.mini_cart,cart-modal,aside,cart-root,cart-notification,aside[id="cart"],section.cart,.mini-cart-modal,cart-sidebar,#cartDrawer,.cart-side-drawer,.Cart-Drawer,section-cart-drawer,drawer-modal,.drawer,mini-cart,form[action="/checkout"],section[x-show="cart_drawer"],drawer-component,modal-component[data-modal="modal-cart-drawer"],loess-drawer[id="CartDrawer"],.sidebar-drawer-container,.side-cart,.topbar-content,.flyout,.dialog__content,cart-popup,.header-minicart,cart-items',
  CART_DRAWER_HEADER = 'cart-drawer header,.upcart-header, .cart-drawer header, sht-cart-drwr .drawer__header, cart-drawer .drawer__header, cart-drawer .drawer-header, cart-drawer .cart_header, .cart__drawer .drawer__header, .cart-drawer .drawer__header, .drawer--cart .drawer__header, div[id="CartDrawer"] .drawer__header, cart-drawer .cart-drawer__header, cart-drawer .f-drawer__header, .cart-drawer .cart-drawer__header, #CartDrawer .drawer__fixed-header, cart-drawer .cart-drawer__top, cart-drawer drawer__head, .quick-cart .quick-cart__header, .shopify-section .quick-cart__header, cart-drawer .mini-cart__header, .cart__drawer .drawer__top, .cart-drawer .cart-drawer__head, .cart-drawer .side-panel-header, sidebar-drawer .sidebar__header, .mfp-cart-draw .cart-draw__head, .mini-cart .ajax-cart__header-wrapper, .mini_cart .yv_side_drawer_title, cart-modal .modal-header, aside .cart-drawer__top, cart-root .cart--header, cart-notification .cart-notification__header, aside[id="cart"] header, section.cart .header, cart-drawer .drawer__heading, sidebar-drawer .site-cart-heading, .mini-cart-modal .mini-cart__heading-wrapper, cart-sidebar .cart-sidebar__header, .cart-drawer .cart__title, #cartDrawer .sd-sidebar-head, .cart-drawer .cart-drawer-content-header, .cart-side-drawer .cart-drawer-content-header, cart-drawer [class~="cart-drawer-header"], .Cart-Drawer .Drawer__Header, section-cart-drawer .Drawer__Header, drawer-modal .drawer-header, sidebar-drawer .cart__title, cart-drawer .modal-heading, .drawer .quick-cart__tabs, mini-cart .mini-cart-header, cart-notification .cart_notification_topbar, form[action="/checkout"] .mm-subtitle, section[x-show="cart_drawer"] section, drawer-component .mini-cart__close, body aside[id="cart"] header, cart-items [class~="cart-items-header"], sidebar-drawer .sidebar__close, modal-component[data-modal="modal-cart-drawer"] .modal-component_head, loess-drawer[id="CartDrawer"] header, .sidebar-drawer-container .sidebar-drawer__header-container, .side-cart .side-cart-header, aside .cart-header-details, .topbar-content .topbar-header, .flyout .flyout__header-wrapper, .dialog__content .main-cart__heading, cart-popup .popup__header, .header-minicart .header-minicart-header, mini-cart .minicart-top',
  CART_DRAWER_ITEMS = 'cart-drawer-items,.upcart-cart-body,cart-popup-items, .cart-drawer .cart-drawer__body ,.cart-drawer__content, sht-cart-drwr .drawer__body, .drawer__scrollable, .cart-drawer__inner, sidebar-drawer .sidebar__body, .cart-drawer .side-panel-content, cart-drawer .drawer__content, .cart-drawer .cart__table, cart-root .cart--body, .cart-drawer .cart-drawer__content, .quick-cart__items, .Cart-Drawer .Drawer__Main, drawer-modal .header-mini-cart-content, cart-drawer [class~="cart-drawer-products"], aside .cart-items, div[id="cart"] .cart-items, drawer-modal .drawer-content, .cart-drawer .cart-drawer__cart, cart-drawer .cart-drawer__blocks, .mini-cart .ajax-cart__cart-items, .mini-cart .mini-cart__content, section-cart-drawer .Drawer__Body, cart-notification .cart__items, .drawer--cart .ajaxcart__inner, .drawer .ajaxcart__inner, sidebar-drawer .cart__items, sidebar-drawer .cart-items, mini-cart .header-mini-cart-content, .cart-drawer .cart-drawer__section--items, cart-sidebar .cart-sidebar__items, mini-cart .cart-items-wrapper, .cart__drawer .cart__items, .cart-drawer .cart-drawer__items, loess-drawer .cart-form, aside .cart_list, .minicart-sidebar .minicart__box, .side-cart .items, .header-minicart-drawer .header-minicart-content, .drawer--cart .ajaxcart__product, cart-drawer .cart-drawer-cart-items-wrapper, .cart-drawer-form__contents, .main-mini-cart-items, .side-cart .side-cart-content, drawer .cart-drawer-form, aside[id="cart"] ul, cart-modal #CartModal-ScrollBody, .cart-drawer-content-body, #cart-drawer-live-region-products, .cart-mini-items, modal-component[data-modal="modal-cart-drawer"] .modal-component_content, mini-cart .mini-cart-item-list, cart-form',
  CART_DRAWER_FOOTER = '.drawer__footer, .cart-drawer footer, .cart-drawer bottom',
  INPUT_VARIANT_ID = 'input[name="id"]',
  SELECTOR_REPLACE = 'cart-items , cart-drawer , form[action="/cart"],a[href="/cart"],.cart__item ,.js-contents',
}

export enum ETriggerProductsType {
  ALL_PRODUCTS = 'all-products',
  PRODUCT_COLLECTIONS = 'product-collections',
  PRODUCT_TAGS = 'product-tags',
  PRODUCT_VERDORS = 'product-vendors',
  PRODUCT_TYPES = 'product-types',
  SPECIFIC_PRODUCTS = 'specific-products',
  SPECIFIC_VARIANTS = 'specific-variants',
}

export enum ERecommendType {
  SLIDER = 'slider',
  LIST = 'list',
}

export enum EConditionProductToOffer {
  BEST_SELLING = 'best-selling',
  PRODUCTS_FROM_COLLECTIONS = 'products-from-collections',
  PRODUCTS_WITH_TAGS = 'products-with-tags',
  PRODUCTS_FROM_VENDORS = 'products-from-vendors',
  PRODUCTS_OF_PRODUCT_TYPES = 'products-of-product-types',
  SPECIFIC_PRODUCTS = 'specific-products',
}

export enum EConditionProductsTriggerSettings {
  FROM_COLLECTIONS = 'from-collections',
  WITH_TAGS = 'with-tags',
  FROM_VENDORS = 'from-vendors',
  OF_PRODUCT_TYPES = 'of-products-types',
  FROM_CUSTOM_LIST = 'from-custom-list',
}

export enum EAPIAppProxyTypes {
  GET_PRODUCTS_AUTO_RECOMMENDATION = 'GET_PRODUCTS_AUTO_RECOMMENDATION',
  GET_PRODUCTS_FROM_COLLECTION_IDS = 'GET_PRODUCTS_FROM_COLLECTION_IDS',
  GET_PRODUCTS_FROM_TAGS = 'GET_PRODUCTS_FROM_TAGS',
  GET_PRODUCTS_FROM_TYPES = 'GET_PRODUCTS_FROM_TYPES',
  GET_PRODUCTS_FROM_VENDORS = 'GET_PRODUCTS_FROM_VENDORS',
  GET_PRODUCTS_FROM_IDS = 'GET_PRODUCTS_FROM_IDS',
  GET_TOP_SELLER_PRODUCTS = 'GET_TOP_SELLER_PRODUCTS',
  GET_PRODUCTS_TO_OFFER_LIVE_VIEW = 'GET_PRODUCTS_TO_OFFER_LIVE_VIEW',
  GET_CREATE_TIME_SHOP = 'GET_CREATE_TIME_SHOP',
  GET_DATA_ADDON_VARIANT_CHECKBOX = 'GET_DATA_ADDON_VARIANT_CHECKBOX',
}

export enum EPubSubEvents {
  CART_UPDATE = 'cart-update',
  UPDATE_VARIANT_IN_CHECKBOX = 'update_variant',
  SELECTED_VARIANT_CHANGE = 'selected_variant_change',
  INJECT_PRODUCT_OFFER_INTO_CART_DRAWER = 'inject_product_product_offer_into_cart_drawer',

  REMOVE_DATA_INPUT_FORM = 'remove_data_input_form',
}

export enum EProductOffersDirection {
  HORIZONTAL = 'horizontal',
  VERTICAL = 'vertical',
}

export enum EProductOffersDisplayType {
  SLIDER = 'slider',
  BLOCK = 'block',
}

export enum EMediaRatioOptions {
  SQUARE = 'square',
  PORTRAIT = 'portrait',
}

export enum EMediaFit {
  ORIGINAL = 'original',
  FILL = 'fill',
}

export enum EMedia {
  PLACEHOLDER_IMAGE_SQUARE = 'https://cdn.shopify.com/s/files/1/0646/2953/8985/files/placeholder_image_square.png',
  PLACEHOLDER_IMAGE_RECT = 'https://cdn.shopify.com/s/files/1/0646/2953/8985/files/placeholder_image_rect.png',
}

export enum EDynamicFields {
  PRODUCT_TITLE = '{{product title}}',
  PRICE = '{{price}}',
  COMPARE_AT_PRICE = '{{compare-at price}}',
  VARIANT_NAME = '{{variant name}}',
}

export enum ECheckboxWarning {
  ALL_CHECKBOXES_ARE_DRAFT = 'ALL_CHECKBOXES_ARE_DRAFT',
  NO_CHECKBOXES_APPLIED = 'NO_CHECKBOXES_APPLIED',
  CHECKBOX_OUTSIDE_PRODUCT_DETAILS_AND_CART = 'CHECKBOX_OUTSIDE_PRODUCT_DETAILS_AND_CART',
  ONE_CHECKBOX_FOR_CART_IN_PRODUCT_DETAILS = 'ONE_CHECKBOX_FOR_CART_IN_PRODUCT_DETAILS',
  NO_CHECKBOX_FOR_PRODUCT_DETAILS = 'NO_CHECKBOX_FOR_PRODUCT_DETAILS',
  MORE_THAN_ONE_BLOCK_IN_PRODUCT_DETAILS = 'MORE_THAN_ONE_BLOCK_IN_PRODUCT_DETAILS',
  ONE_CHECKBOX_FOR_PRODUCT_DETAILS_IN_CART = 'ONE_CHECKBOX_FOR_PRODUCT_DETAILS_IN_CART',
  NO_CHECKBOX_FOR_PRODUCT_CART = 'NO_CHECKBOX_FOR_PRODUCT_CART',
  MORE_THAN_ONE_BLOCK_IN_CART_PAGE = 'MORE_THAN_ONE_BLOCK_IN_CART_PAGE',
  ONE_CHECKBOX_AND_DRAFT = 'ONE_CHECKBOX_AND_DRAFT',
  CART_EMPTY = 'CART_EMPTY',
}

export const CHECKBOX_WARNING_PRIORITIES: any = {
  [ECheckboxWarning.ALL_CHECKBOXES_ARE_DRAFT]: 3,
  [ECheckboxWarning.ONE_CHECKBOX_AND_DRAFT]: 3,
  [ECheckboxWarning.NO_CHECKBOXES_APPLIED]: 2,
  [ECheckboxWarning.CHECKBOX_OUTSIDE_PRODUCT_DETAILS_AND_CART]: 1,
  [ECheckboxWarning.ONE_CHECKBOX_FOR_CART_IN_PRODUCT_DETAILS]: 1,
  [ECheckboxWarning.NO_CHECKBOX_FOR_PRODUCT_DETAILS]: 1,
  [ECheckboxWarning.MORE_THAN_ONE_BLOCK_IN_PRODUCT_DETAILS]: 4,
  [ECheckboxWarning.ONE_CHECKBOX_FOR_PRODUCT_DETAILS_IN_CART]: 1,
  [ECheckboxWarning.NO_CHECKBOX_FOR_PRODUCT_CART]: 1,
  [ECheckboxWarning.MORE_THAN_ONE_BLOCK_IN_CART_PAGE]: 4,
  [ECheckboxWarning.CART_EMPTY]: 1,
}

export const CHECKBOX_WARNING_DESCRIPTION_MAPPING: any = {
  [ECheckboxWarning.ALL_CHECKBOXES_ARE_DRAFT]:
    'Checkboxes are in draft mode. Set the checkboxes as active to show them here. ',
  [ECheckboxWarning.NO_CHECKBOXES_APPLIED]: 'No checkbox is applied to this trigger product. ',
  [ECheckboxWarning.CHECKBOX_OUTSIDE_PRODUCT_DETAILS_AND_CART]:
    'Checkboxes only work inside sections with product details and cart page. ',
  [ECheckboxWarning.ONE_CHECKBOX_AND_DRAFT]: (checkboxName: string) =>
    `The checkbox ${checkboxName} is in draft mode. Set it as active to show it here.`,
  [ECheckboxWarning.CART_EMPTY]: 'Your cart is empty. Please add items to cart to view checkbox.',

  // Product details
  [ECheckboxWarning.ONE_CHECKBOX_FOR_CART_IN_PRODUCT_DETAILS]:
    'You select Cart placement for this checkbox. Please add the checkbox on the cart page or change placement setting. ',
  [ECheckboxWarning.NO_CHECKBOX_FOR_PRODUCT_DETAILS]:
    'No checkboxes are set for Product details placement. Please add the app block on the cart page or change placement setting. ',
  [ECheckboxWarning.MORE_THAN_ONE_BLOCK_IN_PRODUCT_DETAILS]:
    'The app block is already in use. You can only add one app block in a product form. ',

  // Cart page
  [ECheckboxWarning.ONE_CHECKBOX_FOR_PRODUCT_DETAILS_IN_CART]:
    'You select Product details placement for this checkbox. Please add the checkbox inside a product section or change placement setting. ',
  [ECheckboxWarning.NO_CHECKBOX_FOR_PRODUCT_CART]:
    'No checkboxes are set for Cart placement. Please add the app block inside a product section or change placement setting. ',
  [ECheckboxWarning.MORE_THAN_ONE_BLOCK_IN_CART_PAGE]:
    'The app block is already in use. You can only add one app block in the cart page. ',
}

export enum EPlacementType {
  CART = 'cart',
  PRODUCT_DETAILS = 'product_details',
  PRODUCT_PAGE = 'product_page',
}

export enum EWidgetType {
  CHECKBOX = 'checkbox',
  PRODUCT_OFFER = 'product-offer',
}

export enum EProductOfferWarning {
  PRODUCT_OFFER_DRAFT_MODE = 'PRODUCT_OFFER_DRAFT_MODE',
  MORE_THAN_ONE_BLOCK_IN_CART_PAGE = 'MORE_THAN_ONE_BLOCK_IN_CART_PAGE',
  PRODUCT_OFFER_OUTSIDE_PERMISSION = 'PRODUCT_OFFER_OUTSIDE_PERMISSION',
  ALL_PRODUCT_OFFERS_IN_DRAFT_MODE = 'ALL_PRODUCT_OFFERS_IN_DRAFT_MODE',

  CART_EMPTY = 'CART_EMPTY',
  NO_OFFERS_SET_TO_CART_PAGE = 'NO_OFFERS_SET_TO_CART_PAGE',
  NO_TRIGGER_MATCH_IN_CART = 'NO_TRIGGER_MATCH_IN_CART',

  NO_OFFERS_SET_TO_PRODUCT_PAGE = 'NO_OFFERS_SET_TO_PRODUCT_PAGE',
  NO_TRIGGER_MATCH_IN_PRODUCT_PAGE = 'NO_TRIGGER_MATCH_IN_PRODUCT_PAGE',
}

export const PRODUCT_OFFER_WARNING_DESCRIPTION_MAPPING: any = {
  [EProductOfferWarning.PRODUCT_OFFER_DRAFT_MODE]:
    'Product offer is in draft mode. Set this product offer as active to show it here.',
  [EProductOfferWarning.MORE_THAN_ONE_BLOCK_IN_CART_PAGE]:
    'The app block is already in use. You can only add one app block in the cart page.',
  [EProductOfferWarning.PRODUCT_OFFER_OUTSIDE_PERMISSION]: 'Product offers only work on product pages or cart pages.',
  [EProductOfferWarning.ALL_PRODUCT_OFFERS_IN_DRAFT_MODE]:
    'Product offers for this placement are in draft mode. Set them to active to display.',

  [EProductOfferWarning.CART_EMPTY]: 'Your cart is empty. Please add items to cart to view product offers.',
  [EProductOfferWarning.NO_OFFERS_SET_TO_CART_PAGE]:
    'No offer(s) is set for cart placement. Add app block to product page or change placement setting.',
  [EProductOfferWarning.NO_TRIGGER_MATCH_IN_CART]: 'No products in cart meet trigger conditions for any offers.',

  [EProductOfferWarning.NO_OFFERS_SET_TO_PRODUCT_PAGE]:
    'No offer(s) is set for product page placement. Add app block to cart or change placement setting.',
  [EProductOfferWarning.NO_TRIGGER_MATCH_IN_PRODUCT_PAGE]: 'No product offer is applied to this trigger product.',
}

export const SESSION_BEHAVIOR_SEPARATOR = ';'
export const WEB_PIXEL_EVENTS = {
  UPDATE_USER_BEHAVIOR: 'UPDATE_USER_BEHAVIOR',
}
