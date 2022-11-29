import "@blockly/block-plus-minus";

import { ScrollBlockDragger, ScrollMetricsManager, ScrollOptions } from "@blockly/plugin-scroll-options";
import { WorkspaceSearch } from "@blockly/plugin-workspace-search";
import Blockly from "blockly";
import * as zh from "blockly/msg/zh-hans";

import toolbox from "../toolbox/toolbox";
import toolboxConfig from "../toolbox/toolbox.json";

class BoxyWorkSpace {
  constructor() {
    Blockly.setLocale(zh);
    Blockly.Scrollbar.scrollbarThickness = 10;
    this.blocklyArea = document.getElementById("blocklyArea");
    this.blocklyDiv = document.getElementById("blocklyDiv");
  }

  load() {
    this.workspace = Blockly.inject(this.blocklyDiv, {
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

    window.addEventListener("resize", this.onresize);
    this.onresize();
  }

  onresize() {
    let x = 0;
    let y = 0;
    let element = this.blocklyArea;
    do {
      x += element.offsetLeft;
      y += element.offsetTop;
      element = element.offsetParent;
    } while (element);

    this.blocklyDiv.style.left = x + "px";
    this.blocklyDiv.style.top = y + "px";
    this.blocklyDiv.style.width = this.blocklyArea.offsetWidth + "px";
    this.blocklyDiv.style.height = this.blocklyArea.offsetHeight + "px";
    Blockly.svgResize(Blockly.getMainWorkspace());
  }
}

let workspace = new BoxyWorkSpace();
workspace.load();
export default workspace;
