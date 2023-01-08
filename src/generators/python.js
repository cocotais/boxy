import { pythonGenerator } from "blockly/python";

pythonGenerator["controls_forever"] = function (block) {
  const branch = pythonGenerator.statementToCode(block, "DO") || "pass";
  return "while True:\n" + branch;
};

pythonGenerator["math_evenly_divisible"] = function (block) {
  const argument1 = pythonGenerator.valueToCode(block, "DIVIDEND", pythonGenerator.ORDER_NONE) || "0";
  const argument2 = pythonGenerator.valueToCode(block, "DIVISOR", pythonGenerator.ORDER_MEMBER) || "0";
  return [argument1 + " % " + argument2 + " == 0", pythonGenerator.ORDER_MEMBER];
};
