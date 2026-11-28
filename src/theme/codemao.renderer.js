import * as Blockly from 'blockly'

import { installEffects, themeCSS } from './codemao.effects.js'
import { describeBlock, isValueContainer } from './codemao.layout.js'
import {
  capsulePath,
  containerCapPath,
  containerRadius,
  containerSocketPath,
  iconDataUrl,
  measureFieldText,
  METRICS,
  previewFieldWidth,
  rendererConstants,
  reporterWidth,
  START_HAT,
  startHatPath
} from './codemao.style.js'

const { Types } = Blockly.blockRendering

export class CustomConstantsProvider extends Blockly.zelos.ConstantProvider {
  constructor() {
    super()
    Object.assign(this, rendererConstants)
  }

  setFontConstants_(theme) {
    super.setFontConstants_(theme)
    this.FIELD_BORDER_RECT_HEIGHT = METRICS.field
    this.FIELD_DROPDOWN_BORDER_RECT_HEIGHT = METRICS.field
    this.FIELD_BORDER_RECT_Y_PADDING = Math.max(0, (METRICS.field - this.FIELD_TEXT_HEIGHT) / 2)
  }

  makeNotch() {
    return { type: this.SHAPES.NOTCH, width: 0, height: 0, pathLeft: '', pathRight: '' }
  }

  makeInsideCorners() {
    return {
      width: 0,
      height: 0,
      pathTop: '',
      pathBottom: '',
      rightWidth: 0,
      rightHeight: 0,
      pathTopRight: '',
      pathBottomRight: ''
    }
  }

  makeHexagonal() {
    const shape = super.makeHexagonal()
    const maxWidth = this.MAX_DYNAMIC_CONNECTION_SHAPE_WIDTH
    shape.width = (height) => Math.min(height / 2, maxWidth)
    const path = (height, right, up) => {
      const x = right ? 1 : -1
      const y = up ? -1 : 1
      const width = shape.width(height)
      const half = height / 2
      return `h ${x * 4} a 3,3 0 0 ${right === up ? 0 : 1} ${x * 2},${y}
        l ${x * (width - 7)},${y * (half - 2)}
        a 2,2 0 0 ${right === up ? 0 : 1} 0,${y * 2}
        l ${-x * (width - 7)},${y * (half - 2)}
        a 3,3 0 0 ${right === up ? 0 : 1} ${-x * 2},${y} h ${-x * 4}`
    }
    shape.pathDown = (height) => path(height, false, false)
    shape.pathUp = (height) => path(height, false, true)
    shape.pathRightDown = (height) => path(height, true, false)
    shape.pathRightUp = (height) => path(height, true, true)
    return shape
  }

  shapeFor(connection) {
    const shape = super.shapeFor(connection)
    const { INPUT_VALUE, OUTPUT_VALUE } = Blockly.ConnectionType
    const block =
      connection.type === OUTPUT_VALUE
        ? connection.getSourceBlock()
        : connection.type === INPUT_VALUE
          ? connection.targetBlock()
          : null
    if (!isValueContainer(block)) return shape
    // Both ends of a value connection share the same geometry and anchor.
    // Copy rather than changing Zelos's shared shape for ordinary reporters.
    return {
      ...shape,
      valueContainer: true,
      connectionOffsetY: () => 0,
      ...(shape.type === this.SHAPES.ROUND && {
        width: containerRadius,
        pathDown: (height) => containerCapPath(height),
        pathUp: (height) => containerCapPath(height, true)
      })
    }
  }

  createDom(svg, selector, injectionDiv) {
    super.createDom(svg, selector, injectionDiv)
    installEffects(svg, this.randomIdentifier, injectionDiv ?? svg)
  }

  getCSS_(selector) {
    return [...super.getCSS_(selector), ...themeCSS(selector)]
  }
}

class CustomRenderInfo extends Blockly.zelos.RenderInfo {
  constructor(renderer, block) {
    super(renderer, block)
    this.layout = describeBlock(block)
  }

  populateTopRow_() {
    super.populateTopRow_()
    if (this.layout.preview) this.topRow.minHeight = this.layout.headerInset
    if (this.layout.hat) this.topRow.minHeight = METRICS.rowInset
    if (!this.layout.statementLayout) {
      this.topRow.minHeight = this.layout.reporterInset
      for (const element of this.topRow.elements) element.width = 0
    }
  }

  populateBottomRow_() {
    super.populateBottomRow_()
    if (this.layout.preview) this.bottomRow.minHeight = this.layout.headerInset
    if (this.layout.hat) {
      this.bottomRow.minHeight =
        this.layout.tail && this.layout.inputs.at(-1) === this.layout.tail ? 0 : METRICS.rowInset
      if (!this.bottomRow.minHeight) {
        for (const element of this.bottomRow.elements) element.height = 0
      }
    } else if (!this.layout.statementLayout) {
      this.bottomRow.minHeight = this.layout.reporterInset
      for (const element of this.bottomRow.elements) element.width = 0
    } else if (
      this.layout.preview &&
      this.layout.inputs.at(-1)?.type === Blockly.inputs.inputTypes.STATEMENT
    )
      this.bottomRow.minHeight = this.layout.metrics.bottomRowHeight
    else if (this.layout.footer) {
      this.bottomRow.minHeight = 0
      for (const element of this.bottomRow.elements) element.height = 0
    }
  }

  createRows_() {
    if (this.isInsertionMarker && !this.outputConnection) {
      this.createMarkerRows_()
      return
    }
    super.createRows_()
    for (const row of this.rows) {
      for (const element of row.elements) {
        if (
          Types.isField(element) &&
          element.field instanceof Blockly.FieldLabel &&
          element.field.isVisible()
        ) {
          const text = element.field.getTextElement()
          if (text && element.field.previewPadding === undefined)
            element.width = measureFieldText(element.field)
          if (this.layout.emptyBoolean) element.width = this.layout.metrics.booleanContent
        }
      }
    }
    if (!this.layout.statementLayout) {
      for (const row of this.inputRows) {
        row.minHeight = this.layout.shadow
          ? this.layout.rowHeight
          : Math.max(row.minHeight, this.layout.rowHeight)
      }
      return
    }

    // Blockly attaches labels such as "else" directly to a statement input.
    // In KittenN those labels sit in the rounded bar above the cavity.
    const rows = []
    for (const row of this.rows) {
      if (row.hasStatement) {
        const statement = row.getLastInput()
        if (this.layout.tail?.connection === statement.connectionModel) {
          statement.height = statement.connectedBlockHeight || 0
          row.minHeight = 0
        } else if (!statement.connectedBlock) statement.height = this.layout.metrics.cavityHeight
        const fields = row.elements.filter(
          (element) => Types.isField(element) || Types.isIcon(element)
        )
        if (fields.length) {
          const header = new Blockly.blockRendering.InputRow(this.constants_)
          header.hasDummyInput = true
          header.minHeight = METRICS.rowHeight
          header.elements = fields
          row.elements = row.elements.filter((element) => !fields.includes(element))
          rows.push(header)
        }
      } else if (Types.isInputRow(row)) {
        const footer = row.elements.some((element) => element.parentInput === this.layout.footer)
        row.minHeight = footer
          ? METRICS.actionRowHeight
          : Math.max(row.minHeight, METRICS.rowHeight)
      }
      rows.push(row)
    }
    this.rows = rows
    this.inputRows = rows.filter((row) => Types.isInputRow(row))
  }

  createMarkerRows_() {
    // Measure only the statement skeleton. Default argument blocks stay in
    // the model for native connection bookkeeping, but add no internal shapes
    // or height to the silhouette (40px statement / 80px empty control).
    this.populateTopRow_()
    const header = new Blockly.blockRendering.InputRow(this.constants_)
    header.hasDummyInput = true
    header.minHeight = METRICS.rowHeight
    this.rows.push(this.topRow, header)
    this.inputRows.push(header)
    for (const input of this.layout.inputs) {
      if (input.type !== Blockly.inputs.inputTypes.STATEMENT) continue
      const row = new Blockly.blockRendering.InputRow(this.constants_)
      this.addInput_(input, row)
      if (this.layout.tail === input)
        row.getLastInput().height = row.getLastInput().connectedBlockHeight || 0
      this.rows.push(row)
      this.inputRows.push(row)
    }
    this.populateBottomRow_()
    this.rows.push(this.bottomRow)
  }

  getSpacerRowHeight_(prev, next) {
    if (this.layout.hat) {
      if (Types.isTopRow(prev) || Types.isBottomRow(next)) return 0
      if (prev.hasStatement || next.hasStatement) return METRICS.rowInset
    }
    if (!this.layout.statementLayout) return super.getSpacerRowHeight_(prev, next)
    if (prev.hasStatement && next.hasStatement) return METRICS.statementHeight
    if (
      prev.hasStatement &&
      next.elements.some((element) => element.parentInput === this.layout.footer)
    )
      return 0
    if (next.hasStatement) return this.layout.headerInset
    if (prev.hasStatement) return METRICS.rowInset
    if (Types.isTopRow(prev) || Types.isBottomRow(next)) return 0
    return super.getSpacerRowHeight_(prev, next)
  }

  computeBounds_() {
    super.computeBounds_()
    for (const row of this.inputRows) {
      if (!row.hasStatement) row.boxyNaturalWidth = row.width
    }
  }

  getDesiredRowWidth_(row) {
    if (this.layout.hat && Types.isInputRow(row) && !row.hasStatement)
      return row.boxyNaturalWidth ?? row.width
    return super.getDesiredRowWidth_(row)
  }

  finalizeVerticalAlignment_() {
    // Flat connections need no notch clearance or Scratch's tight nesting.
  }

  getNegativeSpacing_() {
    // KittenN leaves a complete cap around every field and input. Zelos pulls
    // matching nested shapes into those caps, making arithmetic blocks tighter.
    return 0
  }

  getInRowSpacing_(prev, next) {
    if (this.layout.valueContainer && (!prev || !next)) {
      if (!prev) {
        return next?.parentInput === this.layout.footer
          ? this.layout.metrics.actionPadding - this.outputConnection.shape.width(METRICS.reporter)
          : 0
      }
      return prev.parentInput === this.layout.footer
        ? this.layout.metrics.actionPadding
        : this.layout.metrics.endPadding
    }
    if (this.layout.hat) {
      if ((prev && Types.isStatementInput(prev)) || (next && Types.isStatementInput(next))) return 0
      if (!prev && this.layout.headerInputs.includes(next?.parentInput))
        return START_HAT.labelPadding
    }
    if (this.layout.preview) {
      if (this.layout.unaryBoolean && (!prev || !next)) return METRICS.rowInset
      if (this.layout.predicateSelector && !next) return METRICS.rowInset
      if (!prev && next?.field?.boxyOpticalSpacing) return next.field.boxyOpticalSpacing.before
      if (prev?.field?.boxyOpticalSpacing) return prev.field.boxyOpticalSpacing.after
    }
    if (
      next?.field?.boxyParameterAction === 'add' &&
      prev?.field instanceof Blockly.FieldLabel &&
      next.parentInput?.type === Blockly.inputs.inputTypes.STATEMENT
    )
      return METRICS.actionLabelGap
    if (this.layout.preview && this.layout.shadow && !this.layout.emptyBoolean) {
      if (!prev || !next) return -this.constants_.MEDIUM_PADDING
    }
    if (this.layout.shadowDropdown && (!prev || !next)) return -METRICS.field / 2
    if (!this.outputConnection && (!prev || !next)) {
      if (next && Types.isStatementInput(next)) return METRICS.statementPadding
      return next?.parentInput === this.layout.footer
        ? this.layout.metrics.actionPadding
        : prev
          ? this.layout.metrics.endPadding
          : METRICS.statementPadding
    }
    if (prev && Types.isField(prev) && prev.width === 0) return 0
    if (prev && next && this.layout.preview) return METRICS.rowInset
    return super.getInRowSpacing_(prev, next)
  }

  finalize_() {
    super.finalize_()
    if (this.layout.hat) return
    if (this.layout.valueContainer) {
      for (const row of this.inputRows) {
        if (row.hasStatement) row.statementEdge = METRICS.statementPadding - this.startX
      }
    }
    if (this.layout.minimumWidth) {
      this.width = Math.max(this.width, this.layout.minimumWidth)
      this.widthWithChildren = Math.max(this.widthWithChildren, this.width)
    }
    if (this.isInsertionMarker && !this.outputConnection) {
      this.width = this.widthWithChildren = METRICS.statementMin
      return
    }
    const previewParameter =
      this.layout.preview &&
      this.layout.shadow &&
      (this.layout.literal || this.layout.shadowDropdown)
    const round = this.outputConnection?.shape.type === this.constants_.SHAPES.ROUND
    if ((round && !this.layout.shadow && this.layout.singleField) || previewParameter) {
      const field = this.inputRows[0].elements.find(
        (element) => Types.isField(element) && element.field.isVisible()
      )
      const width = previewParameter
        ? previewFieldWidth(measureFieldText(field.field))
        : reporterWidth(field.width)
      const difference = this.width - width
      if (difference || previewParameter)
        this.capsuleHeight = previewParameter ? METRICS.previewField : this.height
      this.width = width
      this.widthWithChildren = width
      if (this.rightSide) this.rightSide.xPos -= difference
      field.xPos = (width - field.width) / 2
    }
  }
}

class CustomDrawer extends Blockly.zelos.Drawer {
  drawInlineInput_(input) {
    super.drawInlineInput_(input)
    // Keep the native dark socket behind a value container. Its open statement
    // cavity exposes the socket colour; its corners stay fixed as the body grows.
    if (this.info_.isInsertionMarker || !input.shape.valueContainer) return
    this.block_.pathObject.setOutlinePath(
      input.input.name,
      containerSocketPath(
        input.xPos,
        input.centerline - input.height / 2,
        input.width,
        input.height
      )
    )
  }

  drawConnectionHighlightPath(measurable) {
    if (!measurable.shape.valueContainer) return super.drawConnectionHighlightPath(measurable)
    // Zelos normally draws value highlights relative to a middle anchor.
    // Both sides of a container connection instead use its upper corner.
    const path =
      measurable.connectionModel.type === Blockly.ConnectionType.OUTPUT_VALUE
        ? `M ${measurable.width},0 ${measurable.shape.pathDown(measurable.height)}`
        : containerSocketPath(0, 0, measurable.width, measurable.height)
    const connection = measurable.connectionModel
    const block = connection.getSourceBlock()
    return block.pathObject.addConnectionHighlight?.(
      connection,
      path,
      connection.getOffsetInBlock(),
      block.RTL
    )
  }

  drawOutline_() {
    if (this.info_.layout.hat) {
      this.drawStartHat_()
      return
    }
    if (this.info_.capsuleHeight) {
      super.drawOutline_()
      this.outlinePath_ = capsulePath(this.info_.width, this.info_.capsuleHeight)
      return
    }
    // Zelos supplies capsule reporters and hexagonal Boolean sockets.
    // Expanded function definitions may have external inputs; retain their drawer.
    if (!this.info_.layout.statementLayout || this.info_.rows.some((row) => row.hasExternalInput)) {
      super.drawOutline_()
      return
    }
    const info = this.info_
    const left = info.startX
    const top = info.startY
    const bottom = info.bottomRow.baseline
    const corner = this.constants_.CORNER_RADIUS
    const statements = info.rows.filter((row) => row.hasStatement)
    let segmentTop = top
    this.positionPreviousConnection_()
    this.positionNextConnection_()
    this.outlinePath_ = `M ${left + (info.outputConnection ? 0 : corner)},${top}`
    for (const row of statements) {
      const headers = info.inputRows.filter(
        (candidate) =>
          !candidate.hasStatement && candidate.yPos >= segmentTop && candidate.yPos < row.yPos
      )
      const width = Math.max(
        info.layout.metrics.controlMin,
        ...headers.map((row) => left + row.boxyNaturalWidth)
      )
      this.drawRoundedEnd_(width, segmentTop, row.yPos)
      const innerLeft = row.xPos + row.statementEdge
      const cavityBottom = row.yPos + row.height
      const cavityCorner = info.layout.metrics.cavityRadius
      this.outlinePath_ += !cavityCorner
        ? ` H ${innerLeft} V ${cavityBottom}`
        : ` H ${innerLeft + cavityCorner} Q ${innerLeft},${row.yPos} ${innerLeft},${row.yPos + cavityCorner}
            V ${cavityBottom - cavityCorner} Q ${innerLeft},${cavityBottom} ${innerLeft + cavityCorner},${cavityBottom}`
      this.positionStatementInputConnection_(row)
      segmentTop = row.yPos + row.height
    }
    // Only an empty bottom arm is shortened. Function return values and other
    // fields below a statement cavity still need the full measured width.
    const hasFooterInputs = info.inputRows.some(
      (row) => !row.hasStatement && row.yPos >= segmentTop
    )
    const finalRight =
      statements.length && (!hasFooterInputs || info.layout.footer)
        ? statements.at(-1).xPos + statements.at(-1).statementEdge + info.layout.armWidth
        : info.width
    this.drawRoundedEnd_(finalRight, segmentTop, bottom)
    if (info.outputConnection) {
      this.positionOutputConnection_()
      this.outlinePath_ += ` H ${left} ${info.outputConnection.shape.pathUp(info.outputConnection.height)} Z`
      return
    }
    const lowerCorner = info.layout.terminal ? METRICS.terminalCorner : corner
    this.outlinePath_ += info.layout.terminal
      ? ` H ${left + lowerCorner} A ${lowerCorner},${lowerCorner} 0 0 1 ${left},${bottom - lowerCorner}`
      : ` H ${left + corner} Q ${left},${bottom} ${left},${bottom - corner}`
    this.outlinePath_ += ` V ${top + corner} Q ${left},${top} ${left + corner},${top} Z`
  }

  drawStartHat_() {
    const info = this.info_
    this.positionNextConnection_()
    const tail = info.layout.tail
      ? info.inputRows.find(
          (row) => row.getLastInput()?.connectionModel === info.layout.tail.connection
        )
      : null
    const headerBottom = tail?.yPos ?? info.bottomRow.baseline
    const headerRows = info.inputRows.filter((row) => !row.hasStatement && row.yPos < headerBottom)
    const headerWidth = Math.max(
      METRICS.statementMin,
      ...headerRows.map((row) => row.boxyNaturalWidth ?? row.width)
    )
    this.outlinePath_ = startHatPath(headerWidth, headerBottom)
    this.block_.pathObject.setStartBadge(info.layout.hat.icon)
    if (!tail) return
    // A statement input scopes the function body; its visual connection is
    // at the header's lower-left corner, independent of the raised badge.
    tail.statementEdge = -tail.xPos
    this.positionStatementInputConnection_(tail)
  }

  drawRoundedEnd_(right, top, bottom) {
    const radius = Math.max(0, Math.min(METRICS.statementRadius, (bottom - top) / 2))
    this.outlinePath_ += ` H ${right - radius} A ${radius},${radius} 0 0 1 ${right},${top + radius}
      V ${bottom - radius} A ${radius},${radius} 0 0 1 ${right - radius},${bottom}`
  }
}

class CustomPathObject extends Blockly.zelos.PathObject {
  setStartBadge(icon) {
    if (!this.startBadge) {
      this.startBadge = Blockly.utils.dom.createSvgElement(
        Blockly.utils.Svg.G,
        { class: 'boxyStartBadge', 'aria-hidden': 'true', 'pointer-events': 'none' },
        this.svgRoot
      )
      Blockly.utils.dom.createSvgElement(
        Blockly.utils.Svg.CIRCLE,
        { cx: 0, r: START_HAT.innerRadius, fill: '#fff' },
        this.startBadge
      )
      Blockly.utils.dom.createSvgElement(
        Blockly.utils.Svg.IMAGE,
        {
          x: -START_HAT.iconSize / 2,
          y: START_HAT.centerY - START_HAT.iconSize / 2,
          width: START_HAT.iconSize,
          height: START_HAT.iconSize
        },
        this.startBadge
      )
    }
    this.startBadge.querySelector('circle').setAttribute('cy', START_HAT.centerY)
    this.startBadge
      .querySelector('image')
      .setAttribute('href', iconDataUrl(icon, this.style.colourPrimary))
  }

  updateSelected(enable) {
    // Keep Blockly's selection state without Zelos's coloured outline overlay.
    // Pointer feedback comes from the KittenN hover/drag filter on the block.
    this.svgRoot.classList.toggle('blocklySelected', enable)
  }

  applyColour(block) {
    super.applyColour(block)
    if (block.isInsertionMarker()) return
    if (block.isShadow() && block.getParent()) {
      this.svgPath.setAttribute('fill', block.getParent().getColourSecondary())
      this.svgPath.setAttribute('stroke', '#0000001a')
      this.svgPath.setAttribute('fill-opacity', block.workspace.isFlyout ? '0.5' : '1')
    }
    for (const outline of this.svgRoot.querySelectorAll(':scope > .blocklyOutlinePath')) {
      outline.setAttribute('fill', this.style.colourSecondary)
    }
  }

  setOutlinePath(name, path) {
    super.setOutlinePath(name, path)
    const outline = this.getOutlinePath(name)
    outline.setAttribute('fill', this.style.colourSecondary)
    // Connected containers can expose their socket. Keep that background below
    // fields and child blocks even when it is first created after the children.
    this.svgRoot.insertBefore(outline, this.svgPath.nextSibling)
  }
}

class CustomRenderer extends Blockly.zelos.Renderer {
  shouldHighlightConnection(connection) {
    // Flat statement connections need only the insertion silhouette. Zelos's
    // 4px notch highlight otherwise becomes a permanent white dot at its origin.
    const { PREVIOUS_STATEMENT, NEXT_STATEMENT } = Blockly.ConnectionType
    return (
      connection.type !== PREVIOUS_STATEMENT &&
      connection.type !== NEXT_STATEMENT &&
      super.shouldHighlightConnection(connection)
    )
  }

  makeConstants_() {
    return new CustomConstantsProvider()
  }
  makeRenderInfo_(block) {
    return new CustomRenderInfo(this, block)
  }
  makeDrawer_(block, info) {
    return new CustomDrawer(block, info)
  }
  makePathObject(root, style) {
    return new CustomPathObject(root, style, this.getConstants())
  }
}

// Renderer modules are reevaluated when Vite updates the preview.
Blockly.registry.register(Blockly.registry.Type.RENDERER, 'codemao', CustomRenderer, true)
