export const renderCheckboxSkeleton = (isCartDrawer: boolean = false) => {
  return Array.from({ length: isCartDrawer ? 1 : 3 }, (_, i) => {
    return `
<div class='wrapper-skeleton-checkbox'>
    <div class="input-skeleton"></div>
    <div class='onetick-skeleton-content'>
        <div class="onetick-line-skeleton"></div>
    </div>
</div>
`
  }).join('')
}
