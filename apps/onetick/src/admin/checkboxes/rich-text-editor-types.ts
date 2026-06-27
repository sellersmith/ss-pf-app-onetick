// OneTick admin UI is copy-first TailorKit parity adapted to PageFly AdminAppHost and app API ports.
export interface RichTextEditorToolbarExtensionApi {
  insertText(value: string): void
  getSelectionText(): string
  close(): void
}

export interface RichTextEditorToolbarExtension {
  type: string
  render(api: RichTextEditorToolbarExtensionApi): React.ReactNode
}

export interface RichTextEditorToolbarConfig {
  showDivider?: boolean
  formats?: string[]
  modules?: any
  toolbarId?: string
  extensions?: RichTextEditorToolbarExtension[]
}

export interface RichTextEditorProps {
  defaultValue?: string
  formats?: string[]
  id?: string
  modules?: any
  placeholder?: string
  preserveWhitespace?: boolean
  value?: string
  label?: string
  labelHidden?: boolean
  disabled?: boolean
  error?: string
  onBlur?: (event: any) => void
  onChange(value: string): void
  onChangeSelection?: (event: any) => void
  onFocus?: (event: any) => void
  onKeyDown?: (event: any) => void
  onKeyPress?: (event: any) => void
  onKeyUp?: (event: any) => void
  toolbarConfig?: RichTextEditorToolbarConfig
  plainTextPaste?: boolean
}
