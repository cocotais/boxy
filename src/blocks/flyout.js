import * as Blockly from 'blockly'

import { isActionInput } from '../theme/codemao.layout.js'
import {
  isCompactPreview,
  measureFieldText,
  METRICS,
  scriptVariableStyle
} from '../theme/codemao.style.js'
import { SlidingFlyoutDragStrategy } from './flyout-motion.js'
import { operatorIconDataUrl } from './operator-icons.js'

const PREVIEW_INPUT = 'BOXY_FLYOUT_PREVIEW'
const previewed = new WeakSet()

class PreviewLabel extends Blockly.FieldLabel {
  constructor(label, { padding = 0, box = false, minimumWidth = 0, shape = null } = {}) {
    super(label)
    this.previewPadding = padding
    this.previewBox = box
    this.previewMinimumWidth = minimumWidth
    this.previewShape = shape
  }

  initView() {
    super.initView()
    if (this.previewBox) {
      this.previewRect = Blockly.utils.dom.createSvgElement(
        'rect',
        {
          rx: 4,
          height: METRICS.previewField,
          fill: '#ffffff26',
          stroke: '#0000001a',
          ...this.previewShape
        },
        this.fieldGroup_
      )
      this.fieldGroup_.insertBefore(this.previewRect, this.getTextElement())
    }
  }

  render_() {
    super.render_()
    const width = measureFieldText(this)
    this.size_.width = Math.max(this.previewMinimumWidth, width + this.previewPadding * 2)
    if (this.previewBox) {
      this.size_.height = METRICS.previewField
      this.previewRect?.setAttribute('width', this.size_.width)
    }
    this.positionTextElement_((this.size_.width - width) / 2, width)
  }
}

function symbolField(block, appearance) {
  const field = block.getField(appearance.field ?? 'OP')
  const symbol = field.getText()
  if (appearance.text) return new PreviewLabel(symbol, appearance)
  const width = appearance.width
  // FieldImage sits 1.5px above the artwork's reference position.
  const src = operatorIconDataUrl(field.getValue(), { width, height: 20, y: 1.5 })
  return new Blockly.FieldImage(src, width, 20, symbol)
}

const namedValuePreview = (fallback) => (block) => {
  const workspace = block.workspace.targetWorkspace ?? block.workspace
  const variable = workspace.getVariableMap().getVariableById(block.getFieldValue('VAR'))
  return {
    label: variable?.getName() ?? fallback,
    minimumWidth: 20
  }
}

// Strings are simple labels; objects describe retained inputs and decorated
// parts. Only previews that depend on a field/model need a function.
const previews = {
  boxy_return: '返回',
  math_single: '更多函数运算',
  math_types: '转换数据类型',
  lists_create_with: '临时 列表',
  lists_push: '添加项 到末尾',
  lists_delete: '删除项',
  lists_set: '替换项',
  variables_set: { parts: ['设置', { text: '变量', box: true }] },
  math_change: {
    parts: [
      { text: '增加', box: true },
      { text: '变量', box: true }
    ]
  },
  boxy_script_variables: {
    expanded: '脚本变量',
    parts: [
      '脚本变量',
      {
        text: 'a',
        box: true,
        shape: {
          rx: 14,
          fill: scriptVariableStyle.colourPrimary,
          stroke: scriptVariableStyle.colourTertiary
        }
      }
    ]
  },
  lists_insert: { parts: ['插入项 到', { text: '列表', box: true }, '中'] },
  lists_get: { parts: [{ text: '列表', box: true }, '项'] },
  lists_length: { parts: [{ text: '列表', box: true }, '长度'] },
  lists_copy: { parts: ['复制 到', { text: '列表', box: true }] },
  controls_for: { keep: ['FROM', 'TO', 'DO'], inputLabels: { FROM: '遍历', TO: '到' } },
  controls_whileUntil: (block) => ({
    keep: ['BOOL', 'DO'],
    inputLabels: { BOOL: block.getFieldValue('MODE') === 'UNTIL' ? '循环 直到' : '循环 当' }
  }),
  variables_get: namedValuePreview('变量'),
  boxy_list_input: namedValuePreview('列表'),
  lists_split: {
    parts: ['把', { text: 'abc', box: true, shape: { rx: 14, fill: '#eb8b6080' } }, '分开'],
    listIcon: true
  },
  text_charAt: {
    expanded: true,
    keep: ['VALUE', 'INDEX'],
    inputLabels: { INDEX: '的第' },
    suffix: '个字符'
  },
  math_random_int: (block) => ({ label: block.getField('MODE').getText(), padding: 14 }),
  text_join: { keep: ['TITLE', 'ADD0', 'ADD1'] },
  lists_index: { keep: ['VALUE'], inputLabels: { VALUE: '首个' }, suffix: '的项数' },
  lists_includes: { keep: ['VALUE'], inputLabels: { VALUE: '包含' } },
  math_arithmetic: { symbol: { width: 20 } },
  logic_compare: { symbol: { width: 28 } },
  logic_operation: { symbol: { text: true, padding: 6 } }
}

export function filterFlyoutContents(contents, compact) {
  return Array.isArray(contents)
    ? contents.filter((item) => !compact || !item.expandedOnly)
    : contents
}

// The descriptor belongs to the definition, so renamed/custom block types
// inherit the same preview without teaching the renderer their names.
for (const [type, preview] of Object.entries(previews)) Blockly.Blocks[type].boxyPreview = preview

function getPreview(block, compact) {
  let preview = block.boxyPreview
  if (typeof preview === 'function') preview = preview(block)
  if (!compact && !preview?.symbol && preview?.expanded !== true) preview = preview?.expanded
  return typeof preview === 'string' ? { label: preview } : (preview ?? null)
}

/**
 * Presentation only: hidden inputs, fields and shadows are still serialized.
 * The non-serializable preview label is absent from a newly cloned block, so
 * workspace blocks retain their complete editable definition and default values.
 */
export function applyFlyoutPreview(block, compact = true) {
  if (previewed.has(block)) return block
  previewed.add(block)
  for (const input of block.inputList) {
    for (const field of input.fieldRow) {
      if (compact && field instanceof Blockly.FieldImage && !field.boxyPreviewIcon)
        field.setVisible(false)
    }
    if (compact && isActionInput(input)) input.setVisible(false)
  }

  const preview = getPreview(block, compact)
  if (!preview) return block
  const keep = new Set(
    preview.keep ??
      block.inputList
        .filter((input) => input.type === Blockly.inputs.inputTypes.STATEMENT)
        .map((input) => input.name)
  )

  for (const input of block.inputList) {
    if (!keep.has(input.name)) {
      input.setVisible(false)
    } else if (preview.inputLabels?.[input.name]) {
      for (const field of input.fieldRow) field.setVisible(false)
      input.appendField(new Blockly.FieldLabel(preview.inputLabels[input.name]))
    }
  }
  if (preview.parts) {
    const input = block.appendDummyInput(PREVIEW_INPUT)
    for (const part of preview.parts) {
      input.appendField(
        typeof part === 'string'
          ? new PreviewLabel(part)
          : new PreviewLabel(part.text, {
              padding: METRICS.previewPadding,
              minimumWidth: part.shape ? METRICS.previewField : 0,
              ...part
            })
      )
    }
  }
  if (preview.listIcon) {
    const svg =
      '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><g fill="white"><circle cx="5.5" cy="7.5" r="1.5"/><circle cx="5.5" cy="12" r="1.5"/><circle cx="5.5" cy="16.5" r="1.5"/><rect x="8" y="6" width="12" height="3" rx="1.5"/><rect x="8" y="10.5" width="12" height="3" rx="1.5"/><rect x="8" y="15" width="12" height="3" rx="1.5"/></g></svg>'
    const icon = new Blockly.FieldImage(
      `data:image/svg+xml,${encodeURIComponent(svg)}`,
      24,
      24,
      '列表'
    )
    icon.boxyOpticalSpacing = { before: -6, after: 2 }
    block.appendDummyInput('BOXY_FLYOUT_ICON').appendField(icon)
    block.moveInputBefore(
      'BOXY_FLYOUT_ICON',
      preview.keep?.[0] ?? (preview.parts ? PREVIEW_INPUT : null)
    )
  }
  if (preview.label || preview.symbol) {
    const firstVisible = block.inputList.find((input) => input.isVisible())
    block
      .appendDummyInput(PREVIEW_INPUT)
      .appendField(
        preview.symbol
          ? symbolField(block, preview.symbol)
          : new PreviewLabel(preview.label, preview)
      )
    block.moveInputBefore(PREVIEW_INPUT, firstVisible?.name ?? null)
  }
  if (preview.suffix) block.appendDummyInput('BOXY_FLYOUT_SUFFIX').appendField(preview.suffix)
  return block
}

export class PreviewBlockInflater extends Blockly.BlockFlyoutInflater {
  createBlock(definition, workspace) {
    const block = super.createBlock(definition, workspace)
    if (workspace.isFlyout && !workspace.targetWorkspace?.isMutator) {
      applyFlyoutPreview(block, isCompactPreview(block))
      block.setDragStrategy(new SlidingFlyoutDragStrategy(block))
    }
    return block
  }
}
