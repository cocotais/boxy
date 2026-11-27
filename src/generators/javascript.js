import { javascriptGenerator, Order } from 'blockly/javascript'

import { resolveParameter } from '../blocks/procedure-parameters.js'
import { resolveScriptVariable } from '../blocks/variables.js'

function scriptVariableName(binding, generator) {
  return generator.nameDB_.getName(
    binding.declaration.getFieldValue(binding.variable.id),
    `script:${binding.declaration.id}`
  )
}

javascriptGenerator.forBlock.boxy_script_variables = (block, generator) =>
  `let ${block.scriptVariables_.map((variable) => `${scriptVariableName({ declaration: block, variable }, generator)} = 0`).join(', ')};\n`

javascriptGenerator.forBlock.boxy_script_variable = (block, generator) => {
  const binding = resolveScriptVariable(block)
  return [binding ? scriptVariableName(binding, generator) : 'null', Order.ATOMIC]
}

javascriptGenerator.forBlock.variables_get = (block, generator) => {
  return [writableVariable(block, generator) ?? '0', Order.ATOMIC]
}

function writableVariable(block, generator) {
  const id = block.getFieldValue('VAR')
  if (id?.startsWith('script:')) {
    const binding = resolveScriptVariable(block, id.slice('script:'.length))
    return binding ? scriptVariableName(binding, generator) : null
  }
  return id ? generator.getVariableName(id) : null
}

for (const [type, input] of [
  ['variables_set', 'VALUE'],
  ['math_change', 'DELTA']
]) {
  javascriptGenerator.forBlock[type] = (block, generator) => {
    const name = writableVariable(block, generator)
    if (!name) return ''
    const value = generator.valueToCode(block, input, Order.NONE) || '0'
    if (type === 'variables_set') return `${name} = ${value};\n`
    return `${name} = Number(${name}) ${block.getFieldValue('MODE') === 'MINUS' ? '-' : '+'} Number(${value});\n`
  }
}

javascriptGenerator.forBlock.text_contains = (block, generator) => {
  const value = generator.valueToCode(block, 'VALUE', Order.NONE) || "''"
  const find = generator.valueToCode(block, 'FIND', Order.NONE) || "''"
  return [`String(${value}).includes(String(${find}))`, Order.FUNCTION_CALL]
}

javascriptGenerator.forBlock.lists_split = (block, generator) => {
  const input = generator.valueToCode(block, 'INPUT', Order.NONE) || "''"
  const delimiter = generator.valueToCode(block, 'DELIM', Order.NONE) || "''"
  return [`String(${input}).split(String(${delimiter}))`, Order.FUNCTION_CALL]
}

javascriptGenerator.forBlock.lists_copy = (block, generator) => {
  const source = generator.valueToCode(block, 'SOURCE', Order.NONE) || '[]'
  const target = generator.valueToCode(block, 'TARGET', Order.NONE) || '[]'
  const copy = generator.provideFunction_('copyList', [
    `function ${generator.FUNCTION_NAME_PLACEHOLDER_}(source, target) {`,
    '  const items = source.slice();',
    '  target.length = 0;',
    '  for (const item of items) target.push(item);',
    '}'
  ])
  return `${copy}(${source}, ${target});\n`
}

javascriptGenerator.forBlock.boxy_return = (block, generator) =>
  block.getInput('VALUE')
    ? `return ${generator.valueToCode(block, 'VALUE', Order.NONE) || 'null'};\n`
    : 'return;\n'

javascriptGenerator.forBlock.boxy_parameter = (block, generator) => {
  const binding = resolveParameter(block)
  return [
    binding ? generator.getVariableName(binding.parameter.model.getId()) : 'null',
    Order.ATOMIC
  ]
}

javascriptGenerator.forBlock.boxy_boolean_input = () => ['false', Order.ATOMIC]
javascriptGenerator.forBlock.boxy_loop_variable = (block, generator) => [
  generator.getVariableName(block.getFieldValue('VAR')),
  Order.ATOMIC
]
javascriptGenerator.forBlock.boxy_list_input = (block, generator) => {
  const id = block.getFieldValue('VAR')
  return id ? [generator.getVariableName(id), Order.ATOMIC] : ['[]', Order.ATOMIC]
}

const randomInteger = javascriptGenerator.forBlock.math_random_int
javascriptGenerator.forBlock.math_random_int = (block, generator) => {
  if (block.getFieldValue('MODE') !== 'FLOAT') return randomInteger(block, generator)
  const from = generator.valueToCode(block, 'FROM', Order.NONE) || '0'
  const to = generator.valueToCode(block, 'TO', Order.NONE) || '1'
  const randomFloat = generator.provideFunction_('randomFloat', [
    `function ${generator.FUNCTION_NAME_PLACEHOLDER_}(from, to) {`,
    '  return Math.random() * (Math.max(from, to) - Math.min(from, to)) + Math.min(from, to);',
    '}'
  ])
  return [`${randomFloat}(${from}, ${to})`, Order.FUNCTION_CALL]
}

function isInteger(str) {
  return /^\d+$/.test(str)
}

javascriptGenerator.forBlock['controls_forever'] = function (block, generator) {
  const branch = generator.statementToCode(block, 'DO')
  return 'for(;;) {\n' + branch + '}\n'
}

javascriptGenerator.forBlock['math_evenly_divisible'] = function (block, generator) {
  const argument1 = generator.valueToCode(block, 'DIVIDEND', Order.MODULUS) || '0'
  const argument2 = generator.valueToCode(block, 'DIVISOR', Order.MODULUS) || '0'
  return [argument1 + ' % ' + argument2 + ' === 0', Order.NONE]
}

javascriptGenerator.forBlock['text_charAt'] = function (block, generator) {
  const argument1 = generator.valueToCode(block, 'VALUE', Order.FUNCTION_CALL) || "''"
  let argument2, code
  argument2 = generator.valueToCode(block, 'INDEX', Order.FUNCTION_CALL) || '1'
  if (block.getFieldValue('WHERE') === 'FROM_START') {
    argument2 = isInteger(argument2) ? String(Number(argument2) - 1) : argument2 + ' - 1'
    code = argument1 + '.charAt(' + argument2 + ')'
  } else if (block.getFieldValue('WHERE') === 'FROM_END') {
    code = argument1 + '.slice(-' + argument2 + ').charAt(0)'
  }
  return [code, Order.NONE]
}

javascriptGenerator.forBlock['math_types'] = function (block, generator) {
  const map = { STRING: 'String', NUMBER: 'Number', BOOLEAN: 'Boolean' }
  const argument1 = generator.valueToCode(block, 'VALUE', Order.ADDITION) || ''
  return [map[block.getFieldValue('TYPE')] + '(' + argument1 + ')', Order.NONE]
}

javascriptGenerator.forBlock['lists_push'] = function (block, generator) {
  const argument1 = generator.valueToCode(block, 'VALUE', Order.ADDITION) || ''
  const argument2 = generator.valueToCode(block, 'LIST', Order.ADDITION) || '[]'
  return argument2 + '.push(' + argument1 + ');\n'
}

javascriptGenerator.forBlock['lists_insert'] = function (block, generator) {
  const argument1 = generator.valueToCode(block, 'VALUE', Order.ADDITION) || 'null'
  const argument2 = generator.valueToCode(block, 'LIST', Order.ADDITION) || '[]'
  let argument3 = generator.valueToCode(block, 'INDEX', Order.ADDITION) || '1'
  if (block.getFieldValue('WHERE') === 'FROM_START') {
    argument3 = isInteger(argument3) ? String(Number(argument3) - 1) : argument3 + '- 1'
  } else if (block.getFieldValue('WHERE') === 'FROM_END') {
    argument3 = argument2 + '.length - ' + argument3
  }
  return argument2 + '.splice(' + argument3 + ', 0, ' + argument1 + ');\n'
}

javascriptGenerator.forBlock['lists_delete'] = function (block, generator) {
  const argument1 = generator.valueToCode(block, 'LIST', Order.ADDITION) || '[]'
  let argument2 = generator.valueToCode(block, 'INDEX', Order.ADDITION) || '1'
  if (block.getFieldValue('WHERE') === 'FROM_START') {
    argument2 = isInteger(argument2) ? String(Number(argument2) - 1) : argument2 + ' - 1'
  } else if (block.getFieldValue('WHERE') === 'FROM_END') {
    argument2 = argument1 + '.length - ' + argument2
  }
  return argument1 + '.splice(' + argument2 + ', 1);\n'
}

javascriptGenerator.forBlock['lists_set'] = function (block, generator) {
  const argument1 = generator.valueToCode(block, 'LIST', Order.ADDITION) || '[]'
  const argument3 = generator.valueToCode(block, 'VALUE', Order.ADDITION) || 'null'
  let argument2 = generator.valueToCode(block, 'INDEX', Order.ADDITION) || '1'
  if (block.getFieldValue('WHERE') === 'FROM_START') {
    argument2 = isInteger(argument2) ? String(Number(argument2) - 1) : argument2 + ' - 1'
  } else if (block.getFieldValue('WHERE') === 'FROM_END') {
    argument2 = argument1 + '.length - ' + argument2
  }
  return argument1 + '[' + argument2 + '] = ' + argument3 + ';\n'
}

javascriptGenerator.forBlock['lists_get'] = function (block, generator) {
  const argument1 = generator.valueToCode(block, 'LIST', Order.ADDITION) || '[]'
  let argument2 = generator.valueToCode(block, 'INDEX', Order.ADDITION) || '1'
  if (block.getFieldValue('WHERE') === 'FROM_START') {
    argument2 = isInteger(argument2) ? String(Number(argument2) - 1) : argument2 + ' - 1'
  } else if (block.getFieldValue('WHERE') === 'FROM_END') {
    argument2 = argument1 + '.length - ' + argument2
  }
  return [argument1 + '[' + argument2 + ']', Order.NONE]
}

javascriptGenerator.forBlock['lists_index'] = function (block, generator) {
  const argument1 = generator.valueToCode(block, 'LIST', Order.ADDITION) || '[]'
  const argument2 = generator.valueToCode(block, 'VALUE', Order.ADDITION) || "''"
  let code
  if (block.getFieldValue('WHICH') === 'FIRST') {
    code = argument1 + '.indexOf(' + argument2 + ') + 1'
  } else if (block.getFieldValue('WHICH') === 'LAST') {
    code = argument1 + '.lastIndexOf(' + argument2 + ') + 1'
  }
  return [code, Order.NONE]
}

javascriptGenerator.forBlock['lists_includes'] = function (block, generator) {
  const argument1 = generator.valueToCode(block, 'LIST', Order.ADDITION) || '[]'
  const argument2 = generator.valueToCode(block, 'VALUE', Order.ADDITION) || "''"
  return [argument1 + '.includes(' + argument2 + ')', Order.FUNCTION_CALL]
}
