// OneTick admin UI is copy-first TailorKit parity adapted to PageFly AdminAppHost and app API ports.
import React, { memo } from 'react'

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'onetick-popup': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>
    }
  }
}

export const PopupPreview = memo(function PopupPreview({ showPopup }: { showPopup: boolean }) {
  if (!showPopup) return null

  return (
    <onetick-popup
      onClick={(event: React.SyntheticEvent) => {
        event.preventDefault()
        event.stopPropagation()
      }}
    >
      <button className="onetick-popup-btn">
        <svg width="21" height="20" viewBox="0 0 21 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M10.6665 14C10.2523 14 9.91649 13.6642 9.9165 13.25L9.91656 9.74999C9.91657 9.33577 10.2524 8.99999 10.6666 9C11.0808 9.00001 11.4166 9.3358 11.4166 9.75001L11.4165 13.25C11.4165 13.6642 11.0807 14 10.6665 14Z"
            fill="#4A4A4A"
          />
          <path
            d="M9.6665 7C9.6665 6.44772 10.1142 6 10.6665 6C11.2188 6 11.6665 6.44772 11.6665 7C11.6665 7.55228 11.2188 8 10.6665 8C10.1142 8 9.6665 7.55228 9.6665 7Z"
            fill="#4A4A4A"
          />
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M17.6665 10C17.6665 13.866 14.5325 17 10.6665 17C6.80051 17 3.6665 13.866 3.6665 10C3.6665 6.13401 6.80051 3 10.6665 3C14.5325 3 17.6665 6.13401 17.6665 10ZM16.1665 10C16.1665 13.0376 13.7041 15.5 10.6665 15.5C7.62894 15.5 5.1665 13.0376 5.1665 10C5.1665 6.96243 7.62894 4.5 10.6665 4.5C13.7041 4.5 16.1665 6.96243 16.1665 10Z"
            fill="#4A4A4A"
          />
        </svg>
      </button>
    </onetick-popup>
  )
})
