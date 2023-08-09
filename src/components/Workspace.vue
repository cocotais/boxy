<template>
  <div class="blocklyArea" ref="blocklyArea"></div>
  <div class="blocklyDiv" ref="blocklyDiv"></div>
</template>

<script setup>
import '@blockly/block-plus-minus'

import Blockly from 'blockly'
import * as zh from 'blockly/msg/zh-hans'
import { onMounted, ref } from 'vue'

import toolboxConfig from '../assets/toolbox.json'
import { useStore } from '../utils/store'

Blockly.setLocale(zh)
Blockly.Scrollbar.scrollbarThickness = 10
Blockly.FlyoutButton.BORDER_RADIUS = 8

Blockly.Msg['CONTROLS_REPEAT_INPUT_DO'] = ''
Blockly.Msg['CONTROLS_IF_MSG_THEN'] = ''
Blockly.Msg['CONTROLS_IF_MSG_ELSE'] = ''
Blockly.Msg['LOGIC_BOOLEAN_TRUE'] = '真'
Blockly.Msg['LOGIC_BOOLEAN_FALSE'] = '假'
Blockly.Msg['NEW_VARIABLE'] = '创建变量'

let blocklyDiv = ref()
let blocklyArea = ref()
const store = useStore()
const options = {
  toolbox: toolboxConfig,
  media: '/media',
  trashcan: false,
  zoom: {
    controls: true,
    wheel: true,
    startScale: 0.8,
    maxScale: 1.4,
    minScale: 0.5
  },
  move: {
    scrollbars: true,
    drag: true,
    wheel: true
  },
  theme: 'codemao',
  renderer: 'codemao'
}

onMounted(() => {
  store.workspace = Blockly.inject(blocklyDiv.value, options)
})
</script>

<style>
.blocklyDiv {
  width: 100%;
  height: 100%;
  text-align: left;
}

.blocklySvg {
  background-color: var(--color-bg-1);
}

.blocklyMainBackground {
  stroke: none;
}
</style>
