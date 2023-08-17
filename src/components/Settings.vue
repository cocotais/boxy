<template>
  <a-modal v-model:visible="visible">
    <template #title>设置</template>
    <div id="modal-content">
      <a-space>
        <p>积木盒宽度</p>
        <a-radio-group :model-value="flyoutMode" @change="handleFlyoutChange" type="button">
          <a-radio value="full">适应</a-radio>
          <a-radio value="fixed">固定</a-radio>
        </a-radio-group>
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
  </a-modal>
</template>

<script setup>
import { IconAuto, IconDark, IconLight } from '@arco-iconbox/vue-boxy'
import { onMounted, ref } from 'vue'

import Cookies from '../utils/cookies'

const visible = ref(false)
const flyoutMode = ref(Cookies.get('flyout') || 'full')
const themeMode = ref(Cookies.get('theme') || 'auto')

function handleClick() {
  visible.value = true
}

function handleFlyoutChange(value) {
  const flyout = document.querySelector('div.injectionDiv > svg.blocklyFlyout')
  if (flyout) {
    flyout.style.width = '320px'
    if (value === 'full') {
      flyout.classList.remove('blocklyFlyoutFixed')
    } else {
      flyout.classList.add('blocklyFlyoutFixed')
    }
  }
  flyoutMode.value = value
  Cookies.set('flyout', flyoutMode.value)
}

function setTheme(value) {
  if (value === 'light') {
    document.body.removeAttribute('arco-theme')
  } else if (value === 'dark') {
    document.body.setAttribute('arco-theme', 'dark')
  }
}

function handleThemeChange(value) {
  if (value === 'auto') {
    setTheme(window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
  } else {
    setTheme(value)
  }
  themeMode.value = value
  Cookies.set('theme', themeMode.value)
}

window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function (event) {
  if (event.matches && themeMode.value === 'auto') {
    setTheme('dark')
  } else {
    setTheme('light')
  }
})

onMounted(() => {
  handleFlyoutChange(flyoutMode.value)
  handleThemeChange(themeMode.value)
})

defineExpose({ handleClick })
</script>

<style>
#modal-content > div {
  justify-content: space-between;
  width: 100%;
}

.arco-modal {
  width: calc(100% - 40px);
  max-width: 520px;
  margin: 0 20px;
}
</style>
