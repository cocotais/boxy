import $ from "jquery";

class BoxyDialog {
  constructor() {
    console.log("overlay");
    this.overlay = document.createElement("div");
    this.overlay.id = "overlay";
    this.window = document.createElement("div");
    this.window.id = "window";
    this.overlay.appendChild(this.window);
    document.body.appendChild(this.overlay);
    $(this.overlay).hide(0);
    window.addEventListener("resize", this.resize);
    this.resize();
  }

  resize = () => {
    if (window.innerWidth >= 750) {
      this.window.classList.remove("full");
      this.window.classList.add("center");
    } else {
      this.window.classList.remove("center");
      this.window.classList.add("full");
    }
  };

  open = (content) => {
    this.window.innerHTML = content;
    $(this.overlay).fadeIn(100);
    this.pageHead = this.window.getElementsByClassName("pageHead")[0];
    if (this.pageHead.children.close !== undefined) {
      this.pageHead.children.close.addEventListener("click", this.close);
    }
  };

  close = () => {
    $(this.overlay).fadeOut(100);
  };
}

let boxyDialog = new BoxyDialog();
export default boxyDialog;
