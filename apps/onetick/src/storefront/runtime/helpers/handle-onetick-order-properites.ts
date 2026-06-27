import { EOneTickOrderPropertyKeys, EPlacementType, type EWidgetType } from '../constants'

// Define types with better naming and organization
interface IOneTickOrderPropertyConfig {
  type: EWidgetType
  id: string
  placement: EPlacementType
  masterProductId?: string
  masterProductTitle?: string
  masterVariantId?: string
  variantProductId?: string
  canRemoved?: boolean | string
  masterVariantTitle?: string
  data?: Object
}

// Destructure enum values once at module level for better readability
const {
  ONETICK_PROPERTIES,
  ONETICK_WIDGET_TYPE_FLAG,
  ONETICK_WIDGET_ID_FLAG,
  ONETICK_WIDGET_PLACEMENT,
  ONETICK_MASTER_PRODUCT_ID,
  ONETICK_MASTER_PRODUCT_TITLE,
  ONETICK_VARIANT_PRODUCT_ID,
  ONETICK_MASTER_VARIANT_ID,
  ONETICK_CHECKBOX_CAN_REMOVE_WHEN_TRIGGER_REMOVE,
  ONETICK_CHECKBOX_DATA,
} = EOneTickOrderPropertyKeys

/**
 * @author Sona
 * Creates an object containing order properties for OneTick.
 *
 * The `otProperties` string is constructed in a specific order to ensure
 * proper encoding and decoding. Changing the order may break data parsing.
 *
 * Format: type, id, placement, canRemoved, masterProductId, variantProductId, data
 *
 * - `type`: The type of the widget, .
 * - `id`: Unique identifier.
 * - `placement`: The types have been defined in EWidgetType (default: false).
 * - `canRemoved`: Can the addon be removed when the trigger is removed or not?
 * - `masterProductId`: ID of the master product (optional).
 * - `masterProductTitle`: Title of the master product (optional).
 * - `masterVariantId`: ID of the master variant (optional).
 * - `masterVariantTitle`: Title of the master variant (optional).
 * - `variantProductId`: ID of the variant product (optional).
 * - `data`: Additional data (optional). Note: type must be an object.
 */
export const creatOneTickOrderProperties = (props: IOneTickOrderPropertyConfig) => {
  const {
    type,
    id,
    placement,
    masterProductId,
    masterProductTitle,
    variantProductId,
    masterVariantId,
    canRemoved = false,
    masterVariantTitle,
    data,
  } = props
  const otProperties = `${type};${id};${placement};${canRemoved};${variantProductId || ''};${masterVariantId || ''};${
    masterProductId || ''
  };${data ? JSON.stringify(data) : ''}`

  const properties = {
    [ONETICK_PROPERTIES]: otProperties,
    ...(masterProductTitle
      && placement !== EPlacementType.CART && {
        [ONETICK_MASTER_PRODUCT_TITLE]: getFormattedProductTitle(masterProductTitle, masterVariantTitle),
      }),
  }

  return properties
}

export const getOneTickOrderProperties = (properties: any) => {
  if (properties?.[ONETICK_PROPERTIES]) {
    const dataProperties = properties[ONETICK_PROPERTIES].split(';')
    const [type, id, placement, canRemoved, variantProductId, masterVariantId, masterProductId, data] = dataProperties
    return {
      [ONETICK_WIDGET_TYPE_FLAG]: type,
      [ONETICK_WIDGET_ID_FLAG]: id,
      [ONETICK_WIDGET_PLACEMENT]: placement,
      [ONETICK_CHECKBOX_CAN_REMOVE_WHEN_TRIGGER_REMOVE]: canRemoved === 'true',
      [ONETICK_VARIANT_PRODUCT_ID]: variantProductId || '',
      [ONETICK_MASTER_VARIANT_ID]: masterVariantId || '',
      [ONETICK_MASTER_PRODUCT_ID]: masterProductId || '',
      [ONETICK_CHECKBOX_DATA]: (data && JSON.parse(data)) || {},
    }
  }

  return properties
}

// Helper function to format product title with variant title
const getFormattedProductTitle = (productTitle: string, variantTitle?: string) => {
  if (!variantTitle) return productTitle
  return `${productTitle}: ${variantTitle}`
}
