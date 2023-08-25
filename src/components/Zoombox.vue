<template>
  <div id="zoombox">
    <a-space>
      <a-tooltip content="整理" position="top" mini>
        <a-button type="text" @click="handleCleanUpClick" aria-label="整理">
          <template #icon>
            <icon-cleanup />
          </template>
        </a-button>
      </a-tooltip>
    </a-space>
    <a-space>
      <a-tooltip content="代码区" position="top" mini>
        <a-button type="text" @click="handleCodespace" aria-label="代码区">
          <template #icon>
            <icon-code />
          </template>
        </a-button>
      </a-tooltip>
    </a-space>
    <a-space>
      <a-tooltip content="缩小" position="top" mini>
        <a-button type="text" @click="handleSmallerClick" aria-label="缩小">
          <template #icon>
            <icon-smaller />
          </template>
        </a-button>
      </a-tooltip>
      <a-tooltip content="恢复为100%" position="top" mini>
        <a-button type="text" @click="handleResetClick" aria-label="恢复为100%">
          <span ref="scale">100%</span>
        </a-button>
      </a-tooltip>
      <a-tooltip content="放大" position="top" mini>
        <a-button type="text" @click="handleBiggerClick" aria-label="放大">
          <template #icon>
            <icon-bigger />
          </template>
        </a-button>
      </a-tooltip>
    </a-space>
  </div>
</template>

<script setup>
import { IconBigger, IconCleanup, IconCode, IconSmaller } from '@arco-iconbox/vue-boxy'
import { onMounted, ref } from 'vue'

import { useStore } from '../store/store'

const scale = ref()
const store = useStore()

function handleCleanUpClick() {
  store.workspaceSvg.cleanUp()
}

function handleCodespace() {
  store.hasLayoutSider = !store.hasLayoutSider
}

function handleSmallerClick() {
  let speed = store.workspaceSvg.options.zoomOptions.scaleSpeed
  let scale = store.workspaceSvg.scale
  store.workspaceSvg.zoom(0, 0, Math.log((scale - 0.15) / scale) / Math.log(speed))
}

function handleResetClick() {
  document.getElementsByClassName('blocklyZoom')[2].dispatchEvent(new PointerEvent('pointerdown'))
}

function handleBiggerClick() {
  let speed = store.workspaceSvg.options.zoomOptions.scaleSpeed
  let scale = store.workspaceSvg.scale
  store.workspaceSvg.zoom(0, 0, Math.log((scale + 0.15) / scale) / Math.log(speed))
}

onMounted(() => {
  store.workspaceSvg.addChangeListener(() => {
    scale.value.innerHTML = Math.floor((store.workspaceSvg.scale * (5 / 3) - 1 / 3) * 100) + '%'
  })
})
</script>

<style>
.blocklyZoom {
  display: block;
  opacity: 0;
}

#app > section > main {
  position: relative;
}

#zoombox {
  position: absolute;
  right: 40px;
  bottom: 40px;
  width: max-content;

  > div {
    position: relative;
    z-index: 9;

    display: inline-flex;
    align-items: center;
    justify-content: space-evenly;

    margin-right: 10px;

    background-color: var(--color-bg-2);
    border: var(--color-border-2) solid 1px;
    border-radius: var(--border-radius-medium);

    > div {
      margin: 0 !important;

      > button > span {
        color: var(--color-text-2);
      }
    }
  }

  > div:nth-last-child(1) {
    margin-right: 0;

    > div:nth-child(2) > button {
      padding: 0 5px;
    }
  }
}

div.arco-trigger-popup.arco-trigger-position-top.arco-tooltip {
  visibility: hidden;
}

arco-btn-text,
.arco-btn-text[type='button'],
.arco-btn-text[type='submit'] {
  background: transparent !important;

  -webkit-tap-highlight-color: transparent;
}

arco-btn-text:active,
.arco-btn-text[type='button']:active,
.arco-btn-text[type='submit']:active {
  background: var(--color-fill-3) !important;
}

@media (any-hover: hover) {
  div.arco-trigger-popup.arco-trigger-position-top.arco-tooltip {
    visibility: visible;
  }

  arco-btn-text:hover,
  .arco-btn-text[type='button']:hover,
  .arco-btn-text[type='submit']:hover {
    background: var(--color-fill-2) !important;
  }
}
</style>
