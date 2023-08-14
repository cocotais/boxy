<template>
  <a-scrollbar style="overflow: auto">
    <div id="codespace">
      <div>
        <IconClose @click="handleCloseClick" />
      </div>
      <div>
        <highlightjs autodetect :code="code" />
      </div>
    </div>
  </a-scrollbar>
</template>

<script setup>
import { IconClose } from '@arco-iconbox/vue-boxy'
import { javascriptGenerator } from 'blockly/javascript'
import { onMounted, ref } from 'vue'

import { useStore } from '../utils/store'

const defaultContext = '未检测到积木块'
const code = ref(defaultContext)
const store = useStore()

onMounted(() => {
  store.workspace.addChangeListener(() => {
    code.value = javascriptGenerator.workspaceToCode(store.workspace) || defaultContext
  })
})

function handleCloseClick() {
  store.hasCodespace = false
}
</script>

<style lang="less">
@font-face {
  font-family: JetBrainsMono;
  font-display: swap;
  src: url('../assets/JetBrainsMono.ttf');
}

#app > section {
  @media screen {
    @media (max-width: 768px) {
      > div {
        min-width: 100vw;
        max-width: 100%;
        padding: 0;

        > div.arco-resizebox-trigger-vertical > div {
          display: none;
        }
      }
    }

    @media (min-width: 768px) {
      > div {
        min-width: 25%;
        max-width: 60%;
      }
    }
  }

  > div > div > div {
    > div.arco-scrollbar-container {
      padding: 1em;
      height: calc(100vh - 2em);
    }

    > div.arco-scrollbar-track > div > div {
      background: --color-fill-4 !important;
    }
  }
}

#codespace {
  > div {
    > svg {
      position: fixed;
      top: 20px;
      right: 20px;

      width: 20px;
      height: 20px;

      color: var(--color-text-3);
    }

    > pre {
      margin: 0;

      > code {
        user-select: text;

        overflow: inherit;

        padding: 0;

        font-family: JetBrainsMono, sans-serif;
        font-size: 15px;
        line-height: 1.414;

        background: transparent;

        > span::selection {
          color: inherit;
          background: #1ba2e333;
        }
      }

      > code::selection {
        color: inherit;
        background: #1ba2e333;
      }
    }
  }

  @media screen {
    @media (max-width: 768px) {
      > div:nth-child(1) {
        display: block;
        height: 60px;
      }
    }

    @media (min-width: 768px) {
      > div:nth-child(1) {
        display: none;
      }
    }
  }

  > div:nth-child(2) {
    width: 100%;
  }
}
</style>
