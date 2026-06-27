export function handleRemoveElement(
  element: HTMLElement | Element,
  _message: string,
  shouldRemove: boolean = true
): void {
  shouldRemove && element.remove()
}
