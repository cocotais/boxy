<template>
  <div class="blocklyDiv" ref="blocklyDiv"></div>
</template>

<script setup>
import '@blockly/block-plus-minus'

import Blockly from 'blockly'
import * as zh from 'blockly/msg/zh-hans'
import { onMounted, ref } from 'vue'

import toolboxConfig from '../assets/toolbox.json'
import { useStore } from '../utils/store'

Blockly.setLocale(zh)
Blockly.FlyoutButton.BORDER_RADIUS = 8

Blockly.Msg['CONTROLS_REPEAT_INPUT_DO'] = ''
Blockly.Msg['CONTROLS_IF_MSG_THEN'] = ''
Blockly.Msg['CONTROLS_IF_MSG_ELSE'] = ''
Blockly.Msg['LOGIC_BOOLEAN_TRUE'] = '真'
Blockly.Msg['LOGIC_BOOLEAN_FALSE'] = '假'
Blockly.Msg['NEW_VARIABLE'] = '创建变量'

const blocklyDiv = ref()
const store = useStore()
const options = {
  toolbox: toolboxConfig,
  media: '/media',
  trashcan: false,
  zoom: {
    controls: true,
    wheel: true,
    startScale: 0.8,
    maxScale: 1.4,
    minScale: 0.5
  },
  move: {
    scrollbars: true,
    drag: true,
    wheel: true
  },
  theme: 'codemao',
  renderer: 'codemao'
}

onMounted(() => {
  store.workspace = Blockly.inject(blocklyDiv.value, options)
})
</script>

<style lang="less">
#app > section {
  > main {
    > div.blocklyDiv {
      width: 100%;
      height: 100vh;
      text-align: left;

      > div.injectionDiv {
        > svg.blocklySvg {
          background-color: var(--color-bg-1);

          > g.blocklyWorkspace > rect.blocklyMainBackground {
            stroke: none;
          }
        }

        > svg.blocklyMainWorkspaceScrollbar {
          opacity: 0;
          transition: opacity ease 200ms;

          > g > rect.blocklyScrollbarHandle {
            fill: var(--color-fill-4);
          }
        }

        > svg.blocklyScrollbarHorizontal {
          margin-top: 1px;

          > g > rect.blocklyScrollbarHandle {
            height: 9px;
          }
        }

        > svg.blocklyScrollbarVertical {
          > g > rect.blocklyScrollbarHandle {
            width: 9px;
          }
        }
      }
    }
  }

  > main:hover {
    > div.blocklyDiv > div > svg.blocklyMainWorkspaceScrollbar {
      opacity: 0.8;
    }
  }
}
</style>
