<template>
  <div id="zoombox">
    <a-space>
      <a-tooltip content="搜索" position="top" mini>
        <a-button type="text" aria-label="搜索">
          <template #icon>
            <icon-search />
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
          <span>100%</span>
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
import { IconBigger, IconCode, IconSearch, IconSmaller } from '@arco-iconbox/vue-boxy'

import { useStore } from '../utils/store'

let store = useStore()

function handleCodespace() {
  store.hasCodespace = !store.hasCodespace
}

function handleSmallerClick() {
  let speed = store.workspace.options.zoomOptions.scaleSpeed
  let scale = store.workspace.scale
  // \log_{speed}\left(\frac{scale - 0.15}{scale}\right)
  store.workspace.zoom(0, 0, Math.log((scale - 0.15) / scale) / Math.log(speed))
}

function handleResetClick() {
  document.getElementsByClassName('blocklyZoom')[2].dispatchEvent(new PointerEvent('pointerdown'))
}

function handleBiggerClick() {
  let speed = store.workspace.options.zoomOptions.scaleSpeed
  let scale = store.workspace.scale
  // \log_{speed}\left(\frac{scale + 0.15}{scale}\right)
  store.workspace.zoom(0, 0, Math.log((scale + 0.15) / scale) / Math.log(speed))
}
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
</style>
