import { javascriptGenerator } from "blockly/javascript";

javascriptGenerator["controls_forever"] = function (block) {
  const branch = javascriptGenerator.statementToCode(block, "DO");
  return "for(;;) {\n" + branch + "}\n";
};

javascriptGenerator["math_evenly_divisible"] = function (block) {
  const argument1 = javascriptGenerator.valueToCode(block, "DIVIDEND", null) || "0";
  const argument2 = javascriptGenerator.valueToCode(block, "DIVISOR", null) || "0";
  return [argument1 + " % " + argument2 + " === 0"];
};
