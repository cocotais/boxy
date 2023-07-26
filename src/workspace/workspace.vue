<script setup>
/**
 * @license
 * Copyright 2022 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Blockly Vue Component.
 * @author dcoodien@gmail.com (Dylan Coodien)
 */

import { onMounted, ref, shallowRef } from "vue";
import Blockly from "blockly";
import * as zh from "blockly/msg/zh-hans";
import BoxySearch from "../search/search";
import BoxyZoomBox from "../zoomBox/zoomBox";
import trashcan from "../trashcan/trashcan";
import BoxyCodespace from "../codespace/codespace";

Blockly.setLocale(zh);
Blockly.Scrollbar.scrollbarThickness = 10;

const props = defineProps(["options"]);
const blocklyToolbox = ref();
const blocklyDiv = ref();
const workspace = shallowRef();

defineExpose({ workspace });

onMounted(() => {
  const options = props.options || {};
  if (!options.toolbox) {
    options.toolbox = blocklyToolbox.value;
  }

  workspace.value = Blockly.inject(blocklyDiv.value, options);

  const workspaceSearch = new BoxySearch(workspace.value);
  workspaceSearch.load();

  let boxyCodespace = new BoxyCodespace(workspace.value);
  boxyCodespace.load();

  const boxyZoomBox = new BoxyZoomBox(
    workspace.value,
    boxyCodespace,
    workspaceSearch
  );
  boxyZoomBox.load();

  window.zoomBoxResize = boxyZoomBox.resize;
  window.searchSwitch = boxyZoomBox.searchSwitch;
  window.codespaceSwitch = boxyZoomBox.codespaceSwitch;
  window.zoomBoxSmaller = boxyZoomBox.smaller;
  window.zoomBoxReset = boxyZoomBox.reset;
  window.zoomBoxBigger = boxyZoomBox.bigger;

  workspace.value.addChangeListener(function (event) {
    boxyCodespace.updateCode();
    trashcan.switch(event);
  });
});
</script>

<template>
  <div>
    <div class="blocklyDiv" ref="blocklyDiv"></div>
    <xml ref="blocklyToolbox" style="display: none">
      <slot></slot>
    </xml>
    <!--代码区-->
    <div id="codespace">
      <div id="codespaceHead">
        <iconpark-icon
          id="codespaceClose"
          name="close"
          onclick="codespaceSwitch();zoomBoxResize()"
        ></iconpark-icon>
      </div>
      <pre><code id="code" class="language-javascript"></code></pre>
    </div>
    <!--垃圾桶-->
    <div id="trashcan" class="blocklyToolboxDelete" style="cursor: grabbing">
      <img
        src="../icon/trashcan/lid.svg"
        id="trashcan-lid"
        class="trashcan"
        alt="垃圾桶盖"
      />
      <img
        src="../icon/trashcan/body.svg"
        id="trashcan-body"
        class="trashcan"
        alt="垃圾桶身"
      />
    </div>
    <!--缩放栏-->
    <div id="zoomBox">
      <div id="search" data-title="搜索" onclick="searchSwitch()">
        <iconpark-icon
          name="search"
          id="switchSearch"
          class="zoomFunctions"
        ></iconpark-icon>
      </div>
      <div data-title="转换代码" onclick="codespaceSwitch();zoomBoxResize()">
        <iconpark-icon
          name="code"
          id="switchCode"
          class="zoomFunctions"
        ></iconpark-icon>
      </div>
      <div id="zoomBoxSeparate"></div>
      <div data-title="缩小" onclick="zoomBoxSmaller()">
        <iconpark-icon
          name="smaller"
          id="zoomBoxSmaller"
          class="zoomFunctions"
        ></iconpark-icon>
      </div>
      <div data-title="恢复为100%" onclick="zoomBoxReset()">
        <span id="zoomBoxReset">100%</span>
      </div>
      <div data-title="放大" onclick="zoomBoxBigger()">
        <iconpark-icon
          name="bigger"
          id="zoomBoxBigger"
          class="zoomFunctions"
        ></iconpark-icon>
      </div>
    </div>
  </div>
</template>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.blocklyDiv {
  height: 100%;
  width: 100%;
  text-align: left;
}
</style>
