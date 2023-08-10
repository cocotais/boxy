<template>
  <div id="codespace-head">
    <IconClose />
  </div>
  <highlightjs id="code" autodetect :code="code" />
</template>

<script setup>
import { IconClose } from '@arco-iconbox/vue-boxy'
import { javascriptGenerator } from 'blockly/javascript'
import { onMounted, ref } from 'vue'

import { useStore } from '../utils/store'

let code = ref('未检测到积木块')
let store = useStore()

onMounted(() => {
  store.workspace.addChangeListener(function () {
    code.value = javascriptGenerator.workspaceToCode(store.workspace) || '未检测到积木块'
  })
})
</script>

<style>
.arco-layout-sider-children {
  height: 100vh;
}

#codespace-head {
  display: none;
}

@font-face {
  font-family: JetBrainsMono;
  font-display: swap;
  src: url('../assets/JetBrainsMono.ttf');
}

#code > code {
  user-select: text;

  font-family: JetBrainsMono, sans-serif;
  font-size: 14px;
  line-height: 1.414;

  background: transparent;
}

#code > code::selection {
  color: inherit;
  background: #1ba2e333;
}

#code > code > span::selection {
  color: inherit;
  background: #1ba2e333;
}
</style>
