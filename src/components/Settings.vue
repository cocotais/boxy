<template>
  <a-modal v-model:visible="visible" width="auto" :footer="false">
    <template #title>设置</template>
    <div id="modal-content">
      <a-space>
        <p id="compact-flyout-label">短积木模式</p>
        <a-switch
          :model-value="compactFlyout"
          aria-labelledby="compact-flyout-label"
          @change="handleCompactFlyoutChange"
        />
      </a-space>
      <a-space>
        <p>主题</p>
        <a-select :model-value="themeMode" @change="handleThemeChange" style="text-align: justify">
          <a-option value="light">
            <template #icon>
              <IconLight />
            </template>
            <template #default>白天模式</template>
          </a-option>
          <a-option value="dark">
            <template #icon>
              <IconDark />
            </template>
            <template #default>黑夜模式</template>
          </a-option>
          <a-option value="auto">
            <template #icon>
              <IconAuto />
            </template>
            <template #default>跟随系统</template>
          </a-option>
        </a-select>
      </a-space>
    </div>
    <template #footer>
      <span style="color: var(--color-text-4)">Copyright 2023 Coconut Studio</span>
    </template>
  </a-modal>
</template>

<script setup>
import { IconAuto, IconDark, IconLight } from '@arco-iconbox/vue-boxy'
import { useCookies } from '@vueuse/integrations/useCookies'
import { onBeforeUnmount, onMounted, ref } from 'vue'

import { useStore } from '../store/store'

const store = useStore()
const cookies = useCookies(['theme', 'compactFlyout'])
const visible = ref(false)
const themeMode = ref(cookies.get('theme') || 'auto')
const compactFlyout = ref(cookies.get('compactFlyout') !== false)
const colorScheme = window.matchMedia('(prefers-color-scheme: dark)')

function handleClick() {
  visible.value = true
}

function handleCompactFlyoutChange(value) {
  compactFlyout.value = value
  cookies.set('compactFlyout', value, { path: '/', maxAge: 31536000, sameSite: 'lax' })
  const workspace = store.workspaceSvg
  if (!workspace) return
  workspace.boxyCompactFlyout = value
  // Recreate the selected category from its definitions. Compact previews hide
  // fields, so a fresh flyout restores the complete model without touching code.
  workspace.refreshToolboxSelection()
}

function setTheme(value) {
  let theme = value
  if (value === 'auto') {
    theme = colorScheme.matches ? 'dark' : 'light'
  }
  document.body.setAttribute('arco-theme', theme)
}

function handleThemeChange(value) {
  setTheme(value)
  themeMode.value = value
  cookies.set('theme', value)
}

function handleColorSchemeChange(event) {
  if (themeMode.value === 'auto') {
    setTheme(event.matches ? 'dark' : 'light')
  }
}

onMounted(() => colorScheme.addEventListener('change', handleColorSchemeChange))
onBeforeUnmount(() => colorScheme.removeEventListener('change', handleColorSchemeChange))

setTheme(cookies.get('theme') || 'auto')

defineExpose({ handleClick })
</script>

<style>
#modal-content > div {
  justify-content: space-between;
  width: 100%;

  -webkit-tap-highlight-color: transparent;
}
</style>
