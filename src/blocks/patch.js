import Blockly from "blockly";

import toolboxConfig from "../toolbox/toolbox.json";

function block_style(name, style) {
  // https://groups.google.com/g/blockly/c/byDoKnftEcc/m/qbaF9M8vBAAJ
  const savedIfInit = Blockly.Blocks[name].init;
  Blockly.Blocks[name].init = function () {
    savedIfInit.bind(this)();
    this.setStyle(style);
  };
}

// 摘取积木栏配置信息，自动生成补丁
toolboxConfig["contents"].forEach(function (category) {
  if ("contents" in category) {
    let style = category["categorystyle"];
    category["contents"].forEach(function (element) {
      if (element["kind"] === "block") {
        block_style(element.type, style);
      }
    });
  } else {
    console.warn(
      "This category is empty. ",
      "If you are using a custom approach, ",
      "please list all possible blocks in contents for a unified format."
    );
  }
});

Blockly.Msg["CONTROLS_REPEAT_INPUT_DO"] = "";
Blockly.Msg["CONTROLS_IF_MSG_THEN"] = "";
Blockly.Msg["CONTROLS_IF_MSG_ELSE"] = "";
