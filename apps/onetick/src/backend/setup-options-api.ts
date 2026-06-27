// OneTick backend code must access PageFly only through AppBackendPlugin ctx.ports.
import type {
  AppBackendRegisterContext,
  ShopifyResourceSetupOptions,
} from '../../../../web/server/src/app-platform/contracts'
import type { OneTickPlacementType, OneTickTriggerProductsType } from '../domain/checkbox'
import { createOneTickCheckboxRepository } from './checkbox-repository'

const triggerProductsTypes: OneTickTriggerProductsType[] = [
  'all-products',
  'specific-products',
  'specific-variants',
  'product-collections',
  'product-tags',
  'product-vendors',
  'product-types',
]

const placements: OneTickPlacementType[] = ['product_details', 'cart']

export interface OneTickSetupOptionsResponse {
  success: true
  triggerProductsTypes: OneTickTriggerProductsType[]
  placements: OneTickPlacementType[]
  resources: ShopifyResourceSetupOptions
  limits: {
    currentCount: number
    upsellProductLimit: number | null
    limitReached: boolean
  }
}

export function registerOneTickSetupOptionsApi(app: AppBackendRegisterContext) {
  app.api.route({
    method: 'GET',
    path: '/setup-options',
    capability: 'canReadOneTickSetupOptions',
    async handler(request) {
      const query = typeof request.query.q === 'string' ? request.query.q : undefined
      const [resources, checkboxes] = await Promise.all([
        app.ports.shopifyResources.setupOptions(request.context, query),
        createOneTickCheckboxRepository(app.ports, request.context).list(),
      ])

      return {
        body: {
          success: true,
          triggerProductsTypes,
          placements,
          resources,
          limits: {
            currentCount: checkboxes.length,
            upsellProductLimit: null,
            limitReached: false,
          },
        } satisfies OneTickSetupOptionsResponse,
      }
    },
  })
}
