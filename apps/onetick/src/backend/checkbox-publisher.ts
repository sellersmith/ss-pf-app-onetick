// OneTick backend code must access PageFly only through AppBackendPlugin ctx.ports.
import type { AppBackendRegisterContext, AppContext } from '../../../../web/server/src/app-platform/contracts'
import type { OneTickCheckbox } from '../domain/checkbox'
import { formatOneTickCheckboxForMetafield } from '../domain/checkbox'
import type { OneTickCheckboxRepository } from './checkbox-repository'

export interface OneTickPublishResult {
  item: OneTickCheckbox
  ok: boolean
  message?: string
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error)
}

async function trackQuietly(
  ctx: AppContext,
  app: AppBackendRegisterContext,
  eventName: string,
  payload: Record<string, unknown>
) {
  try {
    await app.ports.tracking.track(ctx, eventName, payload)
  } catch {
    // Tracking must not change merchant-facing publish state.
  }
}

export async function publishCheckbox(
  ctx: AppContext,
  app: AppBackendRegisterContext,
  checkbox: OneTickCheckbox,
  repository: OneTickCheckboxRepository
): Promise<OneTickPublishResult> {
  const updatedAt = new Date().toISOString()

  try {
    // App data remains the primary database. Shopify app-data metafields are the storefront runtime
    // snapshot consumed by Liquid/config and can be regenerated from the repository record.
    await app.ports.appMetafields.setMany(ctx, [
      {
        namespace: 'onetick_checkbox',
        key: checkbox.id,
        type: 'json',
        owner: 'app-installation',
        value: formatOneTickCheckboxForMetafield(checkbox),
        reason: 'onetick-checkbox-admin-save',
      },
    ])
    await trackQuietly(ctx, app, 'onetick_checkbox_published', {
      checkboxId: checkbox.id,
      isActive: checkbox.isActive,
    })

    const item = await repository.setPublishState(checkbox.id, { status: 'published', updatedAt })
    return { ok: true, item: item || checkbox }
  } catch (error) {
    const message = errorMessage(error)
    const item = await repository.setPublishState(checkbox.id, {
      status: 'failed',
      error: message,
      updatedAt,
    })
    await trackQuietly(ctx, app, 'onetick_checkbox_publish_failed', {
      checkboxId: checkbox.id,
      error: message,
    })
    return { ok: false, item: item || checkbox, message }
  }
}
