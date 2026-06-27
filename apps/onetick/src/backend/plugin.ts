// OneTick backend code must access PageFly only through AppBackendPlugin ctx.ports.
import type { AppBackendPlugin } from '../../../../web/server/src/app-platform/contracts'
import { onetickManifest } from '../../manifest'
import { onetickStorefrontContribution } from '../storefront/runtime-contract'
import { registerOneTickCheckboxApi } from './checkbox-api'
import { registerOneTickCheckboxBulkApi } from './checkbox-bulk-api'
import { registerOneTickOnboardingApi } from './onboarding-api'
import { registerOneTickSetupOptionsApi } from './setup-options-api'
import { registerOneTickStylingApi } from './styling-api'
import { createOneTickStylingActivationMetafields } from './styling-publisher'
import { registerOneTickThemeConfigApi } from './theme-config-api'

// OneTick enters PageFly only through AppBackendPlugin. All data, Shopify, support, and tracking
// access below must flow through ctx.ports so the app package stays isolated from PageFly core.
export const onetickBackendPlugin: AppBackendPlugin = {
  appId: onetickManifest.appId,
  manifest: onetickManifest,
  register(ctx) {
    registerOneTickCheckboxApi(ctx)
    registerOneTickCheckboxBulkApi(ctx)
    registerOneTickSetupOptionsApi(ctx)
    registerOneTickStylingApi(ctx)
    registerOneTickOnboardingApi(ctx)
    registerOneTickThemeConfigApi(ctx)

    ctx.api.route({
      method: 'GET',
      path: '/status',
      capability: 'canReadShopContext',
      async handler(request) {
        const shop = await ctx.ports.shopContext.getSafeContext(request.context, [
          'identity',
          'plan',
          'app',
          'storefront',
        ])

        return {
          body: {
            appId: ctx.app.appId,
            status: 'pilot',
            shop,
            storefrontRuntime: onetickStorefrontContribution,
          },
        }
      },
    })
    ctx.api.route({
      method: 'GET',
      path: '/debug-bundle',
      capability: 'canReadSupportDebugBundle',
      async handler(request) {
        const reason = String(request.query.reason || '').trim()
        if (!reason) {
          return {
            status: 400,
            body: {
              success: false,
              message: 'Support debug reason is required',
            },
          }
        }

        return {
          body: {
            appId: ctx.app.appId,
            status: 'pilot',
            supportDebug: await ctx.ports.supportDebug.create(request.context, {
              reason,
            }),
          },
        }
      },
    })

    ctx.storefront.runtime({
      name: onetickStorefrontContribution.name,
      assetPath: onetickStorefrontContribution.assetPath,
      configElementId: onetickStorefrontContribution.configElementId,
      globalStoreKey: onetickStorefrontContribution.globalStoreKey,
      liquidConfigTemplate: onetickStorefrontContribution.liquidConfigTemplate,
      runtimeInstaller: onetickStorefrontContribution.runtimeInstaller,
      contribution: 'active',
      activationMetafields: ({ context, ports }) => createOneTickStylingActivationMetafields(ports, context),
    })
  },
}

export default onetickBackendPlugin
