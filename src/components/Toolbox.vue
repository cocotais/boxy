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
  this['workspace_'].scale = 0.8 //对，这是覆盖的唯一地方，实现 toolbox 大小锁死。
  let a = 0
  let b = this['workspace_'].getTopBlocks(!1)
  let c = 0
  for (let d = 0, e; (e = b[d]); d++) {
    c = e.getHeightWidth().width
    e.outputConnection && (c -= this['tabWidth_'])
    a = Math.max(a, c)
  }
  for (let d = 0, e; (e = this['buttons_'][d]); d++) a = Math.max(a, e.width)
  a += 1.5 * this['MARGIN'] + this['tabWidth_']
  a *= this['workspace_'].scale
  a += Blockly.Scrollbar.scrollbarThickness
  if (this.width_ !== a) {
    for (let d = 0, e; (e = b[d]); d++) {
      if (this['RTL']) {
        c = e.getRelativeToSurfaceXY().x
        let f = a / this['workspace_'].scale - this['MARGIN']
        e.outputConnection || (f -= this['tabWidth_'])
        e.moveBy(f - c, 0)
      }
      this['rectMap_'].has(e) && this['moveRectToBlock_'](this['rectMap_'].get(e), e)
    }
    if (this['RTL'])
      for (let d = 0, e; (e = this['buttons_'][d]); d++)
        (b = e.getPosition().y),
          e.moveTo(a / this['workspace_'].scale - e.width - this['MARGIN'] - this['tabWidth_'], b)
    this['targetWorkspace'].toolboxPosition !== this['toolboxPosition_'] ||
      this['toolboxPosition_'] !== Blockly.utils.toolbox.Position.LEFT ||
      this['targetWorkspace'].getToolbox() ||
      this['targetWorkspace'].translate(
        this['targetWorkspace'].scrollX + a,
        this['targetWorkspace'].scrollY
      )
    this.width_ = a
    this['position']()
    this['targetWorkspace'].recordDragTargets()
  }
}
</script>

<style>
.blocklyToolboxDiv {
  z-index: 4;
  top: 60px;

  width: 60px;
  padding: 0;

  background: var(--color-bg-2);
}

.blocklyFlyout .blocklyFlyoutBackground {
  fill: var(--color-bg-2);
  fill-opacity: 0;
}

.blocklyFlyout {
  position: absolute;
  z-index: 3;
  transform: translate(-260px, 0);

  overflow: hidden;
  display: block !important;

  width: 320px;
  height: 100vh;

  background: var(--color-bg-2);
  box-shadow: rgb(0 0 0 / 10%) 0 4px 4px 0;

  transition: transform 0.3s cubic-bezier(0, 1, 0, 1);
}

.blocklyFlyoutButtonShadow {
  display: none;
}

.blocklyTreeLabel {
  padding: 3px 0;

  font: 13px sans-serif !important;
  color: var(--color-text-1);
  text-align: center;
  white-space: pre-line;
}

.blocklyTreeRow {
  height: initial;
  margin: 0 4px;
  padding: 0 !important;
  border-radius: 4px;
}

.blocklyTreeRow:not(.blocklyTreeSelected):hover {
  background-color: rgb(var(--primary-1));
}

.blocklyFlyout:hover {
  overflow: visible;
}

.blocklyTreeRowContentContainer {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 11px 0 6px;
}

#app > section > main > div.blocklyDiv > div > svg.blocklyScrollbarVertical.blocklyFlyoutScrollbar {
  display: none;
}
</style>
