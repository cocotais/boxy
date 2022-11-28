import { workspace } from "../workspace/workspace";

let zoomBox = document.querySelector("#zoomBox");

// sigmoid 函数
function sigmoid(x) {
  const ex = Math.E ** x;
  return ex / (ex + 1);
}

// 缩放栏样式
let zoomFunctions = document.getElementsByClassName("zoomFunctions");
for (let element = 0; element < zoomFunctions.length; element++) {
  zoomFunctions[element].setAttribute("width", "25px");
  zoomFunctions[element].setAttribute("height", "25px");
  zoomFunctions[element].setAttribute("size", "1em");
}

// 缩放栏尺寸变化
function zoomBoxSizeManager() {
  // 仅作基础适配
  let size = zoomBox.getBoundingClientRect();
  let unit = 55 - 10 * sigmoid(0.005 * size.left - 2);
  zoomBox.style.width = 5.5 * unit + "px";
  zoomBox.style.height = unit + "px";
}

window.addEventListener("resize", zoomBoxSizeManager);
zoomBoxSizeManager();

window.zoomBoxSmaller = function () {
  document.getElementsByClassName("blocklyZoom")[0].dispatchEvent(new PointerEvent("pointerdown"));
  document.getElementById("zoomBoxReset").innerHTML = Math.ceil(workspace.getScale() * 100) + "%";
};

window.zoomBoxReset = function () {
  document.getElementsByClassName("blocklyZoom")[2].dispatchEvent(new PointerEvent("pointerdown"));
  document.getElementById("zoomBoxReset").innerHTML = Math.ceil(workspace.getScale() * 100) + "%";
};

window.zoomBoxBigger = function () {
  document.getElementsByClassName("blocklyZoom")[1].dispatchEvent(new PointerEvent("pointerdown"));
  document.getElementById("zoomBoxReset").innerHTML = Math.ceil(workspace.getScale() * 100) + "%";
};
