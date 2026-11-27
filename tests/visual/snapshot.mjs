// Serializable, read-only browser projection used by the Chrome regression run.
export function snapshotTheme() {
  const clean = (value) =>
    String(value ?? '')
      .replace(/boxy(HoverFilter|InputHighlight)[0-9.]+/g, 'boxy$1')
      .replace(/blocklyDisabledPattern[0-9.]+/g, 'blocklyDisabledPattern')
      .replace(/\s+/g, ' ')
      .trim()
  const canvas = document.querySelector('.blocklySvg').getBoundingClientRect()
  const bounds = (element, parent) => {
    const rect = element.getBoundingClientRect()
    return [rect.x - parent.x, rect.y - parent.y, rect.width, rect.height].map(
      (value) => Math.round(value * 10000) / 10000
    )
  }
  const attrs = [
    'd',
    'fill',
    'stroke',
    'fill-opacity',
    'stroke-width',
    'transform',
    'width',
    'height',
    'rx',
    'ry',
    'x',
    'y'
  ]
  const styles = [
    'fill',
    'fillOpacity',
    'stroke',
    'strokeOpacity',
    'strokeWidth',
    'font',
    'fontFeatureSettings',
    'cursor',
    'pointerEvents',
    'filter',
    'opacity',
    'display'
  ]
  const summarize = (root) =>
    Array.from(root?.querySelectorAll('.blocklyBlockCanvas>g.blocklyBlock') ?? []).map((block) => {
      const rect = block.getBoundingClientRect()
      return {
        type: block.classList[0],
        bounds: bounds(block, canvas),
        nodes: Array.from(
          block.querySelectorAll(
            'path,rect,text,image,g.blocklyField,g.blocklyLabelField,g.blocklyImageField'
          )
        ).map((element) => {
          const style = getComputedStyle(element)
          return {
            tag: element.tagName,
            cls: Array.from(element.classList)
              .filter(
                (name) =>
                  !['blocklyActiveFocus', 'blocklyPassiveFocus', 'blocklySelected'].includes(name)
              )
              .join(' '),
            text: element.tagName === 'text' ? element.textContent : undefined,
            bounds: bounds(element, rect),
            attrs: Object.fromEntries(
              attrs
                .filter((name) => element.hasAttribute(name))
                .map((name) => [name, clean(element.getAttribute(name))])
            ),
            style: Object.fromEntries(styles.map((name) => [name, clean(style[name])]))
          }
        })
      }
    })
  const flyout = document.querySelector('svg.blocklyFlyout:not(.boxyFlyoutClosing)')
  return {
    blocks: summarize(document.querySelector('.blocklySvg')),
    flyout: flyout && getComputedStyle(flyout).display !== 'none' ? summarize(flyout) : [],
    widgets: Array.from(document.querySelectorAll('.blocklyWidgetDiv,.blocklyDropDownDiv'))
      .filter(
        (element) =>
          getComputedStyle(element).display !== 'none' && element.getBoundingClientRect().width
      )
      .map((element) => ({
        cls: element.className,
        bounds: bounds(element, canvas),
        shadow: getComputedStyle(element).boxShadow,
        text: element.textContent
      }))
  }
}
