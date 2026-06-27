// OneTick admin runtime entry for app-owned artifact deploys outside the PageFly core build.
import React from 'react'
import { createRoot, type Root } from 'react-dom/client'
import type { AdminAppHost } from '../../../../web/core/src/app-platform/admin'
import { OneTickAdmin } from './index'

export interface OneTickAdminRuntime {
  mount(container: Element, host: AdminAppHost): void
  unmount(container: Element): void
}

declare global {
  interface Window {
    PageFlyAppPlatformAdmins?: Record<string, OneTickAdminRuntime | undefined>
  }
}

const roots = new WeakMap<Element, Root>()

export function unmount(container: Element): void {
  const root = roots.get(container)
  if (!root) return

  root.unmount()
  roots.delete(container)
}

export function mount(container: Element, host: AdminAppHost): void {
  unmount(container)

  const root = createRoot(container)
  root.render(<OneTickAdmin host={host} />)
  roots.set(container, root)
}

if (typeof window !== 'undefined') {
  window.PageFlyAppPlatformAdmins = {
    ...(window.PageFlyAppPlatformAdmins || {}),
    onetick: { mount, unmount },
  }
}

