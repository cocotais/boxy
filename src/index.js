import "./workspace/workspace.css";
import "./icon/category/category";
import "./icon/category/category.css";
import "./toolbox/toolbox.css";
import "./search/search.css";
import "./navigation/navigation";
import "./navigation/navigation.css";
import "./zoomBox/zoomBox.css";

import { setBoxyCategory } from "./toolbox/toolbox";
import { loadWorkspace } from "./workspace/workspace";

setBoxyCategory();
loadWorkspace();

//监听器
var observer = new window.MutationObserver(function (mutations) {
  mutations.forEach(function (mutation) {
    if (mutation.type === "attributes") {
      let element = document.querySelector("#blocklyDiv > div > svg.blocklyFlyout");
      if (element.style.display === "block") {
        element.style.transform = "translate(60px,0px)";
      } else {
        element.style.transform = "translate(-260px,0px)";
      }
    }
  });
});
observer.observe(document.querySelector("#blocklyDiv > div > svg.blocklyFlyout"), {
  attributes: true,
  attributeFilter: ["style"],
});
