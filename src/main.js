import "./codespace/codespace.less";
import "./toolbox/toolbox.less";
import "./workspace/workspace.less";
import "./theme/theme.less";
import "./search/search.less";
import "./trashcan/trashcan.less";
import "./zoomBox/zoomBox.less";
import "./theme/codemao.theme";
import "./theme/codemao.renderer";
import "./icon/category/category";
import "./toolbox/toolbox";
import "./blocks/boxy";
import "./blocks/patch";
import "@arco-design/web-vue/dist/arco.css";
import "@blockly/block-plus-minus";
import "./dialog/dialog.vue";
import "highlight.js/styles/atom-one-dark.css";
import "highlight.js/lib/common";
import "@arco-themes/vue-boxy/index.less";

import ArcoVue from "@arco-design/web-vue";
import hljsVuePlugin from "@highlightjs/vue-plugin";
import { registerSW } from "virtual:pwa-register";
import { createApp } from "vue";

import App from "./App.vue";
import trashcan from "./trashcan/trashcan";
import observer from "./utils/observer";

const app = createApp(App);
app.use(ArcoVue);
app.use(hljsVuePlugin);
app.mount("#app");

observer("#boxy > .blocklyDiv > div > svg.blocklyFlyout", ["style"], function (element) {
  if (element.style.display === "block") {
    element.style.transform = "translate(60px,0px)";
  } else {
    element.style.transform = "translate(-260px,0px)";
  }
});

observer("#boxy > .blocklyDiv > div >  div.blocklyToolboxDiv.blocklyNonSelectable", ["class"], function (element) {
  if (element.classList.contains("blocklyToolboxDelete")) {
    trashcan.coverOn();
  } else {
    trashcan.coverOff();
  }
});

if ("serviceWorker" in navigator) {
  // && !/localhost/.test(window.location)) {
  registerSW();
}
