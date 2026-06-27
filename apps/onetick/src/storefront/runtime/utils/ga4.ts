function _onetick_gtag() {
  // @ts-ignore
  const gtag = window.gtag
  if (!gtag || typeof gtag !== 'function') return

  gtag(...arguments)
}

export function sendAddedUpsellEvent(events: Object) {
  // @ts-ignore
  _onetick_gtag('event', 'onetick_added_upsell', {
    event_category: 'added_upsell',
    event_label: 'Added upsell event',
    event_value: 1,
    ...events,
  })
}

export function sendViewedEvent(events: Object) {
  // @ts-ignore
  _onetick_gtag('event', 'onetick_viewed', {
    event_category: 'viewed',
    event_label: 'Viewed element',
    event_value: 1,
    ...events,
  })
}
