import workspace from "../workspace/workspace";

function sigmoid(x) {
  const ex = Math.E ** x;
  return ex / (ex + 1);
}

class BoxyZoomBox {
  constructor() {
    this.zoomBox = document.getElementById("zoomBox");
    this.blocklyZoom = document.getElementsByClassName("blocklyZoom");
    this.zoomPercentage = document.getElementById("zoomBoxReset");
    this.workspaceDiv = document.getElementById("blocklyDiv");
    this.codespaceDiv = document.getElementById("codespace");
    this.smallerDiv = this.blocklyZoom[0];
    this.biggerDiv = this.blocklyZoom[1];
    this.resetDiv = this.blocklyZoom[2];
  }

  load() {
    let zoomFunctions = document.getElementsByClassName("zoomFunctions");
    Array.prototype.forEach.call(zoomFunctions, function (zoomFunction) {
      zoomFunction.setAttribute("width", "25px");
      zoomFunction.setAttribute("height", "25px");
      zoomFunction.setAttribute("size", "1em");
    });

    window.addEventListener("resize", this.onresize);
    this.onresize();
  }

  onresize() {
    const size = this.zoomBox.getBoundingClientRect();
    const unit = 55 - 10 * sigmoid(0.005 * size.left - 2);
    this.zoomBox.style.width = 5.5 * unit + "px";
    this.zoomBox.style.height = unit + "px";
  }

  smaller_ = () => {
    this.smallerDiv.dispatchEvent(new PointerEvent("pointerdown"));
    this.zoomPercentage.innerHTML = Math.ceil(workspace.workspace.getScale() * 100) + "%";
  };

  bigger_ = () => {
    this.biggerDiv.dispatchEvent(new PointerEvent("pointerdown"));
    this.zoomPercentage.innerHTML = Math.ceil(workspace.workspace.getScale() * 100) + "%";
  };

  reset_ = () => {
    this.resetDiv.dispatchEvent(new PointerEvent("pointerdown"));
    this.zoomPercentage.innerHTML = Math.ceil(workspace.workspace.getScale() * 100) + "%";
  };

  codespace_ = () => {
    if (this.workspaceDiv.getAttributeNames().indexOf("x") !== -1) {
      this.workspaceDiv.setAttribute("x");
    } else {
      this.workspaceDiv.removeAttribute("x");
    }
  };
}

let zoomBox = new BoxyZoomBox();
zoomBox.load();
export default zoomBox;

window.zoomBoxSmaller = zoomBox.smaller_;
window.zoomBoxReset = zoomBox.reset_;
window.zoomBoxBigger = zoomBox.bigger_;
window.codespace = zoomBox.codespace_;
