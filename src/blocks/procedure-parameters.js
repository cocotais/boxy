import * as Blockly from 'blockly'

import { procedureParameterStyle } from '../theme/codemao.style.js'
import { KittenText } from './fields.js'

export function resolveParameter(block) {
  const find = (definition) => {
    const parameter = definition?.argData_?.find((arg) => arg.argId === block.parameterId_)
    return parameter ? { definition, parameter } : null
  }
  // A copied function retains its argument IDs. Prefer the enclosing copy
  // over the source definition recorded before it was copied.
  for (let parent = block.getParent(); parent; parent = parent.getParent()) {
    const binding = find(parent)
    if (binding) return binding
  }
  return find(block.workspace.getBlockById(block.definitionId_))
}

Blockly.Blocks.boxy_parameter = {
  init() {
    this.definitionId_ = ''
    this.parameterId_ = ''
    this.appendDummyInput().appendField('参数', 'NAME')
    this.setOutput(true)
    this.setStyle('procedure_parameter')
    this.setOnChange(() => {
      if (!this.isDeadOrDying()) this.refreshParameter_()
    })
  },
  saveExtraState() {
    const binding = resolveParameter(this)
    return {
      definitionId: binding?.definition.id ?? this.definitionId_,
      parameterId: this.parameterId_,
      name: binding?.parameter.model.getName() ?? this.getFieldValue('NAME')
    }
  },
  loadExtraState(state) {
    this.definitionId_ = state.definitionId
    this.parameterId_ = state.parameterId
    this.setFieldValue(state.name ?? '参数', 'NAME')
    this.refreshParameter_()
  },
  getVarModels() {
    const binding = resolveParameter(this)
    return binding ? [binding.parameter.model] : []
  },
  refreshParameter_() {
    const binding = resolveParameter(this)
    if (binding) {
      const name = binding.parameter.model.getName()
      if (this.getFieldValue('NAME') !== name) this.setFieldValue(name, 'NAME')
    }
    const missing = !binding && !!this.parameterId_
    if (missing !== this.parameterMissing_) {
      this.parameterMissing_ = missing
      this.setWarningText(missing ? '此参数或所属函数已被移除' : null, 'parameter')
    }
  }
}

export function createParameterReporter(definition, parameterId) {
  const parameter = definition.argData_.find((arg) => arg.argId === parameterId)
  if (!parameter) return null
  return Blockly.serialization.blocks.append(
    {
      type: 'boxy_parameter',
      extraState: {
        definitionId: definition.id,
        parameterId,
        name: parameter.model.getName()
      }
    },
    definition.workspace,
    { recordUndo: true }
  )
}

export class ParameterField extends KittenText {
  constructor(name, parameterId, validator, edit) {
    super(name, validator)
    this.setAppearance('reporter', procedureParameterStyle)
    this.parameterId_ = parameterId
    this.editParameter_ = edit
  }

  initView() {
    super.initView()
    this.fieldGroup_.classList.add('boxyParameter')
    this.fieldGroup_.setAttribute('data-boxy-parameter', this.parameterId_)
  }

  showEditor_() {
    this.editParameter_(this)
  }
}
