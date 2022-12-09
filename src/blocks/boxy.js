import Blockly from "blockly";
import { javascriptGenerator } from "blockly/javascript";

Blockly.defineBlocksWithJsonArray([
  {
    type: "math_evenly_divisible",
    message0: "%1 能被 %2 整除",
    args0: [
      {
        type: "input_value",
        name: "DIVIDEND",
        check: "Number",
        value: 0,
      },
      {
        type: "input_value",
        name: "DIVISOR",
        check: "Number",
        value: 0,
      },
    ],
    inputsInline: true,
    output: "Boolean",
    style: "math_blocks",
    tooltip: "判断第一个数是否恰好被第二个数整除。",
  },
]);

javascriptGenerator["math_evenly_divisible"] = function (block) {
  const argument1 = javascriptGenerator.valueToCode(block, "DIVIDEND", javascriptGenerator.ORDER_NONE) || "0";
  const argument2 = javascriptGenerator.valueToCode(block, "DIVISOR", javascriptGenerator.ORDER_MEMBER) || "0";
  return [argument1 + " % " + argument2 + " === 0", javascriptGenerator.ORDER_MEMBER];
};
