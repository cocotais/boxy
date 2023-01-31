import "./workspace/workspace.less";
import "./icon/category/category";
import "./codespace/codespace.less";
import "./toolbox/toolbox.less";
import "./search/search.less";
import "./navigation/navigation";
import "./navigation/navigation.less";
import "./zoomBox/zoomBox";
import "./zoomBox/zoomBox.less";
import "./trashcan/trashcan.less";
import "./toolbox/toolbox";
import "./workspace/workspace";
import "./theme/theme.less";
import "./blocks/boxy";
import "./blocks/patch";

import theme from "./theme/theme";
import trashcan from "./trashcan/trashcan";
import observer from "./utils/observer";

theme.switch("light");

observer("#workspace > div > svg.blocklyFlyout", ["style"], function (element) {
  if (element.style.display === "block") {
    element.style.transform = "translate(60px,0px)";
  } else {
    element.style.transform = "translate(-260px,0px)";
  }
});

observer("#workspace > div > div.blocklyToolboxDiv.blocklyNonSelectable", ["class"], function (element) {
  if (element.classList.contains("blocklyToolboxDelete")) {
    trashcan.coverOn();
  } else {
    trashcan.coverOff();
  }
});

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/service-worker.js").catch((registrationError) => {
      console.error("SW registration failed: ", registrationError);
    });
  });
}
