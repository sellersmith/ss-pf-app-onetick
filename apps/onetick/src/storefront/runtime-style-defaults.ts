// OneTick storefront CSS variables need app-owned defaults before merchant styling exists.
import type { OneTickCheckboxStyling } from './runtime-types'

export type ResolvedOneTickCheckboxStyling = Required<Omit<OneTickCheckboxStyling, 'checkboxItem'>> & {
  checkboxItem: Required<NonNullable<OneTickCheckboxStyling['checkboxItem']>>
}

export const DEFAULT_ONETICK_CHECKBOX_STYLING: ResolvedOneTickCheckboxStyling = {
  tickIcon: '#ffffff',
  defaultBackground: '#ffffff',
  activeBackground: '#303030',
  defaultBorder: '#8a8a8a',
  activeBorder: '#303030',
  checkboxType: '4px',
  imageSize: 64,
  checkboxItem: {
    defaultBackground: '#FFFFFF00',
    defaultBorder: '#FFFFFF00',
  },
}

export const ONETICK_CHECKBOX_DYNAMIC_STYLE_ELEMENT_ID = 'onetick-checkbox-dynamic-styles'

export const DEFAULT_ONETICK_CHECKBOX_STYLING_JSON = JSON.stringify(DEFAULT_ONETICK_CHECKBOX_STYLING)

export function resolveOneTickCheckboxStyling(
  styling?: OneTickCheckboxStyling | null
): ResolvedOneTickCheckboxStyling {
  const defaults = DEFAULT_ONETICK_CHECKBOX_STYLING

  return {
    tickIcon: styling?.tickIcon ?? defaults.tickIcon,
    defaultBackground: styling?.defaultBackground ?? defaults.defaultBackground,
    activeBackground: styling?.activeBackground ?? defaults.activeBackground,
    defaultBorder: styling?.defaultBorder ?? defaults.defaultBorder,
    activeBorder: styling?.activeBorder ?? defaults.activeBorder,
    checkboxType: styling?.checkboxType ?? defaults.checkboxType,
    imageSize: Number(styling?.imageSize) || defaults.imageSize,
    checkboxItem: {
      defaultBackground: styling?.checkboxItem?.defaultBackground ?? defaults.checkboxItem.defaultBackground,
      defaultBorder: styling?.checkboxItem?.defaultBorder ?? defaults.checkboxItem.defaultBorder,
    },
  }
}

export function getOneTickCheckboxPadding(styling: ResolvedOneTickCheckboxStyling): string {
  return styling.checkboxItem.defaultBackground === '#FFFFFF00' && styling.checkboxItem.defaultBorder === '#FFFFFF00'
    ? '0px'
    : '16px'
}

export function createOneTickCheckboxVariableLines(styling?: OneTickCheckboxStyling | null): string[] {
  const resolved = resolveOneTickCheckboxStyling(styling)

  return [
    `  --o-ti: ${resolved.tickIcon};`,
    `  --o-dbg: ${resolved.defaultBackground};`,
    `  --o-abg: ${resolved.activeBackground};`,
    `  --o-db: ${resolved.defaultBorder};`,
    `  --o-ab: ${resolved.activeBorder};`,
    `  --o-ct: ${resolved.checkboxType};`,
    `  --o-cdbg: ${resolved.checkboxItem.defaultBackground};`,
    `  --o-cdb: ${resolved.checkboxItem.defaultBorder};`,
    `  --o-is: ${resolved.imageSize}px;`,
    `  --o-padding: ${getOneTickCheckboxPadding(resolved)};`,
  ]
}

export function createOneTickCheckboxStyleTextFromStyling(styling?: OneTickCheckboxStyling | null): string {
  return ['onetick-checkbox {', ...createOneTickCheckboxVariableLines(styling), '}'].join('\n')
}
