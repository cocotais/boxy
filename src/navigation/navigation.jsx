import { Modal } from "antd";
import Blockly from "blockly";
import { javascriptGenerator } from "blockly/javascript";
import $ from "jquery";
import { useState } from "react";
import { createRoot } from "react-dom/client";

import workspace from "../workspace/workspace";

const Dialog = (props) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const showModal = () => {
    setIsModalOpen(true);
  };
  const handleOk = () => {
    setIsModalOpen(false);
  };
  const handleCancel = () => {
    setIsModalOpen(false);
  };
  return (
    <>
      <div className="boxyMenuItem" onClick={showModal}>
        <div className="boxyMenuItemContent">{props.name}</div>
      </div>
      <Modal title={props.name} open={isModalOpen} onOk={handleOk} onCancel={handleCancel}>
        {props.contentHTML}
      </Modal>
    </>
  );
};

const Function = (props) => {
  return (
    <div className="boxyMenuItem" onClick={props.onclick}>
      <div className="boxyMenuItemContent">{props.name}</div>
    </div>
  );
};

class BoxyNavigation {
  /**
   * 导航栏
   * @constructor
   */
  constructor() {
    this.navigationDiv = document.getElementById("navigation");
    this.boxyMenuJQ = $(".boxyMenu");
    this.extendedName = ".boxy";
    this.root = document.querySelector("body > div.boxyMenuPosition > div");

    this.register("新建", "dialog");
    this.register("打开", "function", this.open);
    this.register("保存到本地", "function", this.save);
    this.register("导出为目标文件", "function", this.export);
    this.register("选项", "dialog");
  }

  /**
   * 注册导航栏菜单。
   * @param name 菜单项名称。
   * @param mode 菜单引导模式 dialog/function。
   * @param args 如果是 dialog 给予内部HTML，如果是 function 给予要执行的函数。
   */
  register(name, mode, ...args) {
    let item = document.createElement("div");
    if (mode === "dialog") {
      createRoot(item).render(<Dialog name={name} contentHTML={args[0]} />);
    } else if (mode === "function") {
      createRoot(item).render(<Function name={name} onclick={args[0]} />);
    }
    this.root.appendChild(item);
  }

  /**
   * 加载导航栏点击动作，禁用右键菜单。
   * @method
   */
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

    this.navigationDiv.addEventListener("contextmenu", function (event) {
      event.preventDefault();
    });
  };

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

  /**
   * 保存到本地按钮动作。
   * @method
   */
  save = () => {
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

  /**
   * 导出到目标文件按钮动作。
   * @method
   */
  export = () => {
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

  /**
   * 选项按钮动作。
   * @method
   */
  options = () => {
    console.log("options");
  };
}

let navigation = new BoxyNavigation();
navigation.load();
export default navigation;
