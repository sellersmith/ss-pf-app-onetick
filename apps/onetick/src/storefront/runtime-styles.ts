// OneTick storefront runtime runs from the generated theme asset and must fail open on merchant storefronts.
import { splitOneTickCheckboxes } from './runtime-config'
import { createOneTickCheckboxStyleTextFromStyling } from './runtime-style-defaults'
import type { OneTickCheckboxStyling } from './runtime-types'
import type { OneTickRuntimeConfig } from './runtime-types'

function legacyImageSizeToNumber(value: unknown): number | undefined {
  if (typeof value === 'number') return value
  if (typeof value !== 'string') return undefined
  const parsed = Number.parseFloat(value)
  return Number.isFinite(parsed) ? parsed : undefined
}

function legacyCheckboxStyleToConfig(styleSource: any, includeContainerStyle: boolean): OneTickCheckboxStyling {
  return {
    tickIcon: styleSource?.ti,
    defaultBackground: styleSource?.dBg,
    activeBackground: styleSource?.aBg,
    defaultBorder: styleSource?.dBorder,
    activeBorder: styleSource?.aBorder,
    checkboxType: styleSource?.ct,
    imageSize: legacyImageSizeToNumber(styleSource?.is),
    checkboxItem: includeContainerStyle
      ? {
          defaultBackground: styleSource?.cdBg,
          defaultBorder: styleSource?.cdBorder,
        }
      : undefined,
  }
}

export function createOneTickCheckboxStyleText(config: OneTickRuntimeConfig | null): string {
  if (!config) return ''

  const { globalStyling, fallbackStyleSource } = splitOneTickCheckboxes(config?.metafieldsCheckboxData)
  const checkboxStyling = config?.checkboxStyling

  if (checkboxStyling) {
    return createOneTickCheckboxStyleTextFromStyling(checkboxStyling)
  }

  const styleSource = globalStyling || fallbackStyleSource
  return createOneTickCheckboxStyleTextFromStyling(
    styleSource ? legacyCheckboxStyleToConfig(styleSource, Boolean(globalStyling)) : undefined
  )
}

export function appendOneTickInlineAsset(
  documentRef: Document,
  tagName: 'style' | 'script',
  text?: string,
  elementId?: string
) {
  if (!text) return

  const existingElement = elementId ? documentRef.getElementById(elementId) : null
  if (existingElement) {
    existingElement.textContent = text
    return
  }

  const element = documentRef.createElement(tagName)
  if (elementId) element.id = elementId
  element.textContent = text
  documentRef.head.appendChild(element)
}
