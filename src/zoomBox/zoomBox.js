import codespace from "../codespace/codespace";
import theme from "../theme/theme";
import workspace from "../workspace/workspace";

function sigmoid(x) {
  const ex = Math.E ** x;
  return ex / (ex + 1);
}

class BoxyZoomBox {
  constructor() {
    this.blocklyDiv = document.getElementById("blocklyDiv");
    this.codespaceDiv = document.getElementById("codespace");
    this.zoomBoxDiv = document.getElementById("zoomBox");
    this.percentageDiv = document.getElementById("zoomBoxReset");

    this.blocklyZoomButtons = document.getElementsByClassName("blocklyZoom");
    this.codespaceButton = document.getElementById("switchCode");
    this.smallerButton = this.blocklyZoomButtons[0];
    this.biggerButton = this.blocklyZoomButtons[1];
    this.resetButton = this.blocklyZoomButtons[2];
  }

  load = () => {
    let zoomFunctions = document.getElementsByClassName("zoomFunctions");
    Array.prototype.forEach.call(zoomFunctions, function (zoomFunction) {
      zoomFunction.setAttribute("width", "25px");
      zoomFunction.setAttribute("height", "25px");
      zoomFunction.setAttribute("size", "1em");
    });

    this.zoomBoxDiv.addEventListener("contextmenu", function (event) {
      event.preventDefault();
    });

    window.addEventListener("resize", this.resize);
    this.resize();

    this.reset();
  };

  resize = () => {
    const size = this.zoomBoxDiv.getBoundingClientRect();
    const unit = 55 - 10 * sigmoid(0.005 * size.left - 2);
    this.zoomBoxDiv.style.width = 5.5 * unit + "px";
    this.zoomBoxDiv.style.height = unit + "px";
    this.zoomBoxDiv.style.right = codespace.width() + 40 + "px";
  };

  // TODO More Effective Zoom Controller

  themeSwitch = () => {
    let day = document.getElementById("switchThemeDay");
    let night = document.getElementById("switchThemeNight");
    if (theme.root.getAttributeNames().indexOf("mode") !== -1) {
      if (theme.root.getAttribute("mode") === "light") {
        theme.switch("dark");
        night.style.display = "none";
        day.style.display = "block";
      } else {
        theme.switch("light");
        day.style.display = "none";
        night.style.display = "block";
      }
    }
  };

  codespaceSwitch = () => {
    if (this.blocklyDiv.getAttributeNames().indexOf("code") === -1) {
      this.blocklyDiv.setAttribute("code", "");
      this.codespaceDiv.setAttribute("code", "");
      this.codespaceButton.style.color = "var(--boxy-color)";
    } else {
      this.blocklyDiv.removeAttribute("code");
      this.codespaceDiv.removeAttribute("code");
      this.codespaceButton.style.color = "var(--zoombox-color)";
    }
    workspace.resize();
    codespace.resize();
    this.resize();
  };

  smaller = () => {
    this.smallerButton.dispatchEvent(new PointerEvent("pointerdown"));
    this.percentageDiv.innerHTML = Math.ceil(workspace.workspace.getScale() * 100) + "%";
  };

  reset = () => {
    this.resetButton.dispatchEvent(new PointerEvent("pointerdown"));
    this.percentageDiv.innerHTML = Math.ceil(workspace.workspace.getScale() * 100) + "%";
  };

  bigger = () => {
    this.biggerButton.dispatchEvent(new PointerEvent("pointerdown"));
    this.percentageDiv.innerHTML = Math.ceil(workspace.workspace.getScale() * 100) + "%";
  };
}

let zoomBox = new BoxyZoomBox();
zoomBox.load();
export default zoomBox;

window.themeSwitch = zoomBox.themeSwitch;
window.codespaceSwitch = zoomBox.codespaceSwitch;
window.zoomBoxSmaller = zoomBox.smaller;
window.zoomBoxReset = zoomBox.reset;
window.zoomBoxBigger = zoomBox.bigger;
