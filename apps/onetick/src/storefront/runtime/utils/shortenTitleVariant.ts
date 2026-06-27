const MAX_LENGTH = 35

export function shortenTitle(title: string) {
  if (typeof title !== 'string') {
    return ''
  }
  return title.length > MAX_LENGTH ? `${title.slice(0, MAX_LENGTH)}...` : title
}
