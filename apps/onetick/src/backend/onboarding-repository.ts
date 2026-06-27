// OneTick backend code must access PageFly only through AppBackendPlugin ctx.ports.
import type { AppBackendPorts, AppContext } from '../../../../web/server/src/app-platform/contracts'
import type { OneTickOnboardingState } from '../domain/onboarding'
import { defaultOnboardingState, mergeOnboardingState } from '../domain/onboarding'

const ONBOARDING_COLLECTION = 'onboarding'
const ONBOARDING_STATE_ID = 'checkbox-onboarding'
const scopeIndex = {
  name: 'by-shop-app-generation',
  fields: ['shopDomain', 'appId', 'subscriptionGeneration', 'id'],
}

async function ensureCollection(ports: AppBackendPorts, ctx: AppContext) {
  await ports.appData.registerCollection(ctx, { collection: ONBOARDING_COLLECTION, indexes: [scopeIndex] })
}

export function createOneTickOnboardingRepository(ports: AppBackendPorts, ctx: AppContext) {
  return {
    async get(): Promise<OneTickOnboardingState> {
      await ensureCollection(ports, ctx)
      const record = await ports.appData.get<OneTickOnboardingState>(ctx, ONBOARDING_COLLECTION, ONBOARDING_STATE_ID)
      return record ? mergeOnboardingState(record) : defaultOnboardingState
    },
    async put(input: Partial<OneTickOnboardingState>): Promise<OneTickOnboardingState> {
      await ensureCollection(ports, ctx)
      const current = await this.get()
      const next = mergeOnboardingState({ ...current, ...input })
      await ports.appData.put(ctx, ONBOARDING_COLLECTION, ONBOARDING_STATE_ID, next)
      return next
    },
  }
}
