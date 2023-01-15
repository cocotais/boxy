import { dartGenerator } from "blockly/dart";

dartGenerator["controls_forever"] = function (block) {
  const branch = dartGenerator.statementToCode(block, "DO");
  return "for(;;) {\n" + branch + "}\n";
};

dartGenerator["math_evenly_divisible"] = function (block) {
  const argument1 = dartGenerator.valueToCode(block, "DIVIDEND", null) || "0";
  const argument2 = dartGenerator.valueToCode(block, "DIVISOR", null) || "0";
  return argument1 + " % " + argument2 + " == 0";
};
