import { dartGenerator } from "blockly/dart";

dartGenerator["controls_forever"] = function (block) {
  const branch = dartGenerator.statementToCode(block, "DO");
  return "for(;;) {\n" + branch + "}";
};

dartGenerator["math_evenly_divisible"] = function (block) {
  const argument1 = dartGenerator.valueToCode(block, "DIVIDEND", dartGenerator.ORDER_NONE) || "0";
  const argument2 = dartGenerator.valueToCode(block, "DIVISOR", dartGenerator.ORDER_MEMBER) || "0";
  return [argument1 + " % " + argument2 + " == 0", dartGenerator.ORDER_MEMBER];
};
