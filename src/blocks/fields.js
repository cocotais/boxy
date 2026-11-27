import * as Blockly from 'blockly'

import { isLiteral } from '../theme/codemao.layout.js'
import {
  arrowForColour,
  contextMetrics,
  measureFieldText,
  METRICS,
  previewFieldWidth,
  reporterWidth
} from '../theme/codemao.style.js'

function editorInset(block) {
  const owner = block.isShadow() ? (block.getParent() ?? block) : block
  return `inset 0 0 0 2px ${owner.getColour()}`
}

function reporterPalette(field) {
  const block = field.getSourceBlock()
  return (
    field.boxyReporterStyle ?? {
      colourPrimary: block.getColour(),
      colourTertiary: block.getColourTertiary()
    }
  )
}

function paintReporter(field) {
  if (!field.borderRect_) return
  const palette = reporterPalette(field)
  for (const [name, value] of Object.entries({
    rx: field.size_.height / 2,
    ry: field.size_.height / 2,
    fill: palette.colourPrimary,
    stroke: palette.colourTertiary
  }))
    field.borderRect_.setAttribute(name, value)
  Object.assign(field.borderRect_.style, {
    fill: palette.colourPrimary,
    fillOpacity: '1',
    stroke: palette.colourTertiary
  })
}

// A reporter embedded in a block has the same geometry as a dragged reporter.
// Fields declare the role and palette; their input/variable models stay native.
function appearanceMixin(Base) {
  return class extends Base {
    setAppearance(appearance, palette) {
      this.boxyAppearance = appearance
      this.boxyReporterStyle = palette
      return this
    }

    initView() {
      super.initView()
      if (this.boxyAppearance === 'reporter') {
        this.fieldGroup_.setAttribute('data-boxy-reporter', '')
      }
    }

    setMeasuredWidth_(width) {
      this.measuredWidth_ = width
      this.size_.width = width
    }

    render_() {
      super.render_()
      if (this.boxyAppearance !== 'reporter') return
      const textWidth = measureFieldText(this)
      const metrics = contextMetrics(this.getSourceBlock())
      this.setMeasuredWidth_(reporterWidth(textWidth, metrics))
      this.size_.height = metrics.reporterHeight
      this.positionTextElement_((this.size_.width - textWidth) / 2, textWidth)
      this.positionBorderRect_()
      paintReporter(this)
    }

    applyColour() {
      super.applyColour()
      if (this.boxyAppearance === 'reporter') paintReporter(this)
    }
  }
}

function renderDropdown(field) {
  const textWidth = measureFieldText(field)
  const plain = field.boxyAppearance === 'inline'
  if (plain) {
    field.size_.width = textWidth
    field.size_.height = field.getConstants().FIELD_TEXT_HEIGHT
    field.svgArrow.style.display = 'none'
    if (field.borderRect_) field.borderRect_.style.display = 'none'
    field.positionTextElement_(0, textWidth)
    return
  }
  if (field.boxyAppearance === 'reporter') {
    field.svgArrow.style.display = 'none'
    field.fieldGroup_.classList.add('boxyLoopVariable')
    return
  }
  if (field.getSourceBlock().workspace.isFlyout) {
    field.size_.width = previewFieldWidth(textWidth)
    field.size_.height = METRICS.previewField
    field.svgArrow.style.display = 'none'
    field.positionTextElement_((field.size_.width - textWidth) / 2, textWidth)
    field.positionBorderRect_()
    return
  }
  // The selected text is centred in the column before the arrow.
  field.size_.width = Math.max(METRICS.dropdownMin, textWidth + METRICS.dropdownPadding)
  field.size_.height = METRICS.field
  const arrowColumn = field.isFullBlockField() ? 18 : 14
  field.positionTextElement_((field.size_.width - arrowColumn - textWidth) / 2, textWidth)
  field.svgArrow?.setAttribute('transform', `translate(${field.size_.width - 20},8)`)
  field.positionBorderRect_()
}

function styleDropdown(field) {
  const block = field.getSourceBlock()
  if (!block || !field.fieldGroup_) return
  const fullBlock = field.isFullBlockField()
  const target = fullBlock ? block.pathObject?.svgPath : field.borderRect_
  if (!target || target.style.display === 'none') return
  const open = !!field.menu_
  const reporter = field.boxyAppearance === 'reporter'
  const colour = reporter
    ? reporterPalette(field).colourPrimary
    : fullBlock
      ? (block.getParent() ?? block).getColourSecondary()
      : block.getColour()
  field.fieldGroup_.classList.toggle('boxyFieldOpen', open)
  target.classList.toggle('boxyDropdownSelectionOpen', open)
  Object.assign(target.style, {
    fill: open || (!fullBlock && !reporter) ? '#fff' : colour,
    fillOpacity:
      open || reporter ? '1' : fullBlock ? (block.workspace.isFlyout ? '0.5' : '1') : '0.1',
    stroke:
      open || (fullBlock && !block.workspace.isFlyout)
        ? colour
        : reporter
          ? reporterPalette(field).colourTertiary
          : '#000',
    strokeOpacity: open || reporter ? '1' : '0.1',
    strokeWidth: open ? '1.5px' : '1px',
    filter: open ? 'var(--boxy-input-highlight-filter)' : ''
  })
  const text = field.getTextElement()
  if (text) text.style.setProperty('fill', open ? '#333' : '#fff', 'important')
  if (field.svgArrow) {
    field.svgArrow.style.opacity = !open && fullBlock ? '0.6' : '1'
    field.svgArrow.setAttributeNS(
      'http://www.w3.org/1999/xlink',
      'xlink:href',
      arrowForColour(open ? colour : '#ffffff')
    )
  }
}

function dropdownMixin(Base) {
  return class extends appearanceMixin(Base) {
    render_() {
      super.render_()
      renderDropdown(this)
      styleDropdown(this)
    }

    applyColour() {
      super.applyColour()
      styleDropdown(this)
    }

    showEditor_(event) {
      super.showEditor_(event)
      Blockly.DropDownDiv.setColour('var(--color-bg-popup)', 'var(--color-fill-3)')
    }
  }
}

export class KittenDropdown extends dropdownMixin(Blockly.FieldDropdown) {}
export class KittenVariable extends dropdownMixin(Blockly.FieldVariable) {
  shouldAddBorderRect_() {
    const block = this.getSourceBlock()
    return block ? !block.isShadow() : super.shouldAddBorderRect_()
  }
}

function literalMixin(Base) {
  return class extends Base {
    isStandaloneLiteral() {
      const block = this.getSourceBlock()
      return block && !block.isShadow() && isLiteral(block)
    }

    isFullBlockField() {
      const fullBlock = super.isFullBlockField()
      if (!this.isStandaloneLiteral()) return fullBlock
      // Real literals have an inset editor inside a reporter shell, like
      // KittenN's one-argument join. Shadows remain a single editable capsule.
      this.fullBlockClickTarget_ = false
      return false
    }

    get size_() {
      const size = super.size_
      if (this.measuredWidth_ !== undefined) size.width = this.measuredWidth_
      return size
    }

    set size_(size) {
      super.size_ = size
      this.measuredWidth_ = undefined
    }

    positionTextElement_(margin, width) {
      if (this.isFullBlockField())
        Blockly.Field.prototype.positionTextElement_.call(this, margin, width)
      else super.positionTextElement_(margin, width)
    }

    updateSize_(margin) {
      super.updateSize_(margin)
      const standalone = this.isStandaloneLiteral()
      const fullBlock = this.isFullBlockField()
      const metrics = contextMetrics(this.getSourceBlock())
      // Measure displayed SVG text, including tabular digits, for every input.
      const width = measureFieldText(this)
      let padding =
        margin ?? (this.borderRect_ ? this.getConstants().FIELD_BORDER_RECT_X_PADDING : 0)
      let minimum = 14
      if (fullBlock) {
        minimum = metrics.inputMin
        padding = 0
      }
      if (standalone) {
        minimum = metrics.literalMin
        padding = metrics.literalPadding
        this.size_.height = metrics.fieldHeight
      }
      this.setMeasuredWidth_(Math.max(minimum, width + padding * 2))
      this.positionTextElement_((this.size_.width - width) / 2, width)
      if (!fullBlock) this.positionBorderRect_()
    }

    positionBorderRect_() {
      super.positionBorderRect_()
      if (this.isStandaloneLiteral() && this.borderRect_) {
        this.borderRect_.setAttribute('rx', this.size_.height / 2)
        this.borderRect_.setAttribute('ry', this.size_.height / 2)
      }
    }

    applyColour() {
      super.applyColour()
      const block = this.getSourceBlock()
      if (this.isStandaloneLiteral() && this.borderRect_) {
        this.borderRect_.setAttribute('fill', block.getColourSecondary())
        this.borderRect_.setAttribute('stroke', block.getColourTertiary())
        this.borderRect_.setAttribute('fill-opacity', block.workspace.isFlyout ? '0.5' : '1')
      } else if (this.isFullBlockField()) {
        block.pathObject.svgPath.setAttribute(
          'fill',
          block.isShadow() && block.getParent()
            ? block.getParent().getColourSecondary()
            : block.getColour()
        )
      }
    }

    resizeEditor_() {
      super.resizeEditor_()
      if (this.htmlInput_) {
        this.htmlInput_.style.boxShadow = editorInset(this.getSourceBlock())
      }
    }

    widgetCreate_() {
      const input = super.widgetCreate_()
      const block = this.getSourceBlock()
      input.style.border = '0'
      if (this.isStandaloneLiteral())
        input.style.borderRadius = `${(METRICS.field / 2) * block.workspace.getAbsoluteScale()}px`
      input.style.boxShadow = editorInset(block)
      // KittenN animates an opaque 3px white outer ring independently of the
      // parent's coloured inset border. Scale the ring with the workspace.
      const widget = Blockly.WidgetDiv.getDiv()
      const scale = block.workspace.getAbsoluteScale()
      widget.style.borderRadius = input.style.borderRadius
      widget.style.transition = window.matchMedia('(prefers-reduced-motion: reduce)').matches
        ? 'none'
        : 'box-shadow 0.25s ease'
      widget.style.boxShadow = `0 0 0 ${3 * scale}px #fff`
      return input
    }

    getScaledBBox() {
      const bounds = super.getScaledBBox()
      if (this.isFullBlockField()) {
        const halfStroke = this.getSourceBlock().workspace.getAbsoluteScale() / 2
        bounds.left += halfStroke
        bounds.right -= halfStroke
        bounds.top += halfStroke
        bounds.bottom -= halfStroke
      }
      return bounds
    }
  }
}

export class KittenNumber extends appearanceMixin(literalMixin(Blockly.FieldNumber)) {}
export class KittenText extends appearanceMixin(literalMixin(Blockly.FieldTextInput)) {}

for (const [name, Field] of [
  ['field_dropdown', KittenDropdown],
  ['field_variable', KittenVariable],
  ['field_number', KittenNumber],
  ['field_input', KittenText]
]) {
  Blockly.fieldRegistry.unregister(name)
  Blockly.fieldRegistry.register(name, Field)
}

/** Named selectors do not create a variable just by opening the toolbox. */
class NamedVariableField extends KittenDropdown {
  referencesVariables() {
    return true
  }

  refreshVariableName() {
    this.getOptions(false)
    this.forceRerender()
    if (this.getSvgRoot()) this.recomputeAriaContext()
  }

  getAriaValue() {
    return this.getText()
  }

  doClassValidation_(value) {
    this.getOptions(false)
    return super.doClassValidation_(value)
  }

  getText_() {
    return (
      this.getSourceBlock()
        ?.workspace.getVariableMap()
        .getVariableById(this.getValue())
        ?.getName() ??
      this.getLocalOptions?.().find(([, id]) => id === this.getValue())?.[0] ??
      '?'
    )
  }

  constructor(variableType) {
    super(function () {
      const workspace = this.getSourceBlock()?.workspace
      if (!workspace) return [['?', '']]
      const variables = workspace.getVariableMap().getVariablesOfType(variableType)
      const selected = variables.find((variable) => variable.getId() === this.getValue())
      return [
        ['?', ''],
        ...(this.getLocalOptions?.() ?? []),
        ...variables.map((variable) => [variable.getName(), variable.getId()]),
        [variableType === 'Array' ? '新建列表…' : '新建变量…', 'BOXY_CREATE_VALUE'],
        ...(selected
          ? [
              ['重命名…', 'BOXY_RENAME_VALUE'],
              ['删除…', 'BOXY_DELETE_VALUE']
            ]
          : [])
      ]
    })
    this.setValidator((value) => {
      const workspace = this.getSourceBlock().workspace
      if (value === 'BOXY_RENAME_VALUE' || value === 'BOXY_DELETE_VALUE') {
        const variable = workspace.getVariableMap().getVariableById(this.getValue())
        if (variable) {
          if (value === 'BOXY_RENAME_VALUE') Blockly.Variables.renameVariable(workspace, variable)
          else Blockly.Variables.deleteVariable(workspace, variable)
        }
        return null
      }
      if (value !== 'BOXY_CREATE_VALUE') return value
      Blockly.Variables.createVariableButtonHandler(
        workspace,
        (name) => {
          if (name && !this.disposed) {
            const variable = workspace.getVariableMap().getVariable(name, variableType)
            this.setValue(variable.getId())
          }
        },
        variableType
      )
      return null
    })
  }
}

export class ListVariableField extends NamedVariableField {
  constructor() {
    super('Array')
  }
}

export class VariableField extends NamedVariableField {
  constructor() {
    super('')
  }

  saveState() {
    return { id: this.getValue() }
  }

  loadState(state) {
    this.setValue(state.id)
  }
}
