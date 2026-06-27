// OneTick storefront runtime runs from the generated theme asset and must fail open on merchant storefronts.
import { getOneTickProductOfferStyling } from './runtime-product-offers-styling'

const cleanupKey = '__onetickSliderNavigationCleanup'

function getDevice(width?: number) {
  const innerWidth = typeof width === 'number' ? width : window.innerWidth
  return innerWidth >= 768 ? 'desktop' : 'mobile'
}

function minmax(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value))
}

function smoothScroll(windowRef: Window, container: HTMLElement, top: number, left: number) {
  container.scroll({ top, left, behavior: 'smooth' })
  return new Promise(resolve => {
    const requestFrame = (windowRef as any).requestAnimationFrame || ((callback: FrameRequestCallback) => callback(0))
    const checkScroll = () => {
      if (Math.abs(container.scrollTop - top) <= 1 && Math.abs(container.scrollLeft - left) <= 1) resolve(true)
      else requestFrame(checkScroll)
    }
    checkScroll()
  })
}

export function installOneTickProductOfferSliderNavigation(element: HTMLElement, windowRef: Window) {
  ;((element as any)[cleanupKey] as (() => void) | undefined)?.()
  const container = element.querySelector('.onetick-slider-items') as HTMLElement | null
  const prevButton = element.querySelector('button.control-prev') as HTMLElement | null
  const nextButton = element.querySelector('button.control-next') as HTMLElement | null
  if (!container || !prevButton || !nextButton) return function cleanup() {}

  const width = typeof element.getBoundingClientRect === 'function' ? element.getBoundingClientRect().width : undefined
  let currentDevice = getDevice(width)
  const styling = getOneTickProductOfferStyling(windowRef, 'slider')
  const getItemsPerSlide = () => currentDevice === 'mobile' ? styling.ipsm || 1 : styling.ipsd || 4
  let currentIndex = 0
  let enableScroll = true

  prevButton.style.left = currentDevice === 'desktop' ? '-28px' : '-16px'
  nextButton.style.right = currentDevice === 'desktop' ? '-28px' : '-16px'

  const getSlides = () => Array.from(element.querySelectorAll('.onetick-offer-container-item')) as HTMLElement[]
  const IntersectionObserverCtor = (windowRef as any).IntersectionObserver
  const visibleObserver = IntersectionObserverCtor
    ? new IntersectionObserverCtor((entries: IntersectionObserverEntry[]) => {
      entries.forEach(entry => entry.isIntersecting
        ? entry.target.classList.add('is-visible')
        : entry.target.classList.remove('is-visible'))
    }, { root: container, threshold: 0.01 })
    : null
  const updateNavigationButtonsState = () => {
    prevButton.style.display = container.scrollLeft > 0 ? 'flex' : 'none'
    nextButton.style.display = container.scrollLeft >= container.scrollWidth - container.clientWidth - 1 ? 'none' : 'flex'
  }
  const getCurrentIndex = () => {
    const visibleIndex = getSlides().findIndex(slide => slide.classList.contains('is-visible'))
    currentIndex = visibleIndex >= 0 ? visibleIndex : currentIndex
    return currentIndex
  }
  const goToSlide = async (index: number) => {
    const currentSlide = getSlides()[index]
    const top = minmax(currentSlide?.offsetTop || 0, 0, container.scrollHeight)
    const left = minmax(currentSlide?.offsetLeft || 0, 0, container.scrollWidth)
    updateNavigationButtonsState()
    return smoothScroll(windowRef, container, top, left)
  }
  const handleNext = async () => {
    if (!enableScroll) return
    enableScroll = false
    const itemsPerSlide = getItemsPerSlide()
    const limitIndexMax = getSlides().length - itemsPerSlide
    currentIndex = Math.min(getCurrentIndex() + itemsPerSlide, limitIndexMax)
    await goToSlide(currentIndex)
    enableScroll = true
  }
  const handlePrev = async () => {
    if (!enableScroll) return
    enableScroll = false
    currentIndex = Math.max(getCurrentIndex() - getItemsPerSlide(), 0)
    await goToSlide(currentIndex)
    enableScroll = true
  }

  const onResize = () => {
    const nextDevice = getDevice(typeof element.getBoundingClientRect === 'function' ? element.getBoundingClientRect().width : undefined)
    if (nextDevice === currentDevice) return
    currentDevice = nextDevice
    element.style.setProperty('--po-is', `${currentDevice === 'mobile' ? styling.ism || 10 : styling.isd || 10}px`)
    element.style.setProperty('--po-ips', `${currentDevice === 'mobile' ? styling.ipsm || 1 : styling.ipsd || 4}`)
    element.style.setProperty('--po-cn', `${currentDevice === 'mobile' ? styling.cnm || 1 : styling.cnd || 3}`)
    getSlides().forEach(slide => slide.style.setProperty('width', `calc(100% / ${getItemsPerSlide()})`))
  }

  getSlides().forEach((slide, index) => slide.style.setProperty('scrollSnapStop', index % getItemsPerSlide() === 0 ? 'always' : ''))
  visibleObserver && getSlides().forEach(slide => visibleObserver.observe(slide))
  container.addEventListener('scroll', updateNavigationButtonsState)
  if (typeof windowRef.addEventListener === 'function') windowRef.addEventListener('resize', onResize)
  nextButton.addEventListener('click', handleNext, { passive: true })
  prevButton.addEventListener('click', handlePrev, { passive: true })
  updateNavigationButtonsState()

  const cleanup = () => {
    container.removeEventListener('scroll', updateNavigationButtonsState)
    if (typeof windowRef.removeEventListener === 'function') windowRef.removeEventListener('resize', onResize)
    nextButton.removeEventListener('click', handleNext, { passive: true })
    prevButton.removeEventListener('click', handlePrev, { passive: true })
    visibleObserver?.disconnect()
  }
  ;(element as any)[cleanupKey] = cleanup
  return cleanup
}
