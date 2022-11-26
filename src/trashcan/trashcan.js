import { workspace } from "../workspace/workspace";

let trashcanLid = document.getElementById("trashcan-lid");
let trashcanBody = document.getElementById("trashcan-body");
let trashCan = document.getElementById("trashcan");

export function trashcanSwitchOn() {
  trashcanLid.style.zIndex = 7;
  trashcanBody.style.zIndex = 7;
  trashCan.style.zIndex = 6;
  trashcanLid.style.opacity = 1;
  trashcanBody.style.opacity = 1;
  trashCan.style.opacity = 1;
}

export function trashcanSwitchOff() {
  trashcanLid.style.zIndex = 0;
  trashcanBody.style.zIndex = 0;
  trashCan.style.zIndex = 0;
  trashcanLid.style.opacity = 0;
  trashcanBody.style.opacity = 0;
  trashCan.style.opacity = 0;
}

export function trashcanCoverOn() {
  trashcanLid.style.transform = "translate(-4px,-4px) rotate(-20deg)";
}

export function trashcanCoverOff() {
  trashcanLid.style.transform = "translate(0px, 0px) rotate(0deg)";
}

// 垃圾桶监听器
export function setTrashcan() {
  workspace.addChangeListener(function (event) {
    if (event.type === "drag") {
      trashcanSwitchOn();
    } else if (event.type === "move") {
      trashcanSwitchOff();
      trashcanCoverOff();
    }
  });
}
