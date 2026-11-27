import '../src/blocks/index.js'
import '../src/generators/javascript.js'

import assert from 'node:assert/strict'
import test from 'node:test'

import * as Blockly from 'blockly'
import { javascriptGenerator } from 'blockly/javascript'

import { createParameterReporter, resolveParameter } from '../src/blocks/procedure-parameters.js'
import { variableFlyout } from '../src/blocks/toolbox.js'

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
    assert.equal(workspace.getVariableMap().getAllVariables().length, 0)
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
    assert.equal(workspace.getVariableMap().getAllVariables().length, 0)
    plus()
    definition.dispose()
    reply('late response')
    assert.equal(workspace.getVariableMap().getVariable('late response', ''), null)
  } finally {
    workspace.dispose()
  }
})

test('function parameters and callers stay local through creation, rename, undo and reload', async () => {
  const workspace = new Blockly.Workspace()
  const restored = new Blockly.Workspace()
  try {
    const first = workspace.newBlock('procedures_defnoreturn')
    first.setFieldValue('first', 'NAME')
    first.addArg_('value')
    const second = workspace.newBlock('procedures_defnoreturn')
    second.setFieldValue('second', 'NAME')
    second.addArg_('value')
    const calls = ['procedures_callnoreturn', 'procedures_callreturn'].map((type) =>
      Blockly.serialization.blocks.append(
        { type, extraState: { name: 'first', params: ['value'] } },
        workspace
      )
    )
    Blockly.Procedures.mutateCallers(first)
    const id = first.argData_[0].argId
    createParameterReporter(first, id)
    await flushEvents()
    assert.equal(workspace.getBlocksByType('procedures_defnoreturn').length, 2)
    assert.notEqual(first.argData_[0].model, second.argData_[0].model)
    assert.deepEqual(workspace.getVariableMap().getAllVariables(), [])
    assert.deepEqual(Blockly.Variables.allUsedVarModels(workspace), [])
    assert.equal(
      variableFlyout(workspace).filter((item) => item.type === 'variables_get').length,
      1
    )
    workspace.clearUndo()
    first.getField('MINUS').showEditor_()
    await flushEvents()
    workspace.undo(false)
    await flushEvents()
    assert.equal(first.argData_[0].argId, id)
    first.getField(id).setValue('renamed')
    assert.equal(second.argData_[0].model.getName(), 'value')
    for (const call of calls) assert.deepEqual(call.arguments_, ['renamed'])
    const state = Blockly.serialization.workspaces.save(workspace)
    assert.equal(state.variables, undefined)
    Blockly.serialization.workspaces.load(state, restored)
    await flushEvents()
    assert.deepEqual(restored.getVariableMap().getAllVariables(), [])
    assert.equal(restored.getBlocksByType('procedures_defnoreturn').length, 2)
    const code = javascriptGenerator.workspaceToCode(restored)
    assert.doesNotMatch(code, /\bvar\s/)
    assert.doesNotThrow(() => new Function(code))
  } finally {
    workspace.dispose()
    restored.dispose()
  }
})

test('same-name globals and function parameters remain independent in bindings and generated code', async () => {
  const workspace = new Blockly.Workspace()
  try {
    const global = workspace.getVariableMap().createVariable('value')
    const definition = workspace.newBlock('procedures_defnoreturn')
    definition.setFieldValue('identity', 'NAME')
    definition.addArg_('value')
    const id = definition.argData_[0].argId
    const returned = workspace.newBlock('boxy_return')
    definition.getInput('STACK').connection.connect(returned.previousConnection)
    returned
      .getInput('VALUE')
      .connection.connect(createParameterReporter(definition, id).outputConnection)
    Blockly.serialization.blocks.append(
      {
        type: 'variables_set',
        fields: { VAR: { id: global.getId() } },
        inputs: { VALUE: { block: { type: 'math_number', fields: { NUM: 7 } } } }
      },
      workspace
    )
    const caller = Blockly.serialization.blocks.append(
      { type: 'procedures_callreturn', extraState: { name: 'identity', params: ['value'] } },
      workspace
    )
    caller.getInput('ARG0').connection.connect(workspace.newBlock('text').outputConnection)
    await flushEvents()
    assert.deepEqual(workspace.getVariableMap().getAllVariables(), [global])
    assert.notEqual(definition.argData_[0].model.getId(), global.getId())
    workspace.getVariableMap().renameVariable(global, 'globalValue')
    await flushEvents()
    assert.equal(definition.getFieldValue(id), 'value')
    definition.getField(id).setValue('inputValue')
    assert.equal(global.getName(), 'globalValue')
    const code = javascriptGenerator.workspaceToCode(workspace)
    assert.equal(
      new Function(`${code}\nreturn [identity('works'), globalValue];`)().join(','),
      'works,7'
    )
    assert.doesNotMatch(code, /\bvar\s+inputValue/)
  } finally {
    workspace.dispose()
  }
})

test('a standalone call can create its definition without creating global parameters', async (t) => {
  const workspace = new Blockly.Workspace()
  // Legacy XML auto-creation invokes initSvg even for headless workspaces.
  t.mock.method(Blockly.Blocks.procedures_defnoreturn, 'initSvg', () => {})
  try {
    Blockly.serialization.blocks.append(
      { type: 'procedures_callnoreturn', extraState: { name: 'missing', params: ['input'] } },
      workspace,
      { recordUndo: true }
    )
    await flushEvents()
    const definitions = workspace.getBlocksByType('procedures_defnoreturn')
    assert.equal(definitions.length, 1)
    assert.equal(definitions[0].getProcedureDef()[1][0], 'input')
    assert.ok(definitions[0].argData_[0].argId)
    assert.deepEqual(workspace.getVariableMap().getAllVariables(), [])
    assert.doesNotThrow(() => new Function(javascriptGenerator.workspaceToCode(workspace)))
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
