<template>
  <div id="search">
    <a-space :style="{ display: visible ? 'block' : 'none' }">
      <a-input placeholder="搜索作品中的积木" @input="handleInput" @press-enter="handlePressEnter">
        <template #append>
          <a-button type="text" @click="handleUpClick" aria-label="上一个匹配">
            <template #icon>
              <IconUp />
            </template>
          </a-button>
          <a-button type="text" @click="handleDownClick" aria-label="下一个匹配">
            <template #icon>
              <IconDown />
            </template>
          </a-button>
          <a-button type="text" @click="handleCloseClick" aria-label="关闭">
            <template #icon>
              <IconClose />
            </template>
          </a-button>
        </template>
      </a-input>
    </a-space>
  </div>
</template>

<script setup>
import { IconClose, IconDown, IconUp } from '@arco-iconbox/vue-boxy'
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'

import { useStore } from '../store/store'

const visible = ref(false)
const store = useStore()
const keyEvents = new AbortController()

function handleInput(value) {
  store.searchPlugin.searchAndHighlight(value)
}

function handlePressEnter() {
  store.searchPlugin.next()
}

function handleUpClick() {
  store.searchPlugin.previous()
}

function handleDownClick() {
  store.searchPlugin.next()
}

function handleCloseClick() {
  store.searchVisible = false
}

function handleKeyDown(event) {
  if ((event.ctrlKey || event.metaKey) && event.key === 'f') {
    store.searchVisible = true
    event.preventDefault()
    event.stopPropagation()
  }
}

watch(
  () => store.searchVisible,
  (isVisible, wasVisible) => {
    visible.value = isVisible
    if (!isVisible && wasVisible) store.searchPlugin?.close()
  },
  { immediate: true }
)

onMounted(() => {
  store.workspaceSvg.getInjectionDiv().addEventListener('keydown', handleKeyDown, {
    signal: keyEvents.signal
  })
})
onBeforeUnmount(() => keyEvents.abort())
</script>

<style lang="less">
#search {
  position: absolute;
  z-index: 7;
  top: 40px;
  right: 40px;

  > div > div > span > span.arco-input-append {
    padding: 0 4px;
  }
}

div.blockly-ws-search {
  display: none !important;
}
</style>
