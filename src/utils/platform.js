/**
 * 返回当前的平台
 * @returns {string} PC/Phone
 */
function platform() {
  const flyoutDiv = document.querySelector("#boxy > .blocklyDiv > div > svg.blocklyFlyout");
  const toolboxDiv = document.getElementsByClassName("blocklyToolboxDiv")[0];
  const toolboxWidth = toolboxDiv.getBoundingClientRect().width;
  const flyoutWidth = flyoutDiv.getBoundingClientRect().width;
  const codespaceWidth = 350 + Math.log(window.innerWidth);
  return window.innerWidth > toolboxWidth + flyoutWidth + codespaceWidth ? "PC" : "Phone";
}

export default platform;
