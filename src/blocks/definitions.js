import * as Blockly from 'blockly'

import toolbox from '../assets/toolbox.json' with { type: 'json' }
import { KittenDropdown } from './fields.js'
import { operatorIconDataUrl } from './operator-icons.js'
import { booleanShadow, listShadow, numberShadow, setDefault, textShadow } from './parameters.js'

// Default values are part of the model, including inputs created outside the toolbox.
const defaults = {
  controls_repeat_ext: { TIMES: numberShadow(5) },
  controls_whileUntil: { BOOL: booleanShadow() },
  math_arithmetic: { A: numberShadow(1), B: numberShadow(1) },
  math_random_int: { FROM: numberShadow(1), TO: numberShadow(10) },
  logic_compare: { A: numberShadow(1), B: numberShadow(1) },
  logic_operation: { A: booleanShadow(), B: booleanShadow() },
  logic_negate: { BOOL: booleanShadow() },
  math_round: { NUM: numberShadow(3.1) },
  math_modulo: { DIVIDEND: numberShadow(64), DIVISOR: numberShadow(10) },
  math_evenly_divisible: { DIVIDEND: numberShadow(9), DIVISOR: numberShadow(3) },
  math_number_property: { NUMBER_TO_CHECK: numberShadow(2) },
  math_trig: { NUM: numberShadow(45) },
  math_single: { NUM: numberShadow() },
  lists_split: { INPUT: textShadow('a,b,c'), DELIM: textShadow(',') },
  text_charAt: { VALUE: textShadow(), INDEX: numberShadow(1) },
  text_contains: { VALUE: textShadow(), FIND: textShadow('a') },
  text_length: { VALUE: textShadow() },
  math_types: { VALUE: numberShadow() },
  variables_set: { VALUE: numberShadow() },
  math_change: { DELTA: numberShadow(1) },
  lists_push: { VALUE: numberShadow(), LIST: listShadow() },
  lists_insert: { VALUE: numberShadow(), LIST: listShadow(), INDEX: numberShadow(1) },
  lists_delete: { LIST: listShadow(), INDEX: numberShadow(1) },
  lists_set: { LIST: listShadow(), INDEX: numberShadow(1), VALUE: numberShadow() },
  lists_copy: { SOURCE: listShadow(), TARGET: listShadow() },
  lists_get: { LIST: listShadow(), INDEX: numberShadow(1) },
  lists_length: { VALUE: listShadow() },
  lists_index: { LIST: listShadow(), VALUE: numberShadow() },
  lists_includes: { LIST: listShadow(), VALUE: numberShadow() }
}

const listPosition = {
  options: [
    ['第', 'FROM_START'],
    ['倒数第', 'FROM_END']
  ]
}
const sentenceWord = { appearance: 'inline' }

// Definitions declare field roles and connection semantics; the theme resolves
// their geometry without knowing block types, field names or translated words.
const definitions = {
  controls_flow_statements: { fields: { FLOW: sentenceWord }, nextStatement: true },
  lists_insert: { fields: { WHERE: sentenceWord } },
  lists_index: { fields: { WHICH: sentenceWord } },
  lists_push: { inputChecks: { VALUE: null } },
  lists_get: { fields: { WHERE: listPosition }, output: null },
  lists_delete: { fields: { WHERE: listPosition } },
  lists_set: { fields: { WHERE: listPosition } },
  math_random_int: {
    configure(block) {
      const input = block.getInput('FROM')
      for (const field of [...input.fieldRow]) input.removeField(field.name)
      input.appendField(
        new KittenDropdown([
          ['随机整数', 'INTEGER'],
          ['随机小数', 'FLOAT']
        ]),
        'MODE'
      )
    }
  },
  math_modulo: {
    configure(block) {
      const icon = new Blockly.FieldImage(operatorIconDataUrl('DIVIDE'), 18, 18, '÷')
      icon.boxyPreviewIcon = true
      const input = block.getInput('DIVISOR')
      input.removeField(input.fieldRow[0].name)
      input.insertFieldAt(0, icon)
    }
  },
  math_number_property: {
    configure(block) {
      const property = block.getField('PROPERTY')
      const prefix = new Blockly.FieldLabel('是')
      const input = block.inputList.find((input) => input.fieldRow.includes(property))
      input.insertFieldAt(input.fieldRow.indexOf(property), prefix)
      const validator = property.getValidator()
      property.setValidator(function (value) {
        const validated = validator.call(this, value)
        if (validated !== null) prefix.setValue(value === 'DIVISIBLE_BY' ? '' : '是')
        return validated
      })
    }
  },
  math_trig: {
    configure(block) {
      block.appendDummyInput('UNIT').appendField('度')
      block.getField('OP').setValidator((value) => {
        block.getInput('UNIT').setVisible(['SIN', 'COS', 'TAN'].includes(value))
        return value
      })
    }
  }
}

for (const [type, inputs] of Object.entries(defaults)) {
  const definition = (definitions[type] ??= {})
  definition.defaults = inputs
}

// The category owns its palette. Multiple presets of one definition share
// one initializer, and aliases inherit the complete definition when copied.
for (const category of toolbox.contents) {
  for (const item of category.contents) {
    if (item.kind === 'block') (definitions[item.type] ??= {}).style = category.categorystyle
  }
}
for (const type of ['procedures_callnoreturn', 'procedures_callreturn']) {
  const definition = (definitions[type] ??= {})
  definition.style = 'function'
}

for (const [type, definition] of Object.entries(definitions)) {
  const init = Blockly.Blocks[type].init
  Blockly.Blocks[type].init = function () {
    init.call(this)
    if (definition.style) {
      this.setStyle(this.boxyStyle ?? definition.style)
      this.setInputsInline(true)
    }
    for (const [name, { appearance, options }] of Object.entries(definition.fields ?? {})) {
      const field = this.getField(name)
      if (appearance) field.setAppearance(appearance)
      if (options) field.setOptions(options)
    }
    if (definition.nextStatement !== undefined) this.setNextStatement(definition.nextStatement)
    for (const [name, state] of Object.entries(definition.defaults ?? {}))
      setDefault(this, name, structuredClone(state))
    for (const [name, check] of Object.entries(definition.inputChecks ?? {}))
      this.getInput(name).setCheck(check)
    if ('output' in definition) this.setOutput(true, definition.output)
    definition.configure?.(this)
  }
}
