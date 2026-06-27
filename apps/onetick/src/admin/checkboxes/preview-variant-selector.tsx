// OneTick admin UI is copy-first TailorKit parity adapted to PageFly AdminAppHost and app API ports.
import React, { memo } from 'react'
import type { OneTickSelectedVariant } from './selected-variant'

export type OneTickPreviewVariant = NonNullable<OneTickSelectedVariant['product']['variants']>[number]

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'onetick-variant-selector-container': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>
      'onetick-variant-selector': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>
    }
  }
}

interface VariantSelectorPreviewProps {
  showVariantSelector: boolean
  hasMultipleVariants: boolean
  variants: OneTickPreviewVariant[]
  previewVariant: OneTickPreviewVariant | null
  setPreviewVariant: React.Dispatch<React.SetStateAction<OneTickPreviewVariant | null>>
  variantTitle: string
}

export const VariantSelectorPreview = memo(function VariantSelectorPreview({
  showVariantSelector,
  hasMultipleVariants,
  variants,
  previewVariant,
  setPreviewVariant,
  variantTitle,
}: VariantSelectorPreviewProps) {
  if (!showVariantSelector || !hasMultipleVariants) return null

  return (
    <onetick-variant-selector-container>
      <onetick-variant-selector>
        <label>Variant:</label>
        <select
          onChange={event => {
            const selectedId = event.target.value
            const selectedVariant = variants.find(item => item.id === selectedId)
            if (selectedVariant) {
              setPreviewVariant(selectedVariant)
            }
          }}
          onClick={event => {
            event.preventDefault()
            event.stopPropagation()
          }}
          value={previewVariant?.id || ''}
        >
          {variants.map(item => (
            <option key={item.id} value={item.id}>
              {item.title}
            </option>
          ))}
        </select>
        <span id="onetick-addon-variant" data-addon-variant-id={previewVariant?.id}>
          {variantTitle}
        </span>

        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M6.24009 8.20009C6.31232 8.13311 6.39703 8.08101 6.48939 8.04677C6.58175 8.01253 6.67995 7.99682 6.77838 8.00053C6.87681 8.00425 6.97355 8.02732 7.06307 8.06842C7.15258 8.10952 7.23313 8.16786 7.30009 8.24009L10.0001 11.1481L12.7001 8.24009C12.8354 8.09422 13.023 8.00806 13.2218 8.00056C13.4206 7.99306 13.6142 8.06483 13.7601 8.20009C13.906 8.33535 13.9921 8.52302 13.9996 8.72181C14.0071 8.9206 13.9354 9.11422 13.8001 9.26009L10.5501 12.7601C10.4799 12.8358 10.3948 12.8962 10.3002 12.9376C10.2055 12.9789 10.1034 13.0002 10.0001 13.0002C9.89683 13.0002 9.79467 12.9789 9.70003 12.9376C9.60539 12.8962 9.5203 12.8358 9.45009 12.7601L6.20009 9.26009C6.13311 9.18787 6.08101 9.10316 6.04677 9.0108C6.01253 8.91844 5.99682 8.82024 6.00053 8.72181C6.00425 8.62338 6.02732 8.52664 6.06842 8.43712C6.10952 8.34761 6.16786 8.26706 6.24009 8.20009Z"
            fill="#4A4A4A"
          />
        </svg>
      </onetick-variant-selector>
    </onetick-variant-selector-container>
  )
})
