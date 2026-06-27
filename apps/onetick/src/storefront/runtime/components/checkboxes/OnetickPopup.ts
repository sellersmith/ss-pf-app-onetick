/* eslint-disable no-useless-constructor */

import { PORTALS_CONTAINER_ID } from '../../constants'
import type OnetickTextContainer from './OnetickTextContainer'

class OnetickPopup extends HTMLElement {
  constructor() {
    super()
  }

  init() {
    const onetickPopup = this.querySelector('.onetick-popup')
    const activatorButton = this.querySelector('.onetick-popup-btn')
    const closeButton = this.querySelector('.close')

    if (!activatorButton || !onetickPopup || !closeButton) return

    /*
      Finds and sets up communication with an instance of OnetickTextContainer within the current component.
      Waits for OnetickTextContainer to be fully defined before assigning OnetickCheckboxElement
      from the closest OnetickCheckbox parent
    */
    const textEditor = this.querySelector('onetick-text-container') as OnetickTextContainer
    customElements.whenDefined('onetick-text-container').then(() => {
      textEditor.onetickCheckboxElement = this.closest('onetick-checkbox')
    })

    // Add popup into a portals container for better management
    this.addPopupInToPortalsContainer(onetickPopup)

    activatorButton.addEventListener('click', e => {
      e.stopImmediatePropagation()
      e.preventDefault()
      e.stopPropagation()
      onetickPopup.classList.toggle('show')
    })

    closeButton.addEventListener('click', () => {
      onetickPopup.classList.remove('show')
    })

    // When the user clicks anywhere outside of the modal, close it
    window.addEventListener('click', e => {
      if (e.target === onetickPopup) {
        onetickPopup.classList.remove('show')
      }
    })
  }

  addPopupInToPortalsContainer(onetickPopup: Element) {
    let portalsContainer = document.getElementById(PORTALS_CONTAINER_ID)
    if (!portalsContainer) {
      portalsContainer = document.createElement('div')
      portalsContainer.id = PORTALS_CONTAINER_ID
      document.body.appendChild(portalsContainer)
    }
    portalsContainer.append(onetickPopup)
  }

  connectedCallback() {
    this.init()
  }
}

customElements.get('onetick-popup') || customElements.define('onetick-popup', OnetickPopup)
