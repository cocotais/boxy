import Blockly from "blockly";

// https://groups.google.com/g/blockly/c/byDoKnftEcc/m/qbaF9M8vBAAJ
export default function block_style(name, style) {
  const savedIfInit = Blockly.Blocks[name].init;
  Blockly.Blocks[name].init = function () {
    savedIfInit.bind(this)();
    this.setStyle(style);
  };
}
