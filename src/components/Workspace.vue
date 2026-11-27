<template>
  <div class="blocklyDiv" ref="blocklyDiv"></div>
</template>

<script setup>
import { WorkspaceSearch } from '@blockly/plugin-workspace-search'
import { useCookies } from '@vueuse/integrations/useCookies'
import * as Blockly from 'blockly'
import * as zhHans from 'blockly/msg/zh-hans'
import { onBeforeUnmount, onMounted, ref } from 'vue'

import toolboxConfig from '../assets/toolbox.json'
import { registerVariableToolbox } from '../blocks/toolbox'
import zh from '../msg/zh.json'
import { useStore } from '../store/store'
import { CodemaoDragger } from '../theme/codemao.dragging.js'

Blockly.setLocale({ ...zhHans, ...zh })

Blockly.Scrollbar.scrollbarThickness = 15
Blockly.FlyoutButton.BORDER_RADIUS = 4
Blockly.FlyoutButton.TEXT_MARGIN_X = 10
Blockly.FlyoutButton.TEXT_MARGIN_Y = 10

const blocklyDiv = ref()
const store = useStore()
const cookies = useCookies(['compactFlyout'])
const options = {
  plugins: {
    [Blockly.registry.Type.FLYOUTS_VERTICAL_TOOLBOX]: 'codemaoFlyout',
    [Blockly.registry.Type.BLOCK_DRAGGER]: CodemaoDragger
  },
  toolbox: toolboxConfig,
  media: '/media',
  trashcan: false,
  zoom: {
    controls: true,
    wheel: true,
    startScale: 1,
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
  store.$patch((state) => {
    state.workspaceSvg = Blockly.inject(blocklyDiv.value, options)
    state.workspaceSvg.boxyCompactFlyout = cookies.get('compactFlyout') !== false
    registerVariableToolbox(state.workspaceSvg)
    state.searchPlugin = new WorkspaceSearch(store.workspaceSvg)
  })
  store.searchPlugin.setSearchPlaceholder('搜索作品中的积木')
  store.searchPlugin.init()
})

onBeforeUnmount(() => {
  store.searchPlugin?.dispose()
  store.workspaceSvg?.dispose()
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

body {
  .blocklyWidgetDiv .blocklyHtmlInput {
    border: 0;
    color: #344265;
    background: #fff;
  }
}
</style>
