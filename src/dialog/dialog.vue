<script>
import { Input, Modal } from "@arco-design/web-vue";
import Blockly from "blockly";
import { h } from "vue";

Blockly.dialog.setAlert(function (message, callback) {
  Modal.confirm({
    title: "注意",
    content: message,
    okText: "确认",
    onCancel: callback,
    onOk: callback,
    hideCancel: true,
  });
});

Blockly.dialog.setConfirm(function (message, callback) {
  Modal.confirm({
    title: "注意",
    content: message,
    okText: "确认",
    cancelText: "取消",
    onCancel: function () {
      callback(false);
    },
    onOk: function () {
      callback(true);
    },
  });
});

Blockly.dialog.setPrompt(function (message, defaultValue, callback) {
  Modal.confirm({
    title: message,
    content: () => h(Input, { defaultValue: defaultValue, id: "dialog-input" }),
    okText: "确认",
    cancelText: "取消",
    onCancel: function () {
      callback(null);
    },
    onOk: function () {
      callback(document.querySelector("#dialog-input input").value);
    },
  });
});
</script>
