import Blockly from 'blockly'

Blockly.defineBlocksWithJsonArray([
  {
    type: 'controls_forever',
    message0: '%1',
    args0: [
      {
        type: 'field_label',
        text: '永远 循环'
      }
    ],
    message1: '%1',
    args1: [
      {
        type: 'input_statement',
        name: 'DO'
      }
    ],
    previousStatement: null,
    nextStatement: null,
    style: 'controller',
    tooltip: '重复执行。'
  },
  {
    type: 'math_evenly_divisible',
    message0: '%1 能被 %2 整除',
    args0: [
      {
        type: 'input_value',
        name: 'DIVIDEND',
        check: 'Number',
        value: 0
      },
      {
        type: 'input_value',
        name: 'DIVISOR',
        check: 'Number',
        value: 0
      }
    ],
    output: 'Boolean',
    style: 'calculation',
    tooltip: '判断第一个数是否恰好被第二个数整除。'
  },
  {
    type: 'lists_split',
    message0: '把 %1 按 %2 %3',
    args0: [
      {
        type: 'input_value',
        name: 'INPUT',
        check: ['String', 'Array']
      },
      {
        type: 'input_value',
        name: 'DELIM',
        check: 'String'
      },
      {
        type: 'field_dropdown',
        name: 'MODE',
        options: [
          ['分开成列表', 'SPLIT'],
          ['合并为文本', 'JOIN']
        ]
      }
    ],
    output: ['String', 'Array'],
    style: 'calculation',
    tooltip: '将文本分开成列表或将列表合并为文本。'
  },
  {
    type: 'text_charAt',
    message0: '取 %1 %2 第 %3 个字符',
    args0: [
      {
        type: 'input_value',
        name: 'VALUE',
        check: 'String'
      },
      {
        type: 'field_dropdown',
        name: 'WHERE',
        options: [
          ['正数', 'FROM_START'],
          ['倒数', 'FROM_END']
        ]
      },
      {
        type: 'input_value',
        name: 'INDEX',
        check: 'Number'
      }
    ],
    output: 'String',
    style: 'calculation',
    tooltip: '取文本指定位置的字符。'
  },
  {
    type: 'text_getSubstring',
    message0: '取 %1 %2 第 %3 到 %4 第 %5 个字符',
    args0: [
      {
        type: 'input_value',
        name: 'VALUE',
        check: 'String'
      },
      {
        type: 'field_dropdown',
        name: 'WHERE1',
        options: [
          ['正数', 'FROM_START'],
          ['倒数', 'FROM_END']
        ]
      },
      {
        type: 'input_value',
        name: 'INDEX1',
        check: 'Number'
      },
      {
        type: 'field_dropdown',
        name: 'WHERE2',
        options: [
          ['正数', 'FROM_START'],
          ['倒数', 'FROM_END']
        ]
      },
      {
        type: 'input_value',
        name: 'INDEX2',
        check: 'Number'
      }
    ],
    output: 'String',
    style: 'calculation',
    tooltip: '取文本指定位置的字符。'
  },
  {
    type: 'math_types',
    message0: '把 %1 转换为 %2 类型',
    args0: [
      {
        type: 'input_value',
        name: 'VALUE'
      },
      {
        type: 'field_dropdown',
        name: 'TYPE',
        options: [
          ['字符串', 'STRING'],
          ['数值', 'NUMBER'],
          ['布尔', 'BOOLEAN']
        ]
      }
    ],
    output: 'String',
    style: 'calculation',
    tooltip: '将对象转换为指定类型。'
  },
  {
    type: 'lists_push',
    message0: '添加 %1 到 %2 末尾',
    args0: [
      {
        type: 'input_value',
        name: 'VALUE',
        check: 'Number'
      },
      {
        type: 'input_value',
        name: 'LIST',
        check: 'Array'
      }
    ],
    previousStatement: null,
    nextStatement: null,
    style: 'lists',
    tooltip: '添加值到列表的末尾。'
  },
  {
    type: 'lists_insert',
    message0: '插入 %1 到 %2 %3 第 %4 项后面',
    args0: [
      {
        type: 'input_value',
        name: 'VALUE'
      },
      {
        type: 'input_value',
        name: 'LIST',
        check: 'Array'
      },
      {
        type: 'field_dropdown',
        name: 'WHERE',
        options: [
          ['正数', 'FROM_START'],
          ['倒数', 'FROM_END']
        ]
      },
      {
        type: 'input_value',
        name: 'INDEX',
        check: 'Number'
      }
    ],
    previousStatement: null,
    nextStatement: null,
    style: 'lists',
    tooltip: '添加值到列表的末尾。'
  },
  {
    type: 'lists_delete',
    message0: '删除 %1 %2 第 %3 项',
    args0: [
      {
        type: 'input_value',
        name: 'LIST',
        check: 'Array'
      },
      {
        type: 'field_dropdown',
        name: 'WHERE',
        options: [
          ['正数', 'FROM_START'],
          ['倒数', 'FROM_END']
        ]
      },
      {
        type: 'input_value',
        name: 'INDEX',
        check: 'Number'
      }
    ],
    previousStatement: null,
    nextStatement: null,
    style: 'lists_delete',
    tooltip: '删除列表的指定项。'
  },
  {
    type: 'lists_set',
    message0: '替换 %1 %2 第 %3 项为 %4',
    args0: [
      {
        type: 'input_value',
        name: 'LIST',
        check: 'Array'
      },
      {
        type: 'field_dropdown',
        name: 'WHERE',
        options: [
          ['正数', 'FROM_START'],
          ['倒数', 'FROM_END']
        ]
      },
      {
        type: 'input_value',
        name: 'INDEX',
        check: 'Number'
      },
      {
        type: 'input_value',
        name: 'VALUE'
      }
    ],
    previousStatement: null,
    nextStatement: null,
    style: 'lists',
    tooltip: '替换列表的指定项。'
  },
  {
    type: 'lists_get',
    message0: '%1 %2 第 %3 项',
    args0: [
      {
        type: 'input_value',
        name: 'LIST',
        check: 'Array'
      },
      {
        type: 'field_dropdown',
        name: 'WHERE',
        options: [
          ['正数', 'FROM_START'],
          ['倒数', 'FROM_END']
        ]
      },
      {
        type: 'input_value',
        name: 'INDEX',
        check: 'Number'
      }
    ],
    output: 'Any',
    style: 'lists',
    tooltip: '获取列表的指定项。'
  },
  {
    type: 'lists_index',
    message0: '%1 中 %2 %3 的位置',
    args0: [
      {
        type: 'input_value',
        name: 'LIST',
        check: 'Array'
      },
      {
        type: 'field_dropdown',
        name: 'WHICH',
        options: [
          ['第一个', 'FIRST'],
          ['最后一个', 'LAST']
        ]
      },
      {
        type: 'input_value',
        name: 'VALUE'
      }
    ],
    output: 'Number',
    style: 'lists',
    tooltip: '返回在列表中的第一个/最后一个匹配项的索引值，如果找不到项目则返回列表本身。'
  },
  {
    type: 'lists_includes',
    message0: '%1 中包含 %2',
    args0: [
      {
        type: 'input_value',
        name: 'LIST',
        check: 'Array'
      },
      {
        type: 'input_value',
        name: 'VALUE'
      }
    ],
    output: 'Boolean',
    style: 'lists',
    tooltip: '列表中是否包含指定项。'
  }
])
