import { Button, Modal, Popover } from "antd";
import Blockly from "blockly";
import { javascriptGenerator } from "blockly/javascript";
import { useState } from "react";
import { createRoot } from "react-dom/client";

import icon from "../icon/logo/boxy.svg";
import workspace from "../workspace/workspace";

const Dialog = (props) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const showModal = () => {
    props.hide();
    setTimeout(setIsModalOpen, 100, true);
  };
  const handleOk = () => {
    setIsModalOpen(false);
  };
  const handleCancel = () => {
    setIsModalOpen(false);
  };
  return (
    <>
      <Button type="text" style={{ width: 128, textAlign: "left" }} onClick={showModal}>
        {props.name}
      </Button>
      <Modal title={props.name} open={isModalOpen} onOk={handleOk} onCancel={handleCancel}>
        {props.content}
      </Modal>
    </>
  );
};

const Function = (props) => {
  const onTrigger = () => {
    props.hide();
    setTimeout(props.onClick, 100);
  };
  return (
    <>
      <Button type="text" style={{ width: 128, textAlign: "left" }} onClick={onTrigger}>
        {props.name}
      </Button>
    </>
  );
};

class BoxyNavigation {
  /**
   * 导航栏
   * @constructor
   */
  constructor() {
    this.navigationDiv = document.getElementById("navigationContainer");
    this.extendedName = ".boxy";

    const NavigationMenu = () => {
      const [open, setOpen] = useState(false);
      const hide = () => {
        setOpen(false);
      };
      const handleOpenChange = (newOpen) => {
        setOpen(newOpen);
      };
      const content = (
        <>
          <Dialog name="新建" hide={hide} content={null}></Dialog>
          <br />
          <Function name="打开" hide={hide} onClick={this.open}></Function>
          <br />
          <Function name="保存到本地" hide={hide} onClick={this.save}></Function>
          <br />
          <Function name="导出为目标文件" hide={hide} onClick={this.export}></Function>
          <br />
          <Dialog name="选项" hide={hide} content={null}></Dialog>
        </>
      );
      return (
        <>
          <Popover
            arrowPointAtCenter
            placement="rightTop"
            content={content}
            trigger="hover"
            open={open}
            onOpenChange={handleOpenChange}
          >
            <img id="navigation" src={icon} alt="Logo" />
          </Popover>
        </>
      );
    };
    createRoot(this.navigationDiv).render(<NavigationMenu />);
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
