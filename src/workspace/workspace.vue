<script setup>
import Blockly from "blockly";
import * as zh from "blockly/msg/zh-hans";
import { onMounted, ref, shallowRef } from "vue";

import Dropdown from "@/dropdown/dropdown.vue";

import BoxyCodespace from "../codespace/codespace";
import BoxySearch from "../search/search";
import trashcan from "../trashcan/trashcan";
import BoxyZoomBox from "../zoomBox/zoomBox";

Blockly.setLocale(zh);

Blockly.Msg["CONTROLS_REPEAT_INPUT_DO"] = "";
Blockly.Msg["CONTROLS_IF_MSG_THEN"] = "";
Blockly.Msg["CONTROLS_IF_MSG_ELSE"] = "";
Blockly.Msg["LOGIC_BOOLEAN_TRUE"] = "真";
Blockly.Msg["LOGIC_BOOLEAN_FALSE"] = "假";
Blockly.Msg["NEW_VARIABLE"] = "创建变量";

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

let directions = ref([]);
let width = ref(0);

window.changeDirection = (value) => {
  directions.value = value;
};

window.changeSize = (value) => {
  if (value <= 768) {
    width.value = value;
  }
};

let move = (size) => {
  if (size.width <= 768) {
    width.value = size.width;
  } else {
    width.value = 768;
  }
  window.zoomBoxResize();
};

let moveEnd = () => {
  window.zoomBoxResize();
};
</script>

<template>
  <div>
    <!--下拉框-->
    <Dropdown :workspace="workspace"></Dropdown>
    <div class="blocklyDiv" ref="blocklyDiv"></div>
    <xml ref="blocklyToolbox" style="display: none">
      <slot></slot>
    </xml>
    <!--代码区-->
    <a-resize-box
      id="codespace"
      v-model:width="width"
      :directions="directions"
      @moving="move"
      @moving-end="moveEnd"
      :style="{ width: '0px' }"
    >
      <div id="codespaceHead">
        <iconpark-icon id="codespaceClose" name="close" onclick="codespaceSwitch();zoomBoxResize()"></iconpark-icon>
      </div>
      <pre><code id="code" class="language-javascript"></code></pre>
    </a-resize-box>

    <!--垃圾桶-->
    <div id="trashcan" class="blocklyToolboxDelete" style="cursor: grabbing">
      <img src="../icon/trashcan/lid.svg" id="trashcan-lid" class="trashcan" alt="垃圾桶盖" />
      <img src="../icon/trashcan/body.svg" id="trashcan-body" class="trashcan" alt="垃圾桶身" />
    </div>
  </div>
</template>

<style scoped>
.blocklyDiv {
  height: 100%;
  width: 100%;
  text-align: left;
}
</style>
