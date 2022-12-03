// TODO Hot Loader
import "highlight.js/styles/atom-one-light.css";

class BoxyTheme {
  constructor() {
    this.root = document.documentElement;
  }

  switch(mode) {
    this.root.removeAttribute("mode");
    this.root.setAttribute("mode", mode);
    if (mode === "light") {
      import("highlight.js/styles/atom-one-light.css");
    } else {
      import("highlight.js/styles/atom-one-dark.css");
    }
  }
}

let theme = new BoxyTheme();
export default theme;
