// OneTick backend code must access PageFly only through AppBackendPlugin ctx.ports.
import type { AppBackendPorts, AppContext } from '../../../../web/server/src/app-platform/contracts'
import type { OneTickCheckboxGlobalStyling } from '../domain/styling'
import { defaultCheckboxStyling, mergeCheckboxStyling } from '../domain/styling'

const STYLING_COLLECTION = 'styling'
const CHECKBOX_STYLING_ID = 'global-checkbox'
const scopeIndex = {
  name: 'by-shop-app-generation',
  fields: ['shopDomain', 'appId', 'subscriptionGeneration', 'id'],
}

async function ensureCollection(ports: AppBackendPorts, ctx: AppContext) {
  await ports.appData.registerCollection(ctx, { collection: STYLING_COLLECTION, indexes: [scopeIndex] })
}

export function createOneTickStylingRepository(ports: AppBackendPorts, ctx: AppContext) {
  return {
    async get(): Promise<OneTickCheckboxGlobalStyling> {
      await ensureCollection(ports, ctx)
      const record = await ports.appData.get<OneTickCheckboxGlobalStyling>(ctx, STYLING_COLLECTION, CHECKBOX_STYLING_ID)
      return record ? mergeCheckboxStyling(record) : defaultCheckboxStyling
    },
    async put(input: Partial<OneTickCheckboxGlobalStyling>): Promise<OneTickCheckboxGlobalStyling> {
      await ensureCollection(ports, ctx)
      const current = await this.get()
      const next = mergeCheckboxStyling({ ...current, ...input })
      await ports.appData.put(ctx, STYLING_COLLECTION, CHECKBOX_STYLING_ID, next)
      return next
    },
  }
}
