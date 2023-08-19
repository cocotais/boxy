<template>
  <noscript></noscript>
</template>

<style lang="less">
div.blockly-ws-search {
  top: 40px !important;
  right: 40px !important;

  height: 32px;
  padding: 1px;

  background: var(--color-bg-2);
  border: 1px solid var(--color-neutral-3);
  border-radius: var(--border-radius-medium);
  box-shadow: none;

  > div {
    align-items: center;

    > div {
      align-items: center;

      > div {
        > input {
          height: 30px;
          margin-left: 4px;
          font-size: 14px;
          line-height: 1.5715;
          color: var(--color-text-3);
          background: var(--color-bg-2);
        }

        > input:focus {
          outline: none;
        }

        > input::placeholder {
          color: var(--color-text-3);
        }
      }

      > div:nth-child(2) {
        height: 12px;
        padding-right: 2px;
      }
    }

    > button {
      width: 12px;
      height: 12px;
      margin-right: 6px;
    }
  }
}

body[arco-theme='dark']
  > #app
  > section
  > main
  > div.blocklyDiv
  > div
  > div.blockly-ws-search
  > div {
  > div > div > button {
    filter: invert(0.5);
  }

  > button {
    filter: invert(0.5);
  }
}
</style>
