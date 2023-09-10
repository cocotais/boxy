<template>
  <div class="blocklyDiv" ref="blocklyDiv"></div>
</template>

<script setup>
import '@blockly/block-plus-minus'

import { WorkspaceSearch } from '@blockly/plugin-workspace-search'
import Blockly from 'blockly'
import { onMounted, ref } from 'vue'

import toolboxConfig from '../assets/toolbox.json'
import { block_style } from '../blocks/patch'
import * as zh from '../msg/zh.json'
import { useStore } from '../store/store'

Blockly.setLocale(zh)

Blockly.Scrollbar.scrollbarThickness = 15
Blockly.FlyoutButton.BORDER_RADIUS = 4
Blockly.FlyoutButton.TEXT_MARGIN_X = 10
Blockly.FlyoutButton.TEXT_MARGIN_Y = 10

block_style('lists_create_with', 'list')
block_style('procedures_defnoreturn', 'function')
block_style('procedures_defreturn', 'function')
block_style('procedures_ifreturn', 'function')
block_style('procedures_callnoreturn', 'function')
block_style('procedures_callreturn', 'function')

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
  store.$patch((state)=>{
state.workspaceSvg = Blockly.inject(blocklyDiv.value, options)
    state.searchPlugin =  new WorkspaceSearch(store.workspaceSvg)
  })
  store.searchPlugin.setSearchPlaceholder('搜索作品中的积木')
  store.searchPlugin.init()
})
</script>

<style lang="less">
#app > section {
  height: 100%;

  > main {
    height: 100%;

    > div.blocklyDiv {
      width: 100%;
      height: 100%;
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
