import '../src/blocks/index.js'
import '../src/generators/javascript.js'

import assert from 'node:assert/strict'
import test from 'node:test'

import * as Blockly from 'blockly'
import { javascriptGenerator } from 'blockly/javascript'

import { applyFlyoutPreview } from '../src/blocks/flyout.js'
import { createParameterReporter } from '../src/blocks/procedure-parameters.js'
import { procedureFlyout } from '../src/blocks/toolbox.js'

const flushEvents = () => new Promise((resolve) => setTimeout(resolve, 25))

test('return defaults to one value, including a clone from the compact flyout', () => {
  const source = new Blockly.Workspace()
  const target = new Blockly.Workspace()
  try {
    const returned = source.newBlock('boxy_return')
    assert.equal(returned.getInputTargetBlock('VALUE').getFieldValue('NUM'), 0)
    assert.equal(returned.getField('TOGGLE').boxyParameterAction, 'remove')
    applyFlyoutPreview(returned)
    assert.equal(returned.getInput('VALUE').isVisible(), false)
    assert.equal(returned.getInput('BUTTONS').isVisible(), false)
    const copy = Blockly.serialization.blocks.append(
      Blockly.serialization.blocks.save(returned),
      target
    )
    assert.equal(copy.getInput('VALUE').isVisible(), true)
    assert.equal(copy.getInput('BUTTONS').isVisible(), true)
    assert.equal(copy.getInputTargetBlock('VALUE').getFieldValue('NUM'), 0)
  } finally {
    source.dispose()
    target.dispose()
  }
})

test('bare return saves, reloads and ends a function without a value', () => {
  const workspace = new Blockly.Workspace()
  const restored = new Blockly.Workspace()
  try {
    const definition = workspace.newBlock('procedures_defnoreturn')
    definition.setFieldValue('stop', 'NAME')
    const returned = workspace.newBlock('boxy_return')
    definition.getInput('STACK').connection.connect(returned.previousConnection)
    returned.updateShape_(false)
    assert.equal(returned.getInput('VALUE'), null)
    assert.equal(returned.getField('TOGGLE').boxyParameterAction, 'add')
    Blockly.serialization.workspaces.load(
      Blockly.serialization.workspaces.save(workspace),
      restored
    )
    const copy = restored.getBlocksByType('boxy_return')[0]
    assert.equal(copy.getInput('VALUE'), null)
    const code = javascriptGenerator.workspaceToCode(restored)
    assert.match(code, /return;/)
    assert.equal(new Function(`${code}\nreturn stop();`)(), undefined)
    copy.updateShape_(true)
    copy.updateShape_(true)
    assert.equal(copy.inputList.filter((input) => input.name === 'VALUE').length, 1)
    assert.equal(copy.getInputTargetBlock('VALUE').getFieldValue('NUM'), 0)
  } finally {
    workspace.dispose()
    restored.dispose()
  }
})

test('return toggle releases connected values and undo/redo restores the connection', async () => {
  const workspace = new Blockly.Workspace()
  try {
    const definition = workspace.newBlock('procedures_defnoreturn')
    const returned = workspace.newBlock('boxy_return')
    definition.getInput('STACK').connection.connect(returned.previousConnection)
    const value = workspace.newBlock('text')
    value.setFieldValue('kept', 'TEXT')
    returned.getInput('VALUE').connection.connect(value.outputConnection)
    await flushEvents()
    workspace.clearUndo()
    returned.getField('TOGGLE').showEditor_()
    await flushEvents()
    assert.equal(returned.getInput('VALUE'), null)
    assert.equal(value.isDeadOrDying(), false)
    assert.equal(value.getParent(), null)
    workspace.undo(false)
    await flushEvents()
    assert.equal(returned.getInputTargetBlock('VALUE'), value)
    assert.equal(value.getFieldValue('TEXT'), 'kept')
    workspace.undo(true)
    await flushEvents()
    assert.equal(returned.getInput('VALUE'), null)
    assert.equal(value.getParent(), null)
    returned.getField('TOGGLE').showEditor_()
    await flushEvents()
    assert.equal(returned.getInputTargetBlock('VALUE').getFieldValue('NUM'), 0)
    workspace.undo(false)
    await flushEvents()
    assert.equal(returned.getInput('VALUE'), null)
    workspace.undo(true)
    await flushEvents()
    returned.getInputTargetBlock('VALUE').setFieldValue(73, 'NUM')
    await flushEvents()
    workspace.clearUndo()
    returned.getField('TOGGLE').showEditor_()
    await flushEvents()
    workspace.undo(false)
    await flushEvents()
    assert.equal(returned.getInputTargetBlock('VALUE').getFieldValue('NUM'), 73)
  } finally {
    workspace.dispose()
  }
})

test('function toolbox has one definition and an unconditional terminal return', () => {
  const workspace = new Blockly.Workspace()
  try {
    assert.equal(Blockly.Blocks.procedures_defreturn, undefined)
    assert.equal(Blockly.Blocks.procedures_ifreturn, undefined)
    assert.deepEqual(
      procedureFlyout(workspace).map((entry) => entry.type),
      ['procedures_defnoreturn', 'boxy_return']
    )
    const definition = workspace.newBlock('procedures_defnoreturn')
    assert.equal(definition.getInput('RETURN'), null)
    const returned = workspace.newBlock('boxy_return')
    assert.equal(returned.getInput('CONDITION'), null)
    assert.ok(returned.getInput('VALUE'))
    assert.ok(returned.previousConnection)
    assert.equal(returned.nextConnection, null)
  } finally {
    workspace.dispose()
  }
})

test('independent returns work in branches and both call shapes use the same definition', async () => {
  const workspace = new Blockly.Workspace()
  const restored = new Blockly.Workspace()
  try {
    const definition = workspace.newBlock('procedures_defnoreturn')
    definition.setFieldValue('choose', 'NAME')
    definition.addArg_('condition')
    const condition = createParameterReporter(definition, definition.argData_[0].argId)
    const branch = workspace.newBlock('controls_if')
    branch.getInput('IF0').connection.connect(condition.outputConnection)
    definition.getInput('STACK').connection.connect(branch.previousConnection)
    const [early, fallback] = ['early', 'fallback'].map((value) => {
      const returned = workspace.newBlock('boxy_return')
      const text = workspace.newBlock('text')
      text.setFieldValue(value, 'TEXT')
      returned.getInput('VALUE').connection.connect(text.outputConnection)
      return returned
    })
    branch.getInput('DO0').connection.connect(early.previousConnection)
    branch.nextConnection.connect(fallback.previousConnection)
    for (const type of ['procedures_callnoreturn', 'procedures_callreturn']) {
      Blockly.serialization.blocks.append(
        { type, extraState: { name: 'choose', params: ['condition'] } },
        workspace
      )
    }
    await flushEvents()
    assert.equal(workspace.getBlocksByType('procedures_defnoreturn').length, 1)
    const entries = procedureFlyout(workspace)
    assert.ok(entries.some((entry) => entry.type === 'procedures_callreturn'))
    assert.ok(entries.some((entry) => entry.type === 'procedures_callnoreturn'))
    Blockly.serialization.workspaces.load(
      Blockly.serialization.workspaces.save(workspace),
      restored
    )
    const code = javascriptGenerator.workspaceToCode(restored)
    assert.equal(new Function(`${code}\nreturn choose(true);`)(), 'early')
    assert.equal(new Function(`${code}\nreturn choose(false);`)(), 'fallback')
  } finally {
    workspace.dispose()
    restored.dispose()
  }
})

test('return blocks enable inside functions and disable when detached without losing their value', async () => {
  const workspace = new Blockly.Workspace()
  try {
    const definition = workspace.newBlock('procedures_defnoreturn')
    const returned = workspace.newBlock('boxy_return')
    const value = returned.getInputTargetBlock('VALUE')
    value.setFieldValue(73, 'NUM')
    await flushEvents()
    assert.equal(returned.isEnabled(), false)
    definition.getInput('STACK').connection.connect(returned.previousConnection)
    await flushEvents()
    assert.equal(returned.isEnabled(), true)
    returned.unplug()
    await flushEvents()
    assert.equal(returned.isEnabled(), false)
    assert.equal(returned.getInputTargetBlock('VALUE'), value)
    assert.equal(value.getFieldValue('NUM'), 73)
  } finally {
    workspace.dispose()
  }
})
