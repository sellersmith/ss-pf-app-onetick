// OneTick admin UI is copy-first TailorKit parity adapted to PageFly AdminAppHost and app API ports.
import React, { useCallback, useEffect, useRef, useState } from 'react'
import ReactQuill from 'react-quill-new'
import { ensureCustomLinkBlot, getBaseQuill } from './rich-text-editor-link-behavior'
import { RichTextEditorLinkModal } from './rich-text-editor-link-modal'
import type { RichTextEditorToolbarExtension } from './rich-text-editor-types'

export const EDITOR_TOOLBAR_MODULES = {
  toolbar: { container: '#toolbar', handlers: { link: () => {} } },
  history: { delay: 500, maxStack: 100, userOnly: true },
}

export const EDITOR_TOOLBAR_FORMATS = [
  'header',
  'bold',
  'italic',
  'underline',
  'align',
  'strike',
  'background',
  'list',
  'bullet',
  'indent',
  'link',
  'target',
  'image',
  'color',
  'video',
]

ensureCustomLinkBlot()

interface RichTextEditorToolbarProps {
  quillRef: React.RefObject<ReactQuill>
  onChange(value: string): void
  formats: string[]
  toolbarId: string
  plainTextPaste?: boolean
  extensions?: RichTextEditorToolbarExtension[]
  showDivider?: boolean
}

export const RichTextEditorToolbar: React.FC<RichTextEditorToolbarProps> = ({
  quillRef,
  onChange,
  formats,
  toolbarId,
  plainTextPaste,
  extensions = [],
  showDivider = true,
}) => {
  const [canLink, setCanLink] = useState(false)
  const lastRangeRef = useRef<{ index: number; length: number } | null>(null)
  const [linkModalState, setLinkModalState] = useState({ open: false, url: '', target: '_self' as '_self' | '_blank' })
  const qlClassName = `ql-formats${showDivider ? ' ql-formats-divider' : ''}`

  const getQuill = useCallback(() => {
    const instance = quillRef.current as any
    return typeof instance?.getEditor === 'function' ? instance.getEditor() : instance || null
  }, [quillRef])

  useEffect(() => {
    const quill = getQuill()
    if (!quill?.on || !quill?.off) return
    const updateSelectionState = () => {
      const range = quill.getSelection()
      if (!range) return setCanLink(false)
      lastRangeRef.current = range
      if (range.length > 0) return setCanLink(true)
      const [leaf] = quill.getLeaf(range.index)
      setCanLink(leaf?.domNode?.parentElement?.tagName === 'A')
    }
    quill.on('selection-change', updateSelectionState)
    quill.on('text-change', updateSelectionState)
    updateSelectionState()
    return () => {
      quill.off('selection-change', updateSelectionState)
      quill.off('text-change', updateSelectionState)
    }
  }, [getQuill])

  useEffect(() => {
    const quill = getQuill()
    if (!plainTextPaste || typeof window === 'undefined' || typeof Node === 'undefined' || !quill?.clipboard) return
    const Delta = getBaseQuill().import?.('delta')
    if (!Delta) return
    quill.clipboard.addMatcher(Node.ELEMENT_NODE, (node: any) => new Delta().insert(node?.textContent || ''))
  }, [getQuill, plainTextPaste])

  const extractLinkContext = (range: { index: number; length: number }) => {
    const quill = getQuill()
    if (!quill) return null
    const [leaf, offset] = quill.getLeaf(range.index)
    const anchor = (leaf as any)?.parent?.domNode as HTMLElement | undefined
    if (!anchor || anchor.tagName !== 'A') return range.length ? { url: '', target: '_self' as const, range } : null
    const length = typeof (leaf as any)?.length === 'function' ? (leaf as any).length() : range.length
    return {
      url: anchor.getAttribute('href') || '',
      target: anchor.getAttribute('target') === '_blank' ? '_blank' as const : '_self' as const,
      range: { index: range.index - (offset || 0), length },
    }
  }

  const openLinkModal = () => {
    const quill = getQuill()
    const selection = quill?.getSelection() || lastRangeRef.current
    const context = selection ? extractLinkContext(selection) : null
    if (context) setLinkModalState({ open: true, url: context.url, target: context.target })
    quill?.theme?.tooltip?.hide?.()
  }

  const applyLink = ({ url, target }: { url: string; target: '_self' | '_blank' }) => {
    const quill = getQuill()
    const range = quill?.getSelection() || lastRangeRef.current
    if (!quill || !range) return
    quill.setSelection(range)
    quill.format('link', url.trim() || false)
    if (url.trim()) quill.format('target', target)
    setLinkModalState(prev => ({ ...prev, open: false }))
  }

  const removeLink = () => applyLink({ url: '', target: '_self' })
  const hasFormat = (format: string) => formats.includes(format)

  return (
    <div id={toolbarId}>
      {['bold', 'italic', 'underline', 'strike'].some(hasFormat) ? (
        <span className={qlClassName}>
          {hasFormat('bold') ? <button className="ql-bold" /> : null}
          {hasFormat('italic') ? <button className="ql-italic" /> : null}
          {hasFormat('underline') ? <button className="ql-underline" /> : null}
          {hasFormat('strike') ? <button className="ql-strike" /> : null}
        </span>
      ) : null}
      {['align', 'color', 'background'].some(hasFormat) ? (
        <span className={qlClassName}>
          {hasFormat('align') ? <select className="ql-align" /> : null}
          {hasFormat('color') ? <select className="ql-color" /> : null}
          {hasFormat('background') ? <select className="ql-background" /> : null}
        </span>
      ) : null}
      {hasFormat('link') ? (
        <span className={qlClassName}>
          <button type="button" className="ql-link ql-link-custom" disabled={!canLink} onClick={openLinkModal} />
        </span>
      ) : null}
      {extensions.map((extension, index) => {
        const quill = getQuill()
        const api = {
          insertText: (value: string) => {
            const range = quill?.getSelection(true)
            const indexToInsert = range ? range.index : 0
            quill?.insertText(indexToInsert, value)
            quill?.setSelection(indexToInsert + value.length, 0)
          },
          getSelectionText: () => {
            const range = quill?.getSelection()
            return range?.length ? quill.getText(range.index, range.length) : ''
          },
          close: () => {},
        }
        return <span className={qlClassName} key={`${extension.type}-${index}`}>{extension.render(api)}</span>
      })}
      <RichTextEditorLinkModal
        state={linkModalState}
        onClose={() => setLinkModalState(prev => ({ ...prev, open: false }))}
        onSave={applyLink}
        onRemove={removeLink}
      />
    </div>
  )
}
