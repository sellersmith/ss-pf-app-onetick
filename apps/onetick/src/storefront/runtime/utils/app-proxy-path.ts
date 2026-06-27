export function getOneTickAppProxyPath(): string {
  const configuredPath = window.__onetick_store__?.appProxyPath
  if (typeof configuredPath === 'string' && configuredPath.trim()) {
    return configuredPath.trim()
  }

  return '/apps/pagefly'
}
