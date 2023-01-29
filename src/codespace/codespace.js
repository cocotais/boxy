import "../generators/javascript";

import { javascriptGenerator } from "blockly/javascript";
import highlight from "highlight.js/lib/core";
import javascript from "highlight.js/lib/languages/javascript";

import platform from "../utils/platform";
import workspace from "../workspace/workspace";

class BoxyCodespace {
  /**
   * 代码区
   * @constructor
   */
  constructor() {
    this.blocklyDiv = document.getElementById("blocklyDiv");
    this.codespaceDiv = document.getElementById("codespace");
    this.codespaceHeadDiv = document.getElementById("codespaceHead");
    this.codeDiv = document.getElementById("code");
    this.workspaceDiv = document.getElementById("workspace");
    this.navigationDiv = document.getElementById("navigationContainer");
    this.codespaceButton = document.getElementById("switchCode");
  }

  /**
   * 加载代码区高亮、监听器。
   * @method
   */
  load = () => {
    // 代码区高亮
    highlight.registerLanguage("javascript", javascript);
    highlight.highlightAll();
    // 代码区尺寸变化监听器
    this.workspaceDiv.addEventListener("resize", this.resize);
    window.addEventListener("resize", this.resize);
    this.resize();
  };

  /**
   * 将工作区内容转化为代码，并提供高亮。
   * @method
   */
  updateCode = () => {
    let code = javascriptGenerator.workspaceToCode(workspace.workspace);
    if (code === "") {
      this.codeDiv.innerHTML = "未检测到积木块";
    } else {
      this.codeDiv.innerHTML = code;
    }
    highlight.highlightAll();
  };

  /**
   * 根据当前用户窗口大小，重置代码区尺寸。
   * @method
   */
  resize = () => {
    this.codespaceDiv.style.width = this.currentWidth() + "px";
    if (this.currentWidth() === window.innerWidth) {
      this.codespaceHeadDiv.style.display = "block";
      this.codeDiv.style.marginTop = "0px";
      this.navigationDiv.style.zIndex = "11";
    } else {
      this.codespaceHeadDiv.style.display = "none";
      this.codeDiv.style.marginTop = "20px";
      this.navigationDiv.style.zIndex = "4";
    }
  };

  /**
   * 打开代码区。
   * @method
   */
  open = () => {
    this.blocklyDiv.setAttribute("code", "");
    this.codespaceDiv.setAttribute("code", "");
    this.codespaceButton.style.color = "var(--boxy-color)";
  };

  /**
   * 关闭代码区。
   * @method
   */
  close = () => {
    this.blocklyDiv.removeAttribute("code");
    this.codespaceDiv.removeAttribute("code");
    this.codespaceButton.style.color = "var(--zoombox-color)";
  };

  /**
   * 代码区收放。
   * @method
   */
  switch = () => {
    if (this.blocklyDiv.getAttributeNames().indexOf("code") === -1) {
      this.open();
    } else {
      this.close();
    }
  };

  /**
   * 代码区是否展开。
   * @method
   * @returns {boolean}
   */
  state = () => {
    return this.codespaceDiv.getAttributeNames().indexOf("code") !== -1;
  };

  /**
   * 计算代码区应有宽度。
   * @method
   * @returns {number} 宽度(px)
   */
  dueWidth = () => {
    if (platform() === "PC") {
      return 350 + Math.log(window.innerWidth);
    } else {
      return window.innerWidth;
    }
  };

  /**
   * 代码区实际宽度。
   * @returns {number}
   */
  currentWidth = () => {
    return this.state() ? this.dueWidth() : 0;
  };
}

let codespace = new BoxyCodespace();
codespace.load();
export default codespace;
