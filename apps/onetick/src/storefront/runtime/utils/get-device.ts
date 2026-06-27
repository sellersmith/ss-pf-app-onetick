export enum EDevices {
  DESKTOP = 'desktop',
  MOBILE = 'mobile',
}

const DEVICES_MAP: { [key in EDevices]: { from: number; to: number } } = {
  [EDevices.DESKTOP]: { from: 768, to: 1000000000000 },
  [EDevices.MOBILE]: { from: 0, to: 767 },
}

export const getDevice = (width?: number): EDevices => {
  const innerWidth = typeof width === 'number' ? width : window.innerWidth

  return (Object.keys(DEVICES_MAP).find(device => {
    const { from, to } = DEVICES_MAP[device as EDevices]
    return innerWidth >= from && innerWidth <= to
  }) || EDevices.MOBILE) as EDevices
}
