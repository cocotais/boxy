/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview The full custom renderer built during the custom renderer
 * codelab, in ES6 syntax.
 * @author fenichel@google.com (Rachel Fenichel)
 */
import Blockly from "blockly";
class CustomConstantsProvider extends Blockly.zelos.ConstantProvider {
  constructor() {
    // Set up all of the constants from the base provider.
    super();

    // Override a few properties.
    /**
     * The width of the notch used for previous and next connections.
     * @type {number}
     * @override
     */
    this.NOTCH_WIDTH = 0;

    /**
     * The height of the notch used for previous and next connections.
     * @type {number}
     * @override
     */
    this.NOTCH_HEIGHT = 0;

    /**
     * Rounded corner radius.
     * @type {number}
     * @override
     */
    this.CORNER_RADIUS = 4;
    /**
     * The height of the puzzle tab used for input and output connections.
     * @type {number}
     * @override
     */
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
