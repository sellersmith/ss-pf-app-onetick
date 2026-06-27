// OneTick admin UI is copy-first TailorKit parity adapted to PageFly AdminAppHost and app API ports.
import type { OneTickThemeConfig } from './types'

export function resolveOneTickThemeHelperLink(themeConfig: OneTickThemeConfig): string {
  // Prefer the dedicated helper link, then fall back through Shopify theme-editor surfaces so the
  // install button stays useful when a theme does not expose every deep link.
  return themeConfig.oneTickHelperLink
    || themeConfig.appEmbedLink
    || themeConfig.productThemeLink
    || themeConfig.themeEditCodeLink
}

export function openOneTickThemeHelper(themeConfig: OneTickThemeConfig): boolean {
  const link = resolveOneTickThemeHelperLink(themeConfig)
  if (!link) return false
  window.open(link, '_blank', 'noopener,noreferrer')
  return true
}
