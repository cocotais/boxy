import { phpGenerator } from "blockly/php";

phpGenerator["controls_forever"] = function (block) {
  const branch = phpGenerator.statementToCode(block, "DO");
  return "for(;;) {\n" + branch + "}\n";
};

phpGenerator["math_evenly_divisible"] = function (block) {
  const argument1 = phpGenerator.valueToCode(block, "DIVIDEND", null) || "0";
  const argument2 = phpGenerator.valueToCode(block, "DIVISOR", null) || "0";
  return argument1 + " % " + argument2 + " == 0";
};
