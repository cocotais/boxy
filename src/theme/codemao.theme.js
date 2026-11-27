import * as Blockly from 'blockly'

import { loopVariableStyle, procedureParameterStyle, scriptVariableStyle } from './codemao.style.js'

const codemaoTheme = Blockly.Theme.defineTheme('codemao', {
  base: Blockly.Themes.Zelos,
  blockStyles: {
    loop_variable: loopVariableStyle,
    procedure_parameter: procedureParameterStyle,
    controller: {
      colourPrimary: '#68cdff',
      colourSecondary: '#3bb1ec',
      colourTertiary: '#53a2c9'
    },
    calculation: {
      colourPrimary: '#feae8a',
      colourSecondary: '#eb8b60',
      colourTertiary: '#e58b63'
    },
    function: {
      colourPrimary: '#f88767',
      colourTertiary: '#df795c'
    },
    utility: {
      colourPrimary: '#00afc3',
      colourTertiary: '#009daf'
    },
    variable: scriptVariableStyle,
    script_variable_declaration: {
      colourPrimary: '#fc942c',
      colourSecondary: '#eb930d',
      colourTertiary: '#c77422'
    },
    list: {
      colourPrimary: '#f3c220',
      colourSecondary: '#e8ab00',
      colourTertiary: '#d1a100'
    },
    dictionary: {
      colourPrimary: '#a073ff',
      colourTertiary: '#9067e5'
    },
    color: {
      colourPrimary: '#2bc9a7',
      colourTertiary: '#19b693'
    }
  },
  categoryStyles: {
    controller: {
      colour: '#01adff'
    },
    calculation: {
      colour: '#f0aa8b'
    },
    function: {
      colour: '#f88767'
    },
    utility: {
      colour: '#5ab45b'
    },
    variable: {
      colour: '#fdab3d'
    },
    list: {
      colour: '#ff9c37'
    },
    dictionary: {
      colour: '#2bc9a7'
    },
    color: {
      colour: '#2bc9a7'
    }
  }
})

export default codemaoTheme
