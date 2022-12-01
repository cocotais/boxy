import Blockly from "blockly";

import superellipse from "../icon/category/superellipse.svg";

// https://blocklycodelabs.dev/codelabs/custom-toolbox/index.html?index=..%2F..index#0

class BoxyCategory extends Blockly.ToolboxCategory {
  constructor(categoryDef, toolbox, opt_parent) {
    super(categoryDef, toolbox, opt_parent);
  }

  addColourBorder_ = (colour) => {
    this.rowDiv_.style.backgroundColor = colour;
  };

  setSelected = (isSelected) => {
    let labelDom = this.rowDiv_.getElementsByClassName("blocklyTreeLabel")[0];
    if (isSelected) {
      this.rowDiv_.style.backgroundColor = "var(--toolbox-background)";
      labelDom.style.color = "var(--toolbox-color)";
    } else {
      this.rowDiv_.style.backgroundColor = "var(--toolbox-background)";
      labelDom.style.color = "var(--toolbox-color)";
    }

    Blockly.utils.aria.setState(this.htmlDiv_, Blockly.utils.aria.State.SELECTED, isSelected);
  };

  createIconDom_ = () => {
    const img = document.createElement("iconpark-icon");
    img.name = this.cssConfig_.icon;
    img.size = "21";
    img.color = "white";
    img.style = `
      -webkit-mask-size: 100% 100%;
      -webkit-mask-image: url(${superellipse});
      mask-size: 100% 100%;
      mask-image: url(${superellipse});
    `;
    return img;
  };
}

class BoxyToolbox {
  constructor() {
    this.ariaElements = document.getElementsByClassName("blocklyToolboxCategory");
  }

  load = () => {
    Blockly.registry.register(
      Blockly.registry.Type.TOOLBOX_ITEM,
      Blockly.ToolboxCategory.registrationName,
      BoxyCategory,
      true
    );
  };

  ariaFix = () => {
    Array.prototype.forEach.call(this.ariaElements, function (element) {
      element.setAttribute("aria-level", "1");
    });
  };
}

let toolbox = new BoxyToolbox();
toolbox.load();
export default toolbox;
