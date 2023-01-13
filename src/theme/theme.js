class BoxyTheme {
  /**
   * 主题
   * @constructor
   */
  constructor() {
    this.root = document.documentElement;
  }

  /**
   * 切换主题
   * @method
   * @param {string} mode 主题名称
   */
  switch(mode) {
    this.root.removeAttribute("mode");
    this.root.setAttribute("mode", mode);
    if (mode === "light") {
      import("highlight.js/styles/atom-one-light.css");
      document.querySelector("meta[name='theme-color']").setAttribute("content", "#4062f6");
    } else if (mode === "dark") {
      import("highlight.js/styles/atom-one-dark.css");
      document.querySelector("meta[name='theme-color']").setAttribute("content", "#6de3ff");
    }
  }
}

let theme = new BoxyTheme();
export default theme;
