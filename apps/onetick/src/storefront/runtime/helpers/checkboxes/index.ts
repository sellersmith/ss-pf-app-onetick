export function handleInjectCheckboxToCartDrawer(newCartDrawerSelectorOfCheckboxElement: Element | HTMLElement | null) {
  try {
    if (!newCartDrawerSelectorOfCheckboxElement?.parentNode) {
      return
    }

    const isExistCheckbox = newCartDrawerSelectorOfCheckboxElement.parentNode.querySelector('onetick-group-checkboxes')
    if (
      isExistCheckbox
      && (isExistCheckbox.getAttribute('data-drawer-cart') === 'true'
        || isExistCheckbox.getAttribute('data-onetick-theme-code') === 'true')
    ) {
      return
    }

    const onetickGroupCheckboxes = document.createElement('onetick-group-checkboxes')
    onetickGroupCheckboxes.setAttribute('data-drawer-cart', 'true')

    newCartDrawerSelectorOfCheckboxElement?.append(onetickGroupCheckboxes)
  } catch (error) {
    console.error('[OneTick] Error injecting checkbox into cart drawer', error)
  }
}
