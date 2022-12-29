/**
 * @license
 * Copyright 2016 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import Blockly from "blockly";

var CustomDialog = {};

/** 重构 Blockly.dialog.setAlert() 函数 */
Blockly.dialog.setAlert(function (message, callback) {
  CustomDialog.show("Alert", message, {
    onCancel: callback,
  });
});

/** 重构 Blockly.dialog.setConfirm() 函数 */
Blockly.dialog.setConfirm(function (message, callback) {
  CustomDialog.show("Confirm", message, {
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

/** 重构 Blockly.dialog.setPrompt() 函数 */
Blockly.dialog.setPrompt(function (message, defaultValue, callback) {
  CustomDialog.show("Prompt", message, {
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

/** 隐藏所有出现的对话框 */
CustomDialog.hide = function () {
  if (CustomDialog.backdropDiv_) {
    CustomDialog.backdropDiv_.style.display = "none";
    CustomDialog.dialogDiv_.style.display = "none";
  }
};

/**
 * 显示对话框
 * 可选参数:
 *  - showOkay: 是否显示确认按钮
 *  - showCancel: 是否显示取消按钮
 *  - showInput: 是否显示输入栏
 *  - onOkay: 回调处理确认按钮按下时的操作
 *  - onCancel: 回调处理取消按钮按下时或背景被点击时的操作
 */
CustomDialog.show = function (title, message, options) {
  var backdropDiv = CustomDialog.backdropDiv_;
  var dialogDiv = CustomDialog.dialogDiv_;
  if (!dialogDiv) {
    backdropDiv = document.createElement("div");
    backdropDiv.id = "customDialogBackdrop";
    backdropDiv.style.cssText =
      "position: absolute;" +
      "top: 0; left: 0; right: 0; bottom: 0;" +
      "background-color: rgba(0, 0, 0, .7);" +
      "z-index: 100;";
    document.body.appendChild(backdropDiv);

    dialogDiv = document.createElement("div");
    dialogDiv.id = "customDialog";
    dialogDiv.style.cssText = "background-color: #fff;" + "width: 400px;" + "margin: 20px auto 0;" + "padding: 10px;";
    backdropDiv.appendChild(dialogDiv);

    dialogDiv.onclick = function (event) {
      event.stopPropagation();
    };

    CustomDialog.backdropDiv_ = backdropDiv;
    CustomDialog.dialogDiv_ = dialogDiv;
  }
  backdropDiv.style.display = "block";
  dialogDiv.style.display = "block";

  dialogDiv.innerHTML =
    '<header class="customDialogTitle"></header>' +
    '<p class="customDialogMessage"></p>' +
    (options.showInput ? '<div><input id="customDialogInput"></div>' : "") +
    '<div class="customDialogButtons">' +
    (options.showCancel ? '<button id="customDialogCancel">Cancel</button>' : "") +
    (options.showOkay ? '<button id="customDialogOkay">OK</button>' : "") +
    "</div>";
  dialogDiv.getElementsByClassName("customDialogTitle")[0].appendChild(document.createTextNode(title));
  dialogDiv.getElementsByClassName("customDialogMessage")[0].appendChild(document.createTextNode(message));

  var onOkay = function (event) {
    CustomDialog.hide();
    options.onOkay && options.onOkay();
    event && event.stopPropagation();
  };
  var onCancel = function (event) {
    CustomDialog.hide();
    options.onCancel && options.onCancel();
    event && event.stopPropagation();
  };

  var dialogInput = document.getElementById("customDialogInput");
  CustomDialog.inputField = dialogInput;
  if (dialogInput) {
    dialogInput.focus();

    dialogInput.onkeyup = function (event) {
      if (event.keyCode == 13) {
        onOkay();
        return false;
      } else if (event.keyCode == 27) {
        onCancel();
        return false;
      }
    };
  } else {
    var okay = document.getElementById("customDialogOkay");
    okay && okay.focus();
  }

  if (options.showOkay) {
    document.getElementById("customDialogOkay").addEventListener("click", onOkay);
  }
  if (options.showCancel) {
    document.getElementById("customDialogCancel").addEventListener("click", onCancel);
  }

  backdropDiv.onclick = onCancel;
};
