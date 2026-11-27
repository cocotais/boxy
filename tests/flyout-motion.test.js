import assert from 'node:assert/strict'
import test from 'node:test'

import * as Blockly from 'blockly'

import { SlidingFlyoutDragStrategy } from '../src/blocks/flyout-motion.js'

function workspace(scale, left = 0, top = 0, originX = 60, originY = 0) {
  return {
    scale,
    getInjectionDiv: () => ({ getBoundingClientRect: () => ({ left, top }) }),
    getOriginOffsetInPixels: () => new Blockly.utils.Coordinate(originX, originY)
  }
}

test('a pointer clone uses the visible animated origin at a different workspace zoom', () => {
  const oldBlock = {
    getSvgRoot: () => ({ getScreenCTM: () => ({ e: 23.856586456298828, f: 8 }) }),
    getRelativeToSurfaceXY: () => assert.fail('must not read the final inline position')
  }
  let placed
  const newBlock = {
    workspace: workspace(0.7),
    moveDuringDrag: (point) => {
      placed = point
    }
  }
  SlidingFlyoutDragStrategy.prototype.positionNewBlock.call(
    { pointerDrag: true },
    oldBlock,
    newBlock
  )
  assert.ok(Math.abs(placed.x * 0.7 + 60 - 23.856586456298828) < 0.0001)
  assert.ok(Math.abs(placed.y * 0.7 - 8) < 0.0001)
})

test('keyboard placement retains Blockly native workspace coordinate conversion', () => {
  const oldBlock = {
    workspace: workspace(1, 20, 40),
    getRelativeToSurfaceXY: () => new Blockly.utils.Coordinate(12, 8),
    getSvgRoot: () => assert.fail('keyboard placement must not depend on an animated DOM element')
  }
  let placed
  const newBlock = {
    workspace: workspace(0.7, 20, 40),
    moveDuringDrag: (point) => {
      placed = point
    }
  }
  SlidingFlyoutDragStrategy.prototype.positionNewBlock.call(
    { pointerDrag: false },
    oldBlock,
    newBlock
  )
  assert.ok(Math.abs(placed.x - 12 / 0.7) < 0.0001)
  assert.ok(Math.abs(placed.y - 8 / 0.7) < 0.0001)
})
