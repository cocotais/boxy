<!--suppress HtmlDeprecatedAttribute -->
<p align="center">
   <br>
   <img width="100" src="https://gitee.com/coco-central/boxy/raw/master/src/icon/logo/boxy.svg" alt="Boxy-logo"/>
</p>

<h1 align="center">
   Boxy
</h1>

<div align="center">

[![star](https://gitee.com/coco-central/boxy/badge/star.svg?theme=dark)](https://gitee.com/coco-central/boxy/stargazers)
[![fork](https://gitee.com/coco-central/boxy/badge/fork.svg?theme=dark)](https://gitee.com/coco-central/boxy/members)

</div>

#### 介绍

Boxy 是 Google Blockly 的一个应用实例，
对 Blockly 进行了基本的配置，
你可以用它快速地进行 Blockly 开发。

#### 安装

1. **环境检查： 确保你的电脑已经安装了最新版本的 Node.js。**
   Boxy 是纯客户端 Web 应用，
   仅使用 Node.js 进行自动化处理。

2. **克隆仓库：将本仓库克隆到本地。**

   ```
   git clone https://gitee.com/coco-central/boxy.git
   ```

3. **环境配置：配置本地开发环境。**

   ```
   cd boxy
   ```

   ```
   npm install
   ```

4. **开发服务：启动 WebPack DevServer 本地开发服务。**
   构建采用开发模式，支持热重载。

   ```
   npm start
   ```

#### 开发

- **构建：基于 WebPack 构建。**

  - 开发模式：源映射及 DevServer 支持。

    ```
    npm run dev
    ```

  - 生产模式：文件压缩及 PWA 生成。

    ```
    npm run build
    ```

- **服务：启动 http-server 本地服务。**
  使用

  ```
  npm run server
  ```

- **守候：自动检测文件更改，并重新编译。**
  如果你的开发工具可以建立本地服务，请使用此命令在开发中执行热重载。
  此命令生成的内容在 `http://localhost:8000/dist/index.html` 中。

  ```
  npm run watch
  ```

- **清理：清除软件包和构建，并重置缓存。**
  清除 `/dist/` 和 `/node_modules/` 下的内容，重置 npm 的缓存。

  ```
  npm run clean
  ```

- **格式化：标准化项目文件。**
  请在 `commit` 前运行以保证符合代码规范。

  ```
  npm run lint
  ```
