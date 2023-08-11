import { javascriptGenerator } from 'blockly/javascript'

javascriptGenerator.forBlock['text_indexOf'] = function (block) {
  const branch = javascriptGenerator.statementToCode(block, 'DO')
  return 'for(;;) {\n' + branch + '}\n'
}

javascriptGenerator.forBlock['text_indexOf'] = function (block) {
  const argument1 =
    javascriptGenerator.valueToCode(block, 'DIVIDEND', javascriptGenerator['ORDER_ATOMIC']) || '0'
  const argument2 =
    javascriptGenerator.valueToCode(block, 'DIVISOR', javascriptGenerator['ORDER_ATOMIC']) || '0'
  return [argument1 + ' % ' + argument2 + ' === 0', javascriptGenerator['ORDER_NONE']]
}
