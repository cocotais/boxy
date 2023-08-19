<template>
  <a-trigger trigger="hover" position="rt" :popup-visible="visible">
    <div id="logo" @click="handleIconClick">
      <img alt="Logo" src="../assets/boxy.svg" width="36" height="36" />
    </div>
    <template #content>
      <div class="navigatorMenu">
        <a-doption>新建</a-doption>
        <a-doption @click="handleSaveClick">保存到电脑</a-doption>
        <a-doption @click="handleOpenClick">打开本地文件</a-doption>
        <a-divider margin="1px" />
        <a-doption @click="handleSearchClick">查找</a-doption>
        <a-divider margin="1px" />
        <a-doption @click="handleDocsClick">文档</a-doption>
        <a-doption @click="handleOptionsClick">设置</a-doption>
      </div>
    </template>
  </a-trigger>
  <Settings ref="modal"></Settings>
</template>

<script setup>
import Blockly from 'blockly'
import { ref } from 'vue'

import { useStore } from '../utils/store'
import Settings from './Settings.vue'

const visible = ref()
const modal = ref()
const store = useStore()

function handleIconClick() {
  visible.value = !visible.value
  Blockly.hideChaff()
}

function handleSaveClick() {
  const json = Blockly.serialization.workspaces.save(store.workspace)
  const text = JSON.stringify(json)
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = 'project.boxy'
  anchor.click()
  visible.value = false
}

function handleOpenClick() {
  const input = document.createElement('input')
  input.setAttribute('type', 'file')
  input.setAttribute('name', 'file')
  input.setAttribute('visibility', 'hidden')
  input.setAttribute('accept', '.boxy')
  input.addEventListener('change', function () {
    const file = this.files[0]
    const reader = new FileReader()
    reader.addEventListener('load', function () {
      const json = JSON.parse(this.result)
      Blockly.serialization.workspaces.load(json, store.workspace)
    })
    reader.readAsText(file)
  })
  input.click()
  visible.value = false
}

function handleSearchClick() {
  store.search.open()
  visible.value = false
}

function handleDocsClick() {
  window.open('https://www.yuque.com/hzsn/boxy')
  visible.value = false
}

function handleOptionsClick() {
  modal.value.handleClick()
  visible.value = false
}
</script>

<style>
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

  > li {
    -webkit-tap-highlight-color: transparent;
  }
}

@keyframes show-dropdown {
  0% {
    width: 0;
    height: 0;
  }

  100% {
    width: 150px;
    height: 248px;
  }
}
</style>
