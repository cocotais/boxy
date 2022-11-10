import Blockly from "blockly";
import $ from "jquery";

function loadToolbox() {
  $.ajax({
    url: "./src/toolbox/toolbox.xml",
    type: "get",
    async: true,
    dataType: "xml",
    success: function (data) {
      let xmlDoc = $(data).find("toolbox").html();
      $("#toolbox").html(xmlDoc);
      localStorage.setItem("toolbox", xmlDoc);
      return;
    },
    error: function (jqXHR, textStatus, errorThrown) {
      $("#toolbox").html(localStorage.getItem("toolbox") || "");
      console.error("Boxy Error: An unknown error occurred in toolbox.");
      console.error("Boxy is loading the data from the storage instead.");
      console.error("Please check your settings and try again.");
      console.error(jqXHR);
      console.error("ErrorType:", textStatus);
      console.error(errorThrown);
      return;
    },
  });
}

function loadWorkspace() {
  var blocklyArea = document.getElementById("blocklyArea");
  var blocklyDiv = document.getElementById("blocklyDiv");
  var workspace = Blockly.inject(blocklyDiv, {
    toolbox: document.getElementById("toolbox"),
  });

  var onresize = function (e) {
    let element = blocklyArea;
    let x = 0;
    let y = 0;
    do {
      x += element.offsetLeft;
      y += element.offsetTop;
      element = element.offsetParent;
    } while (element);

    blocklyDiv.style.left = x + "px";
    blocklyDiv.style.top = y + "px";
    blocklyDiv.style.width = blocklyArea.offsetWidth + "px";
    blocklyDiv.style.height = blocklyArea.offsetHeight + "px";
    console.log(blocklyArea.offsetWidth, blocklyArea.offsetHeight);
    Blockly.svgResize(workspace);
  };
  window.addEventListener("resize", onresize, false);
  onresize();
  Blockly.svgResize(workspace);
}

export function loadBlockly() {
  loadToolbox();
  loadWorkspace();
}
