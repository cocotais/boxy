import * as Blockly from 'blockly'

import {
  parameterButton,
  removeDynamicInput,
  restoreDynamicInputs,
  saveDynamicInputs
} from './mutations.js'
import { numberShadow, setDefault } from './parameters.js'

Blockly.Blocks.boxy_return = {
  init() {
    this.appendDummyInput('TITLE').appendField('返回')
    this.appendDummyInput('BUTTONS')
    this.setPreviousStatement(true)
    this.setInputsInline(true)
    this.setStyle('function')
    this.setTooltip('结束当前函数，可选择返回一个值。')
    this.updateShape_(true)
  },
  saveExtraState() {
    return saveDynamicInputs(this, { hasValue: !!this.getInput('VALUE') })
  },
  loadExtraState(state) {
    this.updateShape_(state.hasValue)
    restoreDynamicInputs(this, state)
  },
  updateShape_(hasValue) {
    if (hasValue && !this.getInput('VALUE')) {
      this.appendValueInput('VALUE')
      this.moveInputBefore('VALUE', 'BUTTONS')
      setDefault(this, 'VALUE', numberShadow())
    } else if (!hasValue && this.getInput('VALUE')) {
      removeDynamicInput(this, 'VALUE')
    }
    const buttons = this.getInput('BUTTONS')
    buttons.removeField('TOGGLE', true)
    buttons.appendField(
      parameterButton(hasValue ? '−' : '+', hasValue ? '移除返回值' : '添加返回值', (block) =>
        block.updateShape_(!block.getInput('VALUE'))
      ),
      'TOGGLE'
    )
  },
  onchange(event) {
    if (
      this.isDeadOrDying() ||
      this.isInFlyout ||
      this.isInsertionMarker() ||
      this.workspace.isDragging?.()
    )
      return
    if (
      ![
        Blockly.Events.BLOCK_CREATE,
        Blockly.Events.BLOCK_MOVE,
        Blockly.Events.BLOCK_DELETE,
        Blockly.Events.FINISHED_LOADING
      ].includes(event.type)
    )
      return
    let inside = false
    for (let parent = this.getSurroundParent(); parent; parent = parent.getSurroundParent()) {
      if (typeof parent.getProcedureDef === 'function') {
        inside = true
        break
      }
    }
    if (inside === this.boxyInsideFunction_) return
    this.boxyInsideFunction_ = inside
    this.setWarningText(inside ? null : '返回积木只能在函数内部使用。', 'return-scope')
    const recordUndo = Blockly.Events.getRecordUndo()
    Blockly.Events.setRecordUndo(false)
    try {
      this.setDisabledReason(!inside, 'OUTSIDE_PROCEDURE')
    } finally {
      Blockly.Events.setRecordUndo(recordUndo)
    }
  }
}
