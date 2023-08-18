<template>
  <div class="blocklyDiv" ref="blocklyDiv"></div>
</template>

<script setup>
import '@blockly/block-plus-minus'

import { WorkspaceSearch } from '@blockly/plugin-workspace-search'
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
  store.search = new WorkspaceSearch(store.workspace)
  store.search.setSearchPlaceholder('搜索作品中的积木')
  store.search.init()
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

div.blocklyWidgetDiv {
  > div.blocklyMenu {
    padding: 4px 0;
    background-color: var(--color-bg-popup);
    border: 1px solid var(--color-fill-3);
    border-radius: var(--border-radius-medium);
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);

    > div.blocklyMenuItem {
      color: var(--color-text-1);
      padding: 0 12px;
      font-size: 14px;
      line-height: 36px;
      text-align: left;
      background-color: transparent;

      > div.blocklyMenuItemContent {
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
      }
    }

    > div.blocklyMenuItem.blocklyMenuItemDisabled {
      color: var(--color-text-4);
    }

    > div.blocklyMenuItem:not(.blocklyMenuItemDisabled):hover {
      background: var(--color-fill-2);
    }
  }

  > div.blocklyMenu.blocklyFocused {
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  }
}

body {
  > div.blocklyDropDownDiv {
    border: 1px solid var(--color-fill-3);
    border-radius: var(--border-radius-medium);
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);

    > div.blocklyDropDownContent > div.blocklyMenu > div.blocklyMenuItem {
      border-radius: var(--border-radius-medium);
    }
  }

  > div.blocklyDropDownDiv.blocklyFocused {
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  }
}
</style>
