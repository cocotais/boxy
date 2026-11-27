import * as Blockly from 'blockly'

import toolbox from '../assets/toolbox.json' with { type: 'json' }

export function procedureFlyout(workspace) {
  const contents = [
    {
      kind: 'block',
      type: 'procedures_defnoreturn',
      gap: 12,
      fields: { NAME: Blockly.Msg.PROCEDURES_DEFNORETURN_PROCEDURE }
    },
    { kind: 'block', type: 'boxy_return', gap: 24 }
  ]
  for (const [name, params] of Blockly.Procedures.allProcedures(workspace).flat()) {
    // A function may be executed for its side effects or used as a value;
    // an explicit return in its body decides what value it produces.
    for (const type of ['procedures_callnoreturn', 'procedures_callreturn']) {
      contents.push({ kind: 'block', type, gap: 12, extraState: { name, params } })
    }
  }
  return contents
}

export function variableFlyout(workspace) {
  const variables = workspace.getVariableMap().getVariablesOfType('').reverse()
  const variable = variables[0]
  const fields = variable ? { VAR: { id: variable.getId() } } : undefined
  return [
    { kind: 'button', text: '新建变量', callbackKey: 'CREATE_VARIABLE' },
    ...['variables_set', 'math_change'].map((type) => ({
      kind: 'block',
      type,
      fields,
      gap: 12
    })),
    { kind: 'block', type: 'boxy_script_variables', gap: 12 },
    ...(variables.length ? variables : [null]).map((model) => ({
      kind: 'block',
      type: 'variables_get',
      fields: model ? { VAR: { id: model.getId() } } : undefined,
      gap: 12
    }))
  ]
}

export function listFlyout(workspace) {
  const lists = workspace.getVariableMap().getVariablesOfType('Array').reverse()
  return [
    { kind: 'button', text: '新建列表', callbackKey: 'CREATE_LIST' },
    ...structuredClone(
      toolbox.contents.find((category) => category.categorystyle === 'list').contents
    ),
    ...(lists.length ? lists : [null]).map((model) => ({
      kind: 'block',
      type: 'boxy_list_input',
      fields: model ? { VAR: model.getId() } : undefined,
      gap: 12
    }))
  ]
}

function createNamedValue(workspace, type = '') {
  const toolbox = workspace.getToolbox()
  const category = toolbox?.getSelectedItem()
  // Blockly closes its flyout when the app's modal takes focus. Return to the
  // same category after the prompt, so the new reporter appears immediately.
  const restore = () => {
    if (category) toolbox.setSelectedItem(category)
  }
  const prompt = (defaultName = '') => {
    Blockly.Variables.promptName(
      type === 'Array' ? '新列表的名称' : Blockly.Msg.NEW_VARIABLE_TITLE,
      defaultName,
      (name) => {
        if (!name) return restore()
        if (Blockly.Variables.nameUsedWithAnyType(name, workspace)) {
          Blockly.dialog.alert(`名称“${name}”已被使用`, () => prompt(name))
          return
        }
        workspace.getVariableMap().createVariable(name, type)
        restore()
      }
    )
  }
  prompt()
}

export function registerVariableToolbox(workspace) {
  workspace.registerToolboxCategoryCallback('PROCEDURE', procedureFlyout)
  workspace.registerToolboxCategoryCallback('VARIABLE', variableFlyout)
  workspace.registerToolboxCategoryCallback('LIST', listFlyout)
  workspace.registerButtonCallback('CREATE_VARIABLE', () => createNamedValue(workspace))
  workspace.registerButtonCallback('CREATE_LIST', () => createNamedValue(workspace, 'Array'))
}
