import Blockly from "blockly";

let codemaoTheme = Blockly.Theme.defineTheme("Codemao", {
  base: Blockly.Themes.Zelos,
  blockStyles: {
    controller: {
      colourPrimary: "#68cdff",
      // colourTertiary: "#5db8e5",
    },
    calculation: {
      colourPrimary: "#feae8a",
      // colourTertiary: "#e49c7c",
    },
    variable: {
      colourPrimary: "#ffbb55",
      // colourTertiary:"#e5aa53", // 我找不到一个猫站原厂色
    },
  },
});

export default codemaoTheme;
