# Boxy

Boxy 是 Google Blockly 的一个应用实例，
对 Blockly 进行了较为完善的配置，
你可以用它快速地进行 Blockly 开发。

# 安装

1. **环境检查： 确保你的电脑已经安装了最新版本的 Node.js。**
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
   yarn install
   ```

### 开发模式

- 监听源码变化，编译并执行热重载。

  ```shell
  yarn dev
  ```

### 生产模式

1. 构建并优化生成。

   ```shell
   yarn build
   ```

2. 预览构建。

   ```shell
   yarn preview
   ```

### 格式化

- 请在 `commit` 前执行格式化程序。

  ```shell
  yarn format
  ```

  ```shell
  yarn style
  ```

  ```shell
  yarn lint
  ```
