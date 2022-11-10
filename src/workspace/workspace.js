import Blockly from "blockly";
import toolboxConfig from "../toolbox/toolbox.json";
import {
  ScrollOptions,
  ScrollBlockDragger,
  ScrollMetricsManager,
} from "@blockly/plugin-scroll-options";
import { WorkspaceSearch } from "@blockly/plugin-workspace-search";
import "@blockly/block-plus-minus";

export function loadWorkspace() {
  var blocklyArea = document.getElementById("blocklyArea");
  var blocklyDiv = document.getElementById("blocklyDiv");
  var workspace = Blockly.inject(blocklyDiv, {
    toolbox: toolboxConfig,
    trashcan: false,
    plugins: {
      blockDragger: ScrollBlockDragger,
      metricsManager: ScrollMetricsManager,
    },
    zoom: {
      controls: true,
      wheel: true,
      startScale: 0.8,
      maxScale: 1.6,
      minScale: 0.4,
      scaleSpeed: 1.5,
    },
    move: {
      scrollbars: true,
      drag: true,
      wheel: true,
    },
    theme: "zelos",
    renderer: "zelos",
  });

  const plugin = new ScrollOptions(workspace);
  plugin.init();
  const workspaceSearch = new WorkspaceSearch(workspace);
  workspaceSearch.init();

  var onresize = function (e) {
    let element = blocklyArea;
    let x = 0;
    let y = 0;
    do {
      x += element.offsetLeft;
      y += element.offsetTop;
      element = element.offsetParent;
    } while (element);

    blocklyDiv.style.left = x + "px";
    blocklyDiv.style.top = y + "px";
    blocklyDiv.style.width = blocklyArea.offsetWidth + "px";
    blocklyDiv.style.height = blocklyArea.offsetHeight + "px";
    console.log(blocklyArea.offsetWidth, blocklyArea.offsetHeight);
    Blockly.svgResize(workspace);
  };
  window.addEventListener("resize", onresize, false);
  onresize();
  Blockly.svgResize(workspace);
}
