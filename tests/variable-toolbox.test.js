import '../src/blocks/index.js'
import '../src/generators/javascript.js'

import assert from 'node:assert/strict'
import test from 'node:test'

import * as Blockly from 'blockly'
import { javascriptGenerator } from 'blockly/javascript'

import { applyFlyoutPreview } from '../src/blocks/flyout.js'
import { listFlyout, registerVariableToolbox, variableFlyout } from '../src/blocks/toolbox.js'

const getters = (contents, type) => contents.filter((item) => item.type === type)

test('named flyouts show every value newest first, without mixing variables and lists', () => {
  const workspace = new Blockly.Workspace()
  try {
    assert.equal(getters(variableFlyout(workspace), 'variables_get').length, 1)
    assert.equal(getters(listFlyout(workspace), 'boxy_list_input').length, 1)
    assert.equal(workspace.getVariableMap().getAllVariables().length, 0)
    const map = workspace.getVariableMap()
    const first = map.createVariable('z first')
    const second = map.createVariable('a second')
    const firstList = map.createVariable('z list', 'Array')
    const secondList = map.createVariable('a list', 'Array')
    assert.deepEqual(
      getters(variableFlyout(workspace), 'variables_get').map((item) => item.fields.VAR.id),
      [second.getId(), first.getId()]
    )
    assert.deepEqual(
      getters(listFlyout(workspace), 'boxy_list_input').map((item) => item.fields.VAR),
      [secondList.getId(), firstList.getId()]
    )
    for (const item of [
      ...getters(variableFlyout(workspace), 'variables_get'),
      ...getters(listFlyout(workspace), 'boxy_list_input')
    ]) {
      const block = Blockly.serialization.blocks.append(item, workspace)
      const before = Blockly.serialization.blocks.save(block)
      applyFlyoutPreview(block)
      const model = map.getVariableById(block.getFieldValue('VAR'))
      assert.equal(block.getInput('BOXY_FLYOUT_PREVIEW').fieldRow[0].getText(), model.getName())
      assert.deepEqual(Blockly.serialization.blocks.save(block), before)
    }
    map.deleteVariable(second)
    map.deleteVariable(secondList)
    assert.deepEqual(
      getters(variableFlyout(workspace), 'variables_get').map((item) => item.fields.VAR.id),
      [first.getId()]
    )
    assert.deepEqual(
      getters(listFlyout(workspace), 'boxy_list_input').map((item) => item.fields.VAR),
      [firstList.getId()]
    )
  } finally {
    workspace.dispose()
  }
})

test('named list reporters retain their binding through rename, serialization and code generation', () => {
  const workspace = new Blockly.Workspace()
  const restored = new Blockly.Workspace()
  try {
    const map = workspace.getVariableMap()
    const list = map.createVariable('items', 'Array')
    const definition = getters(listFlyout(workspace), 'boxy_list_input')[0]
    const block = Blockly.serialization.blocks.append(definition, workspace)
    assert.deepEqual(block.getVarModels(), [list])
    map.renameVariable(list, 'renamed')
    assert.equal(block.getField('VAR').getText(), 'renamed')
    Blockly.serialization.workspaces.load(
      Blockly.serialization.workspaces.save(workspace),
      restored
    )
    const copy = restored.getBlocksByType('boxy_list_input')[0]
    assert.equal(copy.getFieldValue('VAR'), list.getId())
    assert.equal(copy.getField('VAR').getText(), 'renamed')
    assert.match(javascriptGenerator.workspaceToCode(restored), /var renamed;/)
    map.deleteVariable(list)
    assert.equal(block.isDeadOrDying(), true)
    assert.equal(getters(listFlyout(workspace), 'boxy_list_input')[0].fields, undefined)
  } finally {
    workspace.dispose()
    restored.dispose()
  }
})

test('creation restores the category, keeps list types and rejects duplicate names', () => {
  const workspace = new Blockly.Workspace()
  const buttons = new Map()
  const category = {}
  const restored = []
  let reply, dismiss, title
  Blockly.dialog.setPrompt((message, value, callback) => {
    title = message
    reply = callback
  })
  Blockly.dialog.setAlert((message, callback) => {
    dismiss = callback
  })
  try {
    registerVariableToolbox({
      getVariableMap: () => workspace.getVariableMap(),
      getToolbox: () => ({
        getSelectedItem: () => category,
        setSelectedItem: (item) => restored.push(item)
      }),
      registerToolboxCategoryCallback() {},
      registerButtonCallback: (key, callback) => buttons.set(key, callback)
    })
    buttons.get('CREATE_VARIABLE')()
    reply('value')
    buttons.get('CREATE_LIST')()
    assert.equal(title, '新列表的名称')
    reply('value')
    assert.equal(workspace.getVariableMap().getAllVariables().length, 1)
    dismiss()
    reply('items')
    assert.ok(workspace.getVariableMap().getVariable('items', 'Array'))
    buttons.get('CREATE_VARIABLE')()
    reply(null)
    assert.equal(workspace.getVariableMap().getAllVariables().length, 2)
    assert.deepEqual(restored, [category, category, category])
  } finally {
    Blockly.dialog.setPrompt()
    Blockly.dialog.setAlert()
    workspace.dispose()
  }
})
