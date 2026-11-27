import * as Blockly from 'blockly'

import { installFieldReporterDrag } from '../theme/codemao.dragging.js'
import { scriptVariableStyle } from '../theme/codemao.style.js'
import { KittenDropdown, KittenText, VariableField } from './fields.js'
import { parameterButton } from './mutations.js'
import { numberShadow, setDefault } from './parameters.js'

export function resolveScriptVariable(block, variableId = block.variableId_) {
  for (let parent = block.getParent(); parent; parent = parent.getParent()) {
    const variable = parent.scriptVariables_?.find(({ id }) => id === variableId)
    if (variable) return { declaration: parent, variable }
  }
  return null
}

export function createScriptVariableReporter(declaration, variableId) {
  const variable = declaration.scriptVariables_.find(({ id }) => id === variableId)
  if (!variable) return null
  return Blockly.serialization.blocks.append(
    {
      type: 'boxy_script_variable',
      extraState: { variableId, name: declaration.getFieldValue(variableId) }
    },
    declaration.workspace,
    { recordUndo: true }
  )
}

function renameScriptVariable(block, id) {
  if (block.workspace.isFlyout) return
  Blockly.dialog.prompt('重命名脚本变量', block.getFieldValue(id), (reply) => {
    if (reply === null || block.isDeadOrDying()) return
    const name = reply.trim()
    if (
      !name ||
      block.scriptVariables_.some((v) => v.id !== id && v.name.toLowerCase() === name.toLowerCase())
    ) {
      Blockly.dialog.alert(!name ? '变量名称不能为空' : `变量“${name}”已存在`, () => {
        if (!block.isDeadOrDying()) renameScriptVariable(block, id)
      })
      return
    }
    block.getField(id)?.setValue(name)
  })
}

class ScriptVariableField extends KittenText {
  constructor(block, variable) {
    super(variable.name, (name) => {
      variable.name = name
      return name
    })
    this.setAppearance('reporter', scriptVariableStyle)
    this.variableId = variable.id
    this.rename = () => renameScriptVariable(block, variable.id)
  }

  initView() {
    super.initView()
    this.getSvgRoot().setAttribute('data-boxy-script-variable', this.variableId)
  }

  showEditor_() {
    this.rename()
  }
}

Blockly.Blocks.boxy_script_variables = {
  boxyStyle: 'script_variable_declaration',
  init() {
    this.scriptVariables_ = []
    this.appendDummyInput('TITLE').appendField('脚本变量')
    this.appendDummyInput('BUTTONS')
    this.setPreviousStatement(true)
    this.setNextStatement(true)
    this.setInputsInline(true)
    this.setStyle('script_variable_declaration')
    this.updateVariables_([{ id: Blockly.utils.idGenerator.genUid(), name: 'a' }])
  },
  initSvg() {
    Blockly.BlockSvg.prototype.initSvg.call(this)
    installFieldReporterDrag(this, createScriptVariableReporter)
  },
  saveExtraState() {
    return {
      variables: this.scriptVariables_.map(({ id }) => ({ id, name: this.getFieldValue(id) }))
    }
  },
  loadExtraState(state) {
    this.updateVariables_(state.variables)
  },
  updateVariables_(variables) {
    for (const { id } of this.scriptVariables_) this.removeInput(id, true)
    this.scriptVariables_ = variables.map((variable) => ({ ...variable }))
    for (const variable of this.scriptVariables_) {
      this.appendDummyInput(variable.id).appendField(
        new ScriptVariableField(this, variable),
        variable.id
      )
      this.moveInputBefore(variable.id, 'BUTTONS')
    }
    const buttons = this.getInput('BUTTONS')
    buttons.removeField('MINUS', true)
    buttons.removeField('PLUS', true)
    if (variables.length > 1) {
      buttons.appendField(
        parameterButton('−', '减少变量', (block) => {
          block.updateVariables_(block.scriptVariables_.slice(0, -1))
        }),
        'MINUS'
      )
    }
    buttons.appendField(
      parameterButton('+', '新增变量', (block) => {
        const names = new Set(block.scriptVariables_.map(({ name }) => name.toLowerCase()))
        let index = 0
        let name
        do {
          name = `${String.fromCharCode(97 + (index % 26))}${index >= 26 ? Math.floor(index / 26) : ''}`
          index++
        } while (names.has(name))
        block.updateVariables_([
          ...block.scriptVariables_,
          { id: Blockly.utils.idGenerator.genUid(), name }
        ])
      }),
      'PLUS'
    )
  },
  customContextMenu(options) {
    if (this.workspace.isFlyout) return
    for (const { id, name } of this.scriptVariables_) {
      options.push({
        text: `重命名“${name}”`,
        enabled: true,
        callback: () => renameScriptVariable(this, id)
      })
    }
  }
}

Blockly.Blocks.boxy_script_variable = {
  init() {
    this.variableId_ = ''
    this.appendDummyInput().appendField('a', 'NAME')
    this.setOutput(true)
    this.setStyle('variable')
    this.setOnChange(() => {
      if (this.isDeadOrDying() || this.workspace.isFlyout) return
      const binding = resolveScriptVariable(this)
      if (binding)
        this.setFieldValue(binding.declaration.getFieldValue(binding.variable.id), 'NAME')
      const missing = !!this.variableId_ && !binding
      if (missing !== this.scriptVariableMissing_) {
        this.scriptVariableMissing_ = missing
        this.setWarningText(
          missing ? '脚本变量只能在声明后的同一作用域中使用。' : null,
          'script-variable'
        )
      }
    })
  },
  saveExtraState() {
    return { variableId: this.variableId_, name: this.getFieldValue('NAME') }
  },
  loadExtraState(state) {
    this.variableId_ = state.variableId
    this.setFieldValue(state.name, 'NAME')
  },
  customContextMenu(options) {
    const binding = resolveScriptVariable(this)
    if (binding)
      options.push({
        text: '重命名',
        enabled: true,
        callback: () => renameScriptVariable(binding.declaration, binding.variable.id)
      })
  }
}

// Assignment destinations use rectangular selectors. Scoped names share the
// selector with globals, without creating workspace-global variable models.
class ScopedVariableField extends VariableField {
  getLocalOptions() {
    const options = []
    for (let block = this.getSourceBlock()?.getParent(); block; block = block.getParent()) {
      for (const variable of block.scriptVariables_ ?? []) {
        options.push([block.getFieldValue(variable.id), `script:${variable.id}`])
      }
    }
    return options
  }

  referencesVariables() {
    return !this.getValue()?.startsWith('script:')
  }

  doClassValidation_(value) {
    // Blocks are deserialized before they are connected to their parent stack.
    if (value?.startsWith('script:')) return value
    return super.doClassValidation_(value)
  }
}

function refreshScopedVariable(event) {
  if (this.isDeadOrDying() || this.workspace.isFlyout || event.isUiEvent) return
  this.getField('VAR').refreshVariableName()
  const id = this.getFieldValue('VAR')
  const missing =
    id?.startsWith('script:') && !resolveScriptVariable(this, id.slice('script:'.length))
  if (missing !== this.scriptVariableMissing_) {
    this.scriptVariableMissing_ = missing
    this.setWarningText(
      missing ? '所选脚本变量不在当前作用域中。' : null,
      'script-variable-selection'
    )
  }
}

Blockly.Blocks.variables_get = {
  init() {
    this.appendDummyInput().appendField(new ScopedVariableField(), 'VAR')
    this.setOutput(true)
    this.setStyle('variable')
  },
  onchange: refreshScopedVariable
}

for (const [type, label, input] of [
  ['variables_set', '设置', 'VALUE'],
  ['math_change', '增加', 'DELTA']
]) {
  Blockly.Blocks[type] = {
    init() {
      const value = this.appendValueInput(input)
      value.appendField(type === 'variables_set' ? label : '将')
      value.appendField(new ScopedVariableField(), 'VAR')
      if (type === 'variables_set') value.appendField('的值为')
      else
        value.appendField(
          new KittenDropdown([
            ['增加', 'ADD'],
            ['减少', 'MINUS']
          ]),
          'MODE'
        )
      this.setPreviousStatement(true)
      this.setNextStatement(true)
      this.setInputsInline(true)
      this.setStyle('variable')
      setDefault(this, input, numberShadow(type === 'math_change' ? 1 : 0))
    },
    onchange: refreshScopedVariable
  }
}
