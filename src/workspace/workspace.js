import "@blockly/block-plus-minus";

import { ScrollBlockDragger, ScrollMetricsManager, ScrollOptions } from "@blockly/plugin-scroll-options";
import { WorkspaceSearch } from "@blockly/plugin-workspace-search";
import Blockly from "blockly";
import * as zh from "blockly/msg/zh-hans";

import codespace from "../codespace/codespace";
import toolbox from "../toolbox/toolbox";
import toolboxConfig from "../toolbox/toolbox.json";
import trashcan from "../trashcan/trashcan";

class BoxyWorkspace {
  constructor() {
    Blockly.setLocale(zh);
    Blockly.Scrollbar.scrollbarThickness = 10;
    this.blocklyArea = document.getElementById("blocklyArea");
    this.workspaceDiv = document.getElementById("workspace");
  }

  load = () => {
    this.workspace = Blockly.inject(this.workspaceDiv, {
      toolbox: toolboxConfig,
      trashcan: false,
      media: "./media/",
      plugins: {
        blockDragger: ScrollBlockDragger,
        metricsManager: ScrollMetricsManager,
      },
      zoom: {
        controls: true,
        wheel: true,
        startScale: 0.8,
        maxScale: 1.8,
        minScale: 0.3,
      },
      move: {
        scrollbars: true,
        drag: true,
        wheel: true,
      },
      theme: "zelos",
      renderer: "zelos",
    });

    toolbox.ariaFix();

    this.scollOptions = new ScrollOptions(this.workspace);
    this.scollOptions.init();
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

  resize = () => {
    let x = 0;
    let y = 0;
    let element = this.blocklyArea;
    do {
      x += element.offsetLeft;
      y += element.offsetTop;
      element = element.offsetParent;
    } while (element);

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
