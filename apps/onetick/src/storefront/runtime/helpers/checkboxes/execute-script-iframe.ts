export function getDataFromHTMLText(html: string) {
  let addonVariants = {},
    triggerProducts = {}

  const parser = new DOMParser(),
    dom = parser.parseFromString(html, 'text/html')

  if (dom) {
    addonVariants = JSON.parse((dom.querySelector('onetick-data-addon-products') as HTMLElement)?.innerText)
    triggerProducts = JSON.parse((dom.querySelector('onetick-data-trigger-products') as HTMLElement)?.innerText)
  }

  return { addonVariants, triggerProducts }
}

export async function executeScriptInIframe(html: string, callback: (document: Document) => any) {
  return new Promise((resolve, reject) => {
    // Create new iframe with display none
    const iframe = document.createElement('iframe')
    iframe.style.display = 'none'
    document.body.appendChild(iframe)
    let data: any

    if (iframe.contentWindow) {
      // Add script to the iframe document
      iframe.contentWindow.document.open()
      iframe.contentWindow.document.write(html)
      iframe.contentWindow.document.close()
    } else {
      resolve(data)
    }

    // After the iframe has been loader, get the addonVariants and triggerProducts
    iframe.onload = function () {
      const _window = iframe.contentWindow
      if (_window) {
        data = callback(_window.document)
      }

      // Remove iframe
      document.body.removeChild(iframe)
      resolve(data)
    }
  })
}
