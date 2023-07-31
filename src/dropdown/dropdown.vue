<template>
  <a-popover position="rt" trigger="click">
    <div id="brand">
      <img src="../icon/logo/boxy.svg" alt="" />
    </div>
    <template #content>
      <a-doption>新建</a-doption>
      <a-doption @click="save_to_pc">保存到电脑</a-doption>
      <a-doption @click="open_file">打开本地文件</a-doption>
      <a-divider margin="1px" />
      <a-doption @click="open_doc">文档</a-doption>
      <a-doption @click="more_opinion">更多选项</a-doption>
    </template>
  </a-popover>
  <a-drawer :width="340" :visible="visible" @cancel="handleCancel" unmountOnClose :footer="false">
    <template #title> 更多 </template>
    <div>
      <a-typography-title :heading="6">偏好设置</a-typography-title>
      <a-space size="large" :fill="fill" :style="{ justifyContent: 'space-between', color: 'var(--color-text-2)' }">
        <p>积木盒积木全显</p>
        <a-switch />
      </a-space>
      <a-space size="large" :fill="fill" :style="{ justifyContent: 'space-between', color: 'var(--color-text-2)' }">
        <p>主题</p>
        <a-select
          @change="theme_change"
          v-model:model-value="theme_value"
          :style="{ width: '150px' }"
          default-value="跟随系统"
        >
          <a-option>
            <template #icon>
              <icon-light />
            </template>
            <template #default>亮色模式</template>
          </a-option>
          <a-option>
            <template #icon>
              <icon-dark />
            </template>
            <template #default>暗黑模式</template>
          </a-option>
          <a-option>
            <template #icon>
              <icon-auto />
            </template>
            <template #default>跟随系统</template>
          </a-option>
        </a-select>
      </a-space>
      <a-typography-title :heading="6">关于Boxy</a-typography-title>
      <a-space size="large" :fill="fill" :style="{ justifyContent: 'space-between', color: 'var(--color-text-2)' }">
        Boxy yyds！
      </a-space>
    </div>
  </a-drawer>
</template>

<script setup>
import Blockly from "blockly";
import { defineProps, ref } from "vue";
const props = defineProps(["workspace"]);
import { IconAuto, IconDark, IconLight } from "@arco-iconbox/vue-boxy";

import Theme from "@/theme/theme";

const visible = ref(false);
const fill = ref(true);
const theme_value = ref(localStorage.getItem("theme") || "跟随系统");

const more_opinion = () => {
  visible.value = true;
};

window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", (event) => {
  if (event.matches && theme_value.value === "跟随系统") {
    Theme.switch("dark");
  } else {
    Theme.switch("light");
  }
});

switch_theme();

function switch_theme() {
  localStorage.setItem("theme", theme_value.value);
  switch (theme_value.value) {
    case "亮色模式":
      Theme.switch("light");
      break;
    case "暗黑模式":
      Theme.switch("dark");
      break;
    default:
      Theme.switch(window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
  }
}

const theme_change = (value) => {
  theme_value.value = value;
  switch_theme();
};
const handleCancel = () => {
  visible.value = false;
};

const save_to_pc = () => {
  let a = document.createElement("a");
  a.href = `data:,${JSON.stringify(Blockly.serialization.workspaces.save(props.workspace))}`;
  a.download = "project.boxy";
  a.click();
};

const open_file = () => {
  let input = document.createElement("input");
  input.setAttribute("id", "file");
  input.setAttribute("type", "file");
  input.setAttribute("name", "file");
  input.setAttribute("style", "visibility:hidden");
  input.setAttribute("accept", ".boxy");
  document.body.appendChild(input);
  input.click();
  input.onchange = (event) => {
    let file = event.target.files[0];
    let file_reader = new FileReader();
    file_reader.onload = () => {
      let fc = JSON.parse(file_reader.result);
      Blockly.serialization.workspaces.load(fc, props.workspace);
    };
    file_reader.readAsText(file, "UTF-8");
  };
};

const open_doc = () => {
  window.open("https://www.yuque.com/hzsn/waddle/eg76gf6z3ikaie2b");
};
</script>

<style scoped>
#brand {
  background-color: var(--toolbox-background);
  position: absolute;
  top: 0;
  left: 0;
  z-index: 4;
  width: 36px;
  height: 36px;
  padding: 12px;
}
</style>
