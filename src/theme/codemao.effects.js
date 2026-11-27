import * as Blockly from 'blockly'

export function installEffects(svg, identifier, container) {
  const defs = Blockly.utils.dom.createSvgElement(Blockly.utils.Svg.DEFS, {}, svg)
  const filter = Blockly.utils.dom.createSvgElement(
    Blockly.utils.Svg.FILTER,
    {
      id: `boxyHoverFilter${identifier}`,
      height: '180%',
      width: '160%',
      y: '-40%',
      x: '-30%'
    },
    defs
  )
  // Measured from KittenN: a white outer edge and a soft downward shadow.
  filter.innerHTML = `
      <feGaussianBlur stdDeviation="1" />
      <feComponentTransfer result="outBlur">
        <feFuncA type="table" tableValues="0 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1" />
      </feComponentTransfer>
      <feFlood flood-color="#FFFFFF" flood-opacity="1" result="outColor" />
      <feComposite in="outColor" in2="outBlur" operator="in" result="outGlow" />
      <feGaussianBlur in="SourceAlpha" stdDeviation="6" />
      <feOffset dx="0" dy="2" />
      <feComponentTransfer result="outShadow">
        <feFuncA type="linear" slope="0.4" />
      </feComponentTransfer>
      <feMerge>
        <feMergeNode in="outShadow" />
        <feMergeNode in="outGlow" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>`
  // Renderer CSS is shared. Keep the filter reference on each workspace so
  // temporary workspaces used for image export cannot replace its filter.
  container.style.setProperty('--boxy-hover-filter', `url("#${filter.id}")`)
  const inputHighlight = Blockly.utils.dom.createSvgElement(
    Blockly.utils.Svg.FILTER,
    { id: `boxyInputHighlight${identifier}`, y: '-20%', height: '140%' },
    defs
  )
  inputHighlight.innerHTML = `
      <feMorphology operator="dilate" radius="2" in="SourceAlpha" result="expanded" />
      <feFlood flood-color="#fff" result="border-colour" />
      <feComposite operator="in" in="border-colour" in2="expanded" result="border" />
      <feMerge><feMergeNode in="border" /><feMergeNode in="SourceGraphic" /></feMerge>`
  container.style.setProperty('--boxy-input-highlight-filter', `url("#${inputHighlight.id}")`)
}

export function themeCSS(selector) {
  const editableHover = `${selector} .blocklyDraggable:not(.blocklyDisabled)
      .blocklyEditableField:not(.blocklyEditing):hover`
  // Rounded/hexagonal input edges can hit the parent body instead of the
  // input path. Keep the entire block consistent, including flyout previews.
  const pointerSurface = `${selector} .blocklyDraggable:not(.blocklyDragging):not(.blocklyDisabled):not(.blocklyDragging *):not(.blocklyDisabled *)`
  return [
    `${pointerSurface},
       ${pointerSurface} :not(.blocklyDragging):not(.blocklyDisabled):not(.blocklyDragging *):not(.blocklyDisabled *) {
        cursor: pointer;
      }`,
    `${selector} .blocklyHighlightedConnectionPath { pointer-events: none; }`,
    `${selector} .blocklyInsertionMarker { opacity: 1; pointer-events: none; }`,
    `${selector} .blocklyInsertionMarker > :not(.blocklyPath) { display: none !important; }`,
    `${selector} .blocklyInsertionMarker > .blocklyPath {
        display: block;
        fill: rgb(0 0 0 / 20%);
        fill-opacity: 1;
        stroke: rgb(0 0 0 / 28%);
        stroke-width: 1px;
      }`,
    `${selector} .blocklyEditableField .blocklyText,
       ${selector} .blocklyNonEditableField .blocklyText { fill: #fff; }`,
    `${selector} .blocklyText {
        font-feature-settings: "tnum";
        -webkit-font-smoothing: auto;
      }`,
    `${selector} .blocklyOutlinePath { stroke: #0000001a; stroke-width: 1px; }`,
    `${selector} .blocklyHtmlInput { color: #344265; background: #fff; }`,
    `${editableHover} > rect,
       ${editableHover} > .blocklyPath { stroke: #0000001a; stroke-width: 1px; }`,
    `${selector} .blocklyDragging:not(.blocklyShadow):not(.blocklyDragging .blocklyDragging) {
        filter: var(--boxy-hover-filter);
      }`,
    `@media (hover: hover) {
        ${selector} .blocklyDraggable:not(.blocklyShadow):not(.blocklyDisabled):not(.blocklyDragging):hover:not(:has(.blocklyDraggable:not(.blocklyShadow):hover)) {
          filter: var(--boxy-hover-filter);
        }
      }`
  ]
}
