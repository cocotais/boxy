import '../src/blocks/index.js'
import '../src/generators/javascript.js'

import assert from 'node:assert/strict'
import test from 'node:test'

import * as Blockly from 'blockly'
import { javascriptGenerator } from 'blockly/javascript'

const flushEvents = () => new Promise((resolve) => setTimeout(resolve, 25))

function acceptParameterNames(t) {
  let next = 0
  Blockly.dialog.setPrompt((message, initial, callback) => callback(`parameter${++next}`))
  t.after(() => Blockly.dialog.setPrompt())
}

for (const returns of [false, true]) {
  const type = 'procedures_defnoreturn'
  const scenario = returns ? 'value call' : 'statement call'
  const callerType = returns ? 'procedures_callreturn' : 'procedures_callnoreturn'

  test(`${type} (${scenario}) trailing controls preserve the body, caller values and parameter identities`, (t) => {
    acceptParameterNames(t)
    const workspace = new Blockly.Workspace()
    const restored = new Blockly.Workspace()
    try {
      const definition = workspace.newBlock(type)
      definition.setFieldValue('demo', 'NAME')
      const caller = Blockly.serialization.blocks.append(
        { type: callerType, extraState: { name: 'demo', params: [] } },
        workspace
      )
      const body = workspace.newBlock('controls_forever')
      definition.getInput('STACK').connection.connect(body.previousConnection)
      const result = workspace.newBlock('math_number')
      const returned = returns ? workspace.newBlock('boxy_return') : null
      if (returned) {
        body.nextConnection.connect(returned.previousConnection)
        returned.getInput('VALUE').connection.connect(result.outputConnection)
      }
      definition.getField('PLUS').showEditor_()
      definition.getField('PLUS').showEditor_()
      const parameter = definition.getField(definition.argData_[0].argId)
      parameter.setValue('count')
      parameter.onFinishEditing_('count')
      assert.equal(definition.argData_[0].model.getName(), 'count')
      assert.equal(caller.arguments_[0], 'count')
      const first = { ...definition.argData_[0] }
      assert.equal(caller.getInput('ARG1') !== null, true)
      const kept = workspace.newBlock('math_number')
      kept.setFieldValue(37, 'NUM')
      caller.getInput('ARG0').connection.connect(kept.outputConnection)
      const removed = workspace.newBlock('text')
      removed.setFieldValue('released', 'TEXT')
      caller.getInput('ARG1').connection.connect(removed.outputConnection)
      definition.getField('MINUS').showEditor_()
      assert.equal(definition.argData_.length, 1)
      assert.equal(definition.argData_[0].argId, first.argId)
      assert.equal(caller.getInputTargetBlock('ARG0'), kept)
      assert.equal(caller.getInput('ARG1'), null)
      assert.equal(removed.getParent(), null)
      assert.equal(removed.isDeadOrDying(), false)
      assert.equal(definition.getInputTargetBlock('STACK'), body)
      if (returns) assert.equal(returned.getInputTargetBlock('VALUE'), result)
      const buttons = definition.inputList.indexOf(definition.getInput('PARAM_BUTTONS'))
      assert.equal(buttons, definition.inputList.indexOf(definition.getInput('STACK')) - 1)
      for (const { argId } of definition.argData_)
        assert.ok(
          definition.getInput(argId).fieldRow.every((f) => !(f instanceof Blockly.FieldImage))
        )
      Blockly.serialization.workspaces.load(
        Blockly.serialization.workspaces.save(workspace),
        restored
      )
      const copy = restored.getBlocksByType(type)[0]
      assert.equal(copy.argData_[0].argId, first.argId)
      assert.equal(
        restored.getBlocksByType(callerType)[0].getInputTargetBlock('ARG0').getFieldValue('NUM'),
        37
      )
      assert.doesNotThrow(() => new Function(javascriptGenerator.workspaceToCode(restored)))
    } finally {
      workspace.dispose()
      restored.dispose()
    }
  })

  test(`${type} (${scenario}) can undo and redo the first and last parameter controls`, async (t) => {
    acceptParameterNames(t)
    const workspace = new Blockly.Workspace()
    try {
      const definition = workspace.newBlock(type)
      await flushEvents()
      workspace.clearUndo()
      definition.getField('PLUS').showEditor_()
      await flushEvents()
      const id = definition.argData_[0].argId
      workspace.undo(false)
      await flushEvents()
      assert.equal(definition.argData_.length, 0)
      assert.equal(definition.getField('MINUS'), null)
      workspace.undo(true)
      await flushEvents()
      assert.equal(definition.argData_[0].argId, id)
      definition.getField('MINUS').showEditor_()
      await flushEvents()
      assert.equal(definition.argData_.length, 0)
      workspace.undo(false)
      await flushEvents()
      assert.equal(definition.argData_[0].argId, id)
    } finally {
      workspace.dispose()
    }
  })

  test(`${type} (${scenario}) confirms a dialog asynchronously in one undoable parameter operation`, async (t) => {
    let confirm
    Blockly.dialog.setPrompt((message, initial, callback) => {
      confirm = callback
    })
    t.after(() => Blockly.dialog.setPrompt())
    const workspace = new Blockly.Workspace()
    try {
      const definition = workspace.newBlock(type)
      definition.setFieldValue('dialogDemo', 'NAME')
      const caller = Blockly.serialization.blocks.append(
        { type: callerType, extraState: { name: 'dialogDemo', params: [] } },
        workspace
      )
      await flushEvents()
      workspace.clearUndo()
      definition.getField('PLUS').showEditor_()
      await flushEvents()
      assert.equal(definition.argData_.length, 0)
      confirm('named')
      await flushEvents()
      const id = definition.argData_[0].argId
      assert.deepEqual(caller.arguments_, ['named'])
      workspace.undo(false)
      await flushEvents()
      assert.equal(definition.argData_.length, 0)
      assert.deepEqual(caller.arguments_, [])
      workspace.undo(true)
      await flushEvents()
      assert.equal(definition.argData_[0].argId, id)
      assert.deepEqual(caller.arguments_, ['named'])
    } finally {
      workspace.dispose()
    }
  })
}
