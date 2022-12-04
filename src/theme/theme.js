// TODO Hot Loader
import "highlight.js/styles/atom-one-light.css";

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
    } else if (mode === "dark") {
      import("highlight.js/styles/atom-one-dark.css");
    }
  }
}

let theme = new BoxyTheme();
export default theme;
