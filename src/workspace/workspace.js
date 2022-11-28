import "@blockly/block-plus-minus";

import { ScrollBlockDragger, ScrollMetricsManager, ScrollOptions } from "@blockly/plugin-scroll-options";
import { WorkspaceSearch } from "@blockly/plugin-workspace-search";
import Blockly from "blockly";
import * as zh from "blockly/msg/zh-hans";

import { toolboxAriaFix } from "../toolbox/toolbox";
import toolboxConfig from "../toolbox/toolbox.json";

export var workspace;

// 加载工具箱
export function loadWorkspace() {
  // 本地语言设置
  Blockly.setLocale(zh);
  // 注册工作区
  const blocklyArea = document.getElementById("blocklyArea");
  const blocklyDiv = document.getElementById("blocklyDiv");
  const blocklyWorkSpace = Blockly.inject(blocklyDiv, {
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
  // 配置滚动条
  Blockly.Scrollbar.scrollbarThickness = 10;
  // 加载插件
  const plugin = new ScrollOptions(blocklyWorkSpace);
  plugin.init();
  const workspaceSearch = new WorkspaceSearch(blocklyWorkSpace);
  workspaceSearch.init();
  toolboxAriaFix();

  // 动态大小
  let onresize = function () {
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
    Blockly.svgResize(blocklyWorkSpace);
  };
  window.addEventListener("resize", onresize, false);
  onresize();
  Blockly.svgResize(blocklyWorkSpace);
  workspace = blocklyWorkSpace;
}
