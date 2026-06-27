// OneTick domain models are app-owned persisted shapes plus explicit storefront compatibility formatters.
export interface OneTickCheckboxItemStyling {
  defaultBackground: string
  defaultBorder: string
}

export interface OneTickPersonalizeButtonStyling {
  buttonText: string
  doneText: string
  backgroundColor: string
  textColor: string
  borderColor: string
  borderRadius: number
  paddingBlock: number
  paddingInline: number
  doneBackgroundColor: string
  doneTextColor: string
  doneBorderColor: string
  doneBorderRadius: number
  donePaddingBlock: number
  donePaddingInline: number
}

export interface OneTickCheckboxGlobalStyling {
  tickIcon: string
  defaultBackground: string
  activeBackground: string
  defaultBorder: string
  activeBorder: string
  checkboxType: string
  imageSize: number
  checkboxItem: OneTickCheckboxItemStyling
  personalizeButton: OneTickPersonalizeButtonStyling
}

export const defaultPersonalizeButtonStyling: OneTickPersonalizeButtonStyling = {
  buttonText: 'Personalize',
  doneText: 'Personalized',
  backgroundColor: '#ffffff',
  textColor: '#303030',
  borderColor: '#8a8a8a',
  borderRadius: 4,
  paddingBlock: 6,
  paddingInline: 12,
  doneBackgroundColor: '#303030',
  doneTextColor: '#ffffff',
  doneBorderColor: '#303030',
  doneBorderRadius: 4,
  donePaddingBlock: 6,
  donePaddingInline: 12,
}

export const defaultCheckboxStyling: OneTickCheckboxGlobalStyling = {
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
  personalizeButton: defaultPersonalizeButtonStyling,
}

/** Deep-merges merchant styling over stable defaults so missing metafield keys remain storefront-safe. */
export function mergeCheckboxStyling(input?: Partial<OneTickCheckboxGlobalStyling>): OneTickCheckboxGlobalStyling {
  return {
    ...defaultCheckboxStyling,
    ...(input || {}),
    checkboxItem: {
      ...defaultCheckboxStyling.checkboxItem,
      ...(input?.checkboxItem || {}),
    },
    personalizeButton: {
      ...defaultPersonalizeButtonStyling,
      ...(input?.personalizeButton || {}),
    },
  }
}
