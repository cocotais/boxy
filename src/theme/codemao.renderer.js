import Blockly from "blockly";

class CustomConstantsProvider extends Blockly.zelos.ConstantProvider {
  constructor() {
    super();

    this.NOTCH_WIDTH = 0;
    this.NOTCH_HEIGHT = 0;

    this.CORNER_RADIUS = 4;
    this.TAB_WIDTH = 10;
    this.TAB_HEIGHT = 10;

    this.FIELD_BORDER_RECT_RADIUS = 2;
    this.FIELD_BORDER_RECT_HEIGHT = 10;

    this.EMPTY_INLINE_INPUT_PADDING = 20;
    this.EXTERNAL_VALUE_INPUT_PADDING = 10;

    this.FIELD_TEXT_FONTSIZE = 12;
    this.FIELD_TEXT_FONTWEIGHT = "500";
    this.FIELD_TEXT_FONTFAMILY = "sans-serif";
  }
}

class CustomRenderer extends Blockly.zelos.Renderer {
  constructor(name) {
    super(name);
  }
  makeConstants_() {
    return new CustomConstantsProvider();
  }
}

Blockly.blockRendering.register("codemao", CustomRenderer);
