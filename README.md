# Boxy

Boxy 是 Google Blockly 的一个应用实例，
对 Blockly 进行了较为完善的配置，
你可以用它快速地进行 Blockly 开发。

# 安装

1. **环境检查： 确保你的电脑已经安装了Node.js 22.19+（推荐 Node.js 24 LTS）和 npm 11+。**
   Boxy 是纯客户端 Web 应用，
   仅使用 Node.js 进行自动化处理。

2. **克隆仓库：将本仓库克隆到本地。** Gitee 和 Github 克隆分别如下：

   ```shell
   git clone https://gitee.com/coco-central/boxy.git
   ```

   ```shell
   git clone https://github.com/coco-central/boxy.git
   ```

3. **环境配置：配置本地开发环境。**

   ```shell
   cd boxy
   ```

   ```shell
   npm install
   ```

### 开发模式

- 监听源码变化，编译并执行热重载。

  ```shell
  npm run dev
  ```

### 生产模式

1. 构建并优化生成。

   ```shell
   npm run build
   ```

2. 预览构建。

   ```shell
   npm run preview
   ```

### 格式化

- 请在 `commit` 前执行格式化程序。

  ```shell
  npm run format
  ```

  ```shell
  npm run style
  ```

  ```shell
  npm run lint
  ```

### 检查与积木样式

本项目使用 npm；提交 `package-lock.json`，干净安装请执行 `npm ci`。
依赖升级后建议运行：

```shell
npm test
npm run lint
npm run style
npm run format:check
npm run build
```

积木样式的测量参数、实现入口和检查样例见 [KittenN 积木样式](docs/block-styles.md)。

左上角主菜单使用 Arco Dropdown、分组和图标组件，支持悬停/点击打开、键盘选择及 Escape 收起，
圆角、配色、阴影沿用网站主题，菜单以左上角为原点向右下角展开。Logo 使用独立实色底层遮挡积木盒，
悬停不改变背景颜色。作品操作、查找及设置通过同一菜单配置分发；
工作区有内容时，新建作品会先确认，取消会保留当前作品。
