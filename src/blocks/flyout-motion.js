import * as Blockly from 'blockly'

import { CodemaoBlockDragStrategy } from '../theme/codemao.dragging.js'

// KittenN slides the entire panel by its width, in both directions.
export const FLYOUT_SLIDE_DURATION = 300
export const FLYOUT_SLIDE_EASING = 'ease-out'

export class SlidingFlyout extends Blockly.VerticalFlyout {
  openingAnimation = null
  closingAnimation = null
  closingGhost = null
  replacingContents = false
  motionEvents = null

  init(workspace) {
    super.init(workspace)
    this.motionEvents = new AbortController()
    const options = { signal: this.motionEvents.signal }
    this.svgGroup_.addEventListener(
      'pointerdown',
      () => {
        // Hold the panel where the pointer grabbed it. Finishing the animation
        // here would move the grabbed block before Blockly can clone it.
        this.openingAnimation?.pause()
        this.workspace_.updateInverseScreenCTM()
      },
      { ...options, capture: true }
    )
    const resume = () => {
      if (this.isVisible() && this.openingAnimation?.playState === 'paused') {
        this.openingAnimation.play()
      }
    }
    window.addEventListener('pointerup', resume, options)
    window.addEventListener('pointercancel', resume, options)
  }

  show(definition) {
    const wasVisible = this.isVisible()
    const reversingTransform = this.closingGhost && getComputedStyle(this.closingGhost).transform
    this.clearClosingAnimation()
    this.replacingContents = true
    try {
      super.show(definition)
      for (const item of this.getContents()) {
        const block = item.getElement()
        if (block instanceof Blockly.BlockSvg) {
          for (const child of block.getDescendants(false).reverse()) child.render()
        }
      }
      this.reflow()
    } finally {
      this.replacingContents = false
    }
    // Changing an open category replaces its contents without sliding again.
    if (wasVisible) return
    this.cancelOpeningAnimation()
    if (this.reduceMotion()) return
    const end = this.svgGroup_.style.transform
    const start =
      reversingTransform || `translate(${this.getX() - this.getWidth()}px,${this.getY()}px)`
    this.openingAnimation = this.svgGroup_.animate(
      [{ transform: start }, { transform: end }],
      this.slideOptions(start, end)
    )
    this.openingAnimation.onfinish = () => {
      this.openingAnimation = null
      this.workspace_.updateInverseScreenCTM()
    }
  }

  hide() {
    if (this.replacingContents) {
      super.hide()
      return
    }
    if (this.isVisible() && !this.reduceMotion()) {
      // Blockly hides the interactive flyout immediately. Its inert copy keeps
      // sliding behind the category rail while the new block is dragged.
      const start = getComputedStyle(this.svgGroup_).transform
      this.clearClosingAnimation()
      const ghost = this.svgGroup_.cloneNode(true)
      ghost.classList.add('boxyFlyoutClosing')
      ghost.setAttribute('aria-hidden', 'true')
      ghost.style.transform = start
      for (const element of ghost.querySelectorAll('[id], [data-id], [tabindex]')) {
        element.removeAttribute('id')
        element.removeAttribute('data-id')
        element.removeAttribute('tabindex')
      }
      this.svgGroup_.parentNode.appendChild(ghost)
      this.closingGhost = ghost
      const end = `translate(${this.getX() - this.getWidth()}px,${this.getY()}px)`
      this.closingAnimation = ghost.animate([{ transform: start }, { transform: end }], {
        ...this.slideOptions(start, end),
        fill: 'forwards'
      })
      this.closingAnimation.onfinish = () => this.clearClosingAnimation()
    }
    this.cancelOpeningAnimation()
    super.hide()
  }

  slideOptions(start, end) {
    // CSS transitions reverse from the current position, with proportionally
    // shorter travel time. Do the same when a category is reopened mid-close.
    const distance = Math.abs(new DOMMatrix(start).m41 - new DOMMatrix(end).m41)
    return {
      duration: FLYOUT_SLIDE_DURATION * Math.min(1, distance / this.getWidth()),
      easing: FLYOUT_SLIDE_EASING
    }
  }

  reduceMotion() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  }

  cancelOpeningAnimation() {
    this.openingAnimation?.cancel()
    this.openingAnimation = null
    this.workspace_?.updateInverseScreenCTM()
  }

  clearClosingAnimation() {
    this.closingAnimation?.cancel()
    this.closingAnimation = null
    this.closingGhost?.remove()
    this.closingGhost = null
  }

  dispose() {
    this.motionEvents?.abort()
    this.cancelOpeningAnimation()
    this.clearClosingAnimation()
    super.dispose()
  }
}

export class SlidingFlyoutDragStrategy extends CodemaoBlockDragStrategy {
  pointerDrag = false

  startDrag(event) {
    this.pointerDrag = !!event && 'clientX' in event
    return super.startDrag(event)
  }

  positionNewBlock(oldBlock, newBlock) {
    const matrix = this.pointerDrag && oldBlock.getSvgRoot().getScreenCTM()
    if (!matrix) {
      super.positionNewBlock(oldBlock, newBlock)
      return
    }
    // Blockly's default conversion reads inline translate(), which contains
    // the final position rather than the currently animated screen position.
    const point = Blockly.utils.svgMath.screenToWsCoordinates(
      newBlock.workspace,
      new Blockly.utils.Coordinate(matrix.e, matrix.f)
    )
    newBlock.moveDuringDrag(point)
  }
}
