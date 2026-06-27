// OneTick backend code must access PageFly only through AppBackendPlugin ctx.ports.
import type { AppBackendPorts, AppContext } from '../../../../web/server/src/app-platform/contracts'
import type { OneTickCheckbox, OneTickCheckboxInput } from '../domain/checkbox'
import { createOneTickCheckbox, updateOneTickCheckbox } from '../domain/checkbox'

const CHECKBOX_COLLECTION = 'checkboxes'
const scopeIndex = {
  name: 'by-shop-app-generation',
  fields: ['shopDomain', 'appId', 'subscriptionGeneration', 'id'],
}

export interface OneTickCheckboxRepository {
  list(): Promise<OneTickCheckbox[]>
  get(id: string): Promise<OneTickCheckbox | null>
  create(input: OneTickCheckboxInput): Promise<OneTickCheckbox>
  update(id: string, input: OneTickCheckboxInput): Promise<OneTickCheckbox | null>
  setPublishState(id: string, state: OneTickCheckbox['publishState']): Promise<OneTickCheckbox | null>
  softDelete(id: string): Promise<OneTickCheckbox | null>
  duplicate(id: string): Promise<OneTickCheckbox | null>
}

async function ensureCollection(ports: AppBackendPorts, ctx: AppContext) {
  // The app declares only its logical collection. ScopedAppDataPort adds the physical shop/app/generation
  // filters and rejects collections without this scope index prefix.
  await ports.appData.registerCollection(ctx, { collection: CHECKBOX_COLLECTION, indexes: [scopeIndex] })
}

export function createOneTickCheckboxRepository(ports: AppBackendPorts, ctx: AppContext): OneTickCheckboxRepository {
  async function putCheckbox(checkbox: OneTickCheckbox) {
    await ensureCollection(ports, ctx)
    await ports.appData.put(ctx, CHECKBOX_COLLECTION, checkbox.id, checkbox)
    return checkbox
  }

  return {
    async list() {
      await ensureCollection(ports, ctx)
      const records: OneTickCheckbox[] = []
      let cursor: string | undefined

      // Repository callers need the full active list for list UI and metafield publish. Pagination
      // still stays inside the port so Mongo never receives an unbounded query.
      do {
        const page = await ports.appData.list<OneTickCheckbox>(ctx, CHECKBOX_COLLECTION, { cursor, limit: 100 })
        records.push(...page.items.map(item => item.value))
        cursor = page.nextCursor
      } while (cursor)

      return records.filter(record => !record.deletedAt)
    },
    async get(id) {
      await ensureCollection(ports, ctx)
      const record = await ports.appData.get<OneTickCheckbox>(ctx, CHECKBOX_COLLECTION, id)
      return record && !record.deletedAt ? record : null
    },
    async create(input) {
      return putCheckbox(createOneTickCheckbox(input))
    },
    async update(id, input) {
      const current = await this.get(id)
      if (!current) return null
      return putCheckbox(updateOneTickCheckbox(current, input))
    },
    async setPublishState(id, state) {
      const current = await this.get(id)
      if (!current) return null
      return putCheckbox({ ...current, publishState: state, updatedAt: new Date().toISOString() })
    },
    async softDelete(id) {
      const current = await this.get(id)
      if (!current) return null
      return putCheckbox({ ...current, deletedAt: new Date().toISOString(), updatedAt: new Date().toISOString() })
    },
    async duplicate(id) {
      const current = await this.get(id)
      if (!current) return null
      return putCheckbox(
        createOneTickCheckbox({
          ...current,
          id: `${current.id}-copy-${Date.now()}`,
          title: `${current.title || 'Checkbox'} (Copy)`,
          isActive: false,
        })
      )
    },
  }
}
