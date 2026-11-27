import * as Blockly from 'blockly'

import { METRICS } from '../theme/codemao.style.js'

// Blockly excludes shadow deletion from undo. Dynamic input mutations must
// retain those values along with the shape; connected real blocks use native
// move events and are released instead of deleted.
export function saveDynamicInputs(block, shape) {
  const inputShadows = {}
  for (const input of block.inputList) {
    if (input.type !== Blockly.inputs.inputTypes.VALUE) continue
    const shadow = input.connection.getShadowState(true)
    if (shadow) inputShadows[input.name] = shadow
  }
  return { ...shape, inputShadows }
}

export function restoreDynamicInputs(block, state) {
  for (const [name, shadow] of Object.entries(state.inputShadows ?? {})) {
    block.getInput(name)?.connection?.setShadowState(shadow)
  }
}

export function removeDynamicInput(block, name) {
  const child = block.getInputTargetBlock(name)
  if (child && !child.isShadow()) child.unplug()
  block.removeInput(name, true)
}

export function changeMutation(block, change) {
  const group = Blockly.Events.getGroup()
  Blockly.Events.setGroup(group || true)
  try {
    const beforeState = block.saveExtraState?.()
    const before = beforeState ? JSON.stringify(beforeState) : ''
    change()
    const afterState = block.saveExtraState?.()
    const after = afterState ? JSON.stringify(afterState) : ''
    if (before !== after) {
      Blockly.Events.fire(new Blockly.Events.BlockChange(block, 'mutation', null, before, after))
    }
  } finally {
    Blockly.Events.setGroup(group)
  }
}

export function parameterButton(sign, label, change) {
  const vertical = sign === '+' ? '<path d="M10 6.67v6.66"/>' : ''
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20"><rect x=".5" y=".5" width="19" height="19" rx="9.5" fill="white" fill-opacity=".15" stroke="black" stroke-opacity=".15"/><g fill="none" stroke="white" stroke-width="2" stroke-linecap="round"><path d="M6.67 10h6.66"/>${vertical}</g></svg>`
  const field = new Blockly.FieldImage(
    `data:image/svg+xml,${encodeURIComponent(svg)}`,
    METRICS.button,
    METRICS.button,
    label,
    (button) => {
      const block = button.getSourceBlock()
      if (block.workspace.isFlyout) return
      changeMutation(block, () => change(block))
    }
  )
  field.boxyParameterButton = true
  field.boxyParameterAction = sign === '+' ? 'add' : 'remove'
  return field
}
