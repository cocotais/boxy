import '../src/blocks/index.js'

import assert from 'node:assert/strict'
import test from 'node:test'

import * as Blockly from 'blockly'

import { applyFlyoutPreview } from '../src/blocks/flyout.js'
import { parameterButton } from '../src/blocks/mutations.js'
import { describeBlock, initStartHat, isLiteral } from '../src/theme/codemao.layout.js'

// Deliberately unfamiliar types, field names and input names. Geometry must
// depend on structure; it must not require registering another renderer case.
Blockly.defineBlocksWithJsonArray([
  {
    type: 'specimen_scalar',
    message0: '%1',
    args0: [{ type: 'field_number', name: 'QUANTITY', value: 42 }],
    output: 'Number'
  },
  {
    type: 'specimen_gate',
    message0: '如果 %1',
    args0: [{ type: 'input_value', name: 'WHEN', check: 'Boolean' }],
    message1: '%1',
    args1: [{ type: 'input_statement', name: 'BODY' }],
    previousStatement: null,
    nextStatement: null,
    inputsInline: true
  },
  { type: 'specimen_empty', message0: ' ', output: 'Boolean' }
])

test('literal and reporter classification follows visible structure, including hidden fields', () => {
  const workspace = new Blockly.Workspace()
  try {
    const block = workspace.newBlock('specimen_scalar')
    assert.equal(isLiteral(block), true)
    assert.equal(describeBlock(block).singleField, block.getField('QUANTITY'))
    const hidden = new Blockly.FieldLabel('metadata')
    block.appendDummyInput('INTERNAL').appendField(hidden)
    hidden.setVisible(false)
    assert.equal(isLiteral(block), true)
    block.appendValueInput('OTHER')
    assert.equal(isLiteral(block), false)
    assert.equal(describeBlock(block).singleField, null)
    block.getInput('OTHER').setVisible(false)
    assert.equal(isLiteral(block), true)
    block.appendStatementInput('BODY')
    assert.equal(isLiteral(block), false)
    assert.equal(describeBlock(block).singleField, null)
  } finally {
    workspace.dispose()
  }
})

test('control footer is an action-only input after a cavity, independent of input names', () => {
  const workspace = new Blockly.Workspace()
  try {
    const block = workspace.newBlock('specimen_gate')
    assert.equal(describeBlock(block).footer, null)
    block.appendDummyInput('HEADER_ACTIONS').appendField(parameterButton('+', 'add', () => {}))
    block.moveInputBefore('HEADER_ACTIONS', 'BODY')
    assert.equal(describeBlock(block).footer, null)
    const footer = block
      .appendDummyInput('ACTIONS')
      .appendField(parameterButton('+', 'add', () => {}))
    assert.equal(describeBlock(block).footer, footer)
    footer.setVisible(false)
    assert.equal(describeBlock(block).footer, null)
    footer.setVisible(true)
    footer.appendField('content')
    assert.equal(describeBlock(block).footer, null)
  } finally {
    workspace.dispose()
  }
})

test('empty Boolean sockets and predicate previews derive from connection and field roles', () => {
  const workspace = new Blockly.Workspace()
  try {
    const block = workspace.newBlock('specimen_empty')
    assert.equal(describeBlock(block).emptyBoolean, false)
    block.setShadow(true)
    assert.equal(describeBlock(block).emptyBoolean, true)
    block.appendDummyInput('LABEL').appendField('condition')
    assert.equal(describeBlock(block).emptyBoolean, false)
    const predicate = workspace.newBlock('logic_negate')
    assert.equal(describeBlock(predicate).unaryBoolean, true)
    const value = predicate.getInput('BOOL')
    value.name = 'UNFAMILIAR_INPUT'
    assert.equal(describeBlock(predicate).unaryBoolean, true)
    value.setCheck('Number')
    assert.equal(!!describeBlock(predicate).unaryBoolean, false)
    assert.equal(describeBlock(workspace.newBlock('math_number_property')).predicateSelector, true)
  } finally {
    workspace.dispose()
  }
})

test('custom definitions carry compact preview semantics and clone back to complete inputs', () => {
  Blockly.Blocks.specimen_operator = { ...Blockly.Blocks.math_arithmetic }
  const workspace = new Blockly.Workspace()
  try {
    const block = workspace.newBlock('specimen_operator')
    const original = Blockly.serialization.blocks.save(block)
    applyFlyoutPreview(block)
    assert.equal(block.getInput('A').isVisible(), false)
    assert.equal(block.getInput('B').isVisible(), false)
    assert.ok(block.getInput('BOXY_FLYOUT_PREVIEW'))
    assert.deepEqual(Blockly.serialization.blocks.save(block), original)
    const copy = Blockly.serialization.blocks.append(original, workspace)
    assert.equal(copy.getInput('A').isVisible(), true)
    assert.equal(copy.getInputTargetBlock('A').isShadow(), true)
    assert.equal(copy.getInput('BOXY_FLYOUT_PREVIEW'), null)
  } finally {
    workspace.dispose()
    delete Blockly.Blocks.specimen_operator
  }
})

test('a root hat declares a body tail independently of concrete type and input names', () => {
  const workspace = new Blockly.Workspace()
  try {
    const block = workspace.newBlock('specimen_gate')
    initStartHat(block, {
      body: 'BODY',
      icon: { viewBox: '0 0 10 10', fill: 'currentColor', content: '<circle r="4"/>' }
    })
    // A head cannot also have a preceding statement or a value output.
    assert.equal(describeBlock(block).hat, null)
    block.setPreviousStatement(false)
    block.setNextStatement(false)
    assert.equal(describeBlock(block).tail, block.getInput('BODY'))
    block.getInput('BODY').setVisible(false)
    assert.equal(describeBlock(block).tail, null)
    assert.equal(describeBlock(block).hat, block.boxyHat)
    block.setOutput(true)
    assert.equal(describeBlock(block).hat, null)
    assert.equal(describeBlock(block).tail, null)
  } finally {
    workspace.dispose()
  }
})

test('unfamiliar blocks resolve workspace and preview geometry from their structure', () => {
  const workspace = new Blockly.Workspace()
  const flyout = new (class extends Blockly.Workspace {
    get isFlyout() {
      return true
    }
  })()
  try {
    const regular = workspace.newBlock('specimen_gate')
    const preview = flyout.newBlock('specimen_gate')
    const layout = describeBlock(regular)
    const compact = describeBlock(preview)
    assert.equal(layout.minimumWidth, 110)
    assert.equal(layout.metrics.cavityHeight, 20)
    assert.equal(layout.metrics.cavityRadius, 2)
    assert.equal(compact.minimumWidth, 0)
    assert.equal(compact.metrics.controlMin, 80)
    assert.equal(compact.metrics.cavityHeight, 8)
    assert.equal(compact.metrics.cavityRadius, 0)
    regular.appendDummyInput('OPERATIONS').appendField(parameterButton('+', 'add', () => {}))
    assert.equal(describeBlock(regular).armWidth, 72)
    regular.setInsertionMarker(true)
    assert.equal(describeBlock(regular).footer, null)
    assert.equal(describeBlock(regular).armWidth, 70)
    preview.setNextStatement(false)
    assert.equal(describeBlock(preview).minimumWidth, 110)
    const value = flyout.newBlock('specimen_scalar')
    assert.equal(describeBlock(value).minimumWidth, 0)
    value.setShadow(true)
    assert.equal(describeBlock(value).rowHeight, 28)
    assert.equal(describeBlock(value).reporterInset, 0)
  } finally {
    workspace.dispose()
    flyout.dispose()
  }
})
