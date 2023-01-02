import "@blockly/block-plus-minus";
import "../theme/codemao.theme";
import "../theme/codemao.renderer";

import { WorkspaceSearch } from "@blockly/plugin-workspace-search";
import Blockly from "blockly";
import * as zh from "blockly/msg/zh-hans";

import codespace from "../codespace/codespace";
import toolbox from "../toolbox/toolbox";
import toolboxConfig from "../toolbox/toolbox.json";
import trashcan from "../trashcan/trashcan";

class BoxyWorkspace {
  /**
   * 工作区
   * @constructor
   */
  constructor() {
    Blockly.setLocale(zh);
    Blockly.Scrollbar.scrollbarThickness = 10;
    this.blocklyArea = document.getElementById("blocklyDiv");
    this.workspaceDiv = document.getElementById("workspace");
  }

  /**
   * 注册工作区，修复工具栏aria-level，加载插件，尺寸变化及工作区事件监听。
   * @method
   */
  load = () => {
    this.workspace = Blockly.inject(this.workspaceDiv, {
      toolbox: toolboxConfig,
      trashcan: false,
      media: "./media/",
      zoom: {
        controls: true,
        wheel: true,
        startScale: 0.8,
        maxScale: 1.4,
        minScale: 0.5,
      },
      move: {
        scrollbars: true,
        drag: true,
        wheel: true,
      },
      theme: "codemao",
      renderer: "codemao",
    });

    toolbox.ariaFix();

    this.workspaceSearch = new WorkspaceSearch(this.workspace);
    this.workspaceSearch.init();

    this.blocklyArea.addEventListener("resize", this.resize);
    window.addEventListener("resize", this.resize);
    this.resize();

    this.workspace.addChangeListener(function (event) {
      codespace.updateCode();
      trashcan.switch(event);
    });
  };

  /**
   * 根据当前用户窗口大小，重置代码区尺寸。
   * @method
   */
  resize = () => {
    // 求绝对位置
    let x = 0;
    let y = 0;
    let element = this.blocklyArea;
    do {
      x += element.offsetLeft;
      y += element.offsetTop;
      element = element.offsetParent;
    } while (element);
    // 位置、尺寸设置
    this.workspaceDiv.style.left = x + "px";
    this.workspaceDiv.style.top = y + "px";
    this.workspaceDiv.style.height = this.blocklyArea.offsetHeight + "px";
    this.workspaceDiv.style.width = this.blocklyArea.offsetWidth - codespace.width() + "px";
    Blockly.svgResize(this.workspace);
  };
}

let workspace = new BoxyWorkspace();
workspace.load();
export default workspace;
