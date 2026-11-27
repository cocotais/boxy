<template><span hidden></span></template>

<script setup>
import * as Blockly from 'blockly'

import superellipse from '../assets/superellipse.svg'
import { filterFlyoutContents, PreviewBlockInflater } from '../blocks/flyout'
import { FixedScaleFlyout } from '../blocks/flyout-layout'

class ToolCategory extends Blockly.ToolboxCategory {
  getContents() {
    return filterFlyoutContents(
      super.getContents(),
      this.parentToolbox_.getWorkspace().boxyCompactFlyout !== false
    )
  }

  setSelected = (isSelected) => {
    const labelDom = this.labelDom_
    super.setSelected(isSelected)
    if (isSelected) {
      this.rowDiv_.style.backgroundColor = this.iconDom_.style.backgroundColor
      labelDom.style.color = 'var(--color-white)'
    } else {
      this.rowDiv_.style.backgroundColor = ''
      labelDom.style.color = ''
    }

    Blockly.utils.aria.setState(this.htmlDiv_, Blockly.utils.aria.State.SELECTED, isSelected)
  }

  createIconDom_ = () => {
    const img = document.createElement('iconpark-icon')
    img.name = this.toolboxItemDef_.categorystyle
    img.size = '21'
    // Vite may inline this SVG as a data URL containing quotes. Keep the URL
    // quoted so the browser can parse and apply the mask.
    img.style.cssText = `
      display: inline-flex;
      width: 21px;
      height: 21px;
      -webkit-mask-size: 100% 100%;
      -webkit-mask-image: url("${superellipse}");
      mask-size: 100% 100%;
      mask-image: url("${superellipse}");
      mask-repeat: no-repeat;
      color: white;
    `
    return img
  }

  addColourBorder_(colour) {
    this.iconDom_.style.backgroundColor = colour
  }
}

// 注册用户工具箱。
Blockly.registry.register(
  Blockly.registry.Type.TOOLBOX_ITEM,
  Blockly.ToolboxCategory.registrationName,
  ToolCategory,
  true
)

Blockly.registry.register(
  Blockly.registry.Type.FLYOUTS_VERTICAL_TOOLBOX,
  'codemaoFlyout',
  FixedScaleFlyout,
  true
)
Blockly.registry.register(
  Blockly.registry.Type.FLYOUT_INFLATER,
  'block',
  PreviewBlockInflater,
  true
)
</script>

<style lang="less">
// Blockly 13 adds a separate active-tree focus ring. The selected category's
// background already indicates focus, including during keyboard navigation.
#app .blocklyToolbox,
#app .blocklyToolboxCategoryContainer {
  outline: none;
}

.boxyFlyoutClosing {
  pointer-events: none;
}

div.injectionDiv {
  > div.blocklyToolbox {
    z-index: 4;
    top: 60px;

    width: 60px;
    height: calc(100% - 60px) !important;
    padding: 0;

    background: var(--color-bg-2);
    box-shadow: inset -1px 0 var(--color-border);

    > div > div {
      > div.blocklyToolboxCategory {
        height: initial;
        margin: 0 4px;
        padding: 0 !important;
        border-radius: 4px;

        > div.blocklyTreeRowContentContainer {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 11px 0 6px;

          > span.blocklyToolboxCategoryLabel {
            padding: 3px 0;

            font: 13px sans-serif !important;
            color: var(--color-text-1);
            text-align: center;
            white-space: pre-line;
          }
        }
      }

      @media (any-hover: hover) {
        > div.blocklyToolboxCategory:not(.blocklyToolboxSelected):hover {
          background-color: rgb(var(--primary-1));
        }
      }
    }
  }

  > svg.blocklyFlyout {
    position: absolute;
    z-index: 3;

    // Hover reveals the overhanging blocks without widening the background.
    // Keep vertical clipping so scrolling cannot cross the logo or viewport.
    overflow: visible;

    height: 100%;
    border-right: 1px solid var(--color-border);

    background: var(--color-bg-2);
    clip-path: inset(0);

    &:hover {
      clip-path: inset(0 -100vw 0 0);
    }

    > path.blocklyFlyoutBackground {
      fill: var(--color-bg-2);
      fill-opacity: 0;
    }

    > g > g > g.blocklyFlyoutButton {
      fill: var(--color-secondary);
      transition: fill cubic-bezier(0.34, 0.69, 0.1, 1) 300ms;

      > text {
        fill: var(--color-text-2);
      }

      > rect.blocklyFlyoutButtonShadow {
        display: none;
      }
    }

    > g > g > g.blocklyFlyoutButton:hover {
      fill: var(--color-secondary-hover);
    }

    > g > g > g.blocklyFlyoutButton:active {
      fill: var(--color-secondary-active);
    }
  }

  > svg.blocklyScrollbarVertical.blocklyFlyoutScrollbar {
    display: none;
  }
}
</style>
