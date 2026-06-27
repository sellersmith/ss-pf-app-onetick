/* eslint-disable max-len */
import { EMedia, EProductOffersDirection } from '../../constants'
import type { IProduct, IProductOfferMetafieldData } from '../../types'
import { formatShopifyMoney } from '../../utils/format-currency'
import { spinner } from './spinner'

export default function renderProductOfferSliderHtmlCode(
  product: IProduct,
  sliceToShow: number,
  currentProductOffer: IProductOfferMetafieldData,
  direction: EProductOffersDirection,
  classLayoutSelectInput: string
) {
  const { bt, eq, eo } = currentProductOffer

  const { id, featuredImage, title, availableForSale, variants } = product

  if (!availableForSale && eo) return ''

  const filteredVariants = (eo ? variants.filter(v => !!v.availableForSale) : variants).sort((a, b) =>
    b.availableForSale === a.availableForSale ? 0 : a.availableForSale ? -1 : 1
  )

  const firstVariant = filteredVariants?.[0]

  const isHorizontal = direction === EProductOffersDirection.HORIZONTAL

  return `
  <div class="onetick-offer-container-item onetick-offer-product ${
    isHorizontal ? 'onetick-flex-row' : 'onetick-flex-column'
  }" data-product-id="${id}">
    ${spinner}
    <img class="onetick-offer-item-img" src="${
      firstVariant?.image?.url || (isHorizontal ? EMedia.PLACEHOLDER_IMAGE_SQUARE : EMedia.PLACEHOLDER_IMAGE_RECT)
    }" alt="${featuredImage?.altText || ''}"/>
    <div class="onetick-offer-item-info">
      <div class="onetick-offer-item-header">
        <onetick-offer-title>
          <h5 class="onetick-offer-item-title">${title}</h4>
        </onetick-offer-title>
        <div class="onetick-offer-item-price-row">
          <span class="onetick-offer-item-price">${
            !firstVariant?.price?.amount ? '' : formatShopifyMoney(firstVariant.price.amount)
          }</span>
          <span class="onetick-offer-item-compared-price">${
            !firstVariant?.compareAtPrice?.amount ? '' : formatShopifyMoney(firstVariant.compareAtPrice.amount)
          }</span>
        </div>
      </div>

      <div class="onetick-offer-item-content">
        <div class="onetick-d-flex onetick-g-8 ${classLayoutSelectInput}">
        ${
          filteredVariants.length > 1
            ? `<onetick-offer-variant-selector data-featured-image='${
                featuredImage?.url || ''
              }' data-horizontal='${isHorizontal}'>
                <select autocomplete="off">
                    ${filteredVariants
                      .map(
                        variant =>
                          `<option
                          value='${variant.id}'
                          name='${variant.title}'
                          data-price='${!variant.price?.amount ? '' : formatShopifyMoney(variant.price.amount)}'
                          data-compared-price='${
                            !variant.compareAtPrice?.amount ? '' : formatShopifyMoney(variant.compareAtPrice.amount)
                          }'
                          data-available-for-sale='${!!variant.availableForSale}'
                          data-variant-img='${variant.image?.url || ''}'
                        >
                          ${variant.title}
                        </option>`
                      )
                      .join('')}
                  </select>
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                          fill-rule="evenodd"
                          clip-rule="evenodd"
                          d="M4.78975 6.85225C5.00942 6.63258 5.36558 6.63258 5.58525 6.85225L8.1875 9.4545L10.7898 6.85225C11.0094 6.63258 11.3656 6.63258 11.5852 6.85225C11.8049 7.07192 11.8049 7.42808 11.5852 7.64775L8.58525 10.6477C8.36558 10.8674 8.00942 10.8674 7.78975 10.6477L4.78975 7.64775C4.57008 7.42808 4.57008 7.07192 4.78975 6.85225Z"
                          fill="#616161"
                        />
                      </svg>
                </onetick-offer-variant-selector>`
            : ''
        }
        ${
          eq
            ? `
              <div class="numberstyle-qty">
            <button class="qty-btn qty-rem">
              -
            </button>
            <input type="number" step="1" class="onetick-quantity-selector" min="1" value="1"/>
            <button class="qty-btn qty-add">
              +
            </button>
          </div>
          `
            : ''
        }
        </div>

          <div
            class="onetick-upsell-button"
            data-variant-id=${firstVariant.id}
            style='display: ${firstVariant.availableForSale ? 'block' : 'none'}'
          >
              ${bt}
          </div>

          <div
            class="onetick-upsell-button disable"
            data-variant-id=${firstVariant.id}
            style='display: ${firstVariant.availableForSale ? 'none' : 'block'}'
          >
            Sold out
          </div>
      </div>
    </div>
  </div>
  `
}

export const getDefaultProductOfferSliderHTML = (styleWrapperProductOffer: string) => {
  return `
  <onetick-product-offers style="${styleWrapperProductOffer}">
  <h3 class="onetick-product-offers-title" style="font-weight: 650;"></h3>
  <div class="onetick-offer-container">
      <div class="onetick-loading-overlay"></div>

      <div class="onetick-slider-items"></div>

      <button type="button" aria-label="previous slide" class="control-arrow control-prev">
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path fill-rule="evenodd" clip-rule="evenodd" d="M10.1631 5.19478C10.4092 5.44081 10.4092 5.8397 10.1631 6.08573L7.24861 9.00025L10.1631 11.9148C10.4092 12.1608 10.4092 12.5597 10.1631 12.8057C9.9171 13.0518 9.51821 13.0518 9.27218 12.8057L5.91218 9.44573C5.66615 9.1997 5.66615 8.80081 5.91218 8.55478L9.27218 5.19478C9.51821 4.94875 9.9171 4.94875 10.1631 5.19478Z" fill="#FFFFFF"/>
        </svg>
      </button>

      <button type="button" aria-label="next slide" class="control-arrow control-next">
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path fill-rule="evenodd" clip-rule="evenodd" d="M6.75288 12.8057C6.50685 12.5597 6.50685 12.1608 6.75288 11.9148L9.66741 9.00023L6.75288 6.08571C6.50685 5.83968 6.50685 5.44079 6.75288 5.19476C6.99891 4.94873 7.39781 4.94873 7.64384 5.19476L11.0038 8.55476C11.2499 8.80079 11.2499 9.19968 11.0038 9.44571L7.64384 12.8057C7.39781 13.0517 6.99891 13.0517 6.75288 12.8057Z" fill="#FFFFFF"/>
        </svg>
      </button>
    </div>
  </onetick-product-offers>
`
}

export const loadingSkeletonSlider = (itemsPerShow: number, direction: EProductOffersDirection) => {
  return `
  <div class="onetick-slider-items-loading">
    ${Array.from({ length: itemsPerShow })
      .map(
        () =>
          `<div class="onetick-item-loading onetick-flex-${direction === 'horizontal' ? 'row' : 'column'}">
              <div class="onetick-img-skeleton"></div>
              <div class="onetick-d-flex onetick-flex-col onetick-lines-skeleton">
                <div class="onetick-line-skeleton"></div>
                <div class="onetick-line-skeleton"></div>
                <div class="onetick-line-skeleton"></div>
              </div>
          </div>
          `
      )
      .join('')}
  </div>`
}
