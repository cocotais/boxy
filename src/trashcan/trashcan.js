class BoxyTrashcan {
  constructor() {
    this.trashCan = document.getElementById("trashcan");
    this.trashcanLid = document.getElementById("trashcan-lid");
    this.trashcanBody = document.getElementById("trashcan-body");
  }

  switchOn() {
    this.trashCan.style.zIndex = 6;
    this.trashcanLid.style.zIndex = 7;
    this.trashcanBody.style.zIndex = 7;
    this.trashCan.style.opacity = 1;
    this.trashcanLid.style.opacity = 1;
    this.trashcanBody.style.opacity = 1;
  }

  switchOff() {
    this.trashCan.style.zIndex = 0;
    this.trashcanLid.style.zIndex = 0;
    this.trashcanBody.style.zIndex = 0;
    this.trashCan.style.opacity = 0;
    this.trashcanLid.style.opacity = 0;
    this.trashcanBody.style.opacity = 0;
  }

  coverOn() {
    this.trashcanLid.style.transform = "translate(-4px,-4px) rotate(-20deg)";
  }

  coverOff() {
    this.trashcanLid.style.transform = "translate(0px, 0px) rotate(0deg)";
  }
}

let trashcan = new BoxyTrashcan();
export default trashcan;
