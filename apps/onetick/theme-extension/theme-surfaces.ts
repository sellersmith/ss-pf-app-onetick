// App-owned theme surface manifest; extension build materializes sources into PageFly Shopify extension output.
import type { ThemeSurfaceContribution } from '../../../web/server/src/app-platform/contracts'

export const themeSurfaces: ThemeSurfaceContribution = {
  appId: 'onetick',
  appEmbeds: [
    {
      handle: 'onetick-embed',
      name: 'OneTick',
      target: 'body',
      source: 'blocks/app-embed.liquid',
      generatedName: 'pagefly-onetick-embed.liquid',
    },
  ],
  appBlocks: [
    {
      handle: 'onetick-checkbox',
      name: 'Upsell checkbox',
      target: 'section',
      source: 'blocks/checkbox.liquid',
      generatedName: 'pagefly-onetick-checkbox.liquid',
    },
  ],
  snippets: [
    {
      handle: 'onetick-config',
      source: 'snippets/config.liquid',
      generatedName: 'pagefly-onetick-config.liquid',
    },
    {
      handle: 'onetick-master-product',
      source: 'snippets/master-product.liquid',
      generatedName: 'pagefly-onetick-master-product.liquid',
    },
    {
      handle: 'onetick-checkbox-group-banner',
      source: 'snippets/checkbox-group-banner.liquid',
      generatedName: 'pagefly-onetick-checkbox-group-banner.liquid',
    },
  ],
  assets: [
    {
      handle: 'onetick-js',
      source: '../src/storefront/browser-entry.ts',
      generatedName: 'pagefly-onetick.js',
      kind: 'javascript',
    },
  ],
}

export default themeSurfaces
