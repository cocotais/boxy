import { phpGenerator } from "blockly/php";

phpGenerator["controls_forever"] = function (block) {
  const branch = phpGenerator.statementToCode(block, "DO");
  return "for(;;) {\n" + branch + "}";
};

phpGenerator["math_evenly_divisible"] = function (block) {
  const argument1 = phpGenerator.valueToCode(block, "DIVIDEND", phpGenerator.ORDER_NONE) || "0";
  const argument2 = phpGenerator.valueToCode(block, "DIVISOR", phpGenerator.ORDER_MEMBER) || "0";
  return [argument1 + " % " + argument2 + " == 0", phpGenerator.ORDER_MEMBER];
};
