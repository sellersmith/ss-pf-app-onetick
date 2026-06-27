// OneTick admin UI is copy-first TailorKit parity adapted to PageFly AdminAppHost and app API ports.
interface PreviewDynamicFieldValues {
  price: string
  compareAtPrice?: string
  variantTitle: string
  productTitle: string
}

export function replaceOneTickPreviewDynamicFields(text: string, values: PreviewDynamicFieldValues): string {
  if (!text) return ''
  return text
    .replace(/\{\{price\}\}/g, values.price)
    .replace(/\{\{compare_at_price\}\}/g, values.compareAtPrice || '')
    .replace(/\{\{variant_name\}\}/g, values.variantTitle)
    .replace(/\{\{product_title\}\}/g, values.productTitle)
}
