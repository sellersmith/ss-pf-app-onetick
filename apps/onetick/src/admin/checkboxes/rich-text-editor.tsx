// OneTick admin UI is copy-first TailorKit parity adapted to PageFly AdminAppHost and app API ports.
import { Box, Icon, InlineGrid, Text } from '@shopify/polaris'
import { AlertCircleIcon } from '@shopify/polaris-icons'
import React, { useMemo, useRef } from 'react'
import Quill from 'react-quill-new'
import 'react-quill-new/dist/quill.snow.css'
import { EDITOR_TOOLBAR_FORMATS, EDITOR_TOOLBAR_MODULES, RichTextEditorToolbar } from './rich-text-editor-toolbar'
import type { RichTextEditorProps } from './rich-text-editor-types'
import './rich-text-editor.css'

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  defaultValue,
  formats,
  id,
  modules,
  onBlur,
  onChange,
  onChangeSelection,
  onFocus,
  onKeyDown,
  onKeyPress,
  onKeyUp,
  placeholder,
  preserveWhitespace,
  value,
  label,
  labelHidden = false,
  disabled,
  error,
  toolbarConfig,
  plainTextPaste = false,
}) => {
  const quillRef = useRef<Quill>(null)
  const toolbarId = toolbarConfig?.toolbarId || 'toolbar'
  const resolvedFormats = toolbarConfig?.formats || formats || EDITOR_TOOLBAR_FORMATS
  const normalizedFormats = useMemo(() => {
    const set = new Set(resolvedFormats)
    if (set.has('link')) set.add('target')
    return Array.from(set)
  }, [resolvedFormats])
  const mergedModules = useMemo(() => {
    const baseModules = {
      ...EDITOR_TOOLBAR_MODULES,
      toolbar: { ...EDITOR_TOOLBAR_MODULES.toolbar, container: `#${toolbarId}` },
    }
    const customModules = toolbarConfig?.modules || modules
    if (!customModules) return baseModules
    return {
      ...baseModules,
      ...customModules,
      toolbar: {
        ...baseModules.toolbar,
        ...(customModules.toolbar || {}),
        container: customModules.toolbar?.container || `#${toolbarId}`,
      },
    }
  }, [modules, toolbarConfig?.modules, toolbarId])
  const className = `${disabled ? 'onetick-quill--disabled' : ''}${error ? ' onetick-quill--error' : ''}`.trim()

  return (
    <Box>
      {!labelHidden ? (
        <Box paddingBlockEnd="100">
          <Text as="p" tone={disabled ? 'disabled' : 'base'}>
            {label}
          </Text>
        </Box>
      ) : null}
      <div className="onetick-quill">
        <RichTextEditorToolbar
          quillRef={quillRef}
          onChange={onChange}
          formats={normalizedFormats}
          toolbarId={toolbarId}
          plainTextPaste={plainTextPaste}
          extensions={toolbarConfig?.extensions}
          showDivider={toolbarConfig?.showDivider}
        />
        <Quill
          ref={quillRef}
          className={className}
          defaultValue={defaultValue}
          formats={normalizedFormats}
          id={id}
          modules={mergedModules}
          onBlur={onBlur}
          onChange={onChange}
          onChangeSelection={onChangeSelection}
          onFocus={onFocus}
          onKeyDown={onKeyDown}
          onKeyPress={onKeyPress}
          onKeyUp={onKeyUp}
          placeholder={placeholder}
          preserveWhitespace={preserveWhitespace}
          readOnly={disabled}
          theme="snow"
          value={value}
        />
        {error ? (
          <InlineGrid alignItems="start" gap="150" columns="20px auto">
            <Icon source={AlertCircleIcon} tone="textCritical" />
            <Text as="p" tone="critical">{error}</Text>
          </InlineGrid>
        ) : null}
      </div>
    </Box>
  )
}
