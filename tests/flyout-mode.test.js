import '../src/blocks/index.js'
import '../src/generators/javascript.js'

import assert from 'node:assert/strict'
import test from 'node:test'

import * as Blockly from 'blockly'

import toolbox from '../src/assets/toolbox.json' with { type: 'json' }
import { applyFlyoutPreview, filterFlyoutContents } from '../src/blocks/flyout.js'
import zh from '../src/msg/zh.json' with { type: 'json' }
import { describeBlock } from '../src/theme/codemao.layout.js'
import { contextMetrics, isCompactPreview } from '../src/theme/codemao.style.js'

Blockly.setLocale(zh)

test('expanded flyouts retain compact geometry while revealing editable definitions and controls', () => {
  const workspace = new Blockly.Workspace()
  const flyout = new (class extends Blockly.Workspace {
    get isFlyout() {
      return true
    }
  })()
  flyout.targetWorkspace = workspace
  try {
    assert.equal(isCompactPreview(flyout.newBlock('text_join')), true)
    workspace.boxyCompactFlyout = false
    const join = flyout.newBlock('text_join')
    const before = Blockly.serialization.blocks.save(join)
    applyFlyoutPreview(join, isCompactPreview(join))
    assert.equal(join.getInput('ADD0').isVisible(), true)
    assert.equal(join.getInput('ADD1').isVisible(), true)
    assert.equal(join.getField('PLUS').isVisible(), true)
    assert.equal(join.getField('MINUS').isVisible(), true)
    assert.deepEqual(Blockly.serialization.blocks.save(join), before)
    const loop = flyout.newBlock('controls_for')
    applyFlyoutPreview(loop, false)
    assert.equal(loop.getInput('CURRENT').isVisible(), true)
    assert.equal(loop.getInput('BY').isVisible(), false)
    assert.equal(loop.getInput('STEP_BUTTON').isVisible(), true)
    assert.equal(describeBlock(loop).metrics.cavityHeight, 8)
    assert.equal(contextMetrics(join).fieldHeight, 28)
    assert.equal(contextMetrics(join).reporterHeight, 34)
    assert.equal(contextMetrics(workspace.newBlock('text_join')).fieldHeight, 30)
    const conditional = flyout.newBlock('controls_if')
    applyFlyoutPreview(conditional, false)
    assert.equal(describeBlock(conditional).armWidth, 47)
    assert.equal(contextMetrics(conditional).actionPadding, 32)
    assert.equal(contextMetrics(workspace.newBlock('controls_if')).actionPadding, 52)
    const operator = flyout.newBlock('math_arithmetic')
    applyFlyoutPreview(operator, false)
    assert.equal(operator.getInput('A').isVisible(), false)
    assert.ok(operator.getInput('BOXY_FLYOUT_PREVIEW'))
  } finally {
    flyout.dispose()
    workspace.dispose()
  }
})

test('both flyout modes clone all presets into the same complete workspace models', () => {
  for (const compact of [true, false]) {
    const source = new Blockly.Workspace()
    const target = new Blockly.Workspace()
    try {
      for (const category of toolbox.contents) {
        for (const item of filterFlyoutContents(category.contents, compact)) {
          if (item.kind !== 'block') continue
          const block = Blockly.serialization.blocks.append(item, source)
          if (typeof block.getProcedureDef === 'function') block.setFieldValue('测试函数', 'NAME')
          const original = Blockly.serialization.blocks.save(block)
          applyFlyoutPreview(block, compact)
          assert.deepEqual(Blockly.serialization.blocks.save(block), original, item.type)
          const clone = Blockly.serialization.blocks.append(original, target)
          assert.equal(clone.getInput('BOXY_FLYOUT_PREVIEW'), null, item.type)
          assert.deepEqual(
            Blockly.serialization.blocks.save(clone, { saveIds: false }),
            Blockly.serialization.blocks.save(block, { saveIds: false }),
            item.type
          )
        }
      }
    } finally {
      source.dispose()
      target.dispose()
    }
  }
})

test('expanded mode exposes the additional power and comparison presets without changing dynamic categories', () => {
  const contents = toolbox.contents.find(
    (category) => category.categorystyle === 'calculation'
  ).contents
  assert.deepEqual(
    filterFlyoutContents(contents, false)
      .filter((item) => item.expandedOnly)
      .map((item) => item.fields.OP),
    ['POWER', 'GTE', 'LTE']
  )
  assert.equal(
    filterFlyoutContents(contents, true).some((item) => item.expandedOnly),
    false
  )
  assert.equal(filterFlyoutContents('VARIABLE', false), 'VARIABLE')
})
