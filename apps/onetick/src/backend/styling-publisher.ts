// OneTick styling snapshots are published through host app-data metafield ports for storefront Liquid.
import type { AppBackendPorts, AppContext, AppDataMetafieldInput } from '../../../../web/server/src/app-platform/contracts'
import type { OneTickCheckboxGlobalStyling } from '../domain/styling'
import { createOneTickStylingRepository } from './styling-repository'

export const ONE_TICK_STYLING_METAFIELD = {
  namespace: 'onetick_global_styling',
  key: 'checkbox',
} as const

export function createOneTickStylingMetafield(
  styling: OneTickCheckboxGlobalStyling,
  reason: string
): AppDataMetafieldInput {
  return {
    namespace: ONE_TICK_STYLING_METAFIELD.namespace,
    key: ONE_TICK_STYLING_METAFIELD.key,
    type: 'json',
    owner: 'app-installation',
    value: styling,
    reason,
  }
}

export async function createOneTickStylingActivationMetafields(
  ports: AppBackendPorts,
  ctx: AppContext
): Promise<AppDataMetafieldInput[]> {
  const styling = await createOneTickStylingRepository(ports, ctx).get()
  return [createOneTickStylingMetafield(styling, 'onetick-checkbox-styling-runtime-sync')]
}
