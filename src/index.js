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

import theme from "./theme/theme";
import trashcan from "./trashcan/trashcan";

function getCookie(cname) {
  const name = cname + "=";
  const ca = document.cookie.split(";");
  for (let i = 0; i < ca.length; i++) {
    const c = ca[i].trim();
    if (c.indexOf(name) === 0) return c.substring(name.length, c.length);
  }
  return false;
}

theme.switch(
  getCookie("theme")
    ? getCookie("theme")
    : window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light"
);

const themeMedia = window.matchMedia("(prefers-color-scheme: light)");
themeMedia.addListener((event) => {
  if (!getCookie("theme")) {
    theme.switch(event.matches ? "light" : "dark");
  }
});

const toolboxFlyoutObserver = new window.MutationObserver(function (mutations) {
  mutations.forEach(function (mutation) {
    if (mutation.type === "attributes") {
      let element = document.querySelector("#workspace > div > svg.blocklyFlyout");
      if (element.style.display === "block") {
        element.style.transform = "translate(60px,0px)";
      } else {
        element.style.transform = "translate(-260px,0px)";
      }
    }
  });
});

toolboxFlyoutObserver.observe(document.querySelector("#workspace > div > svg.blocklyFlyout"), {
  attributes: true,
  attributeFilter: ["style"],
});

const trashcanObserver = new window.MutationObserver(function (mutations) {
  mutations.forEach(function (mutation) {
    if (mutation.type === "attributes") {
      let element = document.querySelector("#workspace > div > div.blocklyToolboxDiv.blocklyNonSelectable");
      if (element.classList.contains("blocklyToolboxDelete")) {
        trashcan.coverOn();
      } else {
        trashcan.coverOff();
      }
    }
  });
});

trashcanObserver.observe(document.querySelector("#workspace > div > div.blocklyToolboxDiv.blocklyNonSelectable"), {
  attributes: true,
  attributeFilter: ["class"],
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
