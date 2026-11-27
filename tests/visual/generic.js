import '../../src/main.js'

import * as Blockly from 'blockly'
import { javascriptGenerator, Order } from 'blockly/javascript'

import toolboxConfig from '../../src/assets/toolbox.json'
import { parameterButton } from '../../src/blocks/mutations.js'
import { setDefault } from '../../src/blocks/parameters.js'
import { useStore } from '../../src/store/store.js'

// New definitions have no known renderer type or field/input names.
Blockly.defineBlocksWithJsonArray([
  {
    type: 'specimen_scalar',
    message0: '%1',
    args0: [{ type: 'field_number', name: 'QUANTITY', value: 0 }],
    output: 'Number',
    style: 'calculation'
  },
  {
    type: 'specimen_text',
    message0: '%1',
    args0: [{ type: 'field_input', name: 'CONTENT', text: '' }],
    output: 'String',
    style: 'calculation'
  },
  { type: 'specimen_label', message0: 'i', output: 'Number', style: 'loop_variable' },
  {
    type: 'specimen_socket',
    message0: '%1',
    args0: [{ type: 'field_label', text: '\u00a0' }],
    output: 'Boolean',
    style: 'controller'
  }
])
Blockly.Blocks.specimen_gate = {
  init() {
    this.appendValueInput('WHEN').setCheck('Boolean').appendField('如果')
    this.appendStatementInput('BODY')
    this.appendDummyInput('ACTIONS').appendField(parameterButton('+', '新增分支', () => {}))
    this.setPreviousStatement(true)
    this.setNextStatement(true)
    this.setStyle('controller')
    this.setInputsInline(true)
    setDefault(this, 'WHEN', { type: 'specimen_socket' })
  }
}

// The app's code panel observes this workspace too. Fixture-only blocks need
// generators even when a visual check is concerned only with their geometry.
javascriptGenerator.forBlock.specimen_scalar = (block) => [
  String(block.getFieldValue('QUANTITY')),
  Order.ATOMIC
]
javascriptGenerator.forBlock.specimen_text = (block) => [
  JSON.stringify(block.getFieldValue('CONTENT')),
  Order.ATOMIC
]
javascriptGenerator.forBlock.specimen_label = () => ['0', Order.ATOMIC]
javascriptGenerator.forBlock.specimen_socket = () => ['false', Order.ATOMIC]
javascriptGenerator.forBlock.specimen_gate = (block, generator) => {
  const condition = generator.valueToCode(block, 'WHEN', Order.NONE) || 'false'
  return `if (${condition}) {\n${generator.statementToCode(block, 'BODY')}}\n`
}

const pairs = [
  ['math_number', 'specimen_scalar'],
  ['text', 'specimen_text'],
  ['boxy_loop_variable', 'specimen_label'],
  ['controls_if', 'specimen_gate']
]

// Also exercise metadata inheritance: renamed extension blocks can reuse the
// complete definition, including compact preview and semantic field roles.
for (const original of [
  'math_number_property',
  'controls_whileUntil',
  'math_arithmetic',
  'variables_get'
]) {
  const alias = `specimen_${original}`
  Blockly.Blocks[alias] = { ...Blockly.Blocks[original] }
  javascriptGenerator.forBlock[alias] = javascriptGenerator.forBlock[original]
  pairs.push([original, alias])
}

document.getElementById('workspace').onclick = () => {
  const workspace = useStore().workspaceSvg
  workspace.updateToolbox(toolboxConfig)
  workspace.getToolbox().clearSelection()
  Blockly.serialization.workspaces.load(
    {
      variables: [{ name: 'i', id: 'generic-i' }],
      blocks: {
        languageVersion: 0,
        blocks: pairs.flatMap((pair, row) =>
          pair.map((type, column) => ({ type, x: 30 + column * 650, y: 20 + row * 240 }))
        )
      }
    },
    workspace
  )
  workspace.setScale(1)
  workspace.scroll(0, 0)
}

document.getElementById('flyout').onclick = () => {
  const workspace = useStore().workspaceSvg
  workspace.updateToolbox({
    kind: 'categoryToolbox',
    contents: [
      {
        kind: 'category',
        name: '结构对照',
        categorystyle: 'controller',
        contents: pairs.flatMap((pair) => pair.map((type) => ({ kind: 'block', type, gap: 20 })))
      }
    ]
  })
  const toolbox = workspace.getToolbox()
  toolbox.setSelectedItem(toolbox.getToolboxItems()[0])
}
