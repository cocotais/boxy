<template>
  <div ref="trashcan" id="trashcan" class="blocklyToolboxDelete" style="cursor: grabbing">
    <img ref="trashcanLid" src="../assets/trashcan_lid.svg" alt="垃圾桶盖" />
    <img ref="trashcanBody" src="../assets/trashcan_body.svg" alt="垃圾桶身" />
  </div>
</template>

<script setup>
import { useMutationObserver } from '@vueuse/core'
import { onBeforeUnmount, onMounted, ref } from 'vue'

import { useStore } from '../store/store'

const store = useStore()
const trashcan = ref()
const trashcanLid = ref()
const trashcanBody = ref()
let workspace

function show() {
  trashcan.value.style.zIndex = 6
  trashcanLid.value.style.zIndex = 7
  trashcanBody.value.style.zIndex = 7
  trashcan.value.style.opacity = 1
  trashcanLid.value.style.opacity = 1
  trashcanBody.value.style.opacity = 1
}

function hide() {
  trashcan.value.style.zIndex = 0
  trashcanLid.value.style.zIndex = 0
  trashcanBody.value.style.zIndex = 0
  trashcan.value.style.opacity = 0
  trashcanLid.value.style.opacity = 0
  trashcanBody.value.style.opacity = 0
}

function open() {
  trashcanLid.value.style.transform = 'translate(-4px,-4px) rotate(-20deg)'
}

function close() {
  trashcanLid.value.style.transform = 'translate(0px, 0px) rotate(0deg)'
}

function handleWorkspaceChange(event) {
  if (event.type === 'drag') {
    if (event.isStart) show()
    else hide()
  } else if (event.type === 'move' && event.oldCoordinate !== undefined) {
    hide()
  }
}

onMounted(() => {
  workspace = store.workspaceSvg
  useMutationObserver(
    workspace.getToolbox().HtmlDiv,
    (mutations) => {
      if (mutations[0].target.classList.contains('blocklyToolboxDelete')) {
        open()
      } else {
        close()
      }
    },
    { attributeFilter: ['class'] }
  )
  workspace.addChangeListener(handleWorkspaceChange)
})

onBeforeUnmount(() => workspace?.removeChangeListener(handleWorkspaceChange))
</script>

<style lang="less">
#trashcan {
  position: absolute;
  z-index: 0;
  top: 0;

  width: 60px;
  height: 100%;

  opacity: 0;
  background-color: rgb(0 0 0 / 30%);
  backdrop-filter: blur(12px) saturate(145%);

  transition:
    opacity ease 200ms,
    z-index ease 200ms;

  > img {
    user-select: none;

    position: absolute;
    top: 50%;

    opacity: 0;

    transition: opacity 0.5s;
  }

  > img:nth-child(1) {
    position: absolute;
    left: 12px;

    width: 36px;
    margin-top: -42px;

    transition:
      transform cubic-bezier(0.34, 0.69, 0.1, 1) 300ms,
      opacity cubic-bezier(0.34, 0.69, 0.1, 1) 300ms;
  }

  > img:nth-child(2) {
    position: absolute;
    left: 15px;
    width: 30px;
    margin-top: -30px;
  }
}
</style>
