import Blockly from "blockly";
import { javascriptGenerator } from "blockly/javascript";
import { createRoot } from "react-dom/client";

import workspace from "../workspace/workspace";
import { NavigationMenu } from "./component";

class BoxyNavigation {
  /**
   * 导航栏
   * @constructor
   */
  constructor() {
    this.navigationDiv = document.getElementById("navigationContainer");
    this.extendedName = ".boxy";
    createRoot(this.navigationDiv).render(
      <NavigationMenu
        content={[
          { name: "新建", mode: "dialog", content: null },
          { name: "打开", mode: "function", onClick: this.open },
          { name: "保存到本地", mode: "function", onClick: this.save },
          { name: "导出为目标文件", mode: "function", onClick: this.export },
          { name: "选项", mode: "dialog", content: null },
        ]}
      />
    );
  }

  /**
   * 新建按钮动作。
   * @method
   */
  new = () => {
    console.log("new");
  };

  /**
   * 打开按钮动作。
   * @method
   */
  open = () => {
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

  /**
   * 保存到本地按钮动作。
   * @method
   */
  save = () => {
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

  /**
   * 导出到目标文件按钮动作。
   * @method
   */
  export = () => {
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

  /**
   * 选项按钮动作。
   * @method
   */
  options = () => {
    console.log("options");
  };
}

let navigation = new BoxyNavigation();
export default navigation;
