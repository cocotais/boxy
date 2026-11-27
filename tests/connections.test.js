import '../src/blocks/index.js'
import '../src/theme/codemao.renderer.js'

import assert from 'node:assert/strict'
import test from 'node:test'

import * as Blockly from 'blockly'

import {
  CodemaoBlockDragStrategy,
  connectionEffect,
  useCodemaoDragStrategy
} from '../src/theme/codemao.dragging.js'

test('statement previews omit the persistent notch dot while value highlights remain available', () => {
  const Renderer = Blockly.registry.getClass(Blockly.registry.Type.RENDERER, 'codemao')
  const renderer = new Renderer('codemao')
  const { PREVIOUS_STATEMENT, NEXT_STATEMENT, INPUT_VALUE, OUTPUT_VALUE } = Blockly.ConnectionType
  for (const dragging of [false, true]) {
    const connection = (type) => ({ type, getSourceBlock: () => ({ isDragging: () => dragging }) })
    assert.equal(renderer.shouldHighlightConnection(connection(PREVIOUS_STATEMENT)), false)
    assert.equal(renderer.shouldHighlightConnection(connection(NEXT_STATEMENT)), false)
    assert.equal(renderer.shouldHighlightConnection(connection(INPUT_VALUE)), true)
    assert.equal(renderer.shouldHighlightConnection(connection(OUTPUT_VALUE)), !dragging)
  }
})

function browserGlobals(t, reducedMotion = false) {
  for (const [name, value] of Object.entries({
    document: Blockly.utils.xml.textToDom('<svg xmlns="http://www.w3.org/2000/svg"/>')
      .ownerDocument,
    window: { matchMedia: () => ({ matches: reducedMotion }) }
  })) {
    const previous = Object.getOwnPropertyDescriptor(globalThis, name)
    Object.defineProperty(globalThis, name, { configurable: true, writable: true, value })
    t.after(() => {
      if (previous) Object.defineProperty(globalThis, name, previous)
      else delete globalThis[name]
    })
  }
}

test('disconnecting preserves the dragged stack, and modifier-drag heals the original stack', () => {
  for (const heal of [false, true]) {
    const workspace = new Blockly.Workspace()
    try {
      const sounds = []
      workspace.getAudioManager = () => ({ play: (name) => sounds.push(name) })
      const [first, middle, last] = Array.from({ length: 3 }, () =>
        workspace.newBlock('controls_forever')
      )
      first.nextConnection.connect(middle.previousConnection)
      middle.nextConnection.connect(last.previousConnection)
      new CodemaoBlockDragStrategy(middle).disconnectBlock(heal)
      assert.equal(middle.getParent(), null)
      assert.equal(first.getNextBlock(), heal ? last : null)
      assert.equal(middle.getNextBlock(), heal ? null : last)
      assert.deepEqual(sounds, ['disconnect'])
      assert.equal(workspace.getAllBlocks(false).length, 3)
    } finally {
      workspace.dispose()
    }
  }
})

test('custom connection feedback retains native statement and value connections', async (t) => {
  browserGlobals(t, true)
  const workspace = new Blockly.Workspace()
  try {
    const sounds = []
    workspace.scale = 1
    workspace.getAudioManager = () => ({ play: (name) => sounds.push(name) })
    const parent = workspace.newBlock('controls_forever')
    const child = workspace.newBlock('variables_set')
    const value = workspace.newBlock('text')
    let front = 0
    parent.bringToFront = () => front++
    const statement = new CodemaoBlockDragStrategy(child)
    statement.applyConnections({
      local: child.previousConnection,
      neighbour: parent.getInput('DO').connection
    })
    const reporter = new CodemaoBlockDragStrategy(value)
    reporter.applyConnections({
      local: value.outputConnection,
      neighbour: child.getInput('VALUE').connection
    })
    await new Promise((resolve) => setTimeout(resolve, 10))
    assert.equal(parent.getInputTargetBlock('DO'), child)
    assert.equal(child.getInputTargetBlock('VALUE'), value)
    assert.deepEqual(sounds, ['click', 'click'])
    assert.equal(front, 2)
    const state = Blockly.serialization.blocks.save(parent)
    assert.equal(state.inputs.DO.block.inputs.VALUE.block.type, 'text')
    assert.equal(document.querySelectorAll('circle').length, 0)
  } finally {
    workspace.dispose()
  }
})

test('connection pulse matches the measured white dot, timing, offsets and workspace scale', (t) => {
  browserGlobals(t)
  const svg = document.documentElement
  const animations = []
  const create = document.createElementNS.bind(document)
  t.mock.method(document, 'createElementNS', (...args) => {
    const element = create(...args)
    element.animate = (frames, timing) => {
      const animation = { frames, timing }
      animations.push(animation)
      return animation
    }
    return element
  })
  const sounds = []
  const workspace = {
    scale: 1,
    getAudioManager: () => ({ play: (name) => sounds.push(name) }),
    getSvgXY: () => new Blockly.utils.Coordinate(100, 200),
    getParentSvg: () => svg
  }
  const block = { workspace, getSvgRoot: () => svg, RTL: false }
  connectionEffect(block)
  let circle = svg.querySelector('circle')
  assert.equal(circle.getAttribute('fill'), '#fff')
  assert.equal(circle.hasAttribute('stroke'), false)
  assert.equal(circle.getAttribute('cx'), '100')
  assert.equal(circle.getAttribute('cy'), '203')
  assert.deepEqual(animations[0].timing, { duration: 150, easing: 'linear' })
  assert.deepEqual(animations[0].frames, [
    { r: '0px', opacity: 1 },
    { r: '15px', opacity: 0 }
  ])
  animations[0].onfinish()
  assert.equal(svg.querySelector('circle'), null)

  workspace.scale = 1.4
  block.outputConnection = {}
  connectionEffect(block)
  circle = svg.querySelector('circle')
  assert.equal(Number(circle.getAttribute('cx')), 95.8)
  assert.equal(Number(circle.getAttribute('cy')), 218.2)
  assert.equal(animations[1].frames[1].r, '21px')
  animations[1].oncancel()
  assert.equal(svg.querySelector('circle'), null)
  workspace.scale = 0.5
  connectionEffect(block)
  assert.equal(animations.length, 2)
  assert.deepEqual(sounds, ['click', 'click', 'click'])
})

test('theme dragging preserves explicitly installed strategies and handles unfamiliar block types', () => {
  const block = Object.create(Blockly.BlockSvg.prototype)
  block.workspace = {}
  block.setDragStrategy(new Blockly.dragging.BlockDragStrategy(block))
  useCodemaoDragStrategy(block)
  assert.ok(block.dragStrategy instanceof CodemaoBlockDragStrategy)
  const explicit = new (class extends CodemaoBlockDragStrategy {})(block)
  block.setDragStrategy(explicit)
  useCodemaoDragStrategy(block)
  assert.equal(block.dragStrategy, explicit)
})
