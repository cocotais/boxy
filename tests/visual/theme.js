// The fixture runs the actual app, renderer and flyout. Browser checks use only
// these visible controls; no test-only hooks are added to the production app.
import '../../src/main.js'

import * as Blockly from 'blockly'
import { javascriptGenerator, Order } from 'blockly/javascript'

import toolbox from '../../src/assets/toolbox.json'
import { useStore } from '../../src/store/store.js'
import { valueContainerDefinitions } from '../fixtures/value-containers.js'

Blockly.defineBlocksWithJsonArray(valueContainerDefinitions)
// The fixture only specifies rendering and connections, not execution semantics.
for (const { type, output } of valueContainerDefinitions)
  javascriptGenerator.forBlock[type] = () => (output ? ['[]', Order.ATOMIC] : '')

const variables = [
  { name: 'a', id: 'short' },
  { name: '变量111111', id: 'long' },
  { name: 'a', id: 'list-short', type: 'Array' },
  { name: '列表111111', id: 'list-long', type: 'Array' }
]
const scenes = Object.fromEntries(
  toolbox.contents.map((category) => [
    category.categorystyle,
    category.contents
      .filter((item) => item.kind === 'block')
      .map((item) => {
        const state = { ...item }
        delete state.kind
        delete state.gap
        return state
      })
  ])
)
scenes.variable.push(
  ...['short', 'long'].map((id) => ({ type: 'variables_get', fields: { VAR: { id } } }))
)
scenes.list.push(
  ...['list-short', 'list-long'].map((id) => ({ type: 'boxy_list_input', fields: { VAR: id } }))
)
scenes.function[0].fields = { NAME: 'a' }
scenes.function.push(
  { type: 'procedures_callnoreturn', extraState: { name: 'a' } },
  { type: 'boxy_return', extraState: { hasValue: false } }
)
scenes.dynamic = [
  { type: 'controls_if', extraState: { elseIfCount: 2, hasElse: true } },
  { type: 'controls_for', fields: { VAR: { id: 'long' } }, extraState: { showStep: true } },
  { type: 'text_join', extraState: { itemCount: 4 } },
  { type: 'lists_create_with', extraState: { itemCount: 3 } },
  ...[false, true].map((returns) => ({
    type: 'procedures_defnoreturn',
    fields: { NAME: returns ? '111111' : '函数111' },
    extraState: {
      params: [
        { name: 'x', id: 'arg-x', argId: 'parameter-x' },
        { name: 'count', id: 'arg-count', argId: 'parameter-count' }
      ]
    }
  })),
  { type: 'boxy_loop_variable', fields: { VAR: { id: 'long' } } },
  { type: 'text', fields: { TEXT: '文本111111' } },
  { type: 'math_number', fields: { NUM: -12345.67 } }
]
scenes.functionBody = [false, true].map((returns, index) => ({
  type: 'procedures_defnoreturn',
  fields: { NAME: returns ? '计算' : '执行' },
  extraState: { params: [{ name: '参数', id: `body-var-${index}`, argId: `body-arg-${index}` }] },
  inputs: {
    STACK: {
      block: {
        type: 'variables_set',
        fields: { VAR: { id: 'short' } },
        next: {
          block: {
            type: 'math_change',
            fields: { VAR: { id: 'short' } },
            ...(returns
              ? {
                  next: {
                    block: {
                      type: 'boxy_return',
                      inputs: {
                        VALUE: {
                          block: {
                            type: 'boxy_parameter',
                            extraState: {
                              definitionId: `sample-${index}`,
                              parameterId: `body-arg-${index}`,
                              name: '参数'
                            }
                          }
                        }
                      }
                    }
                  }
                }
              : {})
          }
        }
      }
    }
  }
}))

scenes.scriptVariables = [
  {
    type: 'boxy_script_variables',
    extraState: { variables: [{ id: 'script-count', name: 'count' }] },
    next: {
      block: {
        type: 'variables_set',
        fields: { VAR: { id: 'script:script-count' } },
        inputs: { VALUE: { shadow: { type: 'math_number', fields: { NUM: 7 } } } },
        next: {
          block: {
            type: 'math_change',
            fields: { VAR: { id: 'script:script-count' }, MODE: 'MINUS' },
            next: {
              block: {
                type: 'variables_set',
                fields: { VAR: { id: 'short' } },
                inputs: {
                  VALUE: {
                    block: {
                      type: 'boxy_script_variable',
                      extraState: { variableId: 'script-count', name: 'count' }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
]

scenes.valueContainers = [
  { type: 'blocks_group' },
  {
    type: 'blocks_group',
    inputs: {
      BLOCK: {
        block: {
          type: 'variables_set',
          fields: { VAR: { id: 'short' } },
          next: { block: { type: 'math_change', fields: { VAR: { id: 'short' } } } }
        }
      }
    }
  },
  {
    type: 'variables_set',
    fields: { VAR: { id: 'short' } },
    inputs: {
      VALUE: {
        block: {
          type: 'blocks_group',
          inputs: { BLOCK: { block: { type: 'controls_forever' } } }
        }
      }
    }
  },
  { type: 'specimen_value_branches' },
  {
    type: 'blocks_group',
    inputs: {
      BLOCK: {
        block: {
          type: 'variables_set',
          fields: { VAR: { id: 'short' } },
          inputs: { VALUE: { block: { type: 'blocks_group' } } }
        }
      }
    }
  },
  { type: 'specimen_value_consumer' }
]

for (const [name, blocks] of Object.entries(scenes)) {
  const button = document.createElement('button')
  button.textContent = name
  button.onclick = () => {
    const workspace = useStore().workspaceSvg
    if (name === 'valueContainers') {
      workspace.updateToolbox({
        ...toolbox,
        contents: [
          {
            kind: 'category',
            name: '容器样式',
            categorystyle: 'controller',
            contents: valueContainerDefinitions.map(({ type }) => ({ kind: 'block', type }))
          },
          ...toolbox.contents
        ]
      })
    }
    workspace.getToolbox().clearSelection()
    const columns = name === 'calculation' ? 3 : 2
    const rowHeight = name === 'dynamic' ? 270 : 180
    const height = Math.ceil(blocks.length / columns) * rowHeight + 100
    document.getElementById('app').style.height = `${height}px`
    document.body.style.height = `${height + 40}px`
    Blockly.serialization.workspaces.load(
      {
        variables,
        blocks: {
          languageVersion: 0,
          blocks: blocks.map((block, index) => ({
            ...structuredClone(block),
            id: `sample-${index}`,
            x: 30 + (index % columns) * (columns === 3 ? 470 : 700),
            y: 20 + Math.floor(index / columns) * rowHeight
          }))
        }
      },
      workspace
    )
    workspace.setScale(1)
    Blockly.svgResize(workspace)
    workspace.scroll(0, 0)
    workspace.clearUndo()
    document.title = `Boxy theme regression: ${name}`
  }
  document.getElementById('scenes').appendChild(button)
}
