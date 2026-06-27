// Thin PageFly host for the OneTick admin artifact; keep this file free of OneTick admin screen imports.
import React, { useEffect, useRef, useState } from 'react'
import type { AdminAppHost } from '../../../../web/core/src/app-platform/admin'

const RUNTIME_MANIFEST_PATH = 'admin/runtime/manifest.json'
const RUNTIME_ENTRY_SOURCE = 'src/admin/runtime-entry.tsx'
const RUNTIME_CACHE_BUST = Date.now().toString(36)

interface ViteManifestEntry {
  file?: string
  css?: string[]
  imports?: string[]
}

type ViteManifest = Record<string, ViteManifestEntry>

interface OneTickAdminRuntimeModule {
  mount(container: Element, host: AdminAppHost): void
  unmount?(container: Element): void
}

interface OneTickAdminRuntimeHostProps {
  host: AdminAppHost
}

function collectAssets(manifest: ViteManifest, entryKey: string, visited = new Set<string>()) {
  if (visited.has(entryKey)) return { entryFile: '', cssFiles: [] as string[] }
  visited.add(entryKey)

  const entry = manifest[entryKey]
  if (!entry) return { entryFile: '', cssFiles: [] as string[] }

  const cssFiles = [...(entry.css || [])]
  for (const importKey of entry.imports || []) {
    cssFiles.push(...collectAssets(manifest, importKey, visited).cssFiles)
  }

  return {
    entryFile: entry.file || '',
    cssFiles: Array.from(new Set(cssFiles.filter(Boolean))),
  }
}

async function loadManifest(host: AdminAppHost): Promise<ViteManifest> {
  const response = await fetch(host.ports.assets.resolveAppAssetUrl(RUNTIME_MANIFEST_PATH), { cache: 'no-store' })
  if (!response.ok) throw new Error('Cannot load OneTick admin runtime manifest')
  return response.json() as Promise<ViteManifest>
}

function withRuntimeCacheBust(url: string): string {
  const separator = url.includes('?') ? '&' : '?'
  return `${url}${separator}pf_runtime_v=${encodeURIComponent(RUNTIME_CACHE_BUST)}`
}

async function loadRuntime(host: AdminAppHost): Promise<OneTickAdminRuntimeModule> {
  const manifest = await loadManifest(host)
  const assets = collectAssets(manifest, RUNTIME_ENTRY_SOURCE)

  if (!assets.entryFile) {
    throw new Error('OneTick admin runtime manifest is missing the runtime entry')
  }

  await Promise.all(
    assets.cssFiles.map(cssFile =>
      host.ports.assets.loadStylesheet(`admin/runtime/${cssFile}`, {
        key: `onetick-admin-runtime:${cssFile}`,
      })
    )
  )

  const entryUrl = withRuntimeCacheBust(host.ports.assets.resolveAppAssetUrl(`admin/runtime/${assets.entryFile}`))
  const runtimeModule = (await import(/* @vite-ignore */ entryUrl)) as OneTickAdminRuntimeModule

  if (typeof runtimeModule.mount !== 'function') {
    throw new Error('OneTick admin runtime does not export mount')
  }

  return runtimeModule
}

export const OneTickAdminRuntimeHost: React.FC<OneTickAdminRuntimeHostProps> = ({ host }) => {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const runtimeRef = useRef<OneTickAdminRuntimeModule | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    const container = containerRef.current

    if (!container) return undefined

    setError(null)
    void loadRuntime(host)
      .then(runtime => {
        if (cancelled) return
        runtimeRef.current = runtime
        runtime.mount(container, host)
      })
      .catch(loadError => {
        if (cancelled) return
        setError(loadError instanceof Error ? loadError.message : String(loadError))
      })

    return () => {
      cancelled = true
      runtimeRef.current?.unmount?.(container)
      runtimeRef.current = null
    }
  }, [host])

  if (error) return <div role="alert">{error}</div>
  return <div ref={containerRef} />
}

export default OneTickAdminRuntimeHost

