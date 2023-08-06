<template>
  <a-trigger trigger="click" position="rt">
    <div id="logo" @click="handleIconClick">
      <img src="../assets/boxy.svg" />
    </div>
    <template #content>
      <div class="navigatorMenu">
        <a-doption>新建</a-doption>
        <a-doption @click="handleSaveClick">保存到电脑</a-doption>
        <a-doption @click="handleOpenClick">打开本地文件</a-doption>
        <a-divider margin="1px" />
        <a-doption @click="handleDocsClick">文档</a-doption>
        <a-doption @click="handleOptionsClick">设置</a-doption>
      </div>
    </template>
  </a-trigger>
  <settings ref="modal"></settings>
</template>

<script setup>
import Blockly from 'blockly'
import { ref } from 'vue'

import settings from '../components/Settings.vue'
import { useMainStore } from '../core/store'

const mainStore = useMainStore()
const modal = ref()

function handleIconClick() {
  Blockly.hideChaff()
}

function handleSaveClick() {
  let anchor = document.createElement('a')
  anchor.href = `data:,${JSON.stringify(
    Blockly.serialization.workspaces.save(mainStore.workspace)
  )}`
  anchor.download = 'project.boxy'
  document.body.appendChild(anchor)
  anchor.click()
  document.body.removeChild(anchor)
}

function handleOpenClick() {
  let input = document.createElement('input')
  input.id = 'file'
  input.type = 'file'
  input.name = 'file'
  input.style.visibility = 'hidden'
  input.accept = '.boxy'
  document.body.appendChild(input)
  input.onchange = function (event) {
    let file = event.target.file[0]
    let reader = new FileReader()
    reader.onload = function () {
      let content = JSON.parse(reader.result)
      Blockly.serialization.workspaces.load(content, '0')
    }
    reader.readAsText(file, 'UTF-8')
  }
  input.click()
  document.body.removeChild(input)
}

function handleDocsClick() {
  window.open('https://www.yuque.com/hzsn/boxy')
}

function handleOptionsClick() {
  modal.value.handleClick()
}
</script>

<style scoped>
#logo {
  position: absolute;
  z-index: 4;
  top: 0;
  left: 0;

  width: 36px;
  height: 36px;
  padding: 12px;

  background-color: var(--color-bg-2);
}

.navigatorMenu {
  box-sizing: border-box;
  padding: 12px 16px;

  font-size: 14px;
  line-height: 1.5715;
  color: var(--color-text-2);

  background-color: var(--color-bg-popup);
  border: 1px solid var(--color-neutral-3);
  border-radius: var(--border-radius-medium);
  box-shadow: 0 -2px 5px rgb(0 0 0 / 10%);

  animation: show-dropdown 0.3s cubic-bezier(0, 1.2, 0, 1) forwards !important;
}

@keyframes show-dropdown {
  0% {
    width: 0;
    height: 0;
  }

  100% {
    width: 150px;
    height: 208px;
  }
}
</style>
