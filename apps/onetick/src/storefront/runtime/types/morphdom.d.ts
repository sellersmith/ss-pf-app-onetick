declare module 'morphdom' {
  interface MorphdomOptions {
    onBeforeNodeAdded?: (node: Node) => Node | null
    onNodeAdded?: (node: Node) => void
    onBeforeElUpdated?: (fromEl: Node, toEl: Node) => boolean | void
    onElUpdated?: (el: Node) => void
    onBeforeNodeDiscarded?: (node: Node) => boolean | void
    onNodeDiscarded?: (node: Node) => void
    onBeforeElChildrenUpdated?: (fromEl: Node, toEl: Node) => boolean | void
  }

  function morphdom(fromNode: Node, toNode: Node | string, options?: MorphdomOptions): void
  export default morphdom
}
