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
  // Calls keep names and stable parameter IDs, never workspace variables.
  caller.setProcedureParameters_ = function (names, ids) {
    if (names.length !== ids.length) throw new RangeError('Parameter names and IDs must match')
    if (JSON.stringify(names) === JSON.stringify(this.arguments_)) {
      this.quarkIds_ = [...ids]
      return
    }
    const connections = this.arguments_.map((name, index) => ({
      name,
      id: this.quarkIds_?.[index],
      connection: this.getInput(`ARG${index}`)?.connection.targetConnection
    }))
    for (const { connection } of connections) connection?.disconnect()
    this.arguments_ = [...names]
    this.argumentVarModels_ = []
    this.quarkIds_ = [...ids]
    this.updateShape_()
    for (let index = 0; index < names.length; index++) {
      const previous =
        connections.find((item) => ids[index] && item.id === ids[index]) ??
        connections.find((item) => item.name === names[index]) ??
        (ids[index] == null || connections[index]?.id == null ? connections[index] : null)
      previous?.connection?.reconnect(this, `ARG${index}`)
    }
  }
  const onchange = caller.onchange
  caller.onchange = function (event) {
    if (
      this.workspace &&
      !this.workspace.isFlyout &&
      event.recordUndo &&
      event.type === Blockly.Events.BLOCK_CREATE &&
      event.ids.includes(this.id)
    ) {
      const definition = Blockly.Procedures.getDefinition(this.getProcedureCall(), this.workspace)
      if (
        definition?.type === this.defType_ &&
        JSON.stringify(definition.getProcedureDef()[1]) === JSON.stringify(this.arguments_)
      ) {
        const disabled = !definition.isEnabled()
        this.setDisabledReason(disabled, 'DISABLED_PROCEDURE_DEFINITION')
        this.setWarningText(
          disabled
            ? Blockly.Msg.PROCEDURES_CALL_DISABLED_DEF_WARNING.replace(
                '%1',
                this.getProcedureCall()
              )
            : null
        )
        return
      }
    }
    onchange.call(this, event)
  }
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

function validateParameterName(value) {
  const block = this.getSourceBlock()
  const parameter = block.argData_.find(({ argId }) => argId === this.name)
  const name = value.replace(/[\s\xa0]+/g, ' ').trim()
  if (
    !name ||
    block.argData_.some(
      (arg) => arg !== parameter && arg.model.getName().toLowerCase() === name.toLowerCase()
    )
  )
    return null
  parameter?.model.setName(name)
  Blockly.Procedures.mutateCallers(block)
  return name
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

// Keep the plugin's serialization and shape updates. Parameter models belong
// to their definition, so global-variable APIs must not enumerate them.
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
  this.getVarModels = () => []
  this.getVars = () => []
  this.validator_ = validateParameterName
  const customContextMenu = this.customContextMenu
  this.customContextMenu = function (options) {
    customContextMenu.call(this, options)
    if (this.isInFlyout || this.isCollapsed()) return
    for (const { model, argId } of this.argData_) {
      options.push({
        enabled: true,
        text: Blockly.Msg.VARIABLES_SET_CREATE_GET.replace('%1', model.getName()),
        callback: Blockly.ContextMenu.callbackFactory(this, {
          type: 'boxy_parameter',
          extraState: { definitionId: this.id, parameterId: argId, name: model.getName() }
        })
      })
    }
  }

  this.addArg_ = function (name, id, argId) {
    argId ||= Blockly.utils.idGenerator.genUid()
    name ||= Blockly.Variables.generateUniqueNameFromOptions(
      Blockly.Procedures.DEFAULT_ARG,
      this.argData_.map(({ model }) => model.getName())
    )
    if (!this.argData_.length) this.getInput('TOP').appendField('', 'WITH')
    // A model provides the plugin's name/ID interface without registering it
    // with VariableMap or creating a global-variable event.
    const model = new Blockly.VariableModel(this.workspace, name, '', id ?? argId)
    this.addVarInput_(name, argId)
    this.moveInputBefore(argId, 'STACK')
    this.argData_.push({ model, argId })
    this.updateParameterButtons_()
  }

  this.addVarInput_ = function (name, argId) {
    const field = new ParameterField(name, argId, this.validator_, () =>
      promptParameterName(this, argId)
    )
    this.appendDummyInput(argId).setAlign(Blockly.inputs.Align.RIGHT).appendField(field, argId)
  }

  const removeArg = this.removeArg_
  this.removeArg_ = function (argId) {
    removeArg.call(this, argId)
    this.updateParameterButtons_()
  }
  this.updateParameterButtons_()
}
