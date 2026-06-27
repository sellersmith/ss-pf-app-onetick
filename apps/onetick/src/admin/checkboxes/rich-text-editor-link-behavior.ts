// OneTick admin UI is copy-first TailorKit parity adapted to PageFly AdminAppHost and app API ports.
import ReactQuill from 'react-quill-new'
import QuillCore from 'quill'
import { Attributor, Scope } from 'parchment'

let linkPatched = false

export function getBaseQuill(): any {
  return (ReactQuill as any)?.Quill || (QuillCore as any)
}

export function ensureCustomLinkBlot() {
  if (linkPatched || typeof window === 'undefined') return
  const BaseQuill = getBaseQuill()
  const QuillLink: any = BaseQuill?.import?.('formats/link')
  if (!QuillLink) return

  class TargetAttributor extends Attributor {
    add(node: HTMLElement, value: string) {
      if (!value) {
        node.removeAttribute('target')
        node.removeAttribute('rel')
        return true
      }
      if (value === '_blank') {
        node.setAttribute('target', '_blank')
        node.setAttribute('rel', 'noopener noreferrer')
        return true
      }
      node.setAttribute('target', '_self')
      node.removeAttribute('rel')
      return true
    }
    value(node: HTMLElement) {
      return node.getAttribute('target') === '_blank' ? '_blank' : '_self'
    }
  }

  class CustomLink extends QuillLink {
    static create(value: string) {
      const node = super.create(value) as HTMLElement
      node.removeAttribute('target')
      node.removeAttribute('rel')
      return node
    }
  }

  BaseQuill.register('formats/link', CustomLink as any, true)
  BaseQuill.register('formats/target', new TargetAttributor('target', 'target', { scope: Scope.INLINE }) as any, true)
  linkPatched = true
}
