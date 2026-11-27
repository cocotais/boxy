import * as Blockly from 'blockly'

export const CONNECTION_EFFECT_DURATION = 150
export const CONNECTION_EFFECT_RADIUS = 15

export function connectionEffect(block) {
  const workspace = block.workspace
  workspace.getAudioManager().play('click')
  if (workspace.scale < 1 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

  const point = workspace.getSvgXY(block.getSvgRoot())
  if (block.outputConnection) {
    point.x += (block.RTL ? 3 : -3) * workspace.scale
    point.y += 13 * workspace.scale
  } else point.y += 3 * workspace.scale

  // KittenN expands a small solid white dot, rather than Blockly's grey ring.
  const circle = Blockly.utils.dom.createSvgElement(
    Blockly.utils.Svg.CIRCLE,
    { cx: point.x, cy: point.y, r: 0, fill: '#fff', 'pointer-events': 'none' },
    workspace.getParentSvg()
  )
  const animation = circle.animate(
    [
      { r: '0px', opacity: 1 },
      { r: `${CONNECTION_EFFECT_RADIUS * workspace.scale}px`, opacity: 0 }
    ],
    { duration: CONNECTION_EFFECT_DURATION, easing: 'linear' }
  )
  animation.onfinish = animation.oncancel = () => circle.remove()
}

export class CodemaoBlockDragStrategy extends Blockly.dragging.BlockDragStrategy {
  getTargetBlock() {
    const target = super.getTargetBlock()
    useCodemaoDragStrategy(target)
    return target
  }

  // These two Blockly 13 hooks own only the UI feedback. Connection checking,
  // previews, keyboard placement, event groups and undo stay in the base class.
  disconnectBlock(healStack) {
    this.block.unplug(healStack)
    this.workspace.getAudioManager().play('disconnect')
  }

  applyConnections({ local, neighbour }) {
    local.connect(neighbour)
    const connected = (local.isSuperior() ? neighbour : local).getSourceBlock()
    const root = this.block.getRootBlock()
    Blockly.renderManagement.finishQueuedRenders().then(() => {
      if (!connected.isDeadOrDying()) connectionEffect(connected)
      setTimeout(() => {
        if (!root.isDeadOrDying()) root.bringToFront()
      }, 0)
    })
  }
}

export function useCodemaoDragStrategy(block) {
  // Blockly 13 has no strategy getter/registry. Replace only its default;
  // explicit strategies (such as dragging a loop variable) remain in charge.
  if (
    block instanceof Blockly.BlockSvg &&
    block.dragStrategy.constructor === Blockly.dragging.BlockDragStrategy
  )
    block.setDragStrategy(new CodemaoBlockDragStrategy(block))
}

export function positionFieldReporter(block, field) {
  const rect = field.getSvgRoot().getBoundingClientRect()
  useCodemaoDragStrategy(block)
  block.render()
  const point = Blockly.utils.svgMath.screenToWsCoordinates(
    block.workspace,
    new Blockly.utils.Coordinate(rect.x, rect.y)
  )
  block.moveBy(point.x, point.y)
  return block
}

class FieldReporterDragStrategy extends CodemaoBlockDragStrategy {
  constructor(block, createReporter) {
    super(block)
    this.createReporter = createReporter
    this.fieldName = null
  }

  getTargetBlock() {
    const name = this.fieldName
    this.fieldName = null
    const field = name && !this.block.workspace.isFlyout && this.block.getField(name)
    const copy = field && this.createReporter(this.block, name)
    return copy ? positionFieldReporter(copy, field) : super.getTargetBlock()
  }
}

// Any reporter-role field can drag out its bound value. Definitions supply only
// the model factory; hit testing, flyout behavior and placement are shared.
export function installFieldReporterDrag(block, createReporter) {
  if (block.dragStrategy instanceof FieldReporterDragStrategy) return
  const strategy = new FieldReporterDragStrategy(block, createReporter)
  block.setDragStrategy(strategy)
  block.getSvgRoot().addEventListener('pointerdown', (event) => {
    const target = event.target.closest('[data-boxy-reporter]')
    // Blockly initializes a newly appended field's SVG before assigning its
    // name. Resolve the live field on pointerdown instead of caching that name.
    const field =
      target &&
      block.inputList
        .flatMap((input) => input.fieldRow)
        .find((field) => field.getSvgRoot() === target)
    strategy.fieldName = field?.name ?? null
  })
}

export class CodemaoDragger extends Blockly.dragging.Dragger {
  constructor(draggable) {
    super(draggable)
    useCodemaoDragStrategy(draggable)
  }
}
