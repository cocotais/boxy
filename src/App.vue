<script setup>
import './assets/categories'
import './blocks/boxy'
import './blocks/patch'
import './theme/codemao.theme'
import './theme/codemao.renderer'

import Blockly from 'blockly'

import Codespace from './components/Codespace.vue'
import Navigator from './components/Navigator.vue'
import Toolbox from './components/Toolbox.vue'
import Workspace from './components/Workspace.vue'
import Zoombox from './components/Zoombox.vue'
import { useStore } from './utils/store'

let store = useStore()
function handleMoving() {
  for (let i = 0; i < 5; i++) {
    setTimeout(function () {
      Blockly.svgResize(store.workspace)
    }, 100 * i)
  }
}
handleMoving()
</script>

<template>
  <Navigator />
  <a-layout>
    <a-layout-content><Workspace /><Toolbox /></a-layout-content>
    <a-layout-sider :resize-directions="['left']" @moving="handleMoving" @moving-end="handleMoving">
      <Codespace />
    </a-layout-sider>
  </a-layout>
  <Zoombox />
</template>

<style>
html,
body,
#app {
  width: 100vw;
  height: 100vh;
  margin: 0;
  padding: 0;

  border: 0;
}
</style>
