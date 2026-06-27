import { shortenTitle } from '../utils/shortenTitleVariant'

/* eslint-disable max-len */
const VARIANT_SOLD_OUT_WARNING = 'This variant is sold out.'
const PRODUCT_SOLD_OUT_WARNING = 'This product is sold out.'
export const renderCheckboxContainerHtmlCode = (
  checkboxData: any,
  masterProductId: string,
  masterProductTitle: string,
  isCartDrawer: boolean = false
) => {
  const { addonVariants } = window.__onetick_store__
  const {
    id,
    uv: defaultAddonVariantId,
    up: upsellProductId,
    pc,
    scp,
    sp,
    img,
    h,
    d,
    svs,
    spu,
    ph,
    pd,
    sfi,
    rwtc,
    ctp,
    spb,
  } = checkboxData

  const showImage = typeof sfi === 'boolean' ? sfi : img

  const defaultAddonVariant = addonVariants?.[defaultAddonVariantId] || null

  if (!defaultAddonVariant) return ''

  const addonVariantPrice = defaultAddonVariant.addonVariantPrice || '0'
  const addonVariantComparedPrice = defaultAddonVariant.addonVariantComparedPrice || '0'
  const addonVariantComparedPriceNumber = (defaultAddonVariant.addonVariantComparedPrice || '0').replace(
    /[^0-9.-]+/g,
    ''
  )

  const addonProduct = defaultAddonVariant.product || null
  const variantsList = Object.values(addonVariants).filter(({ product }: any) => product.id === addonProduct.id)

  const checkDataInTag = (element: string): boolean => {
    // Validate that the input is a well-formed HTML string
    try {
      const tempDiv = document.createElement('div')
      tempDiv.innerHTML = element

      if (!tempDiv.querySelector('onetick-text-container')) return !!element
      // Access the content inside the custom element
      const html = tempDiv.querySelector('onetick-text-container')?.innerHTML
      return !!html
    } catch (e) {
      // Return false if there's an error parsing the HTML
      return false
    }
  }

  const contentType = typeof ctp === 'string' ? ctp : undefined
  const showHeading = !contentType || contentType === 'heading_only' || contentType === 'heading_and_description'
  const showDescription
    = !contentType || contentType === 'description_only' || contentType === 'heading_and_description'

  const checkContentBlockShowCenter = () => {
    return (
      [checkDataInTag(h), checkDataInTag(d), sp || scp, svs && addonProduct.variantsCount > 1].filter(
        element => !!element
      ).length < 3 && showImage
    )
  }

  return `
    <onetick-checkbox
      class= 'onetick-checkbox-container'
      data-upsell-variant-id='${defaultAddonVariantId}'
      data-upsell-product='${upsellProductId}'
      data-target-product='${masterProductId}'
      data-target-product-title='${masterProductTitle}'
      data-checkbox-id='${id}'
      data-auto-remove-checkbox='${rwtc}'
    >
      <div class='onetick-d-flex onetick-g-10 ${checkContentBlockShowCenter() ? 'onetick-align-center' : ''}'>
        <div class='onetick-d-flex onetick-g-10 onetick-img-checkbox'>
          <label class='onetick-checkbox'>
            <input
              autocomplete="off"
              type='checkbox'
              ${pc ? 'checked' : ''}
              id='onetick-${id}'
              name='onetick-${id}'
            >
            <span class='onetick-checkmark'></span>
          </label>
        ${
          showImage
            ? `<img
              class='onetick-image-checkbox'
              src='${img}'
              onerror="this.src = 'https://cdn.shopify.com/s/files/1/0646/2953/8985/files/invalid-image.svg';"
              width='40px'
              height='40px'
              loading='lazy'
              alt='Onetick checkbox upsell'
            >`
            : ''
        }
        </div>

        <div class='onetick-d-flex onetick-g-10 onetick-flex-1'>
          <div class='onetick-checkbox-content onetick-flex-1'>
          <div class='onetick-d-flex onetick-wrap onetick-g-8 onetick-r-g-10 onetick-flex-col'>
            <div class='onetick-d-flex onetick-g-4 onetick-flex-col'>
                  ${showHeading && checkDataInTag(h) ? `<h2 class='onetick-label onetick-m-0'>${h}</h2>` : ''}
                  ${showDescription && checkDataInTag(d) ? `<span class='onetick-description'>${d}</span>` : ''}
            </div>
          ${
            sp || scp
              ? ` <div class='onetick-g-8 onetick-d-flex onetick-wrap'>
                    ${sp ? `<h2 class='onetick-price onetick-m-0 '>${addonVariantPrice}</h2>` : ''}
                    ${
                      scp && addonVariantComparedPriceNumber > 0
                        ? `<h2 class='onetick-compared-price onetick-m-0 '>${addonVariantComparedPrice}</h2>`
                        : ''
                    }
                  </div>`
              : ''
          }
          </div>
            ${
              svs && addonProduct.variantsCount > 1
                ? `<onetick-variant-selector-container>
                    <onetick-variant-selector>
                      <label>Variant:</label>
                      <select autocomplete="off">
                        ${variantsList
                          .map(
                            (variant: any) =>
                              `<option
                              value='${variant.id}'
                              name='${variant.title}'
                              ${variant.id === defaultAddonVariantId ? "selected='selected'" : ' '}
                            >
                              ${isCartDrawer ? shortenTitle(variant.title) : variant.title}
                            </option>`
                          )
                          .join('')}
                      </select>
                      <span id='onetick-addon-variant' data-addon-variant-id='${defaultAddonVariant.id}'>
                        ${defaultAddonVariant.title}
                      </span>
                      <svg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 20 20' fill='none'>
                        <path fill-rule="evenodd" clip-rule="evenodd" d="M6.24009 8.20009C6.31232 8.13311 6.39703 8.08101 6.48939 8.04677C6.58175 8.01253 6.67995 7.99682 6.77838 8.00053C6.87681 8.00425 6.97355 8.02732 7.06307 8.06842C7.15258 8.10952 7.23313 8.16786 7.30009 8.24009L10.0001 11.1481L12.7001 8.24009C12.8354 8.09422 13.023 8.00806 13.2218 8.00056C13.4206 7.99306 13.6142 8.06483 13.7601 8.20009C13.906 8.33535 13.9921 8.52302 13.9996 8.72181C14.0071 8.9206 13.9354 9.11422 13.8001 9.26009L10.5501 12.7601C10.4799 12.8358 10.3948 12.8962 10.3002 12.9376C10.2055 12.9789 10.1034 13.0002 10.0001 13.0002C9.89683 13.0002 9.79467 12.9789 9.70003 12.9376C9.60539 12.8962 9.5203 12.8358 9.45009 12.7601L6.20009 9.26009C6.13311 9.18787 6.08101 9.10316 6.04677 9.0108C6.01253 8.91844 5.99682 8.82024 6.00053 8.72181C6.00425 8.62338 6.02732 8.52664 6.06842 8.43712C6.10952 8.34761 6.16786 8.26706 6.24009 8.20009Z" fill="#4A4A4A"/>
                      </svg>
                    </onetick-variant-selector>
                    </onetick-variant-selector-container>
                  `
                : ''
            }
            <span class="warning" style="display: none">${
              svs && addonProduct.variantsCount > 1 ? VARIANT_SOLD_OUT_WARNING : PRODUCT_SOLD_OUT_WARNING
            }</span>
        </div>
        ${
          spu
            ? `
          <onetick-popup>
            <button class='onetick-popup-btn'>
              <svg width='21' height='20' viewBox='0 0 21 20' fill='none' xmlns='http://www.w3.org/2000/svg'>
                <path
                  d="M10.6665 14C10.2523 14 9.91649 13.6642 9.9165 13.25L9.91656 9.74999C9.91657 9.33577 10.2524 8.99999 10.6666 9C11.0808 9.00001 11.4166 9.3358 11.4166 9.75001L11.4165 13.25C11.4165 13.6642 11.0807 14 10.6665 14Z"
                  fill="#4A4A4A"
                />
                <path
                  d="M9.6665 7C9.6665 6.44772 10.1142 6 10.6665 6C11.2188 6 11.6665 6.44772 11.6665 7C11.6665 7.55228 11.2188 8 10.6665 8C10.1142 8 9.6665 7.55228 9.6665 7Z"
                  fill="#4A4A4A"
                />
                <path
                  fill-rule="evenodd"
                  clip-rule="evenodd"
                  d="M17.6665 10C17.6665 13.866 14.5325 17 10.6665 17C6.80051 17 3.6665 13.866 3.6665 10C3.6665 6.13401 6.80051 3 10.6665 3C14.5325 3 17.6665 6.13401 17.6665 10ZM16.1665 10C16.1665 13.0376 13.7041 15.5 10.6665 15.5C7.62894 15.5 5.1665 13.0376 5.1665 10C5.1665 6.96243 7.62894 4.5 10.6665 4.5C13.7041 4.5 16.1665 6.96243 16.1665 10Z"
                  fill="#4A4A4A"
                />
              </svg>
            </button>

            <div class='onetick-popup'>
              <div class='modal-content'>
                <div class='modal-header'>
                  <h2>${ph}</h2>

                  <div class='close'>
                    <svg width='20' height='20' viewBox='0 0 20 20' fill='none' xmlns='http://www.w3.org/2000/svg'>
                      <path d="M13.9697 15.0303C14.2626 15.3232 14.7374 15.3232 15.0303 15.0303C15.3232 14.7374 15.3232 14.2626 15.0303 13.9697L11.0607 10L15.0303 6.03033C15.3232 5.73744 15.3232 5.26256 15.0303 4.96967C14.7374 4.67678 14.2626 4.67678 13.9697 4.96967L10 8.93934L6.03033 4.96967C5.73744 4.67678 5.26256 4.67678 4.96967 4.96967C4.67678 5.26256 4.67678 5.73744 4.96967 6.03033L8.93934 10L4.96967 13.9697C4.67678 14.2626 4.67678 14.7374 4.96967 15.0303C5.26256 15.3232 5.73744 15.3232 6.03033 15.0303L10 11.0607L13.9697 15.0303Z" fill="#4A4A4A"/>
                    </svg>
                  </div>
                </div>

                <div class='modal-body'>
                  ${pd}
                </div>
              </div>
            </div>
          </onetick-popup>
        `
            : ''
        }
        </div>
      </div>
    </onetick-checkbox>
  `
}
