import { javascriptGenerator, Order } from 'blockly/javascript'

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

javascriptGenerator.forBlock['text_getSubstring'] = function (block, generator) {
  const argument1 = generator.valueToCode(block, 'VALUE', Order.FUNCTION_CALL) || "''"
  let argument2, argument3
  argument2 = generator.valueToCode(block, 'INDEX1', Order.FUNCTION_CALL) || '1'
  argument3 = generator.valueToCode(block, 'INDEX2', Order.FUNCTION_CALL) || '1'
  if (block.getFieldValue('WHERE1') === 'FROM_START') {
    argument2 = isInteger(argument2) ? String(Number(argument2) - 1) : argument2 + ' - 1'
  } else if (block.getFieldValue('WHERE1') === 'FROM_END') {
    argument2 = argument1 + '.length - ' + argument2
  }
  if (block.getFieldValue('WHERE2') === 'FROM_END') {
    argument3 = isInteger(argument3) ? String(Number(argument3) - 1) : '(' + argument3 + ' - 1)'
    argument3 = argument1 + '.length - ' + argument3
  }
  return [argument1 + '.slice(' + argument2 + ' ,' + argument3 + ')', Order.NONE]
}

javascriptGenerator.forBlock['math_types'] = function (block, generator) {
  const map = { STRING: 'String', NUMBER: 'Number', BOOLEAN: 'Boolean' }
  const argument1 = generator.valueToCode(block, 'VALUE', Order.ADDITION) || ''
  return [map[block.getFieldValue('TYPE')] + '(' + argument1 + ')', Order.NONE]
}

javascriptGenerator.forBlock['lists_push'] = function (block, generator) {
  const argument1 = generator.valueToCode(block, 'VALUE', Order.ADDITION) || ''
  const argument2 = generator.valueToCode(block, 'LIST', Order.ADDITION) || '[]'
  return argument2 + '.push(' + argument1 + ')'
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
  return argument2 + '.splice(' + argument3 + ', 0, ' + argument1 + ')'
}

javascriptGenerator.forBlock['lists_delete'] = function (block, generator) {
  const argument1 = generator.valueToCode(block, 'LIST', Order.ADDITION) || '[]'
  let argument2 = generator.valueToCode(block, 'INDEX', Order.ADDITION) || '1'
  if (block.getFieldValue('WHERE') === 'FROM_START') {
    argument2 = isInteger(argument2) ? String(Number(argument2) - 1) : argument2 + ' - 1'
  } else if (block.getFieldValue('WHERE') === 'FROM_END') {
    argument2 = argument1 + '.length - ' + argument2
  }
  return argument1 + '.splice(' + argument2 + ', 1)'
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
  return argument1 + '[' + argument2 + '] = ' + argument3
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
  return [argument1 + '.contains(' + +argument2 + ')', Order.NONE]
}
