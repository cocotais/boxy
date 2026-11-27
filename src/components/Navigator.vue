<template>
  <div class="navigatorAnchor">
    <a-dropdown
      v-model:popup-visible="visible"
      :trigger="['hover', 'click']"
      position="rt"
      :popup-max-height="false"
      content-class="navigatorMenuPopup"
      :auto-fit-transform-origin="false"
      @popup-visible-change="handleVisibleChange"
      @select="handleSelect"
    >
      <a-button
        id="logo"
        type="text"
        aria-label="主菜单"
        aria-haspopup="menu"
        :aria-expanded="visible"
        @keydown.esc="visible = false"
      >
        <img alt="Logo" src="../assets/boxy.png" width="36" height="36" draggable="false" />
      </a-button>
      <template #content>
        <a-dgroup v-for="group in menuGroups" :key="group.title" :title="group.title">
          <a-doption
            v-for="item in group.items"
            :key="item.value"
            :value="item.value"
            :active="focusedItem === item.value"
            class="navigatorMenuOption"
            role="menuitem"
            tabindex="0"
            @focus="focusedItem = item.value"
            @blur="focusedItem = null"
            @keydown.enter.prevent="handleSelect(item.value)"
            @keydown.space.prevent="handleSelect(item.value)"
            @keydown.esc.stop.prevent="closeMenu"
          >
            <template #icon><component :is="item.icon" /></template>
            {{ item.label }}
          </a-doption>
        </a-dgroup>
      </template>
    </a-dropdown>
  </div>
  <Settings ref="modal"></Settings>
</template>

<script setup>
import { Modal } from '@arco-design/web-vue'
import {
  IconDownload,
  IconFile,
  IconFolder,
  IconInfoCircle,
  IconSearch,
  IconSettings
} from '@arco-design/web-vue/es/icon'
import * as Blockly from 'blockly'
import { ref } from 'vue'

import { useStore } from '../store/store'
import Settings from './Settings.vue'

const visible = ref(false)
const focusedItem = ref(null)
const modal = ref()
const store = useStore()

const menuGroups = [
  {
    title: '作品',
    items: [
      { value: 'new', label: '新建', icon: IconFile, action: handleNewClick },
      { value: 'save', label: '保存到电脑', icon: IconDownload, action: handleSaveClick },
      { value: 'open', label: '打开本地文件', icon: IconFolder, action: handleOpenClick }
    ]
  },
  {
    title: '编辑',
    items: [{ value: 'search', label: '查找', icon: IconSearch, action: handleSearchClick }]
  },
  {
    title: '应用',
    items: [
      { value: 'settings', label: '设置', icon: IconSettings, action: handleOptionsClick },
      { value: 'about', label: '关于', icon: IconInfoCircle, action: handleAboutClick }
    ]
  }
]

function handleVisibleChange(isVisible) {
  if (isVisible) Blockly.hideChaff()
  else focusedItem.value = null
}

function closeMenu() {
  visible.value = false
  document.getElementById('logo')?.focus()
}

function handleSelect(value) {
  visible.value = false
  menuGroups
    .flatMap((group) => group.items)
    .find((item) => item.value === value)
    ?.action()
}

function handleNewClick() {
  const workspace = store.workspaceSvg
  const create = () => {
    Blockly.serialization.workspaces.load({}, workspace)
    workspace.clearUndo()
  }
  if (
    workspace.getAllBlocks(false).length ||
    workspace.getTopComments().length ||
    workspace.getVariableMap().getAllVariables().length
  ) {
    Modal.confirm({
      title: '新建作品',
      content: '新建作品会清空当前工作区，请先保存需要保留的内容。',
      okText: '新建',
      onOk: create
    })
  } else create()
}

function handleSaveClick() {
  const json = Blockly.serialization.workspaces.save(store.workspaceSvg)
  const text = JSON.stringify(json)
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = 'project.boxy'
  anchor.click()
  setTimeout(() => URL.revokeObjectURL(url), 0)
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
      Blockly.serialization.workspaces.load(json, store.workspaceSvg)
    })
    reader.readAsText(file)
  })
  input.click()
}

function handleSearchClick() {
  store.searchVisible = true
}

function handleOptionsClick() {
  modal.value.handleClick()
}

function handleAboutClick() {
  window.open('https://www.yuque.com/hzsn/boxy', '_blank', 'noopener,noreferrer')
}
</script>

<style>
.navigatorAnchor {
  position: absolute;
  z-index: 5;
  top: 0;
  left: 0;

  width: 60px;
  height: 60px;

  background-color: var(--color-bg-2);
  box-shadow: inset -1px 0 var(--color-border);
}

#logo {
  box-sizing: border-box;
  width: 100%;
  height: 100%;
  padding: 12px;
  border: 0;
  border-radius: 0;

  &:hover,
  &:active {
    background-color: transparent !important;
  }
}

.navigatorMenuOption {
  min-width: 180px;
}

.arco-trigger-popup-wrapper:has(> .navigatorMenuPopup) {
  transform-origin: top left;

  &.slide-dynamic-origin-enter-from,
  &.slide-dynamic-origin-appear-from,
  &.slide-dynamic-origin-leave-to {
    transform: scale(0.9);
  }

  &.slide-dynamic-origin-enter-to,
  &.slide-dynamic-origin-appear-to,
  &.slide-dynamic-origin-leave-from {
    transform: scale(1);
  }
}
</style>
