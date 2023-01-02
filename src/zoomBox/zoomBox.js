import codespace from "../codespace/codespace";
import theme from "../theme/theme";
import workspace from "../workspace/workspace";

/**
 * sigmoid函数
 * @function
 * @param {number} x
 * @returns {number}
 */
function sigmoid(x) {
  const ex = Math.E ** x;
  return ex / (ex + 1);
}

class BoxyZoomBox {
  /**
   * 缩放栏
   * @constructor
   */
  constructor() {
    // 标签
    this.blocklyDiv = document.getElementById("blocklyDiv");
    this.codespaceDiv = document.getElementById("codespace");
    this.zoomBoxDiv = document.getElementById("zoomBox");
    this.percentageDiv = document.getElementById("zoomBoxReset");
    // 按钮
    this.blocklyZoomButtons = document.getElementsByClassName("blocklyZoom");
    this.codespaceButton = document.getElementById("switchCode");
    this.smallerButton = this.blocklyZoomButtons[0];
    this.biggerButton = this.blocklyZoomButtons[1];
    this.resetButton = this.blocklyZoomButtons[2];
  }

  /**
   * 加载缩放栏图标，禁用右键，监听窗口尺寸变化。
   * @method
   */
  load = () => {
    // 加载缩放栏图标
    let zoomFunctions = document.getElementsByClassName("zoomFunctions");
    Array.prototype.forEach.call(zoomFunctions, function (zoomFunction) {
      zoomFunction.setAttribute("width", "25px");
      zoomFunction.setAttribute("height", "25px");
      zoomFunction.setAttribute("size", "1em");
    });
    // 禁用右键
    this.zoomBoxDiv.addEventListener("contextmenu", function (event) {
      event.preventDefault();
    });
    // 监听窗口尺寸变化
    window.addEventListener("resize", this.resize);
    this.resize();
    // 为重置按钮赋基础值
    this.reset();
  };

  /**
   * 根据当前用户窗口大小，重置代码区尺寸。
   * @method
   */
  resize = () => {
    const size = this.zoomBoxDiv.getBoundingClientRect();
    const unit = 55 - 10 * sigmoid(0.005 * size.left - 2);
    this.zoomBoxDiv.style.width = 5.5 * unit + "px";
    this.zoomBoxDiv.style.height = unit + "px";
    this.zoomBoxDiv.style.right = codespace.width() + 40 + "px";
  };

  /**
   * 主题切换按钮。
   * @method
   */
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

  /**
   * 代码区切换按钮。
   * @method
   */
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

  /**
   * 缩小按钮。
   * @method
   */
  smaller = () => {
    this.smallerButton.dispatchEvent(new PointerEvent("pointerdown"));
    this.percentageDiv.innerHTML = Math.floor((workspace.workspace.getScale() * (5 / 3) - 1 / 3) * 100) + "%";
  };

  /**
   * 重置按钮。
   * @method
   */
  reset = () => {
    this.resetButton.dispatchEvent(new PointerEvent("pointerdown"));
    this.percentageDiv.innerHTML = Math.floor((workspace.workspace.getScale() * (5 / 3) - 1 / 3) * 100) + "%";
  };

  /**
   * 放大按钮。
   * @method
   */
  bigger = () => {
    this.biggerButton.dispatchEvent(new PointerEvent("pointerdown"));
    this.percentageDiv.innerHTML = Math.floor((workspace.workspace.getScale() * (5 / 3) - 1 / 3) * 100) + "%";
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
