<template>
  <a-scrollbar style="overflow: auto">
    <div id="codespace">
      <div>
        <IconClose @click="handleCloseClick" />
      </div>
      <div>
        <highlightjs autodetect :code="code" />
      </div>
    </div>
  </a-scrollbar>
</template>

<script setup>
import { IconClose } from '@arco-iconbox/vue-boxy'
import { javascriptGenerator } from 'blockly/javascript'
import { onMounted, ref } from 'vue'

import { useStore } from '../utils/store'

const defaultContext = '未检测到积木块'
const code = ref(defaultContext)
const store = useStore()

onMounted(() => {
  store.workspace.addChangeListener(() => {
    code.value = javascriptGenerator.workspaceToCode(store.workspace) || defaultContext
  })
})

function handleCloseClick() {
  store.hasCodespace = false
}
</script>

<style>
@media screen and (width >= 768px) {
  #app > section > div {
    min-width: 25%;
    max-width: 60%;
  }
}

@media screen and (width <= 768px) {
  #app > section > div {
    min-width: 100%;
    max-width: 100%;
    padding: 0;
  }

  #app > section > div > div.arco-resizebox-trigger-vertical > div {
    display: none;
  }
}

.arco-layout-sider-children {
  overflow: overlay;
  height: 100vh;
}

.arco-layout-sider-children > div {
  height: calc(100% - 1em);
  margin: 1em 0 0 1em;
}

.arco-layout-sider-children > div > div.arco-scrollbar-container {
  overflow-y: auto;
  height: calc(100% - 1em);
  padding: 0 1em 1em 0;
}

.arco-scrollbar-thumb-bar {
  background: var(--color-neutral-4) !important;
}

#codespace > div:nth-child(2) {
  width: 100%;
}

@font-face {
  font-family: JetBrainsMono;
  font-display: swap;
  src: url('../assets/JetBrainsMono.ttf');
}

@media screen and (width >= 768px) {
  #codespace > div:nth-child(1) {
    display: none;
  }
}

@media screen and (width <= 768px) {
  #codespace > div:nth-child(1) {
    display: block;
    height: 60px;
  }
}

#codespace > div > svg {
  position: fixed;
  top: 20px;
  right: 20px;

  width: 20px;
  height: 20px;

  color: var(--color-text-3);
}

#codespace > div > pre {
  margin: 0;
}

#codespace > div > pre > code {
  user-select: text;

  overflow: inherit;

  padding: 0;

  font-family: JetBrainsMono, sans-serif;
  font-size: 15px;
  line-height: 1.414;

  background: transparent;
}

#codespace > div > pre > code::selection {
  color: inherit;
  background: #1ba2e333;
}

#codespace > div > pre > code > span::selection {
  color: inherit;
  background: #1ba2e333;
}
</style>
