import '../src/blocks/index.js'
import '../src/generators/javascript.js'

import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

import * as Blockly from 'blockly'
import { javascriptGenerator } from 'blockly/javascript'

import toolbox from '../src/assets/toolbox.json' with { type: 'json' }
import { applyFlyoutPreview } from '../src/blocks/flyout.js'
import zh from '../src/msg/zh.json' with { type: 'json' }

Blockly.setLocale(zh)

const fixture = JSON.parse(readFileSync(new URL('./fixtures/block-styles.boxy', import.meta.url)))

test('every toolbox block keeps its style and serialized state in compact previews', () => {
  for (const category of toolbox.contents) {
    const workspace = new Blockly.Workspace()
    try {
      for (const item of category.contents ?? []) {
        if (item.kind !== 'block') continue
        const state = { ...item }
        delete state.kind
        const block = Blockly.serialization.blocks.append(state, workspace)
        assert.equal(block.getStyleName(), block.boxyStyle ?? category.categorystyle, item.type)
        assert.equal(block.getInputsInline(), true, item.type)
        const original = Blockly.serialization.blocks.save(block)
        applyFlyoutPreview(block)
        assert.deepEqual(Blockly.serialization.blocks.save(block), original, item.type)
      }
    } finally {
      workspace.dispose()
    }
  }
})

test('nested loops, branches, function calls and list mutations survive a save/load cycle', () => {
  const first = new Blockly.Workspace()
  const second = new Blockly.Workspace()
  try {
    Blockly.serialization.workspaces.load(fixture, first)
    const saved = Blockly.serialization.workspaces.save(first)
    Blockly.serialization.workspaces.load(saved, second)
    assert.equal(second.getAllBlocks(false).length, first.getAllBlocks(false).length)
    const loop = second.getBlocksByType('controls_forever')[0]
    const repeat = loop.getInputTargetBlock('DO')
    assert.equal(repeat.type, 'controls_repeat_ext')
    assert.equal(repeat.getNextBlock().getInput('ELSE').type, Blockly.inputs.inputTypes.STATEMENT)
    assert.equal(repeat.getInputTargetBlock('TIMES').isShadow(), true)
    assert.equal(second.getBlocksByType('procedures_callnoreturn')[0].getStyleName(), 'function')
    assert.equal(second.getBlocksByType('lists_create_with')[0].itemCount_, 2)
    const code = javascriptGenerator.workspaceToCode(second)
    assert.match(code, /for\s*\(;;\)/)
    assert.match(code, /else/)
    assert.doesNotThrow(() => new Function(code))
  } finally {
    first.dispose()
    second.dispose()
  }
})

test('compact arithmetic previews clone into complete editable blocks with their defaults', async () => {
  const { applyFlyoutPreview } = await import('../src/blocks/flyout.js')
  const source = new Blockly.Workspace()
  const target = new Blockly.Workspace()
  try {
    const block = Blockly.serialization.blocks.append(
      {
        type: 'math_arithmetic',
        fields: { OP: 'MULTIPLY' },
        inputs: {
          A: { shadow: { type: 'math_number', fields: { NUM: 3 } } },
          B: { shadow: { type: 'math_number', fields: { NUM: 7 } } }
        }
      },
      source
    )
    applyFlyoutPreview(block)
    assert.equal(block.getInput('A').isVisible(), false)
    const copy = Blockly.serialization.blocks.append(
      Blockly.serialization.blocks.save(block),
      target
    )
    assert.equal(copy.getInput('A').isVisible(), true)
    assert.equal(copy.getInput('B').isVisible(), true)
    assert.equal(copy.getInput('BOXY_FLYOUT_PREVIEW'), null)
    assert.equal(copy.getFieldValue('OP'), 'MULTIPLY')
    assert.equal(copy.getInputTargetBlock('A').getFieldValue('NUM'), 3)
    assert.equal(copy.getInputTargetBlock('B').getFieldValue('NUM'), 7)
    assert.match(javascriptGenerator.workspaceToCode(target), /3 \* 7/)
  } finally {
    source.dispose()
    target.dispose()
  }
})

test('compact loop previews preserve hidden step and variable fields when cloned', async () => {
  const { applyFlyoutPreview } = await import('../src/blocks/flyout.js')
  const source = new Blockly.Workspace()
  const target = new Blockly.Workspace()
  try {
    const block = Blockly.serialization.blocks.append(
      {
        type: 'controls_for',
        extraState: { showStep: true },
        inputs: {
          FROM: { shadow: { type: 'math_number', fields: { NUM: 2 } } },
          TO: { shadow: { type: 'math_number', fields: { NUM: 12 } } },
          BY: { shadow: { type: 'math_number', fields: { NUM: 4 } } }
        }
      },
      source
    )
    applyFlyoutPreview(block)
    assert.equal(block.getInput('BY').isVisible(), false)
    const copy = Blockly.serialization.blocks.append(
      Blockly.serialization.blocks.save(block),
      target
    )
    assert.equal(copy.getInput('BY').isVisible(), true)
    assert.equal(copy.getField('VAR').isVisible(), true)
    assert.equal(copy.getInputTargetBlock('BY').getFieldValue('NUM'), 4)
    assert.equal(copy.getInputTargetBlock('FROM').getFieldValue('NUM'), 2)
    assert.equal(copy.getInputTargetBlock('TO').getFieldValue('NUM'), 12)
    assert.ok(copy.getInput('DO'))
  } finally {
    source.dispose()
    target.dispose()
  }
})

test('variadic controls preserve connected values when adding, removing and reloading parameters', () => {
  for (const type of ['lists_create_with', 'text_join']) {
    const workspace = new Blockly.Workspace()
    const restored = new Blockly.Workspace()
    try {
      const block = workspace.newBlock(type)
      block.updateShape_(3)
      const parameter = workspace.newBlock(type === 'text_join' ? 'text' : 'math_number')
      parameter.setFieldValue(
        type === 'text_join' ? 'kept' : 37,
        type === 'text_join' ? 'TEXT' : 'NUM'
      )
      block.getInput('ADD1').connection.connect(parameter.outputConnection)
      const removed = workspace.newBlock('math_arithmetic')
      if (type === 'lists_create_with')
        block.getInput('ADD2').connection.connect(removed.outputConnection)
      block.updateShape_(2)
      assert.equal(block.getInputTargetBlock('ADD1'), parameter)
      assert.equal(removed.isDeadOrDying(), false)
      assert.equal(removed.getParent(), null)
      const state = Blockly.serialization.workspaces.save(workspace)
      Blockly.serialization.workspaces.load(state, restored)
      const copy = restored.getBlocksByType(type)[0]
      assert.equal(copy.itemCount_, 2)
      assert.equal(
        copy.getInputTargetBlock('ADD1').getFieldValue(type === 'text_join' ? 'TEXT' : 'NUM'),
        type === 'text_join' ? 'kept' : 37
      )
      copy.updateShape_(0)
      copy.updateShape_(1)
      assert.equal(copy.getInputTargetBlock('ADD0').isShadow(), true)
      assert.doesNotThrow(() => new Function(javascriptGenerator.workspaceToCode(restored)))
    } finally {
      workspace.dispose()
      restored.dispose()
    }
  }
})

for (const type of ['text_join', 'lists_create_with']) {
  test(`${type} restores edited default values when undoing parameter removal`, async () => {
    const workspace = new Blockly.Workspace()
    const restored = new Blockly.Workspace()
    const flush = () => new Promise((resolve) => setTimeout(resolve, 25))
    try {
      const block = workspace.newBlock(type)
      block.updateShape_(1)
      const field = type === 'text_join' ? 'TEXT' : 'NUM'
      const value = type === 'text_join' ? 'edited' : 73
      block.getInputTargetBlock('ADD0').setFieldValue(value, field)
      await flush()
      workspace.clearUndo()
      block.getField('MINUS').showEditor_()
      await flush()
      assert.equal(block.getInput('ADD0'), null)
      workspace.undo(false)
      await flush()
      assert.equal(block.getInputTargetBlock('ADD0').getFieldValue(field), value)
      Blockly.serialization.workspaces.load(
        Blockly.serialization.workspaces.save(workspace),
        restored
      )
      assert.equal(
        restored.getBlocksByType(type)[0].getInputTargetBlock('ADD0').getFieldValue(field),
        value
      )
      workspace.undo(true)
      await flush()
      assert.equal(block.getInput('ADD0'), null)
    } finally {
      workspace.dispose()
      restored.dispose()
    }
  })
}

test('conditional buttons add else then else-if and retain other branches when removing one', () => {
  const workspace = new Blockly.Workspace()
  const restored = new Blockly.Workspace()
  try {
    const block = workspace.newBlock('controls_if')
    block.plus()
    assert.equal(block.hasElse_, true)
    assert.equal(block.elseIfCount_, 0)
    block.plus()
    block.plus()
    const body = workspace.newBlock('controls_repeat_ext')
    block.getInput('DO2').connection.connect(body.previousConnection)
    block.minus(1)
    assert.equal(block.getInputTargetBlock('DO1'), body)
    assert.equal(block.elseIfCount_, 1)
    Blockly.serialization.workspaces.load(
      Blockly.serialization.workspaces.save(workspace),
      restored
    )
    const copy = restored.getBlocksByType('controls_if')[0]
    assert.equal(copy.hasElse_, true)
    assert.equal(copy.getInputTargetBlock('DO1').type, 'controls_repeat_ext')
    assert.doesNotThrow(() => new Function(javascriptGenerator.workspaceToCode(restored)))
  } finally {
    workspace.dispose()
    restored.dispose()
  }
})

test('list selectors and loop reporters retain variable bindings and generate working JavaScript', () => {
  const workspace = new Blockly.Workspace()
  const restored = new Blockly.Workspace()
  try {
    const variable = workspace.getVariableMap().createVariable('items', 'Array')
    const includes = workspace.newBlock('lists_includes')
    includes.getInputTargetBlock('LIST').setFieldValue(variable.getId(), 'VAR')
    const loop = workspace.newBlock('controls_for')
    const reporter = workspace.newBlock('boxy_loop_variable')
    reporter.setFieldValue(loop.getFieldValue('VAR'), 'VAR')
    Blockly.serialization.workspaces.load(
      Blockly.serialization.workspaces.save(workspace),
      restored
    )
    assert.equal(
      restored.getBlocksByType('boxy_loop_variable')[0].getFieldValue('VAR'),
      loop.getFieldValue('VAR')
    )
    assert.equal(
      restored.getBlocksByType('boxy_list_input')[0].getFieldValue('VAR'),
      variable.getId()
    )
    const code = javascriptGenerator.workspaceToCode(restored)
    assert.match(code, /items\.includes\(0\)/)
    assert.doesNotThrow(() => new Function(code))
  } finally {
    workspace.dispose()
    restored.dispose()
  }
})

test('every toolbox definition generates syntactically valid JavaScript with its default parameters', () => {
  for (const category of toolbox.contents) {
    for (const item of category.contents ?? []) {
      if (item.kind !== 'block') continue
      const workspace = new Blockly.Workspace()
      try {
        Blockly.serialization.blocks.append(item, workspace)
        const code = javascriptGenerator.workspaceToCode(workspace)
        assert.doesNotThrow(
          () => new Function(`for (let once = 0; once < 1; once++) {\n${code}\n}`),
          item.type
        )
      } finally {
        workspace.dispose()
      }
    }
  }
})

test('break and continue allow following blocks and recognise the surrounding loop', () => {
  const workspace = new Blockly.Workspace()
  try {
    const loop = workspace.newBlock('controls_forever')
    const flow = workspace.newBlock('controls_flow_statements')
    const following = workspace.newBlock('controls_repeat_ext')
    loop.getInput('DO').connection.connect(flow.previousConnection)
    flow.nextConnection.connect(following.previousConnection)
    assert.equal(flow.getSurroundLoop(), loop)
    for (const action of ['BREAK', 'CONTINUE']) {
      flow.setFieldValue(action, 'FLOW')
      assert.equal(flow.getNextBlock(), following)
      const clone = Blockly.serialization.blocks.append(
        Blockly.serialization.blocks.save(loop),
        workspace
      )
      assert.equal(clone.getInputTargetBlock('DO').getNextBlock().type, 'controls_repeat_ext')
      clone.dispose()
      const code = javascriptGenerator.workspaceToCode(workspace)
      assert.match(code, new RegExp(`${action.toLowerCase()};\\s*for\\s*\\(`))
      assert.doesNotThrow(() => new Function(code))
    }
  } finally {
    workspace.dispose()
  }
})
