import '../src/blocks/index.js'

import assert from 'node:assert/strict'
import test from 'node:test'

import * as Blockly from 'blockly'

import { parameterButton } from '../src/blocks/mutations.js'
import { describeBlock, isValueContainer } from '../src/theme/codemao.layout.js'
import { CustomConstantsProvider } from '../src/theme/codemao.renderer.js'
import { valueContainerDefinitions } from './fixtures/value-containers.js'

Blockly.defineBlocksWithJsonArray(valueContainerDefinitions)

function draw(block) {
  const Renderer = Blockly.registry.getClass(Blockly.registry.Type.RENDERER, 'codemao')
  const renderer = new Renderer('codemao')
  const constants = renderer.makeConstants_()
  constants.init()
  renderer.getConstants = () => constants
  // Supply browser measurements to real Blockly models. The renderer still
  // measures rows, draws the outline and positions both connection types.
  block.getIcons = () => []
  for (const field of block.inputList.flatMap((input) => input.fieldRow)) {
    field.getSize = () => ({
      width: field.boxyParameterButton ? 20 : field.getText().length * 16,
      height: 16
    })
    field.getTextElement = () => null
  }
  for (const connection of block.getConnections_(true)) {
    connection.isHighlighted = () => false
    connection.getInsertionMarker = () => null
    connection.setOffsetInBlock = (x, y) => (connection.offset = { x, y })
    connection.getOffsetInBlock = () => connection.offset
  }
  const info = renderer.makeRenderInfo_(block)
  info.measure()
  const drawer = renderer.makeDrawer_(block, info)
  drawer.drawOutline_()
  assert.doesNotMatch(drawer.outlinePath_, /NaN|undefined|Infinity/)
  return { info, drawer, path: drawer.outlinePath_ }
}

test('value containers derive from visible connections, independent of type and input names', () => {
  const workspace = new Blockly.Workspace()
  try {
    const block = workspace.newBlock('blocks_group')
    assert.equal(describeBlock(block).valueContainer, true)
    assert.equal(describeBlock(block).statementLayout, true)
    assert.equal(describeBlock(block).minimumWidth, 110)
    block.getInput('BLOCK').name = 'UNFAMILIAR_BODY'
    block.setOutput(true, 'String')
    assert.equal(describeBlock(block).valueContainer, true)
    block.getInput('UNFAMILIAR_BODY').setVisible(false)
    assert.equal(describeBlock(block).valueContainer, false)
    assert.equal(describeBlock(block).statementLayout, false)
    block.getInput('UNFAMILIAR_BODY').setVisible(true)
    block.setOutput(false)
    assert.equal(describeBlock(block).valueContainer, false)
    assert.equal(describeBlock(workspace.newBlock('controls_forever')).valueContainer, false)
    assert.equal(describeBlock(workspace.newBlock('math_number')).valueContainer, false)
  } finally {
    workspace.dispose()
  }
})

test('both ends resolve container geometry from structure without altering ordinary value shapes', () => {
  const workspace = new Blockly.Workspace()
  const constants = new CustomConstantsProvider()
  constants.init()
  try {
    assert.equal(isValueContainer(null), false)
    const consumer = workspace.newBlock('specimen_value_consumer')
    const input = consumer.getInput('VALUE').connection
    const ordinary = constants.shapeFor(input)
    for (const type of ['blocks_group', 'specimen_value_branches']) {
      const group = workspace.newBlock(type)
      input.connect(group.outputConnection)
      for (const connection of [input, group.outputConnection]) {
        const shape = constants.shapeFor(connection)
        assert.equal(shape.valueContainer, true)
        assert.equal(shape.connectionOffsetY(180), 0)
        assert.equal(shape.width(180), 18)
      }
      input.disconnect()
      assert.equal(constants.shapeFor(input), ordinary)
    }
    const group = workspace.newBlock('blocks_group')
    input.connect(group.outputConnection)
    group.getInput('BLOCK').setVisible(false)
    assert.equal(constants.shapeFor(input), ordinary)
    assert.equal(constants.shapeFor(group.outputConnection), ordinary)
    assert.equal(ordinary.connectionOffsetY(180), 90)
    assert.equal(ordinary.width(80), 40)
    assert.equal(ordinary.valueContainer, undefined)
  } finally {
    workspace.dispose()
  }
})

test('value containers keep fixed caps and statement offsets as their body grows, including RTL', () => {
  const workspace = new Blockly.Workspace()
  try {
    const block = workspace.newBlock('blocks_group')
    const empty = draw(block)
    assert.equal(empty.info.width, 110)
    assert.equal(empty.info.height, 80)
    assert.equal(empty.info.outputConnection.width, 18)
    assert.deepEqual(block.outputConnection.offset, { x: 0, y: 0 })
    assert.deepEqual(block.getInput('BLOCK').connection.offset, { x: 16, y: 40 })
    const headerX = empty.info.inputRows[0].elements.find((e) => e.field).xPos

    const child = workspace.newBlock('controls_forever')
    child.getHeightWidth = () => ({ width: 160, height: 120 })
    block.getInput('BLOCK').connection.connect(child.previousConnection)
    const expanded = draw(block)
    assert.equal(expanded.info.height, 180)
    assert.equal(expanded.info.outputConnection.width, 18)
    assert.equal(expanded.info.width, empty.info.width)
    assert.equal(expanded.info.inputRows[0].elements.find((e) => e.field).xPos, headerX)
    assert.deepEqual(block.outputConnection.offset, { x: 0, y: 0 })
    assert.deepEqual(block.getInput('BLOCK').connection.offset, { x: 16, y: 40 })
    assert.match(expanded.path, /a 18,18/)
    assert.equal(block.getInputTargetBlock('BLOCK'), child)

    block.RTL = true
    draw(block)
    assert.deepEqual(block.getInput('BLOCK').connection.offset, { x: -16, y: 40 })
    assert.equal(Math.abs(block.outputConnection.offset.x), 0)
    assert.equal(block.outputConnection.offset.y, 0)
  } finally {
    workspace.dispose()
  }
})

test('flyout value containers use compact cavities and arms without changing their model', () => {
  const flyout = new (class extends Blockly.Workspace {
    get isFlyout() {
      return true
    }
  })()
  try {
    const block = flyout.newBlock('blocks_group')
    const state = Blockly.serialization.blocks.save(block)
    const { info, path } = draw(block)
    assert.equal(info.height, 60)
    assert.equal(info.outputConnection.width, 18)
    assert.equal(info.inputRows.find((row) => row.hasStatement).height, 8)
    assert.match(path, /56,54/)
    assert.deepEqual(block.getInput('BLOCK').connection.offset, { x: 16, y: 40 })
    assert.deepEqual(block.outputConnection.offset, { x: 0, y: 0 })
    assert.deepEqual(Blockly.serialization.blocks.save(block), state)
  } finally {
    flyout.dispose()
  }
})

test('container connection highlights share the upper origin on both sides of a value input', () => {
  const workspace = new Blockly.Workspace()
  try {
    const group = workspace.newBlock('blocks_group')
    const measured = draw(group)
    const highlight = (connection, path, offset, rtl) => ({ connection, path, offset, rtl })
    group.pathObject = { addConnectionHighlight: highlight }
    const output = measured.drawer.drawConnectionHighlightPath(measured.info.outputConnection)
    assert.equal(output.connection, group.outputConnection)
    assert.deepEqual(output.offset, { x: 0, y: 0 })
    assert.match(output.path, /^M 18,0 /)

    const consumer = workspace.newBlock('specimen_value_consumer')
    group.getHeightWidth = () => ({ width: measured.info.width, height: measured.info.height })
    consumer.getInput('VALUE').connection.connect(group.outputConnection)
    consumer.pathObject = { addConnectionHighlight: highlight }
    const parent = draw(consumer)
    const input = parent.info.inputRows.flatMap((row) => row.elements).find((e) => e.input)
    parent.drawer.positionInlineInputConnection_(input)
    const socket = parent.drawer.drawConnectionHighlightPath(input)
    assert.equal(socket.connection, consumer.getInput('VALUE').connection)
    assert.equal(socket.offset.y, input.centerline - input.height / 2)
    assert.match(socket.path, /^M 18,0 /)
    assert.equal(socket.rtl, consumer.RTL)
  } finally {
    workspace.dispose()
  }
})

test('value containers retain simultaneous value and statement connections through serialization', () => {
  const workspace = new Blockly.Workspace()
  try {
    const group = workspace.newBlock('blocks_group')
    const statement = workspace.newBlock('controls_forever')
    const consumer = workspace.newBlock('variables_set')
    group.getInput('BLOCK').connection.connect(statement.previousConnection)
    consumer.getInput('VALUE').connection.connect(group.outputConnection)
    const state = Blockly.serialization.blocks.save(consumer)
    const restored = Blockly.serialization.blocks.append(state, workspace)
    const restoredGroup = restored.getInputTargetBlock('VALUE')
    assert.equal(restoredGroup.type, 'blocks_group')
    assert.equal(restoredGroup.getInputTargetBlock('BLOCK').type, 'controls_forever')
    assert.deepEqual(restoredGroup.outputConnection.getCheck(), ['Array'])
    assert.equal(restoredGroup.previousConnection, null)
    assert.equal(restoredGroup.nextConnection, null)
  } finally {
    workspace.dispose()
  }
})

test('multi-row value container headers include every row before each cavity', () => {
  const workspace = new Blockly.Workspace()
  try {
    const block = workspace.newBlock('specimen_value_branches')
    const { info, path } = draw(block)
    const statements = info.inputRows.filter((row) => row.hasStatement)
    assert.equal(statements.length, 2)
    assert.equal(info.height, 180)
    for (const row of statements) {
      assert.equal(row.xPos + row.statementEdge, 16)
      assert.equal(row.height, 20)
    }
    const headerWidth =
      Math.max(
        ...info.inputRows
          .filter((row) => row.yPos < statements[0].yPos)
          .map((row) => row.boxyNaturalWidth)
      ) + info.startX
    assert.ok(path.includes(` 1 ${headerWidth},20`))
  } finally {
    workspace.dispose()
  }
})

test('connected value containers retain the parent socket without changing its binding', () => {
  const workspace = new Blockly.Workspace()
  try {
    const consumer = workspace.newBlock('specimen_value_consumer')
    const group = workspace.newBlock('blocks_group')
    group.getHeightWidth = () => ({ width: 110, height: 80 })
    consumer.getInput('VALUE').connection.connect(group.outputConnection)
    const outlines = new Map()
    consumer.pathObject = { setOutlinePath: (name, path) => outlines.set(name, path) }
    const { info, drawer } = draw(consumer)
    const input = info.inputRows.flatMap((row) => row.elements).find((element) => element.input)
    drawer.drawInlineInput_(input)
    assert.ok(outlines.get('VALUE'))
    assert.doesNotMatch(outlines.get('VALUE'), /NaN|undefined|Infinity/)
    assert.match(outlines.get('VALUE'), /A 18,18/)
    assert.equal(input.connectedBlock, group)
    assert.equal(consumer.getInputTargetBlock('VALUE'), group)
    const top = input.centerline - input.height / 2
    assert.deepEqual(consumer.getInput('VALUE').connection.offset, { x: input.xPos, y: top })

    group.getHeightWidth = () => ({ width: 110, height: 180 })
    const taller = draw(consumer)
    taller.drawer.drawInlineInput_(
      taller.info.inputRows.flatMap((row) => row.elements).find((element) => element.input)
    )
    assert.match(outlines.get('VALUE'), /A 18,18/)
    assert.doesNotMatch(outlines.get('VALUE'), /A 48,48/)
    const tallerInput = taller.info.inputRows
      .flatMap((row) => row.elements)
      .find((element) => element.input)
    assert.equal(tallerInput.connectionOffsetY, 0)
    assert.equal(consumer.getInput('VALUE').connection.offset.y, top)

    // Ordinary reporters continue to cover their socket completely.
    outlines.clear()
    const ordinary = workspace.newBlock('lists_create_with')
    ordinary.getHeightWidth = () => ({ width: 110, height: 36 })
    consumer.getInput('VALUE').connection.connect(ordinary.outputConnection)
    const normal = draw(consumer)
    normal.drawer.drawInlineInput_(
      normal.info.inputRows.flatMap((row) => row.elements).find((element) => element.input)
    )
    assert.equal(outlines.size, 0)
    assert.equal(
      ordinary.getHeightWidth().height / 2,
      normal.info.inputRows[0].getLastInput().connectionOffsetY
    )
  } finally {
    workspace.dispose()
  }
})

test('value containers reuse the control footer padding for trailing parameter buttons', () => {
  const workspace = new Blockly.Workspace()
  try {
    const block = workspace.newBlock('blocks_group')
    const button = parameterButton('+', 'add', () => {})
    block.appendDummyInput('ACTIONS').appendField(button)
    const { info } = draw(block)
    const element = info.inputRows.flatMap((row) => row.elements).find((e) => e.field === button)
    assert.equal(element.xPos, 52)
    assert.deepEqual(block.getInput('BLOCK').connection.offset, { x: 16, y: 40 })
  } finally {
    workspace.dispose()
  }
})

test('socket backgrounds created after a child render below the child and fields', () => {
  const Renderer = Blockly.registry.getClass(Blockly.registry.Type.RENDERER, 'codemao')
  const renderer = new Renderer('codemao')
  const root = Blockly.utils.xml.textToDom('<svg xmlns="http://www.w3.org/2000/svg"/>')
  const previous = Object.getOwnPropertyDescriptor(globalThis, 'document')
  Object.defineProperty(globalThis, 'document', {
    configurable: true,
    value: root.ownerDocument
  })
  try {
    const paths = renderer.makePathObject(root, { colourSecondary: '#eb930d' })
    const content = root.ownerDocument.createElementNS(root.namespaceURI, 'g')
    root.appendChild(content)
    paths.setOutlinePath('VALUE', 'M0,0H110V80H0Z')
    const background = paths.getOutlinePath('VALUE')
    assert.equal(root.firstChild, paths.svgPath)
    assert.equal(background.nextSibling, content)
    assert.equal(background.getAttribute('fill'), '#eb930d')
  } finally {
    if (previous) Object.defineProperty(globalThis, 'document', previous)
    else delete globalThis.document
  }
})
