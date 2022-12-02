import Blockly from "blockly";
import { javascriptGenerator } from "blockly/javascript";
import $ from "jquery";

import workspace from "../workspace/workspace";

class BoxyNavigation {
  constructor() {
    this.boxyMenuJQ = $(".boxyMenu");
    this.extendedName = ".boxy";
  }

  load = () => {
    let boxyMenu = $(".boxyMenu");
    $(document).ready(function () {
      $("#navigation").on("click", function (event) {
        event.stopPropagation();
        boxyMenu.toggle(100);
        if (boxyMenu.is(":visible")) {
          $(document).on("click", function () {
            boxyMenu.hide(100);
          });
        }
      });
      boxyMenu.on("click", function (e) {
        e.stopPropagation();
      });
    });
    boxyMenu.hide();
  };

  new_ = () => {
    this.boxyMenuJQ.hide();
    // TODO New
  };

  open_ = () => {
    this.boxyMenuJQ.hide();
    const input = document.createElement("input");
    input.setAttribute("type", "file");
    input.setAttribute("name", "file");
    input.setAttribute("accept", this.extendedName);
    input.addEventListener("change", function () {
      const file = this.files[0];
      const reader = new FileReader();
      reader.addEventListener("load", function () {
        const json = JSON.parse(this.result || "");
        Blockly.serialization.workspaces.load(json["content"], workspace.workspace);
        console.log("[Boxy] Opened:");
        console.log(JSON.stringify(json, null, "  "));
      });
      reader.readAsText(file);
    });
    input.click();
  };

  save_ = () => {
    this.boxyMenuJQ.hide();
    const json = Blockly.serialization.workspaces.save(workspace.workspace);
    const data = { name: "Boxy Project Demo", editorVersion: 1, content: json };
    const text = JSON.stringify(data, null, "  ");
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "name" + ".boxy";
    anchor.click();
    console.log("[Boxy] Saved:");
    console.log(text);
  };

  export_ = () => {
    this.boxyMenuJQ.hide();
    const jsCode = javascriptGenerator.workspaceToCode(workspace.workspace);
    const blob = new Blob([jsCode], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "boxy" + ".js";
    anchor.click();
    console.log("[Boxy] Generated:");
    console.log(jsCode);
  };

  options_ = () => {
    this.boxyMenuJQ.hide();
    // TODO Option
  };
}

let navigation = new BoxyNavigation();
navigation.load();
export default navigation;

// 新建
window.navigationNew = navigation.new_;
// 打开
window.navigationOpen = navigation.open_;
// 保存
window.navigationSave = navigation.save_;
// 导出
window.navigationExport = navigation.export_;
// 选项
window.navigationOptions = navigation.options_;
