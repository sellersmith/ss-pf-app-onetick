// OneTick storefront runtime runs from the generated theme asset and must fail open on merchant storefronts.
import { ONETICK_STORE_GLOBAL } from './runtime-constants'
import { buildOneTickStoreState, readOneTickConfig } from './runtime-config'
import { createOneTickPubSub } from './runtime-pubsub'
import { ONETICK_CHECKBOX_DYNAMIC_STYLE_ELEMENT_ID } from './runtime-style-defaults'
import { appendOneTickInlineAsset, createOneTickCheckboxStyleText } from './runtime-styles'
import { appendOneTickStaticCss } from './runtime-static-css'
import type { OneTickRuntimeConfig, OneTickStore } from './runtime-types'

export function bootstrapOneTickStore(
  options: {
    windowRef?: Window
    documentRef?: Document
    config?: OneTickRuntimeConfig | null
  } = {}
): Partial<OneTickStore> {
  const windowRef = options.windowRef || window
  const documentRef = options.documentRef || windowRef.document
  const config = options.config === undefined ? readOneTickConfig(documentRef) : options.config
  const store = windowRef[ONETICK_STORE_GLOBAL] || {}
  const state = buildOneTickStoreState(config)

  Object.assign(store, state, { pubsub: store.pubsub || createOneTickPubSub() })
  windowRef[ONETICK_STORE_GLOBAL] = store

  appendOneTickStaticCss(documentRef)
  appendOneTickInlineAsset(
    documentRef,
    'style',
    config ? createOneTickCheckboxStyleText(config) : '',
    ONETICK_CHECKBOX_DYNAMIC_STYLE_ELEMENT_ID
  )
  appendOneTickInlineAsset(documentRef, 'style', config?.customSelector?.css)
  appendOneTickInlineAsset(documentRef, 'script', config?.customSelector?.js)

  return store
}
