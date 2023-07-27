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

import Blockly from "blockly";
import * as zh from "blockly/msg/zh-hans";
import { onMounted, ref, shallowRef } from "vue";

import BoxyCodespace from "../codespace/codespace";
import BoxySearch from "../search/search";
import trashcan from "../trashcan/trashcan";
import BoxyZoomBox from "../zoomBox/zoomBox";

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

  const boxyZoomBox = new BoxyZoomBox(workspace.value, boxyCodespace, workspaceSearch);
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
        <iconpark-icon id="codespaceClose" name="close" onclick="codespaceSwitch();zoomBoxResize()"></iconpark-icon>
      </div>
      <pre><code id="code" class="language-javascript"></code></pre>
    </div>
    <!--垃圾桶-->
    <div id="trashcan" class="blocklyToolboxDelete" style="cursor: grabbing">
      <img src="../icon/trashcan/lid.svg" id="trashcan-lid" class="trashcan" alt="垃圾桶盖" />
      <img src="../icon/trashcan/body.svg" id="trashcan-body" class="trashcan" alt="垃圾桶身" />
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
