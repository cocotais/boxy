import Blockly from "blockly";
import $ from "jquery";
import { workspace } from "../workspace/workspace";
import { javascriptGenerator } from "blockly/javascript";

// 导航栏菜单
$(document).ready(function () {
  $("#navigation").on("click", function (e) {
    let boxyMenu = $(".boxyMenu");
    e.stopPropagation();
    boxyMenu.toggle(100);
    if (boxyMenu.is(":visible")) {
      $(document).on("click", function () {
        boxyMenu.hide(100);
      });
    }
  });
  $(".boxyMenu").on("click", function (e) {
    e.stopPropagation();
  });
});
$(".boxyMenu").hide();

// 新建
window.navigationNew = function () {
  $(".boxyMenu").hide();
};

// 打开
window.navigationOpen = function () {
  $(".boxyMenu").hide();
  const input = document.createElement("input");
  input.setAttribute("type", "file");
  input.setAttribute("name", "file");
  input.setAttribute("style", "visibility:hidden");
  input.setAttribute("accept", ".json");
  input.addEventListener("change", function () {
    const file = this.files[0];
    const reader = new FileReader();
    reader.addEventListener("load", function () {
      const json = JSON.parse(this.result);
      Blockly.serialization.workspaces.load(json, workspace);
      console.log("[Boxy] Opened:");
      console.log(this.result);
    });
    reader.readAsText(file);
  });
  input.click();
};

// 保存
window.navigationSave = function () {
  $(".boxyMenu").hide();
  const json = Blockly.serialization.workspaces.save(workspace);
  const text = JSON.stringify(json);
  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "boxy.json";
  anchor.click();
  console.log("[Boxy] Saved:");
  console.log(text);
};

// 导出
window.navigationExport = function () {
  $(".boxyMenu").hide();
  const jsCode = javascriptGenerator.workspaceToCode(workspace);
  const blob = new Blob([jsCode], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "boxy.js";
  anchor.click();
  console.log("[Boxy] Generated:");
  console.log(jsCode);
};

// 设置
window.navigationOptions = function () {
  $(".boxyMenu").hide();
};
