const statementHeight = 40
const rowInset = 4

export const METRICS = {
  field: 30,
  previewField: 28,
  reporter: 36,
  button: 20,
  previewPadding: 6,
  statementMin: 110,
  previewControlMin: 80,
  literalMin: 40,
  dropdownMin: 50,
  dropdownPadding: 30,
  statementHeight,
  rowInset,
  rowHeight: statementHeight - rowInset * 2,
  statementRadius: statementHeight / 2,
  corner: 2,
  terminalCorner: 12,
  statementPadding: 16,
  actionRowHeight: 26,
  actionLabelGap: 26,
  actionPadding: 52
}

export const START_HAT = {
  radius: 24,
  rise: 8,
  centerY: 16,
  labelPadding: 27,
  innerRadius: 19,
  iconSize: 32
}

export function iconDataUrl(icon, colour) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${icon.viewBox}" fill="${icon.fill}" color="${colour}">${icon.content}</svg>`
  return `data:image/svg+xml,${encodeURIComponent(svg)}`
}

// Optical content space inside an empty rounded-hexagonal socket.
export const EMPTY_BOOLEAN_CONTENT = { workspace: 19.459999084472656, preview: 14.5359001159668 }

// The flyout is a compact presentation of the same shapes. All context
// differences are defined here; the renderer only consumes resolved geometry.
const workspaceMetrics = {
  actionPadding: METRICS.actionPadding,
  reporterHeight: METRICS.reporter,
  reporterMin: METRICS.literalMin,
  fieldHeight: METRICS.field,
  literalMin: METRICS.literalMin,
  literalPadding: METRICS.field / 2,
  inputMin: 10,
  controlMin: METRICS.statementMin,
  endPadding: METRICS.statementPadding,
  cavityHeight: 20,
  cavityRadius: METRICS.corner,
  bottomRowHeight: 16,
  armWidth: 70,
  actionArmWidth: 72,
  booleanContent: EMPTY_BOOLEAN_CONTENT.workspace
}
const previewMetrics = {
  ...workspaceMetrics,
  reporterHeight: 34,
  reporterMin: 0,
  fieldHeight: METRICS.previewField,
  literalMin: METRICS.previewField,
  literalPadding: METRICS.previewPadding,
  inputMin: 16,
  controlMin: METRICS.previewControlMin,
  endPadding: 20,
  cavityHeight: 8,
  cavityRadius: 0,
  bottomRowHeight: 8,
  armWidth: 40,
  actionArmWidth: 47,
  actionPadding: 32,
  booleanContent: EMPTY_BOOLEAN_CONTENT.preview
}

export const isCompactPreview = (block) =>
  !!block.workspace.isFlyout && block.workspace.targetWorkspace?.boxyCompactFlyout !== false

export const contextMetrics = (block) =>
  block.workspace.isFlyout ? previewMetrics : workspaceMetrics

export const previewFieldWidth = (textWidth, minimum = METRICS.previewField) =>
  Math.max(minimum, textWidth + METRICS.previewPadding * 2)

export const loopVariableStyle = {
  colourPrimary: '#39a4ff',
  colourSecondary: '#39a4ff',
  colourTertiary: '#2880cb'
}

// Measured from Kitten4's function parameter capsule.
export const procedureParameterStyle = {
  colourPrimary: '#ff7e2e',
  colourSecondary: '#ff7e2e',
  colourTertiary: '#e67129'
}

export const scriptVariableStyle = {
  colourPrimary: '#fdab3d',
  colourSecondary: '#eb930d',
  colourTertiary: '#c99342'
}

const arrowPath =
  'M2.49351315,4H9.50652922C9.77906561,4 10,4.24184373 10,4.54017309C10,4.65100154 9.96885725,4.75914782 9.91079624,4.84994202L6.4042882,9.76954945C6.24799884,10.0139504 5.94030478,10.0733882 5.71703428,9.90230757C5.66983808,9.86614356 5.62879151,9.82121232 5.59575417,9.76954945L2.08924613,4.84994202C1.93295678,4.60554109 1.98725573,4.26872671 2.21052624,4.09764605C2.29347055,4.03409011 2.39226671,4 2.49351315,4Z'
const arrows = new Map()

export function arrowForColour(colour) {
  if (!arrows.has(colour)) {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14"><path fill="${colour}" d="${arrowPath}"/></svg>`
    arrows.set(colour, `data:image/svg+xml,${encodeURIComponent(svg)}`)
  }
  return arrows.get(colour)
}

export const dropdownArrow = arrowForColour('#ffffff')

let measuringContext

export function measureFieldText(field) {
  const constants = field.getConstants()
  const measured = field.getTextElement().getComputedTextLength()
  if (measured) return measured
  measuringContext ??= document.createElement('canvas').getContext('2d')
  measuringContext.font = `${constants.FIELD_TEXT_FONTWEIGHT} ${constants.FIELD_TEXT_FONTSIZE}pt ${constants.FIELD_TEXT_FONTFAMILY}`
  return measuringContext.measureText(field.getTextElement().textContent).width
}

export const reporterWidth = (textWidth, metrics = workspaceMetrics) =>
  Math.max(metrics.reporterMin, metrics.reporterHeight + textWidth)

export function capsulePath(width, height) {
  const radius = height / 2
  return `M ${radius},0 H ${width - radius} A ${radius},${radius} 0 0 1 ${width - radius},${height} H ${radius} A ${radius},${radius} 0 0 1 ${radius},0 Z`
}

export function startHatPath(width, height) {
  // The body starts at (0, 0). Its badge protrudes 24px left and 8px up;
  // the following statement connects at (0, height), not at the badge edge.
  const end = Math.min(METRICS.statementRadius, height / 2)
  const { radius, rise } = START_HAT
  return `M 0,${height} V ${2 * radius - rise} a ${radius},${radius} 0 0 1 0,${-2 * radius}
    a ${radius},${radius} 0 0 1 18,${rise} H ${width - end}
    a ${end},${end} 0 0 1 ${end},${end} V ${height - end}
    a ${end},${end} 0 0 1 ${-end},${end} Z`
}

export const rendererConstants = {
  NOTCH_WIDTH: 0,
  NOTCH_HEIGHT: 0,
  NOTCH_OFFSET_LEFT: 0,
  STATEMENT_INPUT_NOTCH_OFFSET: 0,
  STATEMENT_BOTTOM_SPACER: 0,
  CORNER_RADIUS: METRICS.corner,

  // Blockly measures font sizes in points: 12pt is KittenN's 16px.
  FIELD_TEXT_FONTSIZE: 12,
  FIELD_TEXT_FONTWEIGHT: '400',
  FIELD_TEXT_FONTFAMILY:
    '-apple-system, system-ui, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif',
  FIELD_BORDER_RECT_RADIUS: 4,
  FIELD_BORDER_RECT_X_PADDING: 6,
  FIELD_TEXTINPUT_BOX_SHADOW: false,
  FIELD_DROPDOWN_NO_BORDER_RECT_SHADOW: true,
  FIELD_DROPDOWN_COLOURED_DIV: false,
  FIELD_DROPDOWN_SVG_ARROW_SIZE: 14,
  FIELD_DROPDOWN_SVG_ARROW_DATAURI: dropdownArrow,
  FIELD_BORDER_RECT_COLOUR: '#ffffff1a',

  TOP_ROW_MIN_HEIGHT: METRICS.rowInset,
  TOP_ROW_PRECEDES_STATEMENT_MIN_HEIGHT: METRICS.rowInset,
  BOTTOM_ROW_MIN_HEIGHT: METRICS.rowInset,
  BOTTOM_ROW_AFTER_STATEMENT_MIN_HEIGHT: workspaceMetrics.bottomRowHeight,
  MIN_BLOCK_HEIGHT: METRICS.reporter,
  MIN_BLOCK_WIDTH: 0,
  DUMMY_INPUT_MIN_HEIGHT: METRICS.rowHeight,
  DUMMY_INPUT_SHADOW_MIN_HEIGHT: METRICS.field,
  EMPTY_INLINE_INPUT_HEIGHT: METRICS.field,
  EMPTY_INLINE_INPUT_PADDING: 8,
  EMPTY_STATEMENT_INPUT_HEIGHT: workspaceMetrics.cavityHeight,
  STATEMENT_INPUT_PADDING_LEFT: METRICS.statementPadding,
  STATEMENT_INPUT_SPACER_MIN_WIDTH: 56,
  MEDIUM_PADDING: 8,
  SELECTED_GLOW_COLOUR: '#ffffff',
  SELECTED_GLOW_SIZE: 1
}
