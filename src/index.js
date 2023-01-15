import "./workspace/workspace.css";
import "./icon/category/category";
import "./codespace/codespace.css";
import "./toolbox/toolbox.css";
import "./search/search.css";
import "./navigation/navigation";
import "./navigation/navigation.css";
import "./zoomBox/zoomBox";
import "./zoomBox/zoomBox.css";
import "./dialog/dialog";
import "./dialog/dialog.css";
import "./trashcan/trashcan.css";
import "./toolbox/toolbox";
import "./workspace/workspace";
import "./theme/theme.css";
import "./blocks/boxy";
import "./blocks/patch";

import theme from "./theme/theme";
import trashcan from "./trashcan/trashcan";
import cookies from "./utils/cookies";
import observer from "./utils/observer";

theme.switch(
  cookies.get("theme")
    ? cookies.get("theme")
    : window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light"
);

const themeMedia = window.matchMedia("(prefers-color-scheme: light)");
themeMedia.addEventListener("change", function (event) {
  if (!cookies.get("theme")) {
    theme.switch(event.matches ? "light" : "dark");
  }
});

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
    navigator.serviceWorker
      .register("/service-worker.js")
      .then((registration) => {
        console.log("SW registered: ", registration);
      })
      .catch((registrationError) => {
        console.log("SW registration failed: ", registrationError);
      });
  });
}
