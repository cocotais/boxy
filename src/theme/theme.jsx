// import { ConfigProvider, theme as antdTheme } from "antd";
import zh from "antd/es/locale/zh_CN";
import { createContext, useContext, useState } from "react";

class BoxyTheme {
  /**
   * 主题
   * @constructor
   */
  constructor() {
    this.mode = "light";
    this.root = document.documentElement;
  }

  /**
   * 切换主题
   * @method
   * @param {string} mode 主题名称
   */
  switch(mode) {
    console.log(mode);
    this.mode = mode;
  }
}

let boxyTheme = new BoxyTheme();
export default boxyTheme;

export const ThemeContext = createContext("light");

export const ThemeConfig = (props) => {
  const themeMode = useContext(ThemeContext);
  const getThemeInformation = (value) => {
    if (value === "light") {
      return {
        token: {
          colorPrimary: "#405678",
        },
      };
    } else {
      return {
        token: {
          colorPrimary: "#ffffff",
        },
      };
    }
  };
  return (
    <ThemeContext.Provider value={themeMode}>
      <ThemeContext.Consumer>
        {(themeContext) => <ConfigProvider theme={getThemeInformation(themeContext.themeMode)}></ConfigProvider>}
      </ThemeContext.Consumer>
    </ThemeContext.Provider>
  );
};
