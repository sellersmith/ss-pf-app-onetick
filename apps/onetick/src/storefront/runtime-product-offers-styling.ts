// OneTick storefront runtime runs from the generated theme asset and must fail open on merchant storefronts.
import type { OneTickUnknownRecord } from './runtime-types'

export type OneTickProductOfferDisplayType = 'slider' | 'block'

function addPxIfNumber(value: unknown) {
  if (typeof value === 'number') return `${value}px`
  return typeof value === 'string' ? value : ''
}

function readRecord(value: unknown): OneTickUnknownRecord {
  return value && typeof value === 'object' ? value as OneTickUnknownRecord : {}
}

export function getOneTickProductOfferDisplayType(windowRef: Window, offer?: { dt?: OneTickProductOfferDisplayType }) {
  const stylingDisplayType = windowRef.__onetick_store__?.productOffersStyling?.dt
  return stylingDisplayType === 'block' || offer?.dt === 'block' ? 'block' : 'slider'
}

export function getOneTickProductOfferStyleVariables(windowRef: Window) {
  const styling = readRecord(windowRef.__onetick_store__?.productOffersStyling)
  if (!Object.keys(styling).length) return ''

  const colors = readRecord(styling.c)
  const borderRadius = readRecord(styling.br)
  const mediaRatio = { square: '1/1', portrait: '3/4' }[String(styling.mr)] || '1/1'
  const mediaFit = { original: 'contain', fill: 'cover' }[String(styling.mf)] || 'contain'

  return [
    ['po-ptc', colors.ptc],
    ['po-ppc', colors.ppc],
    ['po-ppcc', colors.ppcc],
    ['po-bbgc', colors.bbgc],
    ['po-btc', colors.btc],
    ['po-mbr', addPxIfNumber(borderRadius.mbr)],
    ['po-sbr', addPxIfNumber(borderRadius.sbr)],
    ['po-bbr', addPxIfNumber(borderRadius.bbr)],
    ['po-mr', mediaRatio],
    ['po-mf', mediaFit],
  ].map(([key, value]) => value ? `--${key}: ${value};` : '').join(' ')
}

export function getOneTickProductOfferStyling(
  windowRef: Window,
  displayType: OneTickProductOfferDisplayType
): OneTickUnknownRecord {
  const styling = (windowRef.__onetick_store__?.productOffersStyling || {}) as OneTickUnknownRecord
  const nestedStyling = styling[displayType]
  return nestedStyling && typeof nestedStyling === 'object'
    ? nestedStyling as OneTickUnknownRecord
    : styling
}
