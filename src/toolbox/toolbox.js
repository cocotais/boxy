import Blockly from "blockly";

import superellipse from "../icon/category/superellipse.svg";

// https://blocklycodelabs.dev/codelabs/custom-toolbox/index.html?index=..%2F..index#0

class BoxyCategory extends Blockly.ToolboxCategory {
  /**
   * 用户工具箱类标签
   * @constructor
   */
  constructor(categoryDef, toolbox, opt_parent) {
    super(categoryDef, toolbox, opt_parent);
  }

  /**
   * 类标签选中样式。
   * @method
   * @param {boolean} isSelected
   */
  setSelected = (isSelected) => {
    let labelDom = this.rowDiv_.getElementsByClassName("blocklyTreeLabel")[0];
    if (isSelected) {
      this.rowDiv_.style.backgroundColor = "var(--toolbox-category-background-selected)";
      labelDom.style.color = "var(--toolbox-category-color-selected)";
    } else {
      this.rowDiv_.style.backgroundColor = "";
      labelDom.style.color = "";
    }

    Blockly.utils.aria.setState(this.htmlDiv_, Blockly.utils.aria.State.SELECTED, isSelected);
  };

  /**
   * 创建iconpark的DOM。
   * @method
   * @returns {HTMLElement} 返回一个iconpark标签
   * @private
   */
  createIconDom_ = () => {
    const img = document.createElement("iconpark-icon");
    img.name = this.toolboxItemDef_.categorystyle;
    img.size = "21";
    img.style = `
      -webkit-mask-size: 100% 100%;
      -webkit-mask-image: url(${superellipse});
      mask-size: 100% 100%;
      mask-image: url(${superellipse});
      color: white;
    `;
    return img;
  };

  /**
   * 覆盖 iconpark 的颜色
   * @param colour
   * @private
   */
  addColourBorder_(colour) {
    this.rowDiv_.children[0].children[0].style.backgroundColor = colour;
  }
}

class BoxyToolbox {
  /**
   * 工具箱
   * @constructor
   */
  constructor() {
    this.ariaElements = document.getElementsByClassName("blocklyToolboxCategory");
  }

  /**
   * 注册类标签
   * @method
   */
  load = () => {
    Blockly.registry.register(
      Blockly.registry.Type.TOOLBOX_ITEM,
      Blockly.ToolboxCategory.registrationName,
      BoxyCategory,
      true
    );
  };

  /**
   * 修复aira-level不符合规范的问题。
   * @method
   */
  ariaFix = () => {
    Array.prototype.forEach.call(this.ariaElements, function (element) {
      element.setAttribute("aria-level", "1");
    });
  };
}

let toolbox = new BoxyToolbox();
toolbox.load();
export default toolbox;
