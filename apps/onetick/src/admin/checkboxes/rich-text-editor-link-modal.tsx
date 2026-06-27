// OneTick admin UI is copy-first TailorKit parity adapted to PageFly AdminAppHost and app API ports.
import { Button, InlineGrid, Modal, Select, TextField } from '@shopify/polaris'
import React, { useEffect, useMemo, useState } from 'react'

interface LinkModalState {
  open: boolean
  url: string
  target: '_self' | '_blank'
}

interface RichTextEditorLinkModalProps {
  state: LinkModalState
  onClose(): void
  onSave(payload: { url: string; target: '_self' | '_blank' }): void
  onRemove(): void
}

export const RichTextEditorLinkModal: React.FC<RichTextEditorLinkModalProps> = ({
  state,
  onClose,
  onSave,
  onRemove,
}) => {
  const [url, setUrl] = useState(state.url || '')
  const [target, setTarget] = useState<'_self' | '_blank'>(state.target || '_self')

  useEffect(() => {
    setUrl(state.url || '')
    setTarget(state.target || '_self')
  }, [state.open, state.target, state.url])

  const targetOptions = useMemo(
    () => [
      { label: 'Same tab', value: '_self' },
      { label: 'New tab', value: '_blank' },
    ],
    [],
  )

  return (
    <Modal
      open={state.open}
      onClose={onClose}
      title={state.url ? 'Edit link' : 'Insert link'}
      primaryAction={{ content: 'Insert link', disabled: !url.trim(), onAction: () => onSave({ url, target }) }}
      secondaryActions={[{ content: 'Cancel', onAction: onClose }]}
      footer={state.url ? <Button onClick={onRemove}>Remove link</Button> : undefined}
    >
      <Modal.Section>
        <InlineGrid gap="400" columns={2}>
          <TextField
            label="Link to"
            value={url}
            onChange={setUrl}
            autoComplete="off"
            placeholder="https://"
            helpText="https:// is required for external links"
          />
          <Select
            label="Open this link in"
            options={targetOptions}
            value={target}
            onChange={value => setTarget(value as '_self' | '_blank')}
          />
        </InlineGrid>
      </Modal.Section>
    </Modal>
  )
}
