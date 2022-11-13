import $ from "jquery";

// 导航栏菜单
$(document).ready(function () {
  $("#navigation").click(function (e) {
    let boxyMenu = $(".boxyMenu");
    e.stopPropagation();
    boxyMenu.toggle(100);
    if (boxyMenu.is(":visible")) {
      $(document).one("click", function () {
        boxyMenu.hide(100);
      });
    }
  });
  $(".boxyMenu").on("click", function (e) {
    e.stopPropagation();
  });
});
$(".boxyMenu").hide();

// 导航栏功能
function navigationNew() {}

function navigationOpen() {}

function navigationSave() {}

function navigationExport() {}

function navigationSettings() {}
