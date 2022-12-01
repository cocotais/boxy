import { javascriptGenerator } from "blockly/javascript";
import highlight from "highlight.js/lib/core";
import javascript from "highlight.js/lib/languages/javascript";

import workspace from "../workspace/workspace";

class BoxyCodespace {
  constructor() {
    this.workspaceDiv = document.getElementById("workspace");
    this.codespaceDiv = document.getElementById("codespace");
    this.codeDiv = document.getElementById("code");
  }

  load = () => {
    highlight.registerLanguage("javascript", javascript);
    highlight.highlightAll();

    this.workspaceDiv.addEventListener("resize", this.resize);
    window.addEventListener("resize", this.resize);
    this.resize();
  };

  updateCode = () => {
    let code = javascriptGenerator.workspaceToCode(workspace.workspace);
    if (code === "") {
      this.codeDiv.innerHTML = "未检测到积木块";
    } else {
      this.codeDiv.innerHTML = code;
    }
    highlight.highlightAll();
  };

  resize = () => {
    this.codespaceDiv.style.width = this.width() + "px";
    if (this.width() === window.innerWidth) {
      this.codeDiv.style.marginTop = document.getElementById("navigation").offsetHeight + "px";
    } else {
      this.codeDiv.style.marginTop = "0";
    }
  };

  width = () => {
    if (this.codespaceDiv.getAttributeNames().indexOf("code") === -1) {
      return 0;
    } else {
      const toolboxDiv = document.getElementsByClassName("blocklyToolboxDiv")[0];
      const toolboxWidth = toolboxDiv.getBoundingClientRect().width;
      const flyoutDiv = document.querySelector("#workspace > div > svg.blocklyFlyout");
      const flyoutWidth = flyoutDiv.getBoundingClientRect().width;
      const codespaceWidth = 350 + Math.log(window.innerWidth);
      if (window.innerWidth > toolboxWidth + flyoutWidth + codespaceWidth) {
        return 350 + Math.log(window.innerWidth);
      } else {
        return window.innerWidth;
      }
    }
  };
}

let codespace = new BoxyCodespace();
codespace.load();
export default codespace;
