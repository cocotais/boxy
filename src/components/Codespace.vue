<template>
  <div>
    <IconClose @click="handleCloseClick" />
  </div>
  <highlightjs autodetect :code="code" />
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
#app > section > main {
  position: relative;
}

@media screen and (width >= 768px) {
  #app > section > div {
    min-width: 30%;
    max-width: 60%;
  }
}

@media screen and (width <= 768px) {
  #app > section > div {
    min-width: 100%;
    max-width: 100%;
    padding: 0;
  }

  #app > section > div > div.arco-resizebox-direction-left > div {
    display: none;
  }
}

.arco-layout-sider-children {
  height: 100vh;
}

@font-face {
  font-family: JetBrainsMono;
  font-display: swap;
  src: url('../assets/JetBrainsMono.ttf');
}

@media screen and (width >= 768px) {
  #app > section > div > div.arco-layout-sider-children > div {
    display: none;
  }
}

@media screen and (width <= 768px) {
  #app > section > div > div.arco-layout-sider-children > div {
    display: block;
    height: 60px;
  }
}

#app > section > div > div.arco-layout-sider-children > div > svg {
  position: absolute;
  top: 20px;
  right: 20px;

  width: 20px;
  height: 20px;

  color: var(--color-text-3);
}

#app > section > div > div.arco-layout-sider-children > pre {
  margin: 0;
}

#app > section > div > div.arco-layout-sider-children > pre > code {
  user-select: text;

  font-family: JetBrainsMono, sans-serif;
  font-size: 14px;
  line-height: 1.414;

  background: transparent;
}

#app > section > div > div.arco-layout-sider-children > pre > code::selection {
  color: inherit;
  background: #1ba2e333;
}

#app > section > div > div.arco-layout-sider-children > pre > code > span::selection {
  color: inherit;
  background: #1ba2e333;
}
</style>
