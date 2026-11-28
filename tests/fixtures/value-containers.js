// These definitions exercise the theme without adding a new built-in feature.
export const valueContainerDefinitions = [
  {
    type: 'blocks_group',
    message0: '%1',
    args0: [{ type: 'field_label', text: '积木组' }],
    message1: '%1',
    args1: [{ type: 'input_statement', name: 'BLOCK' }],
    output: 'Array',
    style: 'controller',
    tooltip: '积木组'
  },
  {
    type: 'specimen_value_branches',
    message0: '选择积木组 %1',
    args0: [{ type: 'input_value', name: 'CONDITION', check: 'Boolean' }],
    message1: '满足时 %1',
    args1: [{ type: 'input_statement', name: 'FIRST' }],
    message2: '否则 %1',
    args2: [{ type: 'input_statement', name: 'SECOND' }],
    output: 'Array',
    inputsInline: true,
    style: 'controller'
  },
  {
    type: 'specimen_value_consumer',
    message0: '使用 %1',
    args0: [{ type: 'input_value', name: 'VALUE', check: 'Array' }],
    inputsInline: true,
    previousStatement: null,
    nextStatement: null,
    style: 'calculation'
  }
]
