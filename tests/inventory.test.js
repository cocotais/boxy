import '../src/blocks/index.js'
import '../src/generators/javascript.js'

import assert from 'node:assert/strict'
import test from 'node:test'

import * as Blockly from 'blockly'
import { javascriptGenerator } from 'blockly/javascript'

import toolbox from '../src/assets/toolbox.json' with { type: 'json' }
import { applyFlyoutPreview, filterFlyoutContents } from '../src/blocks/flyout.js'
import { listFlyout, variableFlyout } from '../src/blocks/toolbox.js'
import { createScriptVariableReporter, resolveScriptVariable } from '../src/blocks/variables.js'

test('operator, variable and list entries match the reference, with constants and without visibility blocks', () => {
  const workspace = new Blockly.Workspace()
  try {
    const operators = filterFlyoutContents(
      toolbox.contents.find((category) => category.categorystyle === 'calculation').contents,
      true
    ).filter((item) => item.kind === 'block')
    assert.deepEqual(
      operators.map((item) => [item.type, item.fields?.OP]),
      [
        ['math_number'],
        ...['ADD', 'MINUS', 'MULTIPLY', 'DIVIDE'].map((op) => ['math_arithmetic', op]),
        ['math_random_int'],
        ...['EQ', 'NEQ', 'GT', 'LT'].map((op) => ['logic_compare', op]),
        ...['AND', 'OR'].map((op) => ['logic_operation', op]),
        ...[
          'logic_negate',
          'logic_boolean',
          'math_round',
          'math_modulo',
          'math_evenly_divisible',
          'math_number_property',
          'math_trig',
          'math_single',
          'text',
          'text_join',
          'text_charAt',
          'text_length',
          'text_contains',
          'lists_split',
          'math_types'
        ].map((type) => [type])
      ].map(([type, op]) => [type, op])
    )
    assert.deepEqual(
      variableFlyout(workspace)
        .filter((item) => item.kind === 'block')
        .map((item) => item.type),
      ['variables_set', 'math_change', 'boxy_script_variables', 'variables_get']
    )
    assert.deepEqual(
      listFlyout(workspace)
        .filter((item) => item.kind === 'block')
        .map((item) => item.type),
      [
        'lists_push',
        'lists_insert',
        'lists_delete',
        'lists_set',
        'lists_copy',
        'lists_get',
        'lists_length',
        'lists_index',
        'lists_includes',
        'lists_create_with',
        'boxy_list_input'
      ]
    )
    assert.equal(workspace.getVariableMap().getAllVariables().length, 0)
    const control = toolbox.contents.find((category) => category.categorystyle === 'controller')
    assert.equal(
      control.contents.some((item) => ['controls_forEach', 'logic_ternary'].includes(item.type)),
      false
    )
  } finally {
    workspace.dispose()
  }
})

test('text containment returns booleans and splitting has the reference defaults and Array output', () => {
  const workspace = new Blockly.Workspace()
  try {
    const contains = workspace.newBlock('text_contains')
    javascriptGenerator.init(workspace)
    assert.equal(new Function(`return ${javascriptGenerator.blockToCode(contains)[0]}`)(), true)
    contains.getInputTargetBlock('FIND').setFieldValue('missing', 'TEXT')
    assert.equal(new Function(`return ${javascriptGenerator.blockToCode(contains)[0]}`)(), false)
    const split = workspace.newBlock('lists_split')
    assert.equal(split.getField('MODE'), null)
    assert.deepEqual(split.outputConnection.getCheck(), ['Array'])
    assert.deepEqual(new Function(`return ${javascriptGenerator.blockToCode(split)[0]}`)(), [
      'a',
      'b',
      'c'
    ])
    const original = Blockly.serialization.blocks.save(split)
    applyFlyoutPreview(split)
    assert.deepEqual(Blockly.serialization.blocks.save(split), original)
    assert.equal(split.getInputTargetBlock('INPUT').getFieldValue('TEXT'), 'a,b,c')
  } finally {
    workspace.dispose()
  }
})

test('list copying replaces contents, preserves the target reference and safely handles self-copy', () => {
  for (const selfCopy of [false, true]) {
    const workspace = new Blockly.Workspace()
    try {
      const map = workspace.getVariableMap()
      const source = map.createVariable('source', 'Array')
      const target = selfCopy ? source : map.createVariable('target', 'Array')
      const block = workspace.newBlock('lists_copy')
      block.getInputTargetBlock('SOURCE').setFieldValue(source.getId(), 'VAR')
      block.getInputTargetBlock('TARGET').setFieldValue(target.getId(), 'VAR')
      const code = javascriptGenerator.workspaceToCode(workspace)
      const input = [1, 'two', { nested: true }]
      const output = selfCopy ? input : [99]
      new Function('source', 'target', code)(input, output)
      assert.deepEqual(input, [1, 'two', { nested: true }])
      assert.deepEqual(output, input)
      if (!selfCopy) {
        assert.notEqual(output, input)
        assert.equal(output[2], input[2])
        input.push(4)
        assert.equal(output.length, 3)
      }
    } finally {
      workspace.dispose()
    }
  }
})

test('script variables can be assigned, incremented and read without leaking into named variables', () => {
  const workspace = new Blockly.Workspace()
  const restored = new Blockly.Workspace()
  try {
    const declaration = workspace.newBlock('boxy_script_variables')
    const id = declaration.scriptVariables_[0].id
    const output = workspace.getVariableMap().createVariable('result')
    const set = workspace.newBlock('variables_set')
    declaration.nextConnection.connect(set.previousConnection)
    set.getInputTargetBlock('VALUE').setFieldValue(7, 'NUM')
    set.setFieldValue(`script:${id}`, 'VAR')
    const change = workspace.newBlock('math_change')
    set.nextConnection.connect(change.previousConnection)
    change.setFieldValue(`script:${id}`, 'VAR')
    const store = workspace.newBlock('variables_set')
    change.nextConnection.connect(store.previousConnection)
    store.setFieldValue(output.getId(), 'VAR')
    store
      .getInput('VALUE')
      .connection.connect(createScriptVariableReporter(declaration, id).outputConnection)
    declaration.getField(id).setValue('localCount')
    Blockly.serialization.workspaces.load(
      Blockly.serialization.workspaces.save(workspace),
      restored
    )
    const copy = restored.getBlocksByType('boxy_script_variables')[0]
    assert.equal(copy.getFieldValue(id), 'localCount')
    assert.equal(restored.getVariableMap().getAllVariables().length, 1)
    for (const reporter of restored.getBlocksByType('boxy_script_variable')) {
      assert.equal(resolveScriptVariable(reporter).declaration, copy)
    }
    const code = javascriptGenerator.workspaceToCode(restored)
    assert.match(code, /let localCount = 0/)
    assert.equal(new Function(`${code}\nreturn result;`)(), 8)
    restored.getBlocksByType('math_change')[0].setFieldValue('MINUS', 'MODE')
    assert.equal(
      new Function(`${javascriptGenerator.workspaceToCode(restored)}\nreturn result;`)(),
      6
    )
    const options = restored.getBlocksByType('variables_set')[0].getField('VAR').getOptions(false)
    assert.ok(options.some(([name, value]) => name === 'localCount' && value === `script:${id}`))
    const detached = createScriptVariableReporter(copy, id)
    assert.equal(resolveScriptVariable(detached), null)
    javascriptGenerator.init(restored)
    assert.equal(javascriptGenerator.blockToCode(detached)[0], 'null')
  } finally {
    workspace.dispose()
    restored.dispose()
  }
})

test('script variable controls preserve identifiers, support undo and bind copied stacks locally', async () => {
  const workspace = new Blockly.Workspace()
  const flush = () => new Promise((resolve) => setTimeout(resolve, 25))
  try {
    const declaration = workspace.newBlock('boxy_script_variables')
    const firstId = declaration.scriptVariables_[0].id
    declaration.getField('PLUS').showEditor_()
    const secondId = declaration.scriptVariables_[1].id
    assert.deepEqual(
      declaration.scriptVariables_.map(({ name }) => name),
      ['a', 'b']
    )
    const statement = workspace.newBlock('variables_set')
    declaration.nextConnection.connect(statement.previousConnection)
    const reporter = createScriptVariableReporter(declaration, secondId)
    statement.getInput('VALUE').connection.connect(reporter.outputConnection)
    await flush()
    workspace.clearUndo()
    declaration.getField('MINUS').showEditor_()
    await flush()
    assert.equal(resolveScriptVariable(reporter), null)
    assert.equal(declaration.scriptVariables_[0].id, firstId)
    workspace.undo(false)
    await flush()
    assert.equal(resolveScriptVariable(reporter).variable.id, secondId)
    const copy = Blockly.serialization.blocks.append(
      Blockly.serialization.blocks.save(declaration),
      workspace
    )
    const copiedReporter = copy.getNextBlock().getInputTargetBlock('VALUE')
    assert.equal(resolveScriptVariable(copiedReporter).declaration, copy)
    const code = javascriptGenerator.workspaceToCode(workspace)
    assert.doesNotThrow(() => new Function(code))
    assert.equal(workspace.getVariableMap().getAllVariables().length, 0)
  } finally {
    workspace.dispose()
  }
})
