import * as Blockly from 'blockly'

import { SlidingFlyout } from './flyout-motion.js'

const COMPACT_WIDTH = 208
const EXPANDED_WIDTH = 272
const VERTICAL_PADDING = 24

class ToolboxMetricsManager extends Blockly.FlyoutMetricsManager {
  getScrollMetrics(workspaceCoordinates, viewMetrics, contentMetrics) {
    const metrics = super.getScrollMetrics(workspaceCoordinates, viewMetrics, contentMetrics)
    const scale = workspaceCoordinates ? 1 : this.workspace_.scale
    metrics.height += (VERTICAL_PADDING - this.flyout_.MARGIN) * 2 * scale
    return metrics
  }
}

export class FixedScaleFlyout extends SlidingFlyout {
  getFlyoutScale() {
    return 1
  }

  getWidth() {
    return this.targetWorkspace?.boxyCompactFlyout === false ? EXPANDED_WIDTH : COMPACT_WIDTH
  }

  layout_(contents) {
    super.layout_(contents)
    for (const item of contents) {
      item.getElement().moveBy(0, VERTICAL_PADDING - this.MARGIN)
    }
  }

  init(workspace) {
    this.workspace_.setMetricsManager(new ToolboxMetricsManager(this.workspace_, this))
    super.init(workspace)
  }
}
