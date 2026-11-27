import * as Blockly from 'blockly'
import { loops } from 'blockly/blocks'

import { installFieldReporterDrag } from '../theme/codemao.dragging.js'
import { loopVariableStyle } from '../theme/codemao.style.js'
import { KittenDropdown, KittenText, KittenVariable, ListVariableField } from './fields.js'
import {
  parameterButton,
  removeDynamicInput,
  restoreDynamicInputs,
  saveDynamicInputs
} from './mutations.js'

loops.loopTypes.add('controls_forever')

export const numberShadow = (value = 0) => ({ type: 'math_number', fields: { NUM: value } })
export const textShadow = (value = 'abc') => ({ type: 'text', fields: { TEXT: value } })
export const booleanShadow = () => ({ type: 'boxy_boolean_input' })
export const listShadow = () => ({ type: 'boxy_list_input' })

export function setDefault(block, name, state) {
  const connection = block.getInput(name)?.connection
  if (connection && !connection.getShadowState(false)) connection.setShadowState(state)
}

Blockly.Blocks.boxy_boolean_input = {
  init() {
    this.appendDummyInput().appendField(new Blockly.FieldLabel('\u00a0'))
    this.setOutput(true, 'Boolean')
    this.setStyle('controller')
  }
}

Blockly.Blocks.text = {
  init() {
    this.appendDummyInput().appendField(new KittenText(''), 'TEXT')
    this.setOutput(true, 'String')
    this.setStyle('calculation')
  }
}

Blockly.Blocks.boxy_list_input = {
  init() {
    this.appendDummyInput().appendField(new ListVariableField(), 'VAR')
    this.setOutput(true, 'Array')
    this.setStyle('list')
  }
}

Blockly.Blocks.boxy_loop_variable = {
  init() {
    const variable = new KittenVariable('i')
    this.appendDummyInput()
      .appendField(variable, 'VAR')
      .appendField(new Blockly.FieldLabel('i'), 'NAME')
    variable.setVisible(false)
    this.setOutput(true, 'Number')
    this.setStyle('loop_variable')
    this.setOnChange(() => {
      if (!this.isDeadOrDying()) this.getField('NAME').setValue(this.getField('VAR').getText())
    })
  }
}

function createLoopVariable(block) {
  const copy = Blockly.serialization.blocks.append(
    { type: 'boxy_loop_variable', fields: { VAR: { id: block.getFieldValue('VAR') } } },
    block.workspace,
    { recordUndo: true }
  )
  copy.getField('NAME').setValue(block.getField('VAR').getText())
  return copy
}

function variadic(type, title, initial, defaultValue) {
  Blockly.Blocks[type] = {
    init() {
      this.itemCount_ = 0
      this.appendDummyInput('TITLE').appendField(title)
      this.appendDummyInput('BUTTONS')
      this.setOutput(true, type === 'text_join' ? 'String' : 'Array')
      this.setInputsInline(true)
      this.setStyle(type === 'text_join' ? 'calculation' : 'list')
      this.updateShape_(initial)
    },
    saveExtraState() {
      return saveDynamicInputs(this, { itemCount: this.itemCount_ })
    },
    loadExtraState(state) {
      this.updateShape_(state.itemCount ?? initial)
      restoreDynamicInputs(this, state)
    },
    updateShape_(count) {
      const buttons = this.getInput('BUTTONS')
      buttons.removeField('MINUS', true)
      buttons.removeField('PLUS', true)
      while (this.itemCount_ > count) removeDynamicInput(this, `ADD${--this.itemCount_}`)
      while (this.itemCount_ < count) {
        const name = `ADD${this.itemCount_++}`
        this.appendValueInput(name)
        this.moveInputBefore(name, 'BUTTONS')
        setDefault(this, name, defaultValue(this.itemCount_ - 1))
      }
      if (count > 0) {
        buttons.appendField(
          parameterButton('−', '减少参数', (block) => block.updateShape_(block.itemCount_ - 1)),
          'MINUS'
        )
      }
      buttons.appendField(
        parameterButton('+', '新增参数', (block) => block.updateShape_(block.itemCount_ + 1)),
        'PLUS'
      )
    }
  }
}

variadic('lists_create_with', '临时列表', 1, () => numberShadow())
variadic('text_join', '连接', 2, (index) => textShadow(index === 0 ? 'ab' : index === 1 ? 'c' : ''))

Blockly.Blocks.controls_whileUntil = {
  init() {
    this.appendValueInput('BOOL')
      .setCheck('Boolean')
      .appendField(
        new KittenDropdown([
          ['循环 直到', 'UNTIL'],
          ['循环 当', 'WHILE']
        ]).setAppearance('inline'),
        'MODE'
      )
    this.appendStatementInput('DO')
    this.setPreviousStatement(true)
    this.setNextStatement(true)
    this.setStyle('controller')
    this.setInputsInline(true)
  }
}

// Keep the public Blockly field and input names for existing files/codegen.
Blockly.Blocks.controls_for = {
  initSvg() {
    Blockly.BlockSvg.prototype.initSvg.call(this)
    installFieldReporterDrag(this, createLoopVariable)
  },
  init() {
    this.appendValueInput('FROM').setCheck('Number').appendField('遍历')
    this.appendValueInput('TO').setCheck('Number').appendField('到')
    this.appendDummyInput('CURRENT')
      .appendField('，当前')
      .appendField(new KittenVariable('i').setAppearance('reporter', loopVariableStyle), 'VAR')
    this.appendValueInput('BY').setCheck('Number').appendField('，间隔')
    this.moveInputBefore('BY', 'CURRENT')
    this.appendDummyInput('STEP_BUTTON')
    this.appendStatementInput('DO')
    this.setPreviousStatement(true)
    this.setNextStatement(true)
    this.setInputsInline(true)
    this.setStyle('controller')
    setDefault(this, 'FROM', numberShadow(1))
    setDefault(this, 'TO', numberShadow(10))
    setDefault(this, 'BY', numberShadow(1))
    this.updateStep_(false)
  },
  saveExtraState() {
    return { showStep: this.showStep_ }
  },
  loadExtraState(state) {
    this.updateStep_(state.showStep ?? true)
  },
  updateStep_(visible) {
    this.showStep_ = visible
    this.getInput('BY').setVisible(visible)
    const input = this.getInput('STEP_BUTTON')
    input.removeField('STEP_TOGGLE', true)
    input.appendField(
      parameterButton(visible ? '−' : '+', visible ? '收起间隔' : '展开间隔', (block) =>
        block.updateStep_(!block.showStep_)
      ),
      'STEP_TOGGLE'
    )
  }
}

Blockly.Blocks.controls_if = {
  init() {
    this.elseIfCount_ = 0
    this.hasElse_ = false
    this.appendValueInput('IF0').setCheck('Boolean').appendField('如果')
    this.appendStatementInput('DO0')
    this.setPreviousStatement(true)
    this.setNextStatement(true)
    this.setStyle('controller')
    this.setInputsInline(true)
    setDefault(this, 'IF0', booleanShadow())
    this.updateButtons_()
  },
  saveExtraState() {
    return saveDynamicInputs(this, { elseIfCount: this.elseIfCount_, hasElse: this.hasElse_ })
  },
  loadExtraState(state) {
    const count = state.elseIfCount ?? state.elseIfCount_ ?? 0
    while (this.elseIfCount_ > count) this.removeBranch_(this.elseIfCount_)
    while (this.elseIfCount_ < count) this.addBranch_()
    if (state.hasElse && !this.hasElse_) this.addElse_()
    else if (!state.hasElse && this.hasElse_) {
      removeDynamicInput(this, 'ELSE')
      this.hasElse_ = false
    }
    this.updateButtons_()
    restoreDynamicInputs(this, state)
  },
  addElse_() {
    this.hasElse_ = true
    this.appendStatementInput('ELSE').appendField('否则')
  },
  addBranch_() {
    const index = ++this.elseIfCount_
    this.appendValueInput(`IF${index}`).setCheck('Boolean').appendField('否则如果')
    this.appendStatementInput(`DO${index}`)
    if (this.hasElse_) {
      this.moveInputBefore(`IF${index}`, 'ELSE')
      this.moveInputBefore(`DO${index}`, 'ELSE')
    }
    setDefault(this, `IF${index}`, booleanShadow())
  },
  removeBranch_(index) {
    removeDynamicInput(this, `IF${index}`)
    removeDynamicInput(this, `DO${index}`)
    // Rename subsequent inputs so codegen and saved states remain contiguous.
    for (let i = index + 1; i <= this.elseIfCount_; i++) {
      this.getInput(`IF${i}`).name = `IF${i - 1}`
      this.getInput(`DO${i}`).name = `DO${i - 1}`
    }
    this.elseIfCount_--
  },
  plus() {
    this.removeInput('BRANCH_BUTTONS', true)
    if (!this.hasElse_) this.addElse_()
    else this.addBranch_()
    this.updateButtons_()
  },
  minus(index) {
    this.removeInput('BRANCH_BUTTONS', true)
    if (index === 'ELSE') {
      removeDynamicInput(this, 'ELSE')
      this.hasElse_ = false
    } else this.removeBranch_(index)
    this.updateButtons_()
  },
  updateButtons_() {
    this.removeInput('BRANCH_BUTTONS', true)
    for (const input of [...this.inputList]) {
      if (input.name.startsWith('BRANCH_REMOVE')) this.removeInput(input.name)
    }
    for (const input of this.inputList) {
      for (const field of [...input.fieldRow]) {
        if (field.boxyParameterButton) input.removeField(field.name)
      }
    }
    for (let i = 1; i <= this.elseIfCount_; i++) {
      this.appendDummyInput(`BRANCH_REMOVE${i}`).appendField(
        parameterButton('−', '移除否则如果', (block) => block.minus(i)),
        `MINUS${i}`
      )
      this.moveInputBefore(`BRANCH_REMOVE${i}`, `DO${i}`)
    }
    if (this.hasElse_ && !this.elseIfCount_) {
      this.getInput('ELSE').appendField(
        parameterButton('−', '移除否则', (block) => block.minus('ELSE')),
        'REMOVE_ELSE'
      )
    }
    // A solitary if has its button in the 26px bottom arm. Otherwise it sits
    // beside the else label, like KittenN, without adding a separate row.
    const input = this.hasElse_ ? this.getInput('ELSE') : this.appendDummyInput('BRANCH_BUTTONS')
    input.appendField(
      parameterButton('+', '新增分支', (block) => block.plus()),
      'PLUS'
    )
  }
}
