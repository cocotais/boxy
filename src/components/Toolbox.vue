<script>
import Blockly from 'blockly'

import superellipse from '../assets/superellipse.svg'

// https://blocklycodelabs.dev/codelabs/custom-toolbox/index.html?index=..%2F..index#0

class ToolCategory extends Blockly.ToolboxCategory {
  /**
   * 类标签选中样式。
   * @method
   * @param {boolean} isSelected
   */
  setSelected = (isSelected) => {
    let labelDom = this.rowDiv_.getElementsByClassName('blocklyTreeLabel')[0]
    if (isSelected) {
      this.rowDiv_.style.backgroundColor = 'rgb(var(--primary-5))'
      labelDom.style.color = 'var(--color-white)'
    } else {
      this.rowDiv_.style.backgroundColor = ''
      labelDom.style.color = ''
    }

    Blockly.utils.aria.setState(this.htmlDiv_, Blockly.utils.aria.State.SELECTED, isSelected)
  }

  /**
   * 创建 iconpark 的 DOM。
   * @method
   * @returns {HTMLElement} 返回一个 iconpark 标签。
   * @private
   */
  createIconDom_ = () => {
    const img = document.createElement('iconpark-icon')
    img.name = this.toolboxItemDef_.categorystyle
    img.size = '21'
    img.style = `
      -webkit-mask-size: 100% 100%;
      -webkit-mask-image: url(${superellipse});
      mask-size: 100% 100%;
      mask-image: url(${superellipse});
      color: white;
    `
    return img
  }

  /**
   * 覆盖 iconpark 的颜色。
   * @param colour
   * @private
   */
  addColourBorder_(colour) {
    this.rowDiv_.children[0].children[0].style.backgroundColor = colour
  }
}

// 注册用户工具箱。
Blockly.registry.register(
  Blockly.registry.Type.TOOLBOX_ITEM,
  Blockly.ToolboxCategory.registrationName,
  ToolCategory,
  true
)

/**
 * 覆盖原始方法。
 * @private
 */
Blockly.VerticalFlyout.prototype['reflowInternal_'] = function () {
  this.workspace_.scale = 0.8 // 实现 toolbox 大小锁死。
  let flyoutWidth = 0
  const blocks = this.workspace_.getTopBlocks(false)
  for (const block of blocks) {
    let width = block.getHeightWidth().width
    if (block.outputConnection) {
      width -= this.tabWidth_
    }
    flyoutWidth = Math.max(flyoutWidth, width)
  }
  for (const button of this.buttons_) {
    flyoutWidth = Math.max(flyoutWidth, button.width)
  }
  flyoutWidth += this.MARGIN * 1.5 + this.tabWidth_
  flyoutWidth *= this.workspace_.scale
  flyoutWidth += Blockly.Scrollbar.scrollbarThickness

  if (this.width_ !== flyoutWidth) {
    for (const block of blocks) {
      if (this.RTL) {
        // With the flyoutWidth known, right-align the blocks.
        const oldX = block.getRelativeToSurfaceXY().x
        let newX = flyoutWidth / this.workspace_.scale - this.MARGIN
        if (!block.outputConnection) {
          newX -= this.tabWidth_
        }
        block.moveBy(newX - oldX, 0)
      }
      if (this.rectMap_.has(block)) {
        this.moveRectToBlock_(this.rectMap_.get(block), block)
      }
    }
    if (this.RTL) {
      // With the flyoutWidth known, right-align the buttons.
      for (const button of this.buttons_) {
        const y = button.getPosition().y
        const x = flyoutWidth / this.workspace_.scale - button.width - this.MARGIN - this.tabWidth_
        button.moveTo(x, y)
      }
    }

    if (
      this.targetWorkspace.toolboxPosition === this.toolboxPosition_ &&
      this.toolboxPosition_ === Blockly.utils.toolbox.Position.LEFT &&
      !this.targetWorkspace.getToolbox()
    ) {
      // This flyout is a simple toolbox. Reposition the workspace so that
      // (0,0) is in the correct position relative to the new absolute edge
      // (ie toolbox edge).
      this.targetWorkspace.translate(
        this.targetWorkspace.scrollX + flyoutWidth,
        this.targetWorkspace.scrollY
      )
    }
    this.width_ = flyoutWidth
    this.position()
    this.targetWorkspace.recordDragTargets()
  }
}
</script>

<style lang="less">
div.injectionDiv {
  > div.blocklyToolboxDiv {
    z-index: 4;
    top: 60px;

    width: 60px;
    padding: 0;

    background: var(--color-bg-2);

    > div > div {
      > div.blocklyTreeRow {
        height: initial;
        margin: 0 4px;
        padding: 0 !important;
        border-radius: 4px;

        > div.blocklyTreeRowContentContainer {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 11px 0 6px;

          > span.blocklyTreeLabel {
            padding: 3px 0;

            font: 13px sans-serif !important;
            color: var(--color-text-1);
            text-align: center;
            white-space: pre-line;
          }
        }
      }

      > div.blocklyTreeRow:not(.blocklyTreeSelected):hover {
        background-color: rgb(var(--primary-1));
      }
    }
  }

  > svg.blocklyFlyout {
    position: absolute;
    z-index: 3;
    transform: translate(-260px, 0);

    overflow: hidden;
    display: block !important;

    width: 320px;
    height: 100vh;

    background: var(--color-bg-2);
    border-right: 1px solid var(--color-border);

    transition: transform cubic-bezier(0, 1, 0, 1) 300ms;

    > path.blocklyFlyoutBackground {
      fill: var(--color-bg-2);
      fill-opacity: 0;
    }

    > g > g > g > rect.blocklyFlyoutButtonShadow {
      display: none;
    }
  }

  > svg.blocklyFlyout:hover {
    overflow: visible;
  }

  > svg.blocklyScrollbarVertical.blocklyFlyoutScrollbar {
    display: none;
  }
}
</style>
