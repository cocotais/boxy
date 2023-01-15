import { luaGenerator } from "blockly/lua";

luaGenerator["controls_forever"] = function (block) {
  const branch = luaGenerator.statementToCode(block, "DO");
  return "while(true) do\n" + branch + "end\n";
};

luaGenerator["math_evenly_divisible"] = function (block) {
  const argument1 = luaGenerator.valueToCode(block, "DIVIDEND", null) || "0";
  const argument2 = luaGenerator.valueToCode(block, "DIVISOR", null) || "0";
  return argument1 + " % " + argument2 + " == 0";
};
