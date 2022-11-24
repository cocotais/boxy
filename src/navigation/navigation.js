import $ from "jquery";

// 导航栏菜单
$(document).ready(function () {
  $("#navigation").on("click", function (e) {
    let boxyMenu = $(".boxyMenu");
    e.stopPropagation();
    boxyMenu.toggle(100);
    if (boxyMenu.is(":visible")) {
      $(document).on("click", function () {
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
window.navigationNew = function () {
  $(".boxyMenu").hide();
};

window.navigationOpen = function () {
  $(".boxyMenu").hide();
};

window.navigationSave = function () {
  $(".boxyMenu").hide();
};

window.navigationExport = function () {
  $(".boxyMenu").hide();
};

window.navigationSettings = function () {
  $(".boxyMenu").hide();
};
