// OneTick backend code must access PageFly only through AppBackendPlugin ctx.ports.
import type {
  AppBackendRegisterContext,
  AppContext,
  ShopifyThemeAsset,
  ThemeSurfaceContribution,
} from '../../../../web/server/src/app-platform/contracts'

export interface OneTickThemeConfig {
  isOS2Theme: boolean
  productThemeLink: string
  enabledAppEmbed: boolean
  enabledOneTickHelper: boolean
  themeEditCodeLink: string
  appEmbedLink: string
  oneTickHelperLink: string
  checkboxBlockLinkProduct: string
  checkboxBlockLinkCart: string
}

export interface OneTickThemeConfigResponse {
  success: true
  appConfig: OneTickThemeConfig
}

const emptyThemeConfig: OneTickThemeConfig = {
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

function generatedHandle(generatedName?: string): string {
  return String(generatedName || '').replace(/\.liquid$/, '')
}

function themeEditorDeepLinkAppId(): string {
  // Shopify deep links now accept the app API key; keep the extension UUID as a fallback for older
  // local envs that were copied from TailorKit/PageFly extension conventions.
  return process.env.SHOPIFY_API_KEY || process.env.SHOPIFY_PAGEFLY_THEME_HELPER_ID || ''
}

function themeBlockIdentifiers(): string[] {
  return [process.env.SHOPIFY_PAGEFLY_THEME_HELPER_ID, process.env.SHOPIFY_API_KEY].filter(Boolean) as string[]
}

function shopAdminSubdomain(shopDomain: string): string {
  return shopDomain.replace(/\.myshopify\.com$/i, '').split('.')[0]
}

function themeIdForUrl(id: string | number): string {
  const value = String(id)
  return value.includes('/') ? value.split('/').filter(Boolean).pop() || value : value
}

function hasProductJsonTemplate(assets: ShopifyThemeAsset[]): boolean {
  return assets.some(asset => /^templates\/product(?:\.[^/]+)?\.json$/.test(asset.key))
}

function parseThemeBlocks(asset: ShopifyThemeAsset | null): unknown[] {
  try {
    const blocks = JSON.parse(asset?.value || '{}')?.current?.blocks || {}
    return Object.values(blocks)
  } catch {
    return []
  }
}

function hasEnabledSurfaceBlock(blocks: unknown[], identifiers: string[], handle: string): boolean {
  return blocks.some(block => {
    if (!block || typeof block !== 'object') return false
    const type = String((block as { type?: unknown }).type || '')
    const disabled = Boolean((block as { disabled?: unknown }).disabled)
    const matchesKnownIdentifier = identifiers.length ? identifiers.some(identifier => type.includes(identifier)) : true
    return !disabled && matchesKnownIdentifier && type.includes(handle)
  })
}

async function getOneTickThemeConfig(
  ctx: AppContext,
  app: AppBackendRegisterContext,
  themeSurfaces?: ThemeSurfaceContribution
): Promise<OneTickThemeConfig> {
  const mainTheme = await app.ports.shopifyTheme.getMainTheme(ctx)
  if (!mainTheme?.id) return emptyThemeConfig

  const deepLinkAppId = themeEditorDeepLinkAppId()
  const blockIdentifiers = themeBlockIdentifiers()
  const assets = await app.ports.shopifyTheme.listAssets(ctx)
  const isOS2Theme = hasProductJsonTemplate(assets)
  const themeId = themeIdForUrl(mainTheme.id)
  const shopSubdomain = shopAdminSubdomain(ctx.shopDomain)
  const productThemeLink = `https://admin.shopify.com/store/${shopSubdomain}/themes/${themeId}/editor?template=product`
  const cartThemeLink = `https://admin.shopify.com/store/${shopSubdomain}/themes/${themeId}/editor?template=cart`
  const themeEditCodeLink = `https://admin.shopify.com/store/${shopSubdomain}/themes/${themeId}`
  const embedHandle = generatedHandle(themeSurfaces?.appEmbeds?.[0]?.generatedName)
  const checkboxHandle = generatedHandle(themeSurfaces?.appBlocks?.[0]?.generatedName)
  const canDeepLinkAppEmbed = Boolean(isOS2Theme && deepLinkAppId && embedHandle)
  const canDeepLinkCheckboxBlock = Boolean(isOS2Theme && deepLinkAppId && checkboxHandle)
  const blocks = embedHandle
    ? parseThemeBlocks(await app.ports.shopifyTheme.getAsset(ctx, 'config/settings_data.json'))
    : []
  const enabledOneTickHelper = Boolean(embedHandle && hasEnabledSurfaceBlock(blocks, blockIdentifiers, embedHandle))
  const oneTickHelperLink = canDeepLinkAppEmbed
    ? `${productThemeLink}&context=apps&activateAppId=${deepLinkAppId}/${embedHandle}`
    : productThemeLink

  return {
    isOS2Theme,
    productThemeLink,
    enabledAppEmbed: enabledOneTickHelper,
    enabledOneTickHelper,
    themeEditCodeLink,
    appEmbedLink: oneTickHelperLink,
    oneTickHelperLink,
    checkboxBlockLinkProduct: canDeepLinkCheckboxBlock
      ? `${productThemeLink}&addAppBlockId=${deepLinkAppId}/${checkboxHandle}&target=mainSection`
      : productThemeLink,
    checkboxBlockLinkCart: canDeepLinkCheckboxBlock
      ? `${cartThemeLink}&addAppBlockId=${deepLinkAppId}/${checkboxHandle}&target=mainSection`
      : cartThemeLink,
  }
}

export function registerOneTickThemeConfigApi(app: AppBackendRegisterContext) {
  app.api.route({
    method: 'GET',
    path: '/theme-config',
    capability: 'canReadOneTickThemeConfig',
    async handler(request) {
      const appConfig = await getOneTickThemeConfig(request.context, app, app.app.manifest.themeSurfaces)
      return { body: { success: true, appConfig } satisfies OneTickThemeConfigResponse }
    },
  })
}
