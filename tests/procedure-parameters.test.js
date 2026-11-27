import '../src/blocks/index.js'
import '../src/generators/javascript.js'

import assert from 'node:assert/strict'
import test from 'node:test'

import * as Blockly from 'blockly'
import { javascriptGenerator } from 'blockly/javascript'

import { createParameterReporter, resolveParameter } from '../src/blocks/procedure-parameters.js'

const flushEvents = () => new Promise((resolve) => setTimeout(resolve, 25))

test('parameter dialogs wait for confirmation, reject empty/duplicate names and cancel cleanly', (t) => {
  let reply, dismiss, title, initial
  let prompts = 0
  Blockly.dialog.setPrompt((message, value, callback) => {
    prompts++
    title = message
    initial = value
    reply = callback
  })
  Blockly.dialog.setAlert((message, callback) => {
    dismiss = callback
  })
  t.after(() => {
    Blockly.dialog.setPrompt()
    Blockly.dialog.setAlert()
  })
  const workspace = new Blockly.Workspace()
  try {
    const definition = workspace.newBlock('procedures_defnoreturn')
    const plus = () => definition.getField('PLUS').showEditor_()
    plus()
    assert.equal(title, '新建参数')
    assert.equal(definition.argData_.length, 0)
    plus()
    assert.equal(prompts, 1)
    reply(null)
    assert.equal(workspace.getVariableMap().getAllVariables().length, 0)
    plus()
    reply('  ')
    assert.equal(definition.argData_.length, 0)
    dismiss()
    reply(' count ')
    assert.equal(definition.argData_[0].model.getName(), 'count')
    plus()
    reply('COUNT')
    assert.equal(definition.argData_.length, 1)
    dismiss()
    reply('message')
    assert.equal(definition.argData_.length, 2)
    const { argId } = definition.argData_[0]
    definition.getField(argId).showEditor_()
    assert.equal(title, '重命名参数')
    assert.equal(initial, 'count')
    reply('amount')
    assert.equal(definition.argData_[0].model.getName(), 'amount')
    plus()
    definition.dispose()
    reply('late response')
    assert.equal(workspace.getVariableMap().getVariable('late response', ''), null)
  } finally {
    workspace.dispose()
  }
})

test('dragged parameters keep their definition and binding through rename and save/load', async () => {
  const workspace = new Blockly.Workspace()
  const restored = new Blockly.Workspace()
  try {
    const definition = workspace.newBlock('procedures_defnoreturn')
    definition.setFieldValue('identity', 'NAME')
    definition.addArg_('value')
    const parameterId = definition.argData_[0].argId
    const reporter = createParameterReporter(definition, parameterId)
    assert.equal(definition.argData_.length, 1)
    assert.equal(definition.getFieldValue(parameterId), 'value')
    assert.equal(reporter.outputConnection.getCheck(), null)
    const returned = workspace.newBlock('boxy_return')
    definition.getInput('STACK').connection.connect(returned.previousConnection)
    returned.getInput('VALUE').connection.connect(reporter.outputConnection)
    const caller = Blockly.serialization.blocks.append(
      { type: 'procedures_callreturn', extraState: { name: 'identity', params: ['value'] } },
      workspace
    )
    const value = workspace.newBlock('text')
    value.setFieldValue('working', 'TEXT')
    caller.getInput('ARG0').connection.connect(value.outputConnection)
    const field = definition.getField(parameterId)
    field.setValue('renamed')
    field.onFinishEditing_('renamed')
    await flushEvents()
    assert.equal(reporter.getFieldValue('NAME'), 'renamed')
    assert.equal(resolveParameter(reporter).parameter.argId, parameterId)
    assert.deepEqual(caller.arguments_, ['renamed'])
    assert.equal(caller.getInputTargetBlock('ARG0'), value)
    Blockly.serialization.workspaces.load(
      Blockly.serialization.workspaces.save(workspace),
      restored
    )
    const copy = restored.getBlocksByType('boxy_parameter')[0]
    assert.equal(resolveParameter(copy).parameter.argId, parameterId)
    assert.equal(resolveParameter(copy).definition.id, definition.id)
    assert.equal(copy.getFieldValue('NAME'), 'renamed')
    const code = javascriptGenerator.workspaceToCode(restored)
    assert.equal(new Function(`${code}\nreturn identity('works');`)(), 'works')
  } finally {
    workspace.dispose()
    restored.dispose()
  }
})

test('a parameter in a copied function binds to the copy rather than its original', () => {
  const workspace = new Blockly.Workspace()
  try {
    const original = workspace.newBlock('procedures_defnoreturn')
    original.addArg_('value')
    const id = original.argData_[0].argId
    const reporter = createParameterReporter(original, id)
    const returned = workspace.newBlock('boxy_return')
    original.getInput('STACK').connection.connect(returned.previousConnection)
    returned.getInput('VALUE').connection.connect(reporter.outputConnection)
    const copy = Blockly.serialization.blocks.append(
      Blockly.serialization.blocks.save(original),
      workspace
    )
    const copyReporter = copy.getInputTargetBlock('STACK').getInputTargetBlock('VALUE')
    assert.notEqual(copy.id, original.id)
    assert.equal(resolveParameter(copyReporter).definition, copy)
    copy.getField(id).setValue('copyValue')
    copy.getField(id).onFinishEditing_('copyValue')
    assert.equal(resolveParameter(copyReporter).parameter.model.getName(), 'copyValue')
    assert.equal(original.argData_[0].model.getName(), 'value')
    assert.equal(copyReporter.saveExtraState().definitionId, copy.id)
  } finally {
    workspace.dispose()
  }
})

test('removing and undoing a parameter safely invalidates and restores its existing reporters', async () => {
  const workspace = new Blockly.Workspace()
  try {
    const definition = workspace.newBlock('procedures_defnoreturn')
    definition.addArg_('value')
    const id = definition.argData_[0].argId
    const reporter = createParameterReporter(definition, id)
    const returned = workspace.newBlock('boxy_return')
    definition.getInput('STACK').connection.connect(returned.previousConnection)
    returned.getInput('VALUE').connection.connect(reporter.outputConnection)
    await flushEvents()
    workspace.clearUndo()
    definition.getField('MINUS').showEditor_()
    await flushEvents()
    assert.equal(resolveParameter(reporter), null)
    assert.equal(reporter.parameterMissing_, true)
    assert.equal(reporter.isDeadOrDying(), false)
    assert.equal(
      javascriptGenerator.forBlock.boxy_parameter(reporter, javascriptGenerator)[0],
      'null'
    )
    workspace.undo(false)
    await flushEvents()
    assert.equal(resolveParameter(reporter).parameter.argId, id)
    assert.equal(reporter.parameterMissing_, false)
    assert.equal(definition.getInputTargetBlock('STACK').getInputTargetBlock('VALUE'), reporter)
  } finally {
    workspace.dispose()
  }
})
