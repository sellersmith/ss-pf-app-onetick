// OneTick admin runtime entry for app-owned artifact deploys outside the PageFly core build.
import React from 'react'
import { AppProvider as PolarisAppProvider } from '@shopify/polaris'
import polarisTranslations from '@shopify/polaris/locales/en.json'
import { createRoot, type Root } from 'react-dom/client'
import { MemoryRouter } from 'react-router-dom'
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
  root.render(
    <PolarisAppProvider i18n={polarisTranslations}>
      {/*
        OneTick mounts as its own React root, so it can't share PageFly's Router.
        The PageFly host owns the real admin URL: each navigation re-runs mount() with a
        fresh host, so we seed the in-memory history from host.route.relativePath to keep
        the internal <Routes> in sync with the host URL (e.g. /new, /edit/:id).
      */}
      <MemoryRouter initialEntries={[host.route.relativePath || '/']}>
        <OneTickAdmin host={host} />
      </MemoryRouter>
    </PolarisAppProvider>
  )
  roots.set(container, root)
}

if (typeof window !== 'undefined') {
  window.PageFlyAppPlatformAdmins = {
    ...(window.PageFlyAppPlatformAdmins || {}),
    onetick: { mount, unmount },
  }
}
