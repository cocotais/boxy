import * as Blockly from 'blockly'

import { contextMetrics, METRICS, START_HAT } from './codemao.style.js'

const { inputTypes } = Blockly.inputs

// Install the bounds together with the head role, so another event-style
// definition gets the same badge clearance without procedure-specific patches.
export function initStartHat(block, hat) {
  block.boxyHat = hat
  for (const method of ['getBoundingRectangle', 'getBoundingRectangleWithoutChildren']) {
    const measure = block[method]
    if (!measure) continue // Headless block models have no SVG bounds.
    block[method] = function (...args) {
      const bounds = measure.apply(this, args)
      bounds.top -= START_HAT.rise
      if (this.RTL) bounds.right += START_HAT.radius
      else bounds.left -= START_HAT.radius
      return bounds
    }
  }
}

export const visibleInputs = (block) => block.inputList.filter((input) => input.isVisible())
export const visibleFields = (block) =>
  visibleInputs(block).flatMap((input) => input.fieldRow.filter((field) => field.isVisible()))

export const isValueContainer = (block, inputs) =>
  !!block?.outputConnection &&
  (inputs ?? visibleInputs(block)).some((input) => input.type === inputTypes.STATEMENT)

export function isLiteral(block) {
  if (!block?.outputConnection) return false
  const inputs = visibleInputs(block)
  const fields = visibleFields(block)
  return (
    !inputs.some((input) => input.connection) &&
    fields.length === 1 &&
    (fields[0] instanceof Blockly.FieldTextInput || fields[0] instanceof Blockly.FieldNumber)
  )
}

export const isActionInput = (input) =>
  input.type === inputTypes.DUMMY &&
  input.fieldRow.length > 0 &&
  input.fieldRow.every((field) => field.boxyParameterButton)

export function describeBlock(block) {
  const inputs = visibleInputs(block)
  const fields = visibleFields(block)
  const values = inputs.filter((input) => input.type === inputTypes.VALUE)
  const marker = block.isInsertionMarker()
  const lastStatement = inputs.findLastIndex((input) => input.type === inputTypes.STATEMENT)
  const valueContainer = isValueContainer(block, inputs)
  const statementLayout = !block.outputConnection || valueContainer
  const boolean = block.outputConnection?.getCheck()?.includes('Boolean') ?? false
  const hat = !block.previousConnection && !block.outputConnection ? block.boxyHat : null
  const tail = hat
    ? (inputs.find((input) => input.name === hat.body && input.type === inputTypes.STATEMENT) ??
      null)
    : null
  const footer =
    lastStatement < 0 || marker
      ? null
      : (inputs.slice(lastStatement + 1).find(isActionInput) ?? null)
  const singleField =
    values.length === 0 && lastStatement < 0 && fields.length === 1 ? fields[0] : null
  const preview = !!block.workspace.isFlyout
  const shadow = block.isShadow()
  const terminal = !!block.previousConnection && !block.nextConnection && !block.outputConnection
  const metrics = contextMetrics(block)
  return {
    inputs,
    fields,
    hat,
    tail,
    terminal,
    valueContainer,
    statementLayout,
    preview,
    shadow,
    metrics,
    headerInset:
      preview && fields.some((field) => field.boxyAppearance === 'reporter')
        ? (METRICS.statementHeight - metrics.reporterHeight) / 2
        : METRICS.rowInset,
    headerInputs: hat ? (tail ? inputs.slice(0, inputs.indexOf(tail)) : inputs) : [],
    minimumWidth: statementLayout && (!preview || terminal) ? METRICS.statementMin : 0,
    rowHeight: shadow ? metrics.fieldHeight : METRICS.rowHeight,
    reporterInset: shadow ? 0 : METRICS.corner,
    armWidth: footer ? metrics.actionArmWidth : metrics.armWidth,
    footer,
    boolean,
    literal: isLiteral(block),
    singleField,
    emptyBoolean:
      boolean &&
      block.isShadow() &&
      inputs.every((input) => !input.connection) &&
      fields.every((field) => field instanceof Blockly.FieldLabel && !field.getText().trim()),
    shadowDropdown: shadow && singleField instanceof Blockly.FieldDropdown,
    unaryBoolean:
      boolean && values.length === 1 && values[0].connection.getCheck()?.includes('Boolean'),
    predicateSelector:
      boolean && values.length > 0 && fields.at(-1) instanceof Blockly.FieldDropdown
  }
}
