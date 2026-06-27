// OneTick manifest is the app-platform contract for host routing, ports, theme surfaces, and Shopify scope policy.
import type { AdminAppManifest } from '../../web/server/src/app-platform/contracts'
import { themeSurfaces } from './theme-extension/theme-surfaces'

export const onetickManifest: AdminAppManifest = {
  appId: 'onetick',
  displayName: 'OneTick',
  description:
    'Beginner-friendly upsell and cross-sell app for checkbox add-ons, product offers, and cart recommendations.',
  version: '0.1.0',
  lifecycle: 'pilot',
  extensionPoints: [
    'admin.route',
    'backend.api',
    'theme.surface',
    'storefront.runtime',
    'cart.intent',
    'pdp.pre-checkout',
  ],
  admin: {
    routeBase: '/app-extensions/onetick',
    label: 'OneTick',
    group: 'growth',
    order: 30,
  },
  api: {
    namespace: '/api/apps/onetick',
  },
  support: {
    owner: 'pagefly-platform',
    runbookUrl: 'plans/260603-1553-pagefly-mega-app-platform/reports/260607-1538-onetick-v01-boundary.md',
    debugBundle: true,
    retentionDays: 90,
  },
  degradedBehavior: {
    admin: 'readonly',
    api: 'readonly',
    storefront: 'no-op',
    webhook: 'skip',
  },
  requiredShopifyScopes: [
    'read_products',
    'read_themes',
    'write_themes',
    'unauthenticated_read_product_inventory',
    'unauthenticated_read_product_listings',
    'unauthenticated_read_product_tags',
  ],
  optionalShopifyScopes: [
    'unauthenticated_read_product_inventory',
    'unauthenticated_read_product_listings',
    'unauthenticated_read_product_tags',
  ],
  shopifyScopePolicy: {
    bumpPolicy: 'merchant-opt-in',
    merchantFacingReason:
      'OneTick needs product, theme, and Storefront API product scopes to render offers and publish the storefront runtime.',
  },
  storefrontRuntime: {
    configElementId: 'onetick-config',
    globalStoreKey: '__onetick_store__',
    liquidBytesBudget: 12000,
    runtimeConfigBytesBudget: 48000,
    assetBytesBudget: 250000,
  },
  themeSurfaces,
  cartIntent: {
    conflictGroup: 'cart-addon-line-items',
    ownsLinePropertyPrefix: '__onetick_',
    coverage: ['cart-page', 'cart-drawer', 'pdp-add-to-cart', 'pdp-pre-checkout'],
    bypassBehavior: 'fail-open-no-op',
    preCheckout: {
      latencyBudgetMs: 50,
      failOpen: true,
      fallbackBehavior: 'no-op',
    },
    checkoutBypass: {
      behavior: 'fail-open-no-op',
      surfaces: ['buy-it-now', 'shop-pay', 'dynamic-checkout', 'pdp-add-and-go-to-checkout'],
      reason: 'OneTick V0.1 does not mutate accelerated checkout submissions before Shopify owns checkout.',
    },
  },
  marketplace: {
    displayTitle: 'OneTick',
    tagline: 'Easy upsell and cross sell with checkboxes and product offers.',
    description:
      'Beginner-friendly upsell and cross-sell app for checkbox add-ons, product offers, and cart recommendations.',
    planLabel: 'Included in your plan',
    themeEmbed: 'Online Store 2.0',
    surfaces: 'Product page, cart drawer, cart page',
    updated: 'Jun 2026',
    metaItems: ['Upsell and cross-sell', 'Online Store 2.0', 'PageFly'],
  },
  marketplaceStats: {
    usageDataCollections: ['checkboxes', 'styling', 'onboarding'],
  },
  // Price-blind entitlement. standard class → unlocked at Builder. No meter → binary lock below Builder.
  // Inert until the Unleash flag `app-platform.tier-gate.enabled` is ON (staged ramp).
  entitlement: {
    appClass: 'standard',
    gatedCapability: 'canWriteOneTickCheckboxes',
  },
}

export default onetickManifest
