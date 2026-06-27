// App-local color picker ported for OneTick styling to avoid TailorKit UI imports.
import type { CSSProperties } from 'react'

interface InputColorPickerProps {
  value: string
  visible: boolean
  setVisible(value: boolean): void
  customBorderRadius?: string
}

const checkerUrl = 'https://apps.pagefly.io/assets/pagefly/static/checker.446aab4f.gif'

export const InputColorPicker: React.FC<InputColorPickerProps> = ({
  value,
  visible,
  setVisible,
  customBorderRadius,
}) => (
  <div
    style={{
      backgroundImage: `url(${checkerUrl})`,
      borderRadius: customBorderRadius || '50%',
      width: '16px',
      height: '16px',
      boxShadow: 'inset 0 0 0 1px rgba(162, 162, 162, 0.2)',
      marginRight: '6px',
      cursor: 'pointer',
    }}
    onClick={() => setVisible(!visible)}
  >
    <PrefixSwatch style={{ borderRadius: customBorderRadius || '50%' }} backgroundColor={value || 'rgba(0,0,0,0)'} />
  </div>
)

function PrefixSwatch(props: { style: CSSProperties; backgroundColor: string }) {
  return <div style={{ width: '100%', height: '100%', backgroundColor: props.backgroundColor, ...props.style }} />
}
