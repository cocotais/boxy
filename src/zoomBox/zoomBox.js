import codespace from "../codespace/codespace";
import workspace from "../workspace/workspace";

function sigmoid(x) {
  const ex = Math.E ** x;
  return ex / (ex + 1);
}

class BoxyZoomBox {
  constructor() {
    this.zoomBoxDiv = document.getElementById("zoomBox");
    this.blocklyZoomButtons = document.getElementsByClassName("blocklyZoom");
    this.zoomPercentageDiv = document.getElementById("zoomBoxReset");
    this.blocklyArea = document.getElementById("blocklyArea");
    this.codespaceDiv = document.getElementById("codespace");
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

    window.addEventListener("resize", this.resize);
    this.resize();
  };

  resize = () => {
    const size = this.zoomBoxDiv.getBoundingClientRect();
    const unit = 55 - 10 * sigmoid(0.005 * size.left - 2);
    this.zoomBoxDiv.style.width = 5.5 * unit + "px";
    this.zoomBoxDiv.style.height = unit + "px";
  };

  // TODO More Effective Zoom Controller

  smaller_ = () => {
    this.smallerButton.dispatchEvent(new PointerEvent("pointerdown"));
    this.zoomPercentageDiv.innerHTML = Math.ceil(workspace.workspace.getScale() * 100) + "%";
  };

  bigger_ = () => {
    this.biggerButton.dispatchEvent(new PointerEvent("pointerdown"));
    this.zoomPercentageDiv.innerHTML = Math.ceil(workspace.workspace.getScale() * 100) + "%";
  };

  reset_ = () => {
    this.resetButton.dispatchEvent(new PointerEvent("pointerdown"));
    this.zoomPercentageDiv.innerHTML = Math.ceil(workspace.workspace.getScale() * 100) + "%";
  };

  codespaceSwitch_ = () => {
    if (this.blocklyArea.getAttributeNames().indexOf("code") === -1) {
      this.blocklyArea.setAttribute("code", "");
      this.codespaceDiv.setAttribute("code", "");
      this.codespaceButton.style.color = "var(--boxy-color)";
    } else {
      this.blocklyArea.removeAttribute("code");
      this.codespaceDiv.removeAttribute("code");
      this.codespaceButton.style.color = "var(--zoombox-color)";
    }
    workspace.resize();
    codespace.resize();
  };
}

let zoomBox = new BoxyZoomBox();
zoomBox.load();
export default zoomBox;

window.zoomBoxSmaller = zoomBox.smaller_;
window.zoomBoxReset = zoomBox.reset_;
window.zoomBoxBigger = zoomBox.bigger_;
window.codespaceSwitch = zoomBox.codespaceSwitch_;
