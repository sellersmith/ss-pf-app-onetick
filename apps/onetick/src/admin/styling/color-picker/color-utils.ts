// App-local color picker ported for OneTick styling to avoid TailorKit UI imports.
import { rgbToHsb, type RGBAColor } from '@shopify/polaris'
import tinycolorFactory from 'tinycolor2'
import type tinycolor from 'tinycolor2'
import type { ColorDisplayValues } from './types'

export function convertTinycolorToPolarisColor(color: tinycolor.ColorFormats.RGBA): RGBAColor {
  const { r, g, b, a } = color
  return { red: r, green: g, blue: b, alpha: a }
}

export function getColors(color: tinycolor.Instance) {
  const hexColor = color.toHex8String()
  const rgbColor = color.toRgb()
  const hsbColor = rgbToHsb(convertTinycolorToPolarisColor(rgbColor))

  return { hexColor, rgbColor, hsbColor }
}

export function toDisplayValues(color: tinycolor.Instance): ColorDisplayValues {
  const { hexColor, rgbColor } = getColors(color)
  return {
    r: rgbColor.r,
    g: rgbColor.g,
    b: rgbColor.b,
    a: Math.round(rgbColor.a * 100).toFixed(0),
    hex: hexColor,
  }
}

export function tinycolorFromDisplayValues(focus: string, displayValues: ColorDisplayValues): tinycolor.Instance {
  if (focus === 'hex') return tinycolorFactory(displayValues.hex)
  if (!focus) return tinycolorFactory('')

  const { r, g, b, a } = displayValues
  return tinycolorFactory({ r, g, b, a: parseFloat(a) / 100 })
}
