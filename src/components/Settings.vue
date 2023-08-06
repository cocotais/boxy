<template>
  <a-modal v-model:visible="visible">
    <template #title>设置</template>
    <div id="modal-content">
      <a-space>
        <p>积木盒宽度</p>
        <a-radio-group type="button">
          <a-radio value="full">适应</a-radio>
          <a-radio value="fixed">固定</a-radio>
        </a-radio-group>
      </a-space>
      <a-space>
        <p>主题</p>
        <a-select :model-value="themeMode" @change="handleThemeChange" style="text-align: justify">
          <a-option>
            <template #icon>
              <IconLight />
            </template>
            <template #default>白天模式</template>
          </a-option>
          <a-option>
            <template #icon>
              <IconDark />
            </template>
            <template #default>黑夜模式</template>
          </a-option>
          <a-option>
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
import { ref } from 'vue'

import Cookies from '../utils/cookies'

const visible = ref(false)
const themeMode = ref(Cookies.get('theme') || '跟随系统')

function handleClick() {
  visible.value = true
}

function setTheme(value) {
  if (value === '白天模式') {
    document.body.removeAttribute('arco-theme')
  } else if (value === '黑夜模式') {
    document.body.setAttribute('arco-theme', 'dark')
  }
}

function handleThemeChange(value) {
  if (value === '跟随系统') {
    setTheme(window.matchMedia('(prefers-color-scheme: dark)').matches ? '黑夜模式' : '白天模式')
  } else {
    setTheme(value)
  }
  themeMode.value = value
  Cookies.set('theme', themeMode.value)
}

window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function (event) {
  if (event.matches && themeMode.value === '跟随系统') {
    setTheme('黑夜模式')
  } else {
    setTheme('白天模式')
  }
})

handleThemeChange(themeMode.value)
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
