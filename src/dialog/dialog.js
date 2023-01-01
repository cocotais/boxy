/**
 * @license
 * Copyright 2016 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import Blockly from "blockly";
import swal from "sweetalert";

var CustomDialog = {};

/** 重构 Blockly.dialog.setAlert() 函数 */
Blockly.dialog.setAlert(function (message, callback) {
  CustomDialog.show("", message, {
    onCancel: callback,
  });
});

/** 重构 Blockly.dialog.setConfirm() 函数 */
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

/** 重构 Blockly.dialog.setPrompt() 函数 */
Blockly.dialog.setPrompt(function (message, defaultValue, callback) {
  CustomDialog.show("", message, {
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
 * 可选参数:
 *  - showOkay: 是否显示确认按钮
 *  - showCancel: 是否显示取消按钮
 *  - showInput: 是否显示输入栏
 *  - onOkay: 回调处理确认按钮按下时的操作
 *  - onCancel: 回调处理取消按钮按下时或背景被点击时的操作
 */
CustomDialog.show = function (title, message, options) {
  var customDialogInput = document.createElement("input");
  customDialogInput.setAttribute("id", "customDialogInput");
  customDialogInput.setAttribute("class", "swal-content__input");
  // 接入sweetalert
  swal({
    title: title,
    text: message,
    buttons: {
      cancel: options.showCancel ? "取消" : false,
      confirm: options.showOkay ? "确定" : false,
    },
    content: options.showInput ? customDialogInput : "",
    closeOnClickOutside: !options.showInput && !options.showOkay,
  }).then((value) => {
    if (value) {
      onOkay();
    } else {
      onCancel();
    }
  });

  var onOkay = function (event) {
    options.onOkay && options.onOkay();
    event && event.stopPropagation();
    swal.close(); // 关闭sweetalert
  };
  var onCancel = function (event) {
    options.onCancel && options.onCancel();
    event && event.stopPropagation();
    swal.close();
  };

  var dialogInput = document.getElementById("customDialogInput");
  CustomDialog.inputField = dialogInput;
  if (dialogInput) {
    dialogInput.focus();
  }
};
