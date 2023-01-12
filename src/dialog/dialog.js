import Blockly from "blockly";
import $ from "jquery";

import myDialog from "./dialog.html";

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

  close = (time = 100) => {
    $(this.overlay).fadeOut(time);
  };
}

let boxyDialog = new BoxyDialog();
export default boxyDialog;

/**
 * 对Blockly本身的弹窗函数进行适配。
 */
var CustomDialog = {};

/**
 * 重构 Blockly.dialog.setAlert() 函数
 * @override
 */
Blockly.dialog.setAlert(function (message, callback) {
  CustomDialog.show("", message, {
    showOkay: true,
    onOkay: callback,
  });
});
/**
 * 重构 Blockly.dialog.setConfirm() 函数
 * @override
 */
Blockly.dialog.setConfirm(function (message, callback) {
  CustomDialog.show("", message, {
    showOkay: true,
    onOkay: function () {
      callback(true);
    },
    showCancel: true,
    onCancel: function () {
      callback(false);
    },
  });
});
/**
 * 重构 Blockly.dialog.setPrompt() 函数
 * @override
 */
Blockly.dialog.setPrompt(function (message, defaultValue, callback) {
  CustomDialog.show(message, "", {
    showInput: true,
    showOkay: true,
    onOkay: function () {
      callback(CustomDialog.inputField.value);
    },
    showCancel: true,
    onCancel: function () {
      callback(null);
    },
  });
  CustomDialog.inputField.value = defaultValue;
});
/**
 * 显示对话框
 * @method
 * 可选参数:
 *  - showOkay: 是否显示确认按钮
 *  - showCancel: 是否显示取消按钮
 *  - showInput: 是否显示输入栏
 *  - onOkay: 回调处理确认按钮按下时的操作
 *  - onCancel: 回调处理取消按钮按下时或背景被点击时的操作
 */
CustomDialog.show = function (title, message, options) {
  boxyDialog.open(myDialog);
  let dialogInput = document.getElementsByClassName("customDialogInput")[0];
  document.getElementsByClassName("customDialogCancel")[0].style.display = options.showCancel ? "" : "none";
  document.getElementsByClassName("customDialogConfirm")[0].style.display = options.showOkay ? "" : "none";
  document.getElementsByClassName("customDialogText")[0].style.display = title !== "" ? "" : "none";
  document.getElementsByClassName("customDialogText")[1].style.display = message !== "" ? "" : "none";
  dialogInput.style.display = options.showInput ? "" : "none";
  document.getElementsByClassName("customDialogText")[0].innerHTML = title;
  document.getElementsByClassName("customDialogText")[1].innerHTML = message;
  document.getElementsByClassName("customDialogConfirm")[0].onclick = function () {
    boxyDialog.close();
    onOkay();
  };
  document.getElementsByClassName("customDialogCancel")[0].onclick = function () {
    boxyDialog.close();
    onCancel();
  };
  let onOkay = function (event) {
    options.onOkay && options.onOkay();
    event && event.stopPropagation();
  };
  let onCancel = function (event) {
    options.onCancel && options.onCancel();
    event && event.stopPropagation();
  };
  CustomDialog.inputField = dialogInput;
  if (dialogInput.style.display === "block") {
    dialogInput.focus();
  }
};
