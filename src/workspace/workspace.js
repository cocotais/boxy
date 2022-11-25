import "@blockly/block-plus-minus";

import { ScrollBlockDragger, ScrollMetricsManager, ScrollOptions } from "@blockly/plugin-scroll-options";
import { WorkspaceSearch } from "@blockly/plugin-workspace-search";
import Blockly from "blockly";
import * as zh from "blockly/msg/zh-hans";

import toolboxConfig from "../toolbox/toolbox.json";
import { trashcanCoverOff, trashcanSwitchOff, trashcanSwitchOn } from "../transhcan/trashcan";

// 加载工具箱
export function loadWorkspace() {
  // 本地语言设置
  Blockly.setLocale(zh);
  // 注册工作区
  const blocklyArea = document.getElementById("blocklyArea");
  const blocklyDiv = document.getElementById("blocklyDiv");
  var workspace = Blockly.inject(blocklyDiv, {
    toolbox: toolboxConfig,
    media: "https://unpkg.com/blockly@9.1.1/media",
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
  // 配置滚动条
  Blockly.Scrollbar.scrollbarThickness = 10;
  // 加载插件
  const plugin = new ScrollOptions(workspace);
  plugin.init();
  const workspaceSearch = new WorkspaceSearch(workspace);
  workspaceSearch.init();
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
    Blockly.svgResize(workspace);
  };
  window.addEventListener("resize", onresize, false);
  onresize();
  Blockly.svgResize(workspace);

  // 垃圾桶监听器
  workspace.addChangeListener(function (event) {
    if (event.type === "drag") {
      trashcanSwitchOn();
    } else if (event.type === "move") {
      trashcanSwitchOff();
      trashcanCoverOff();
    }
  });
}
