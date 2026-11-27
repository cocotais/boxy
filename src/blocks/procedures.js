import * as Blockly from 'blockly'

import categoryIcons from '../assets/category-icons.json' with { type: 'json' }
import { installFieldReporterDrag } from '../theme/codemao.dragging.js'
import { initStartHat } from '../theme/codemao.layout.js'
import { changeMutation, parameterButton } from './mutations.js'
import { createParameterReporter, ParameterField } from './procedure-parameters.js'

const BUTTONS = 'PARAM_BUTTONS'

delete Blockly.Blocks.procedures_defreturn
delete Blockly.Blocks.procedures_ifreturn
Blockly.Blocks.procedures_callreturn.defType_ = 'procedures_defnoreturn'

for (const type of ['procedures_callnoreturn', 'procedures_callreturn']) {
  const caller = Blockly.Blocks[type]
  const updateShape = caller.updateShape_
  caller.updateShape_ = function () {
    updateShape.call(this)
    // Keep Blockly's parameter metadata for synchronization; calls display only
    // the function name and argument sockets, without definition-side labels.
    this.getField('WITH')?.setVisible(false)
    for (let index = 0; index < this.arguments_.length; index++) {
      this.getField(`ARGNAME${index}`).setVisible(false)
    }
  }
}

function promptParameterName(block, parameterId = null) {
  if (block.workspace.isFlyout || block.boxyParameterPrompt) return
  block.boxyParameterPrompt = true
  const prompt = (initial) => {
    Blockly.dialog.prompt(parameterId ? '重命名参数' : '新建参数', initial, (reply) => {
      if (reply === null || block.isDeadOrDying()) {
        block.boxyParameterPrompt = false
        return
      }
      const name = reply.replace(/[\s\xa0]+/g, ' ').trim()
      const duplicate = block.argData_.some(
        (arg) =>
          arg.argId !== parameterId && arg.model.getName().toLowerCase() === name.toLowerCase()
      )
      if (!name || duplicate) {
        Blockly.dialog.alert(!name ? '参数名称不能为空' : `参数“${name}”已存在`, () => {
          if (block.isDeadOrDying()) block.boxyParameterPrompt = false
          else prompt(name)
        })
        return
      }
      block.boxyParameterPrompt = false
      changeMutation(block, () => {
        if (parameterId) {
          const field = block.getField(parameterId)
          if (!field) return
          field.setValue(name)
          field.onFinishEditing_(field.getValue())
        } else {
          block.addArg_(name)
          Blockly.Procedures.mutateCallers(block)
        }
      })
    })
  }
  prompt(parameterId ? block.getFieldValue(parameterId) : '')
}

function finishParameterEditing() {
  const block = this.getSourceBlock()
  const parameter = block.argData_.find(({ argId }) => argId === this.name)
  if (!parameter) return
  const variables = block.workspace.getVariableMap()
  const obsolete = new Set([...this.varIdsToDelete_, this.preEditVarModel_?.getId()])
  for (const id of obsolete) {
    const variable = variables.getVariableById(id)
    if (
      variable &&
      id !== parameter.model.getId() &&
      !Blockly.Variables.getVariableUsesById(block.workspace, id).length
    )
      variables.deleteVariable(variable)
  }
  this.varIdsToDelete_.length = 0
  this.preEditVarModel_ = null
}

function updateParameterButtons() {
  const input = this.getInput(BUTTONS) ?? this.appendDummyInput(BUTTONS)
  input.removeField('MINUS', true)
  input.removeField('PLUS', true)
  if (this.argData_.length) {
    input.appendField(
      parameterButton('−', '减少参数', (block) => block.minus(block.argData_.at(-1).argId)),
      'MINUS'
    )
  }
  input.appendField(
    parameterButton('+', '新增参数', (block) => promptParameterName(block)),
    'PLUS'
  )
  const body = this.getInput('STACK')
  this.moveInputBefore(BUTTONS, body?.name ?? null)
}

// Retain the plugin's parameter models, validators, caller synchronization and
// serialization. Present its arguments as draggable reporter fields.
const definition = Blockly.Blocks.procedures_defnoreturn
const initSvg = definition.initSvg ?? Blockly.BlockSvg.prototype.initSvg
definition.initSvg = function () {
  initSvg.call(this)
  installFieldReporterDrag(this, createParameterReporter)
}
const init = definition.init
definition.init = function () {
  init.call(this)
  // Present the function body as a stack below an event-style head.
  initStartHat(this, { body: 'STACK', icon: categoryIcons.function })
  this.getInput('TOP').removeField('PLUS', true)
  this.updateParameterButtons_ = updateParameterButtons

  this.addVarInput_ = function (name, argId) {
    const field = new ParameterField(name, argId, this.validator_, () =>
      promptParameterName(this, argId)
    )
    field.varIdsToDelete_ = []
    field.preEditVarModel_ = null
    // The plugin's cleanup still calls the removed workspace.deleteVariableById API.
    field.onFinishEditing_ = finishParameterEditing.bind(field)
    this.appendDummyInput(argId).setAlign(Blockly.inputs.Align.RIGHT).appendField(field, argId)
  }

  for (const method of ['addArg_', 'removeArg_']) {
    const original = this[method]
    this[method] = function (...args) {
      original.apply(this, args)
      this.updateParameterButtons_()
    }
  }
  this.updateParameterButtons_()
}
