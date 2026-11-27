<template><span hidden></span></template>

<script>
import { Input, Modal } from '@arco-design/web-vue'
import * as Blockly from 'blockly'
import { h } from 'vue'

Blockly.dialog.setAlert(function (message, callback) {
  Modal.confirm({
    title: '注意',
    content: message,
    okText: '确认',
    onCancel: callback,
    onOk: callback,
    hideCancel: true
  })
})

Blockly.dialog.setConfirm(function (message, callback) {
  Modal.confirm({
    title: '注意',
    content: message,
    okText: '确认',
    cancelText: '取消',
    onCancel: function () {
      callback(false)
    },
    onOk: function () {
      callback(true)
    }
  })
})

Blockly.dialog.setPrompt(function (message, defaultValue, callback) {
  Modal.confirm({
    title: message.replace('：', ''),
    content: () => h(Input, { defaultValue: defaultValue, id: 'dialog-input', autofocus: true }),
    okText: '确认',
    cancelText: '取消',
    onCancel: function () {
      callback(null)
    },
    onOk: function () {
      callback(document.querySelector('#dialog-input input').value)
    }
  })
})
</script>

<style>
.arco-modal-container .arco-modal-simple > div > div > div.arco-modal-title-icon {
  display: none;
}
</style>
