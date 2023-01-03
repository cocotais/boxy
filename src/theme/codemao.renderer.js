import Blockly from "blockly";

class CustomConstantsProvider extends Blockly.zelos.ConstantProvider {
  constructor() {
    super();

    this.NOTCH_WIDTH = 0;
    this.NOTCH_HEIGHT = 8;

    this.CORNER_RADIUS = 4;
    this.TAB_WIDTH = 0;
    this.TAB_HEIGHT = 0;

    this.FIELD_TEXT_FONTSIZE = 12;
    this.FIELD_TEXT_FONTWEIGHT = "500";
    this.FIELD_TEXT_FONTFAMILY = "sans-serif";
  }

  /**
   * @override
   */
  init() {
    super.init();
    // Add calls to create shape objects for the new connection shapes.
    this.RECT_PREV_NEXT = this.makeNotch();
  }

  makeNotch() {
    const width = 0;
    const height = 0;

    /**
     * Since previous and next connections share the same shape
     * you can define a function to generate the path for both.
     */
    function makeMainPath(dir) {
      return Blockly.utils.svgPaths.line([
        Blockly.utils.svgPaths.point(0, height),
        Blockly.utils.svgPaths.point(dir * width, 0),
        Blockly.utils.svgPaths.point(0, -height),
      ]);
    }
    const pathLeft = makeMainPath(1);
    const pathRight = makeMainPath(-1);

    return {
      width: width,
      height: height + this.NOTCH_HEIGHT,
      pathLeft: pathLeft,
      pathRight: pathRight,
    };
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
