export default function formatCurrency(value: number, currency: string) {
  return Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
    minimumIntegerDigits: 1,
  }).format(value)
}

export function formatShopifyMoney(cents: string, format?: string, onlyGetCents: boolean = false) {
  if (typeof cents === 'string') {
    cents = parseFloat(cents).toFixed(2).replace('.', '')
  }
  let value = ''
  const placeholderRegex = /{{\s*(\w+)\s*}}/
  const formatString = format || window.__onetick_store__?.money_format
  function defaultOption(opt: any, def: string | number) {
    return typeof opt === 'undefined' ? def : opt
  }
  function formatWithDelimiters(
    number: string | number | null,
    precision?: number,
    thousands?: string,
    decimal?: string
  ) {
    precision = defaultOption(precision, 2)
    thousands = defaultOption(thousands, ',')
    decimal = defaultOption(decimal, '.')
    if ((typeof number === 'number' && isNaN(number)) || number === null) {
      return '0'
    }
    number = (Number(number) / 100.0).toFixed(precision)
    const parts = number.split('.'),
      dollars = parts[0].replace(/(\d)(?=(\d\d\d)+(?!\d))/g, `$1${thousands}`),
      cents = parts[1] ? decimal + parts[1] : ''
    return dollars + cents
  }
  switch (formatString.match(placeholderRegex)[1]) {
    case 'amount':
      value = formatWithDelimiters(cents, 2)
      break
    case 'amount_no_decimals':
      value = formatWithDelimiters(cents, 0)
      break
    case 'amount_with_comma_separator':
      value = formatWithDelimiters(cents, 2, '.', ',')
      break
    case 'amount_no_decimals_with_comma_separator':
      value = formatWithDelimiters(cents, 0, '.', ',')
      break
    case 'amount_with_space_separator':
      value = formatWithDelimiters(cents, 0, ' ', ' ')
      break
    default:
      value = formatWithDelimiters(cents, 2)
      break
  }
  if (onlyGetCents) {
    return value
  }
  return formatString.replace(placeholderRegex, value)
}
