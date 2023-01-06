import Blockly from "blockly";

/**
 * 重置块的类型。
 * @param name 块名称
 * @param style 要重置的类型
 */
export default function block_style(name, style) {
  // https://groups.google.com/g/blockly/c/byDoKnftEcc/m/qbaF9M8vBAAJ
  const savedIfInit = Blockly.Blocks[name].init;
  Blockly.Blocks[name].init = function () {
    savedIfInit.bind(this)();
    this.setStyle(style);
  };
}
