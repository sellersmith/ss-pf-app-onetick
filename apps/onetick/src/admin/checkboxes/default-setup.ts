// OneTick admin UI is copy-first TailorKit parity adapted to PageFly AdminAppHost and app API ports.
import type { OneTickSetupOptions, OneTickThemeConfig } from './types'

export const emptySetupOptions: OneTickSetupOptions = {
  triggerProductsTypes: [
    'all-products',
    'specific-products',
    'specific-variants',
    'product-collections',
    'product-tags',
    'product-vendors',
    'product-types',
  ],
  placements: ['product_details', 'cart'],
  resources: {
    products: [],
    variants: [],
    collections: [],
    tags: [],
    vendors: [],
    productTypes: [],
  },
  limits: {
    currentCount: 0,
    upsellProductLimit: null,
    limitReached: false,
  },
}

export const emptyThemeConfig: OneTickThemeConfig = {
  isOS2Theme: false,
  productThemeLink: '',
  enabledAppEmbed: false,
  enabledOneTickHelper: false,
  themeEditCodeLink: '',
  appEmbedLink: '',
  oneTickHelperLink: '',
  checkboxBlockLinkProduct: '',
  checkboxBlockLinkCart: '',
}
