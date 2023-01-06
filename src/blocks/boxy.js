import Blockly from "blockly";
import { javascriptGenerator } from "blockly/javascript";

import block_style from "../utils/block_style";

Blockly.defineBlocksWithJsonArray([
  {
    type: "controls_forever",
    message0: "%1",
    args0: [
      {
        type: "field_label",
        text: "重复执行（慎用）",
      },
    ],
    message1: "%1",
    args1: [
      {
        type: "input_statement",
        name: "DO",
      },
    ],
    previousStatement: null,
    nextStatement: null,
    style: "controller",
    tooltip: "重复执行。",
  },
]);

javascriptGenerator["controls_forever"] = function (block) {
  const branch = javascriptGenerator.statementToCode(block, "DO");
  return "for(;;) {\n" + branch + "}";
};

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
    style: "calculation",
    tooltip: "判断第一个数是否恰好被第二个数整除。",
  },
]);

javascriptGenerator["math_evenly_divisible"] = function (block) {
  const argument1 = javascriptGenerator.valueToCode(block, "DIVIDEND", javascriptGenerator.ORDER_NONE) || "0";
  const argument2 = javascriptGenerator.valueToCode(block, "DIVISOR", javascriptGenerator.ORDER_MEMBER) || "0";
  return [argument1 + " % " + argument2 + " === 0", javascriptGenerator.ORDER_MEMBER];
};

const controller = "controller";
const calculation = "calculation";
const variable = "variable";

const block_style_patch = {
  controls_if: controller,
  controls_whileUntil: controller,
  controls_repeat_ext: controller,
  controls_forever: controller,
  controls_for: controller,
  controls_flow_statements: controller,
  logic_ternary: controller,

  math_number: calculation,
  math_arithmetic: calculation,
  math_random_int: calculation,
  math_round: calculation,
  math_single: calculation,
  math_modulo: calculation,
  math_trig: calculation,
  math_evenly_divisible: calculation,
  math_number_property: calculation,
  logic_compare: calculation,
  logic_operation: calculation,
  logic_negate: calculation,
  logic_boolean: calculation,

  variables_set: variable,
  variables_get: variable,
};

for (const [key, value] of Object.entries(block_style_patch)) {
  block_style(key, value);
}

Blockly.Msg["CONTROLS_REPEAT_INPUT_DO"] = "";
Blockly.Msg["CONTROLS_IF_MSG_THEN"] = "";
Blockly.Msg["CONTROLS_IF_MSG_ELSE"] = "";
